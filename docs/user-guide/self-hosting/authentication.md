# Authentication & MCP Auth

VibeXP is **provider-agnostic** and brings its **own OAuth 2.1 Authorization Server** in-house, so you can self-host MCP authentication with **any** supported login provider — without a third-party auth service and without the MCP surface changing per provider.

:::note[No WorkOS, no external Authorization Server]
Earlier versions delegated the OAuth Authorization Server role to WorkOS. That coupling is gone. VibeXP now mints its own tokens and federates *only the login step* to your chosen provider. WorkOS/Clerk/Auth0/Keycloak still work — as a **generic OIDC** configuration, with no special-case code.
:::

## The two roles, and who plays them

The MCP authorization spec separates two roles. VibeXP plays **both**, so an MCP client only ever talks to your VibeXP instance:

| Role | Who | What it does |
| --- | --- | --- |
| **Resource Server** | VibeXP (`/mcp/v1/*`) | Validates the bearer token (audience-bound JWT), serves RFC 9728 Protected Resource Metadata |
| **Authorization Server** | VibeXP (`/oauth2/*`) | Dynamic Client Registration, PKCE, consent, token issuance, JWKS — RFC 8414 metadata |
| **Identity Provider** | Your choice (Google / GitHub / OIDC) | Authenticates the human at login time only — invisible to MCP |

VibeXP mints short-lived JWTs (audience = your `MCP_RESOURCE_URI`), signs them with DB-stored keys it rotates, and publishes its own JWKS. Compliance is therefore **constant across providers**.

:::note[Where each setting lives]
Since v0.15.0 the **sign-in providers** and the **access allowlist** are stored in the database and managed in the admin area under **Settings** → **Authentication**; a change applies with no restart. Everything else on this page is still read from the backend's `config.yaml`: the root instance admins, the session and encryption keys, and the embedded Authorization Server. In the published image an env var only works when the baked `/app/config.yaml` references it as `${VAR}`, which covers `INSTANCE_ADMIN_EMAILS`, `SESSION_ENCRYPTION_KEY`, `OAUTH_AS_ISSUER_URL`, `MCP_RESOURCE_URI` and `AUTH_SETTINGS_RECOVERY_MODE`. Settings marked "mounted `config.yaml`" below are **not** env-wired: mount your own file over `/app/config.yaml` to set them.

Upgrading an instance that set `AUTH_PROVIDER` and the provider variables? See the [v0.15.0 upgrade note](upgrading.md#sign-in-providers-and-the-access-allowlist-moved-to-the-database-v0150).
:::

## First-run setup

The authentication settings sit behind sign-in, and a new instance has no way in yet. So while **no sign-in method is usable**, the instance is in **setup mode**: at startup the server logs a one-time setup URL at `WARN`. No sign-in method is usable while no sign-in provider is enabled and no instance admin can sign in with a password (see [Email and Password Sign-In](password-sign-in.md#when-the-last-way-in-is-lost)).

```json
{"time":"…","level":"WARN","msg":"SETUP URL: https://<your-app-host>/setup?token=…","reason":"no sign-in method is usable (no identity provider is enabled, and password login is off or no instance admin has a password); open this URL to configure sign-in","valid_until":"…"}
```

The URL is built on `FRONTEND_BASE_URL`, so set that to your public URL first. Find the line in the container logs:

```bash
docker compose logs app | grep "SETUP URL"
```

1. **Name a root admin before you start.** Set `INSTANCE_ADMIN_EMAILS` to your own email address (see [Instance Admin Portal](instance-admin.md)); with the bundled `docker-compose.yml`, add it to the `app` service's `environment:` block. Setup ends when a root admin signs in, and it is read from the configuration at startup, so adding it later needs a restart.
2. **Open the setup URL.** The page is headed **Set up sign-in for this instance**. The token is removed from the address bar as soon as the page loads, and a reload continues on the setup session's cookie.
3. **Add and enable a sign-in provider**, as described in [Sign-in providers](#sign-in-providers) below. Or, for an instance without providers, use the **Use email and password** card to give the root admin a password: see [Run an instance on passwords alone](password-sign-in.md#run-an-instance-on-passwords-alone). You can also set the [access allowlist](#restricting-who-can-sign-in-optional) here.
4. **Finish.** Once a provider is enabled, a **Finish setup** card appears with a **Sign in with &lt;provider&gt; as a root admin to finish setup** button. Setup is finished when an address listed in `INSTANCE_ADMIN_EMAILS` signs in through an enabled provider that reports that address as verified, or with the password set on the setup page.

What to know about the token and the session:

- **The token lasts 24 hours and its URL is logged once.** Only a hash of the token is stored, so a restart while it is still valid does not print the URL again: the server logs that a setup token is already issued, with the time it stays valid until. Use the URL from the earlier log line, or get a new one with `setup rearm` (see [Lockout Recovery](lockout-recovery.md)). A restart after the token has expired logs a new URL.
- **The URL can be opened again** until the token expires or setup finishes, as long as no provider is enabled yet.
- **The setup session lasts up to one hour** and never outlives the token. It has no user: it reaches the sign-in providers and the access allowlist, and nothing else. The instance admins and the change history are not shown on the setup page.
- **The session stays valid after you enable a provider**, until a root admin signs in, so a mistyped provider can still be corrected from the same browser.

If the setup page shows an error instead:

| Message | Meaning | What to do |
| --- | --- | --- |
| **This setup link is incomplete** | The address has no token and the browser has no setup session to resume. | Open the full `SETUP URL` from the server logs, including its token. |
| **This setup link is no longer valid** | The token is wrong, was already used to finish setup, or has expired. | Run `setup rearm` for a new URL ([Lockout Recovery](lockout-recovery.md)), or restart the server once the old token has expired. |
| **This instance is already set up** | Setup mode is off because a sign-in method is usable. | Sign in and use **Settings** → **Authentication** in the admin area. If you cannot sign in, see [Lockout Recovery](lockout-recovery.md). |

:::caution[With no root admin, nobody can change the settings afterwards]
Enabling a provider is enough for people to sign in, but only an instance admin can open **Settings** → **Authentication**. If `INSTANCE_ADMIN_EMAILS` is empty, set it and restart.
:::

## Sign-in providers

An instance admin manages the providers in the admin area: open **Admin Portal** from the user menu, then **Settings** → **Authentication**. The **Identity providers** card lists the stored providers in the order the sign-in page offers them. A change applies to the next sign-in, with no restart.

### Add a provider

**Add provider** opens the **Add a sign-in provider** dialog:

| Field | Notes |
| --- | --- |
| **Provider type** | **Google**, **GitHub** or **OpenID Connect**. Google and GitHub can each be added once; OpenID Connect can be added as many times as you need. The type cannot be changed later. |
| **Slug** | Identifies the provider in the sign-in URL. 1 to 63 lower-case letters, digits or hyphens, not starting with a hyphen. Set when the provider is created and cannot be changed later. Prefilled with `google` or `github` for those types. |
| **Display name** | Shown on the sign-in button. |
| **Issuer URL** | OpenID Connect only. The issuer, without the `/.well-known` path. It must use `https` (`http` is accepted only for localhost). |
| **Client ID** | From the provider's console. |
| **Client secret** | Stored encrypted and never shown again. When you edit a provider, leave it blank to keep the stored one; if you change the issuer URL, enter it again. |
| **Redirect URI** | Read-only, with a **Copy redirect URI** button. See below. |
| **Enabled** | Whether the provider is offered on the sign-in page. |

**The redirect URI is the same for every provider and is not configurable**: it is always `<FRONTEND_BASE_URL>/api/v1/auth/callback`. Copy it from the dialog and register it in the provider's console. The `GOOGLE_REDIRECT_URI`, `GITHUB_REDIRECT_URI` and `OIDC_REDIRECT_URI` variables of earlier releases are ignored. The one exception is a localhost `FRONTEND_BASE_URL`, where the redirect URI is `http://localhost:<server port>/api/v1/auth/callback`.

In each provider's console:

- **Google**: create an OAuth 2.0 client ID of type **Web application** in the Google Cloud console, and paste the redirect URI from the dialog under **Authorized redirect URIs**.
- **GitHub**: create an **OAuth App** under your account or organization's developer settings, and paste the redirect URI from the dialog as the **Authorization callback URL**. This is the web-login OAuth client, not the per-team [GitHub App](../integrations/github-app.md).
- **OpenID Connect** (Keycloak, Zitadel, Auth0, Okta, WorkOS, …): create a confidential web client with the authorization code flow, and paste the redirect URI from the dialog into its allowed redirect URIs. Use the provider's issuer as the **Issuer URL**; VibeXP reads the rest from the issuer's discovery document.

### Test, reorder, disable, delete

Each row shows the provider's type, a health badge and its slug, with these controls:

- **Move up** / **move down** arrows: the order of the rows is the order of the buttons on the sign-in page.
- The **enabled** switch: a disabled provider stays stored but is not offered at sign-in.
- **Test**: checks the configuration without signing anyone in and without saving anything. For Google and OpenID Connect the server reads the issuer's discovery document; for GitHub it checks the client ID and secret against GitHub. The same button in the dialog tests the values you have typed before you save them. A passing test does not prove that the redirect URI is registered: only a real sign-in does.
- **Edit** and **Delete**. Deleting a provider removes its stored client secret and cannot be undone.

The health badge is **Healthy**, **Unhealthy**, **Disabled** or **Unknown**. An **Unhealthy** provider is enabled but could not be built, for example because its issuer cannot be reached; the row says why, and the provider is **not offered for sign-in** until it builds again. One broken provider never stops the others.

Two changes ask for confirmation before they are applied, because they can lock you out. Confirm with **Apply anyway** only if you have another way in:

- **This leaves no way to sign in**: the change would leave no enabled provider. The instance returns to setup mode, and the way back in is a setup URL ([Lockout Recovery](lockout-recovery.md)).
- **This is the provider you signed in with**: you could not sign in through it again once your session ends.

If someone else saved a change while you were editing, your change is not saved and the page asks you to **Reload** first.

## Email and password sign-in

Since v0.16.0 an instance can also offer sign-in with an email address and a password, beside the providers or instead of them, and can limit new accounts to invited people. It is off by default. See [Email and Password Sign-In](password-sign-in.md).

## Session & signing keys

```bash
ENCRYPTION_KEY=<32 raw bytes>            # AES-256 at-rest key: app data + OAuth-AS signing-key encryption
SESSION_ENCRYPTION_KEY=<64 hex chars>   # encrypts the web app session cookie (vx_session)
```

The web app keeps a server-side cookie session; the embedded Authorization Server is for MCP / programmatic OAuth clients. Both share the same provider config and user provisioning. The AS's JWT signing keys are generated, stored encrypted in the database, rotated, and served via JWKS — there are **no key files** to manage, and it is multi-instance safe.

## Enable the embedded Authorization Server (MCP auth)

The AS is **opt-in**: it stays off (routes unmounted) until you set its public issuer URL.

```bash
# Public base URL of THIS VibeXP instance (enables the AS when set)
OAUTH_AS_ISSUER_URL=https://<your-app-host>

# Token audience (RFC 8707) — your MCP endpoint. Required to enable the MCP endpoint.
MCP_RESOURCE_URI=https://<your-app-host>/mcp/v1/common
```

The token lifetimes are tunable under `auth.oauth_as.*` in a mounted `config.yaml` — they are not env-wired in the published image (sane defaults shown):

```yaml
auth:
  oauth_as:
    access_token_ttl: "15m"
    refresh_token_ttl: "720h"
    auth_code_ttl: "10m"
    key_rotation_interval: "720h"
    cleanup_interval: "1h"
```

When `OAUTH_AS_ISSUER_URL` is set, `MCP_OAUTH_ISSUER` defaults to it; setting a *divergent* `MCP_OAUTH_ISSUER` fails fast at startup (a token's issuer and the resource server's expected issuer must agree).

MCP clients (Claude Code, Cursor, …) need no API key: they perform Dynamic Client Registration, PKCE, and consent against `/oauth2/*` automatically. See [MCP Server Integration](../mcp-server.md) for the client side.

:::caution[HTTPS is required]
The Authorization Server endpoints (`/oauth2/*`, `/.well-known/oauth-authorization-server`) **reject plain-HTTP requests**. VibeXP is deploy-anywhere and does not assume a platform, so it expects **TLS to terminate at your reverse proxy / load balancer**, which must forward the original scheme as `X-Forwarded-Proto: https`. A direct TLS listener also satisfies this. Only a `localhost` `FRONTEND_BASE_URL` (local development) is exempt.
:::

`FRONTEND_BASE_URL` must point at your app's public origin — it drives the consent redirect and post-login landing:

```bash
FRONTEND_BASE_URL=https://<your-app-host>
```

## Local evaluation (no provider)

For local-only evaluation you can skip sign-in providers entirely:

```bash
FRONTEND_BASE_URL=http://localhost:8080   # localhost ⇒ development mode
```

The dev-login bypass (`/api/v1/auth/dev/login`) is on by default (`auth.dev_login_enabled: true` in the shipped config) but is **honored only in local development** — a non-localhost `FRONTEND_BASE_URL` makes it inert.

No provider is enabled on such an instance, so the server still logs a `SETUP URL` at startup. You do not need it to evaluate locally: dev login works without it. Use it only if you want to try a real provider on localhost.

In local development the embedded AS auto-derives sane defaults (issuer = the local base URL, resource URI = `<issuer>/mcp/v1/common`) and HTTPS enforcement is skipped, so a fresh checkout connects an MCP client with zero auth edits. Production never derives these and never bypasses HTTPS.

## Restricting who can sign in (optional)

The **Access allowlist** card on the same page restricts sign-in by email domain and by exact address. Its badge reads **Open access** while both lists are empty, which means anyone the sign-in providers accept can sign in, and **Restricted** otherwise.

- **Allowed domains**: every address at the domain may sign in. The domain is matched exactly against the part after the `@`, so `example.com` does not cover `a@sub.example.com`.
- **Allowed email addresses**: individual addresses outside the allowed domains.

A user is allowed if **either** list matches. **Save allowlist** stores the lists, and **Reset to open access** removes them.

**The allowlist is enforced immediately, not only at sign-in.** It is checked at sign-in, when an MCP client asks for consent, and on every request of a user who is already signed in. A change applies at once on the server that saved it, and within about 2 seconds on other replicas, with no restart. So when a save would shut out people who are signed in, the page first shows how many signed-in users would be signed out, with a sample of their addresses, and the confirmation button reads **Save and sign them out**. Their next request ends their session, and they cannot sign in again until the allowlist lets them.

Two more rules apply while the allowlist is restricted:

- **Root admins can always sign in**, even when their address matches neither list, so an allowlist mistake cannot lock out the addresses in `INSTANCE_ADMIN_EMAILS`. Instance admins granted in the admin area are not exempt.
- Sign-in requires a **provider-verified** email, so an account whose address the provider has not verified is denied. This applies to root admins too.

If the allowlist locks out everyone who could fix it, see [Lockout Recovery](lockout-recovery.md).

## Designating instance admins (optional)

Instance admins get the admin portal, which is where the settings above live. There are two kinds:

- **Root admins** are listed in `INSTANCE_ADMIN_EMAILS` (comma-separated), or `auth.instance_admins` in a mounted `config.yaml`. They are read from the configuration at startup, and hold root admin power only once their account's email is verified (see [Root admins need a verified email](instance-admin.md#root-admins-need-a-verified-email)).
- **Granted admins** are added by a root admin in the **Instance admins** card under **Settings** → **Authentication**.

```bash
INSTANCE_ADMIN_EMAILS=admin@example.com
```

With no root admin and no granted admin, nobody holds the role. See [Instance Admin Portal](instance-admin.md) for what each kind can do.

## What a self-hoster does NOT need

- No WorkOS (or any external Authorization Server) account.
- No JWT key files — keys live in the database and rotate automatically.
- No CORS or reverse-proxy routing config for MCP — the AS and the SPA are same-origin in the single combined image.
