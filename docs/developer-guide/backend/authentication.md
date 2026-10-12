# Authentication

The backend supports several authentication mechanisms so the web app, CLI,
native clients, and AI agents can all authenticate appropriately. The auth code
lives in `internal/auth`, split into focused subpackages:

| Package | Role |
| --- | --- |
| `internal/auth/idp` | Identity-provider registry and the Google / GitHub / generic-OIDC web-login providers. |
| `internal/auth/session` | The encrypted `vx_session` cookie. |
| `internal/auth/oauthserver` | The embedded OAuth 2.1 Authorization Server (built on [ory/fosite](https://github.com/ory/fosite)). |
| `internal/auth/authkit` | The shared JWT verifier behind both bearer-token surfaces. |
| `internal/auth/mcptoken` | Adapts `authkit` to the MCP SDK's token-verifier contract. |

For the keys referenced here, see
[Configuration → Authentication](configuration.md#authentication).

## Identity providers (stored in the database)

Web login is driven by the provider rows in the `instance_auth_providers`
table, which an instance admin edits under **Settings** → **Authentication** in
the admin area. Each row has a type, a slug, a display name, a client ID, an
encrypted client secret, an enabled flag and a sort order:

- **`google`**: Google OIDC, reached directly via `accounts.google.com`
  discovery. At most one row.
- **`github`**: GitHub OAuth2 (not OIDC; claims come from the GitHub REST
  API). At most one row.
- **`oidc`**: any generic, OIDC-compliant issuer (Keycloak, Authentik,
  Zitadel, Auth0, …). Any number of rows, each with its own issuer URL, which
  drives `/.well-known/openid-configuration` discovery.

A resolver builds the enabled providers from those rows and caches the result
against a shared settings version, so a change made in the admin area is picked
up by every replica on the next sign-in, with no restart. Every provider uses
the same callback, derived from `frontend.base_url`:
`<frontend.base_url>/api/v1/auth/callback` (or
`http://localhost:<server.port>/api/v1/auth/callback` in local development).

The enabled, successfully built set is exposed at
**`GET /api/v1/auth/providers`**, which the frontend login screen renders its
provider picker from, rather than hardcoding a list. A sign-in starts at
`GET /api/v1/auth/login?provider=<slug>`.

While no provider is enabled the instance is in **setup mode**: the server
logs a one-time `SETUP URL` at startup, and its token is exchanged for a short
setup session that can reach the provider and allowlist settings only. See
[First-run setup](../../user-guide/self-hosting/authentication.md#first-run-setup).

:::caution[Misconfiguration is non-fatal]
A provider that cannot be built, for example after failed OIDC discovery
against a bad issuer, is left out of the picker and reported as **Unhealthy**
in the admin area; the backend still boots and the other providers keep
working.
:::

:::note[The `config.yaml` provider keys are deprecated]
Up to v0.14 the registry was built at startup from `auth.providers` (or the
single-value `auth.provider`) and the `auth.google`, `auth.github` and
`auth.oidc` blocks. Since v0.15.0 those keys are only imported into the
database at startup while no provider is stored, and are otherwise ignored;
a per-provider `redirect_uri` is ignored altogether. See the
[upgrade note](../../user-guide/self-hosting/upgrading.md#sign-in-providers-and-the-access-allowlist-moved-to-the-database-v0150).
:::

## Sessions

After the OAuth flow, the web app authenticates with an httpOnly session cookie
named **`vx_session`**. Its payload is encrypted with AES-256-GCM using
`auth.session_encryption_key` — a hex-encoded secret that must decode to
exactly 32 bytes (**64 hex characters**). The same secret also backs (via
domain separation) the HMAC that signs the short-lived `vx_state` OAuth state
cookie. When the key is empty, cookie session auth is disabled (stub/test
mode). Generate a production value with:

```bash
openssl rand -hex 32
```

## Dev login bypass

For local development, set `auth.dev_login_enabled: true` to enable
`POST /api/v1/auth/dev/login`, which mints a session without an external IdP.
The endpoint responds only when the flag is `true` **and** the environment is
detected as local development — `frontend.base_url` pointing at `localhost` or
`127.0.0.1`. The detection is fail-closed (an empty value counts as
production), so the flag has no effect in real deployments even if left on.

## Sign-in allowlist

The access allowlist restricts who may use the instance, by email domain and/or
exact address. It is stored in the database (`instance_auth_allowlist`) and
edited under **Settings** → **Authentication** in the admin area. When both
lists are empty (the default), access is open: anyone the providers accept can
sign in.

Rules:

- A user is allowed if **either** list matches.
- A domain matches the part after the last `@` **exactly** (case-insensitive):
  `a@sub.example.com` does not match domain `example.com`.
- An email entry matches the full address exactly.
- When the allowlist is active, sign-in also requires a **provider-verified**
  email. An unverified IdP account is denied even if its claimed address is
  listed.
- Root instance admins (`auth.instance_admins`) are exempt from the lists.
  Admins granted in the database are not.

The allowlist is enforced at sign-in, at the MCP OAuth consent-attach re-check,
and on every authenticated request of a signed-in user, so tightening it takes
effect within seconds and without a restart.

The `auth.access_allowlist` key in `config.yaml` is deprecated: since v0.15.0
it is only imported at startup while no allowlist is stored.

## Instance admins

An instance admin is either a **root admin**, listed in `auth.instance_admins`
(matched case-insensitively), or an admin **granted in the database** by a root
admin. Both are exposed as `is_instance_admin` on `GET /api/v1/auth/me` and
unlock the `/api/v1/admin` portal, which is guarded by instance-admin
middleware; `is_root_instance_admin` on the same response marks a root admin.
Only a root admin may grant or revoke the role, and a root admin cannot be
suspended, deleted or revoked. With no root admin and no grant, the feature is
dormant.

```yaml
auth:
  instance_admins:
    - admin@example.com
```

See [Instance Admin Portal](../../user-guide/self-hosting/instance-admin.md).

## API keys

Long-lived API keys authenticate non-browser clients (the CLI, Claude Code
hooks) and are sent as a bearer token. They are managed through the API-keys
endpoints and persisted in the database. A separate admin key,
`security.backoffice_admin_api_key`, gates the back-office endpoints (`/bo/*`)
and is unrelated to JWTs and regular API keys.

## The embedded OAuth 2.1 Authorization Server

VibeXP ships its own **OAuth 2.1 Authorization Server**, embedded in the
backend process (`internal/auth/oauthserver`, built on
[ory/fosite](https://github.com/ory/fosite)). It is what mints the bearer JWTs
the [MCP endpoint](mcp-server.md) accepts — no external
identity platform is involved in token issuance. All AS state (registered
clients, authorization codes, tokens, PKCE, signing keys, login sessions) is
persisted in Postgres, so it works across replicas.

The AS is mounted when `auth.oauth_as.issuer_url` is set; empty disables it
(except in local development — see zero-config mode below). The issuer URL is
the AS's public base URL and becomes the token `iss` claim and the metadata
`issuer`.

### Endpoints

| Endpoint | Purpose |
| --- | --- |
| `GET /oauth2/authorize` | Authorization endpoint (authorization-code + PKCE). |
| `POST /oauth2/token` | Token endpoint (`authorization_code` and `refresh_token` grants). |
| `POST /oauth2/register` | Dynamic Client Registration (RFC 7591). |
| `GET /oauth2/jwks.json` | The JWKS with the active + previous RS256 signing keys. |
| `GET /.well-known/oauth-authorization-server` | AS metadata (RFC 8414), advertising all of the above. |

These are protocol routes: they are public by design (clients reach them before
they hold a token), protected by the protocol itself (PKCE, client/redirect
validation, a consent CSRF token) and rate-limited per IP like the auth routes
(`rate_limit.auth_per_minute`). They are mounted only when the AS is enabled,
and are intentionally absent from `openapi.yaml`.

### Dynamic Client Registration

MCP clients self-register via `POST /oauth2/register`. Only **public clients**
are supported (`token_endpoint_auth_method: none` — PKCE stands in for a client
secret), with `authorization_code` / `refresh_token` grants. Redirect URIs must
be absolute and fragment-free: `https` URLs, loopback `http` addresses
(`127.0.0.1`, `::1`, `localhost` — for native apps), or custom private-use URI
schemes.

### Token lifetimes

| Setting | Default |
| --- | --- |
| `auth.oauth_as.access_token_ttl` | `15m` |
| `auth.oauth_as.refresh_token_ttl` | `720h` (30 days) |
| `auth.oauth_as.auth_code_ttl` | `10m` |

All must be positive, and the refresh TTL must exceed the access TTL —
validated at startup so the server fails closed rather than minting unbound or
never-expiring tokens. Access tokens are RS256-signed JWTs whose `sub` is the
internal VibeXP user ID and whose `aud` is `mcp.resource_uri` (RFC 8707).

### Key rotation and cleanup

- **Coordinated key rotation.** The RS256 signing key rotates every
  `auth.oauth_as.key_rotation_interval` (default `720h`). Rotation is
  coordinated through the database so multiple replicas never double-rotate:
  a replica that sees a peer rotating drops its cache and re-checks under a
  lock. Previous keys stay in the JWKS until retired, so freshly rotated
  tokens keep verifying.
- **Retention/cleanup.** Every `auth.oauth_as.cleanup_interval` (default `1h`)
  the AS prunes expired authorization codes, access and refresh tokens, PKCE
  and login sessions, and retired signing keys.

### HTTPS-only in production

Every AS endpoint is behind an HTTPS-enforcing middleware: plain-HTTP requests
are rejected with `403` unless the process is running in local development
(the same `frontend.base_url`-on-localhost heuristic as dev login, fail-closed).
A request counts as HTTPS when TLS terminates at the process (`r.TLS`) **or**
an upstream reverse proxy forwards `X-Forwarded-Proto: https` — VibeXP assumes
no specific platform, so either signal is accepted.

### Zero-config local mode

On a fresh checkout with the example config, the AS "just works" with **zero
auth configuration**:

- When the environment is local development and `auth.oauth_as.issuer_url` is
  empty, it is auto-derived as `http://localhost:<server.port>`.
- `mcp.resource_uri` is auto-derived as `<issuer>/mcp/v1/common`, and
  `mcp.oauth_issuer` defaults to the AS issuer.
- Because the AS is enabled, `/api/v1` JWT acceptance auto-wires too:
  `auth.api_oauth.issuer` fills with the AS issuer and
  `auth.api_oauth.audiences` pins to `[mcp.resource_uri]`, so native-CLI login
  works against the REST API with no extra config.

Explicit configuration always wins — a value already set is never overwritten —
and pointing `mcp.oauth_issuer` at an external issuer without enabling the AS
opts out of auto-enablement. Production never auto-enables: the AS stays
strictly opt-in and the backend never guesses a public issuer.

### The SPA consent flow

The AS **never authenticates anyone itself** — it delegates login to the app:

1. `GET /oauth2/authorize` validates the client and stashes the request as a
   **user-less login session**, then redirects the browser to the SPA consent
   page: `<frontend.base_url>/oauth/consent?login=<id>`.
2. If the user is not signed in to VibeXP, the SPA sends them to
   `/login?return_to=<consent-url>` — the validated, same-origin `return_to`
   brings them back to the consent page after login. **An authenticated app
   user is required before consent.**
3. The consent page calls `GET /api/v1/oauth/consent` for the client details
   (name, redirect host, scopes) and `POST /api/v1/oauth/consent/attach` to
   bind the logged-in app user to the login session — the one AS route behind
   the standard session-auth middleware, so signing out gates MCP
   authorization.
4. The approve/deny decision goes to `POST /api/v1/oauth/consent` (CSRF-bound
   to the login session); on approval the AS issues the authorization code and
   redirects back to the client.

All issuance, CSRF, and redirect validation stays server-side; the SPA only
renders the screen.

## Bearer-JWT verification (`authkit`)

Both bearer-token surfaces verify tokens with the shared
`internal/auth/authkit` verifier: JWKS-backed signature verification with the
keys fetched from `<issuer>/oauth2/jwks.json` (the `jwks_uri` the embedded AS
publishes in its metadata), an **RS256 algorithm pin** (defense against
algorithm-substitution), registered-claim validation with 60s clock-skew
leeway, a pluggable audience policy, and resolution of the token subject to an
internal VibeXP user.

- **MCP** (`/mcp/v1/common`): `internal/auth/mcptoken` wraps `authkit` with a
  strict RFC 8707 audience requirement — the token `aud` must include
  `mcp.resource_uri`. The token `sub` is the internal user ID (the embedded AS
  mints it that way), resolved directly.
- **API surface** (`/api/v1/*`): bearer JWTs are accepted alongside session
  cookies and API keys, with two ways to wire it:
  - **Embedded AS (auto, the default self-hosted case).** When the embedded AS
    is enabled and `auth.api_oauth.issuer` is left empty, VibeXP auto-derives
    it: `api_oauth.issuer` is set to the AS issuer and `api_oauth.audiences` is
    pinned to `[mcp.resource_uri]`. So the native CLI's browser login
    (`vibexp auth login`) works on `/api/v1` with no manual config, and the
    effective policy is "require the MCP resource URI audience". (The CLI's
    token carries exactly that audience, which is why it is now accepted.)
  - **External IdP (manual override).** Set `auth.api_oauth.issuer` explicitly
    to point `/api/v1` at an external issuer; an explicit issuer always wins
    over the auto-wiring. With `auth.api_oauth.audiences` left empty in this
    case, the default policy is "accept any audience **except** the MCP
    resource URI", so MCP-bound tokens stay MCP-only.

:::note
The `authkit` package name is historical — it predates the embedded
Authorization Server. Today the tokens it verifies are minted by VibeXP's own
embedded AS.
:::

## Request resolution

The authentication middleware resolves the caller from — in effect — a session
cookie, a bearer JWT, or an API key, and binds the resolved subject to the
request context (see `internal/contextkeys`). Downstream handlers and services
read the authenticated identity from the context rather than re-parsing headers.
