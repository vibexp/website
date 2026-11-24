# Single Sign-On with Your Identity Provider

Since v0.19.0 VibeXP can hand two decisions to your organisation's identity provider: who may sign in, and who is an instance admin. It also re-checks signed-in sessions against the provider, so access you remove there ends in VibeXP too.

Single sign-on uses **OpenID Connect**. You add the provider as an **OpenID Connect** sign-in provider (see [Sign-in providers](authentication.md#sign-in-providers)) and, optionally, give it a role mapping. Setup guides for specific providers:

- [Okta](sso-okta.md)
- [Microsoft Entra ID](sso-entra-id.md)
- [Keycloak](sso-keycloak.md)
- [Generic OpenID Connect (Ory Hydra example)](sso-generic-oidc.md)
- [Google Workspace](sso-google-workspace.md)

## What the identity provider decides

| Decision | Where it is made |
| --- | --- |
| Who may sign in | The identity provider: whoever it lets through to VibeXP, for example the users assigned to the application. The [access allowlist](authentication.md#restricting-who-can-sign-in-optional) and the [registration mode](password-sign-in.md#registration-mode) still apply on top. |
| Who is an instance admin | The identity provider, through the [role mapping](#role-mapping), next to the root admins from the configuration and the admins granted in the admin area. |
| Team and project roles | VibeXP. Team owners and admins manage them as before; the identity provider has no say in them. |

## Role mapping

The role mapping is set per provider, in the provider dialog under **Admin Portal** → **Settings** → **Authentication**. It is stored in the database with the provider, not in `config.yaml`, and only **OpenID Connect** providers have it: the dialog shows no role mapping for Google or GitHub.

The **Role mapping (optional)** section has two fields:

| Field | Notes |
| --- | --- |
| **Roles claim** | The claim that lists the user's groups or roles, such as `groups`, `roles` or `realm_access.roles`. A dot separates the levels of a nested claim: `realm_access.roles` reads the `roles` array inside the `realm_access` object. At most 255 characters, no spaces, no empty level (`a..b`, a leading or trailing dot). |
| **Admin values** | One value per line, 1 to 50 values of at most 255 characters each. A user whose claim contains one of them becomes an instance admin. |

The two fields go together: set both, or clear both to turn the mapping off.

How a claim is matched:

- The claim must be a **string** or an **array of strings**. A number, an object, an array holding anything other than strings, or a missing claim is no match.
- Values are compared **exactly and case-sensitively**. `Platform-Admins` does not match `platform-admins`. Spaces and hyphens inside a value are fine.
- VibeXP reads the claims of the verified **ID token**. Only when the provider returns no ID token does it read the userinfo endpoint instead. A claim that your provider puts only in the access token or only in userinfo is not seen.

The mapping is evaluated at every sign-in through the provider and again at every [session re-check](#access-re-check). A user whose claim gains an admin value becomes an instance admin; a user whose claim loses it, or loses the claim, stops being one. Each change is recorded in the admin **Audit log** as **Admin via identity provider** or **Identity provider admin removed**.

:::note[A provider admin is not a root admin]
An admin who holds the role through the role mapping opens the same portal as a granted admin, with the same limits: they cannot grant or remove other admins, and they are not exempt from the access allowlist. Their role grants nothing while the provider is disabled, and clearing the mapping or deleting the provider removes it.
:::

When a change would remove your own admin role, because the mapping is your only admin source, the page asks for confirmation first: **This removes your own admin access**. This applies to clearing the mapping, removing your matched value, disabling the provider and deleting it.

## Admin sources

The **Instance admins** card under **Settings** → **Authentication** labels every admin with where the role comes from:

| Label | Source | Changed by |
| --- | --- | --- |
| **Server configuration** | A root admin, listed in `auth.instance_admins` or `INSTANCE_ADMIN_EMAILS`. | Editing the configuration and restarting. |
| **Granted** | Granted by a root admin in the admin area. | A root admin, with **Remove**. |
| **Identity provider** | The role mapping of the named provider, with the value that matched. | The identity provider or the role mapping. The row has no **Remove**: it reads "Managed by &lt;provider&gt;: change it at the identity provider or in the role mapping." |

A user can hold more than one source. A user who is both granted and provider-sourced keeps **Remove** on the granted entry; removing it leaves the provider source in place.

**Root admins are the break-glass path.** The role mapping never adds or removes a root admin, and nothing the identity provider does can revoke one. Keep at least one root admin in `auth.instance_admins`, so that a mistake in the identity provider or the mapping cannot lock every admin out. See [Instance Admin Portal](instance-admin.md) and [Lockout Recovery](lockout-recovery.md).

## Access re-check

A session signed in through an OpenID Connect provider that issued a **refresh token** is re-checked against that provider. VibeXP refreshes the session's tokens when its access token expires or when `auth.session_recheck_interval` has passed since the last refresh, whichever comes first. Signing in counts as a refresh.

- **The provider refuses the refresh** (the account was disabled, removed from the application, or its tokens were revoked): the session ends, the user is signed out on that request, and the event is recorded in the audit log as `auth.session.ended_by_provider`.
- **The provider cannot be reached** (a network error, or a 5xx, 429 or 408 answer): the request gets a 503 with `Retry-After`, and the session is kept.
- **The refresh succeeds**: the role mapping is applied again to the refreshed claims, so a promotion or demotion at the provider reaches VibeXP without a new sign-in.

So access removed at the provider reaches VibeXP within `auth.session_recheck_interval`, at the user's next request after it. The default is `15m`; the value must be positive.

```yaml
# config.yaml
auth:
  session_recheck_interval: "15m"
```

In the published image it is wired as `AUTH_SESSION_RECHECK_INTERVAL`:

```bash
AUTH_SESSION_RECHECK_INTERVAL=5m
```

To get a refresh token, VibeXP requests the `offline_access` scope from an OpenID Connect provider whose discovery document lists `offline_access` in `scopes_supported`. Google gets `access_type=offline` instead.

:::caution[Sessions without a refresh token are not re-checked]
GitHub issues no refresh token, and some OpenID Connect providers ignore `offline_access` or are configured not to issue refresh tokens. Sessions from those providers, and password and dev-login sessions, are never re-checked: they last until they expire or the user signs out, and the role mapping is applied only at sign-in. If you rely on the re-check, make sure your provider issues refresh tokens to the VibeXP client.
:::

Signing out deletes the session and asks the provider to revoke its refresh token, when the provider's discovery document lists a `revocation_endpoint`. This is best effort: sign-out succeeds even when the provider does not answer.

## Provider requirements

Whatever the provider, the VibeXP client needs:

- **The redirect URI** `<FRONTEND_BASE_URL>/api/v1/auth/callback`, the same for every provider. The provider dialog shows it with a **Copy redirect URI** button.
- **A confidential web client** using the authorization code flow, with a client ID and a client secret. VibeXP authenticates to the token endpoint with the client secret.
- **The `refresh_token` grant**, if you want the [access re-check](#access-re-check).
- **The `email` claim in the ID token.** VibeXP requests the scopes `openid`, `email` and `profile`, plus `offline_access` as described above. These scopes are fixed: VibeXP requests no `groups` scope or other extra scope, so the roles claim must be included in the ID token without one. While the [access allowlist](authentication.md#restricting-who-can-sign-in-optional) is restricted, the ID token must also say `email_verified: true`, or the user is denied.
- **PKCE and `nonce` support.** Every sign-in sends a PKCE challenge (`S256`) and a `nonce`, and the ID token must return the same `nonce`. All current OpenID Connect providers support both.
- **HTTPS.** The issuer URL must use `https` (`http` is accepted only for localhost). VibeXP itself must be reached over HTTPS, with TLS terminated at your reverse proxy forwarding `X-Forwarded-Proto: https`, as described in [Authentication & MCP Auth](authentication.md#enable-the-embedded-authorization-server-mcp-auth).

## When the provider denies sign-in

When the identity provider refuses the sign-in itself, for example because the account is not assigned to the application, it redirects back with `error=access_denied`. VibeXP then shows a **No access** page: "Your account does not have access. Contact your administrator." Any other error from the provider shows **Sign-in failed**. The provider's own error text is never shown to the user; it is recorded with the failed sign-in in the audit log.

## Not supported

- **SAML**: only OpenID Connect.
- **SCIM**: the identity provider does not provision or delete VibeXP accounts. An account is created at its first sign-in; access removed at the provider ends sessions through the [access re-check](#access-re-check), but the account stays.
- **Single logout**: signing out of VibeXP does not sign the user out of the identity provider, and signing out of the identity provider does not sign the user out of VibeXP.
- **Team and project role mapping**: the identity provider decides instance admins only.
