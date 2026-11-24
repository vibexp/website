# Single Sign-On with Okta

This guide connects VibeXP to Okta through OpenID Connect and makes the members of an Okta group instance admins. Read [Single Sign-On](single-sign-on.md) first for how the role mapping and the access re-check work.

## Use a custom authorization server

VibeXP requests the scopes `openid`, `email` and `profile`, plus `offline_access`, and no `groups` scope. Okta's **org authorization server** puts groups into the ID token only when the `groups` scope is requested, so with it the role mapping never sees a groups claim. Use a **custom authorization server** instead, such as the one named `default`, and add the groups claim there.

Sign-in alone works with either: if you do not need the role mapping, the org authorization server (issuer `https://<your-okta-domain>`) is enough.

## 1. Create the application

1. In the Okta Admin Console, create an app integration: sign-in method **OIDC - OpenID Connect**, application type **Web Application**.
2. Under grant types, keep **Authorization Code** and select **Refresh Token**. The refresh token is what lets VibeXP [re-check the session](single-sign-on.md#access-re-check).
3. Add the redirect URI from the VibeXP provider dialog as a **Sign-in redirect URI**: `<FRONTEND_BASE_URL>/api/v1/auth/callback`.
4. Keep client authentication on **Client secret**.
5. Assign the people or groups who may sign in. Someone who is not assigned gets the **No access** page in VibeXP.

## 2. Add the groups claim

In **Security** → **API**, open the authorization server and its **Claims** tab, and **Add Claim**:

| Setting | Value |
| --- | --- |
| Name | `groups` |
| Include in token type | **ID Token**, **Always** |
| Value type | **Groups** |
| Filter | **Matches regex** `.*`, or a narrower filter such as **Starts with** `vibexp-` |
| Include in | **Any scope** |

Make sure the authorization server's access policy lets the application use the **Authorization Code** and **Refresh Token** grants and the `offline_access` scope.

## 3. Add the provider in VibeXP

Under **Admin Portal** → **Settings** → **Authentication**, **Add provider**:

| Field | Value |
| --- | --- |
| **Provider type** | **OpenID Connect** |
| **Issuer URL** | `https://<your-okta-domain>/oauth2/default` (or your custom authorization server's issuer) |
| **Client ID**, **Client secret** | From the Okta application |
| **Roles claim** | `groups` |
| **Admin values** | The Okta group name, for example `vibexp-admins` |

Okta group names are matched exactly and case-sensitively. Use **Test** to check the issuer before you save.

## 4. Verify

1. Add a test user to `vibexp-admins` in Okta and sign in to VibeXP as that user. The **Admin Portal** entry appears in the user menu.
2. In **Settings** → **Authentication**, the **Instance admins** card lists the user with the **Identity provider** badge: "via &lt;display name&gt;, matched `vibexp-admins`".
3. Remove the user from the group in Okta. Within `auth.session_recheck_interval` (15 minutes by default), the user's next request no longer has admin access, and the row disappears from the card.

If the user does not become an admin, the ID token most likely has no `groups` claim: check the claim is set to **ID Token**, **Always** on the authorization server whose issuer you entered.
