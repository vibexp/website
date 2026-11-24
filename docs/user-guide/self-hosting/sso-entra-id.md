# Single Sign-On with Microsoft Entra ID

This guide connects VibeXP to Microsoft Entra ID through OpenID Connect and makes the holders of an app role instance admins. Read [Single Sign-On](single-sign-on.md) first for how the role mapping and the access re-check work.

## 1. Register the application

1. In the Microsoft Entra admin center, create an **App registration**. Under **Redirect URI**, choose the **Web** platform and enter the redirect URI from the VibeXP provider dialog: `<FRONTEND_BASE_URL>/api/v1/auth/callback`.
2. Under **Certificates & secrets**, create a **client secret** and copy its value.
3. Under **API permissions**, make sure the Microsoft Graph delegated permissions `openid`, `email`, `profile` and `offline_access` are granted. `offline_access` is what returns a refresh token, which VibeXP needs to [re-check the session](single-sign-on.md#access-re-check).

To let only assigned people sign in, open the application's **Enterprise application** entry and set **Assignment required** to **Yes**, then assign users or groups.

## 2. Choose the claim: app roles or groups

**Use app roles (recommended).** Under **App roles** in the app registration, create a role with **Allowed member types** including users, and a **Value** such as `VibeXP.Admin`. Assign it to people or groups in the enterprise application. An assigned role appears in the ID token's `roles` claim as its **Value**, with no extra configuration.

**Or use groups.** Under **Token configuration**, **Add groups claim** and include it in the **ID** token. Be aware that for cloud groups the `groups` claim carries the groups' **object IDs** (GUIDs), not their names, so the admin value must be the group's object ID. A user in more groups than Entra puts into a token gets no `groups` claim at all, and so would not match.

## 3. Add the provider in VibeXP

Under **Admin Portal** → **Settings** → **Authentication**, **Add provider**:

| Field | Value |
| --- | --- |
| **Provider type** | **OpenID Connect** |
| **Issuer URL** | `https://login.microsoftonline.com/<tenant-id>/v2.0` |
| **Client ID** | The **Application (client) ID** |
| **Client secret** | The secret's value |
| **Roles claim** | `roles` (app roles) or `groups` (groups claim) |
| **Admin values** | `VibeXP.Admin`, or the group's object ID such as `3f2b8c1e-...` |

:::caution[Entra ID tokens may not mark the email as verified]
VibeXP treats an email as verified only when the ID token carries `email_verified: true`. If your tenant's ID tokens carry no such claim, VibeXP treats the address as unverified, so a restricted [access allowlist](authentication.md#restricting-who-can-sign-in-optional) denies those users. Restrict sign-in with **Assignment required** in Entra instead, and check the ID token's claims before you rely on the allowlist.
:::

## 4. Verify

1. Assign `VibeXP.Admin` (or add to the group) a test user and sign in to VibeXP as that user. The **Admin Portal** entry appears in the user menu.
2. In **Settings** → **Authentication**, the **Instance admins** card lists the user with the **Identity provider** badge and the matched value.
3. Remove the assignment in Entra. Within `auth.session_recheck_interval` (15 minutes by default), the user's next request no longer has admin access.
