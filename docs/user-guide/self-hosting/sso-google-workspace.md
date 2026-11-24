# Single Sign-On with Google Workspace

Google Workspace accounts sign in to VibeXP through the **Google** provider type. Sign-in and restricting it to your domain work; mapping Google groups to instance admins does not. Read [Single Sign-On](single-sign-on.md) for the general model.

## What works and what does not

| | Google Workspace |
| --- | --- |
| Sign-in | Yes, with the **Google** provider type. |
| Restrict sign-in to your domain | Yes, with the access allowlist. |
| Instance admins from Google groups | **No.** Google puts no groups into the ID token, and the **Google** provider type has no role mapping. Name the admins in `auth.instance_admins` or grant them in the admin area. |
| Access re-check | Only for sessions that hold a refresh token, see below. |

## 1. Create the OAuth client

In the Google Cloud console of your Workspace organisation, create an OAuth 2.0 client ID of type **Web application**, and add the redirect URI from the VibeXP provider dialog under **Authorized redirect URIs**: `<FRONTEND_BASE_URL>/api/v1/auth/callback`. To keep the consent screen to your organisation, set the OAuth consent screen's user type to **Internal**.

## 2. Add the provider in VibeXP

Under **Admin Portal** → **Settings** → **Authentication**, **Add provider** with **Provider type** **Google**, and the client ID and secret from step 1.

## 3. Restrict sign-in to your domain

In the **Access allowlist** card on the same page, add your Workspace domain, for example `example.com`, under **Allowed domains**, and **Save allowlist**. The domain is matched exactly, so add every domain your users sign in with. See [Restricting who can sign in](authentication.md#restricting-who-can-sign-in-optional).

## Access re-check

VibeXP asks Google for a refresh token with `access_type=offline`. Google usually issues a refresh token only the first time a user consents to the application, and VibeXP does not force the consent screen, so a later sign-in may carry none. A session with a refresh token is re-checked every `auth.session_recheck_interval`; a session without one is not, and lasts until it expires or the user signs out. See [Access re-check](single-sign-on.md#access-re-check).

## Verify

1. Sign in with an address in your domain: it works.
2. Sign in with a personal Google account outside the allowlist: VibeXP refuses it.
