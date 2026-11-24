# Single Sign-On with a Generic OpenID Connect Provider

Any OpenID Connect provider that meets the [provider requirements](single-sign-on.md#provider-requirements) works with VibeXP. This guide uses [Ory Hydra](https://www.ory.sh/hydra/) as the example; the same steps apply to other providers. Read [Single Sign-On](single-sign-on.md) first for how the role mapping and the access re-check work.

## Checklist for any provider

- The issuer serves a discovery document at `<issuer>/.well-known/openid-configuration`, over `https`.
- A confidential client with the authorization code flow, the `refresh_token` grant, and the redirect URI `<FRONTEND_BASE_URL>/api/v1/auth/callback`.
- The client may request `openid`, `email`, `profile` and `offline_access`. If the discovery document does not list `offline_access` in `scopes_supported`, VibeXP does not request it, and sessions are only re-checked if the provider issues a refresh token anyway.
- The ID token carries `email`, `email_verified`, and the roles claim you want to map, as a string or an array of strings.

## 1. Create the client (Ory Hydra)

With the Hydra CLI:

```bash
hydra create oauth2-client \
  --endpoint https://<hydra-admin-host> \
  --name vibexp \
  --grant-type authorization_code,refresh_token \
  --response-type code \
  --scope openid,email,profile,offline_access \
  --redirect-uri https://<your-app-host>/api/v1/auth/callback \
  --token-endpoint-auth-method client_secret_basic
```

Note the client ID and secret it prints. Hydra issues a refresh token only when `offline_access` is granted, so your consent app must grant it.

## 2. Put the roles into the ID token

Hydra takes the ID token's claims from your consent app. When the consent app accepts the consent request, include the user's roles in the ID token session:

```json
{
  "grant_scope": ["openid", "email", "profile", "offline_access"],
  "session": {
    "id_token": {
      "email": "ana@example.com",
      "email_verified": true,
      "groups": ["vibexp-admins", "engineering"]
    }
  }
}
```

The claim may be nested: `{"vibexp": {"roles": ["admin"]}}` is read with the roles claim `vibexp.roles`.

## 3. Add the provider in VibeXP

Under **Admin Portal** → **Settings** → **Authentication**, **Add provider**:

| Field | Value |
| --- | --- |
| **Provider type** | **OpenID Connect** |
| **Issuer URL** | Hydra's public issuer, for example `https://<hydra-public-host>` |
| **Client ID**, **Client secret** | From step 1 |
| **Roles claim** | `groups` |
| **Admin values** | `vibexp-admins` |

Use **Test** to check that VibeXP can read the discovery document.

## 4. Verify

1. Sign in to VibeXP as a user whose ID token carries `vibexp-admins`. The **Admin Portal** entry appears in the user menu.
2. In **Settings** → **Authentication**, the **Instance admins** card lists the user with the **Identity provider** badge and the matched value.
3. Revoke the user's consent session in Hydra, which revokes its refresh tokens. Within `auth.session_recheck_interval` (15 minutes by default), the refresh is refused and the user's next request ends the VibeXP session.

Hydra keeps the ID token claims of the original consent for a refreshed token. A role change in your user store therefore reaches VibeXP at the user's next sign-in, unless your setup updates the claims at refresh (for example with Hydra's token hook). Keycloak, by contrast, reads the roles again at every refresh.
