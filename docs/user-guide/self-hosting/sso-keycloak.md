# Single Sign-On with Keycloak

This guide connects VibeXP to a Keycloak realm through OpenID Connect and makes the holders of a realm role instance admins. Read [Single Sign-On](single-sign-on.md) first for how the role mapping and the access re-check work.

## 1. Create the client

1. In the realm, create a client of type **OpenID Connect**.
2. Turn **Client authentication** on (a confidential client) and keep **Standard flow** enabled.
3. Add the redirect URI from the VibeXP provider dialog to **Valid redirect URIs**: `<FRONTEND_BASE_URL>/api/v1/auth/callback`.
4. Copy the client secret from the **Credentials** tab.

Keycloak lists `offline_access` in its discovery document, so VibeXP requests it and gets a refresh token, which it needs to [re-check the session](single-sign-on.md#access-re-check). The user needs the `offline_access` realm role, which is part of the realm's default roles unless you removed it.

## 2. Put the realm roles into the ID token

Keycloak puts realm roles into the `realm_access.roles` claim. VibeXP reads the **ID token**, so the claim must be there and not only in the access token:

1. Open **Client scopes** → **roles** → **Mappers** → **realm roles**.
2. Make sure **Add to ID token** is on.

Then create a realm role, for example `vibexp-admin`, and assign it to the users or groups who should be instance admins.

To map **client roles** instead, use the claim `resource_access.<client-id>.roles` and turn on **Add to ID token** on the **client roles** mapper. To map **group membership**, add a **Group Membership** mapper with the claim name `groups`; with **Full group path** on, the values carry a leading slash, such as `/vibexp-admins`.

## 3. Add the provider in VibeXP

Under **Admin Portal** → **Settings** → **Authentication**, **Add provider**:

| Field | Value |
| --- | --- |
| **Provider type** | **OpenID Connect** |
| **Issuer URL** | `https://<keycloak-host>/realms/<realm>` |
| **Client ID**, **Client secret** | From the Keycloak client |
| **Roles claim** | `realm_access.roles` |
| **Admin values** | `vibexp-admin` |

## 4. Verify

1. Give a test user the `vibexp-admin` role and sign in to VibeXP as that user. The **Admin Portal** entry appears in the user menu.
2. In **Settings** → **Authentication**, the **Instance admins** card lists the user with the **Identity provider** badge: "via &lt;display name&gt;, matched `vibexp-admin`".
3. Remove the role in Keycloak. Within `auth.session_recheck_interval` (15 minutes by default), the user's next request no longer has admin access. Disabling the user in Keycloak ends their VibeXP session the same way.
