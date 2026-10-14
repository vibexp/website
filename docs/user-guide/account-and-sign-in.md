# Signing In and Your Account

You sign in to VibeXP through a sign-in provider (Google, GitHub or your organization's single sign-on), with an email address and a password, or both: one account can have several ways in. Which of them your instance offers is up to whoever runs it.

This page covers the password side and the **Account settings** page. Running an instance? See [Email and Password Sign-In](self-hosting/password-sign-in.md).

## Getting a password

You cannot sign up with a password on the sign-in page. You set one through a link:

- **A team invitation.** Open the invitation link while signed out. It shows the team, who invited you and the invited address. Under "Create your account for &lt;your address&gt; to join", enter a name (optional) and a password twice, then **Create account and join**. You are signed in and land in the team. If your address already has an account, the page offers **Sign in to accept** instead.
- **A setup link from an administrator**, when they created your account for you. It opens **Set up your account** with your address filled in. Choose a password, then **Create password and sign in**. A setup link works once, for 7 days.
- **Account settings**, if you already sign in through a provider: see [Set, change or remove your password](#set-change-or-remove-your-password).

A password needs at least 12 characters. It cannot be a common password or your email address.

:::caution[Verify your address before you sign in through a provider]
An account created from an invitation, or from a link an administrator handed you, has an address that is not verified yet. While it is not, the **first** sign-in through a provider that reports the address as verified, even your own, takes the account over: your password is removed, and your API keys, connected tools and sessions are revoked. This protects the address's real owner from an account someone else set up with it.

To keep your password, verify the address first by completing an emailed link: choose **Forgot password?** on the sign-in page and use the link it sends. After that, a provider sign-in simply adds itself as another way in. If your instance does not send email, there is no way to verify the address first, so the first provider sign-in always replaces the password.
:::

If a link says **This link is not valid**, it has expired or was already used. Ask for a new one. If you already set a password, sign in with it.

## Signing in with a password

When your instance offers it, the sign-in page has an email and password form beside the provider buttons. After too many wrong passwords, password sign-in for your account is locked for a while, at most 15 minutes.

## Forgot your password?

Choose **Forgot password?** under the password form.

- **If your instance sends email:** enter your address and choose **Email me a reset link**. If the address belongs to an account, a link arrives that works for 1 hour. Open it, choose a new password, and choose **Set password and sign in**. You are signed in, and your other browsers are signed out. Tick **Also revoke API keys and connected tools** if you think someone else had access: it deletes your API keys and disconnects MCP and other connected tools.
- **If it does not:** the page says **Ask your administrator**. An administrator can give you a link to set a new password.

No email arrives if your account signs in through a provider and your address has not been verified yet. Signing in through that provider once verifies it. Otherwise, ask an administrator to show you a reset link and hand it over.

## Account settings

Open **Settings** → **Account settings**: your name, your password and the ways you sign in.

### Profile

**Name** is how you appear to the people you work with.

### Set, change or remove your password

- **Set a password** adds one to an account that signs in through a provider. You can then sign in either way.
- **Change password** needs your **Current password**, then the new one twice. Your other devices are signed out. Tick **Also revoke API keys and connected tools** to also delete your API keys and disconnect your MCP and CLI tools.
- **Remove password** is offered when an enabled sign-in provider is connected to your account. Afterwards you sign in through the provider only, and your other devices are signed out.

If an administrator disabled your password, the page says **Disabled by an administrator**. The password cannot sign you in and cannot be changed here. Ask the administrator for a link to set a new one; using it lifts the block.

### Sign-in methods

**Sign-in methods** lists your password and each connected sign-in provider, with when it was connected and last used. Your only way to sign in can never be removed: add another one first.

**Disconnect** removes a provider account from yours, and signs out your other devices. A disconnected provider account stays out: signing in with it again does not reconnect it, even with the same email address. The sign-in page explains why it was refused. To use it again, sign in another way, find it under **Disconnected** on this page and choose **Allow again**. The next sign-in through that provider then connects it.

### Sign in again for sensitive changes

Setting a first password, removing your password, disconnecting a provider and allowing one again are only possible within 10 minutes of signing in. Otherwise the page asks you to **Sign in again** first. These changes are only possible from the browser, not with an API key or a connected tool.

## Related

- [Team roles & permissions](team-roles-and-permissions.md)
- [Email and Password Sign-In](self-hosting/password-sign-in.md), for administrators
