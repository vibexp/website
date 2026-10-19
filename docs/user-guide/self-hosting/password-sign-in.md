# Email and Password Sign-In

Since v0.16.0 people can sign in to VibeXP with an email address and a password, beside or instead of the [sign-in providers](authentication.md#sign-in-providers). An instance can run on passwords alone, with no Google, GitHub or OpenID Connect provider at all.

Password sign-in is **off** by default. Upgrading changes nothing until an instance admin switches it on.

:::note[Nobody signs up with a password on their own]
A password is always set through a link: a team invitation, a setup link from an administrator, or a reset link. The sign-in page never offers to create an account with a password. Who may get a **new** account through a sign-in provider is decided by the [registration mode](#registration-mode).
:::

This page is for whoever runs the instance and its admins. What people see on their side is in [Signing In and Your Account](../account-and-sign-in.md).

## Switch password sign-in on

Open **Admin Portal** from the user menu, then **Settings** → **Authentication**. The **Sign-in and registration** card has a badge, **Password sign-in on** or **Password sign-in off**, and two settings:

| Setting | What it does |
| --- | --- |
| **Password sign-in** | People sign in with their email address and a password. While it is off, the sign-in page shows no password form, and setup and reset links cannot be made. |
| **Registration** | **Open** or **Invitation only**: see [Registration mode](#registration-mode). |

**Save sign-in policy** stores both. Every change is recorded in the change history on the same page, under **Sign-in policy**.

A change takes effect at once on the server that saved it. On an instance with several servers (replicas), the others pick it up within about 2 seconds.

While password sign-in is on and no email provider is configured, the card warns **Forgotten passwords need an administrator**: nobody can be sent a reset link, so whoever forgets their password needs one from an admin. See [Without an email provider](#without-an-email-provider).

### Switching it off

Switching password sign-in off asks for confirmation when it could lock people out. The dialog lists every reason that applies; continue with **Switch it off anyway** only if you have another way in.

| The dialog says | Meaning |
| --- | --- |
| **This leaves no way to sign in** | No sign-in provider is enabled, so passwords are the only way in. Nobody could sign in afterwards, you included once your session ends, and the instance returns to [setup mode](#when-the-last-way-in-is-lost). |
| **You signed in with a password** | You could not sign in again once your session ends, unless an enabled provider lets you in. |
| **N accounts can only sign in with a password** | Those accounts have no sign-in provider connected and could not sign in. Their passwords are kept and work again when password sign-in is switched back on. |

### Passwords

A password must be at least 12 characters long, must not be a common password, and must not be the account's email address. Repeated wrong passwords lock password sign-in for that account for a while, at most 15 minutes.

## Registration mode

The mode decides who can get a **new** account. Accounts that already exist are never affected by it.

| Mode | Who gets a new account |
| --- | --- |
| **Open** (default) | Anyone a sign-in provider accepts, the first time they sign in, within the [access allowlist](authentication.md#restricting-who-can-sign-in-optional). Anyone invited to a team or created by an admin. |
| **Invitation only** | Only someone with a pending team invitation sent to their address, or an account an admin creates. A provider sign-in that would create an account is refused with "This sign-in cannot create an account". |

Under **Invitation only**, a provider sign-in that would create an account is accepted only when the provider reports the email address as **verified** and the address either has a pending team invitation or is a [root admin](instance-admin.md#root-admins-and-granted-admins).

:::caution[A root admin needs a verified email]
In **every** registration mode, a provider sign-in that would create a root admin's account is accepted only when the provider reports the address as verified. A generic OpenID Connect provider that omits the `email_verified` claim, or an account whose primary email is unverified at the provider, gets "This sign-in cannot create an account" for a root admin who has no account yet. Use a provider that reports verified addresses (Google does; GitHub does for a verified primary email), or the setup page's **Use email and password**. An existing root admin account whose address is not verified holds no root admin power until it is: see [Root admins need a verified email](instance-admin.md#root-admins-need-a-verified-email).
:::

## Run an instance on passwords alone

[First-run setup](authentication.md#first-run-setup) offers a second path beside adding a provider. The setup page has a **Use email and password** card:

1. Name the root admin first: the address must be listed in `INSTANCE_ADMIN_EMAILS` (`auth.instance_admins`). Any other address is refused with "This address is not a root instance admin".
2. On the setup page, fill in **Root admin email**, the password and **Repeat the password**, then **Set up admin and sign in**.

This creates the account if it does not exist yet (or replaces the password of the one that does, ending its sessions), switches password sign-in on, and signs you in. Setup is finished.

The address is treated as verified, because the operator vouches for it. The recovery command below does the same. Adding an identity provider later and signing in with the same address links to the same account and keeps the password.

If the setup page says **This browser is signed in**, a signed-in admin's session is taking precedence over the setup session, and only the setup session may set a root admin's password. Use **Sign out here** and the page works again, or open the setup URL in a private window.

## When the last way in is lost

Setup mode is not only for a new instance. It is on whenever **no sign-in method is usable**: no identity provider is enabled, and either password sign-in is off or no instance admin has a password that works. An instance admin's password stops working when an admin disables it, when the admin is suspended, or when password sign-in is switched off.

So on a password-only instance, losing the last admin password puts the instance back in setup mode, and the **next start logs a new `SETUP URL`**. That, or `setup rearm` for a URL right away, is the intended way back, together with the recovery command below. See [Lockout Recovery](lockout-recovery.md).

## Recovery command: set a root admin's password

`./main admin auth password set --email <root-admin-email>` sets the password of a **root** instance admin whose account already exists, reading the password from the terminal or standard input, never from the command line. `--enable-login` also switches password sign-in on. Because it marks the address verified, it is also how a root admin account from before v0.16.0 gets its root admin power back when the provider does not verify email. It cannot create the account: for a root admin with no account yet, run `setup rearm` and use **Use email and password** on the setup page. See [Set a root admin's password](lockout-recovery.md#set-a-root-admins-password) for the details.

## Create users and hand over setup links

In the admin portal, **Users** → **New user** creates an account and its personal workspace before the person ever signs in.

- **Email** is the only required field. **Name** is optional.
- **Expected identity provider** is a label for your records only; it does not pre-link a provider account.
- **Add to teams** places the account in up to 50 shared teams, as **Member** or **Admin**, from the start.

After **Create user**, the dialog says how the person gets in:

| Outcome | When | What to do |
| --- | --- | --- |
| **Setup link emailed** | An email provider is configured. | Nothing: they open the link and set their password. |
| **Setup link** | No email provider is configured. | Copy the link and send it to them yourself. **It will not be shown again.** Anyone with the link can set the password. |
| **No setup link** | Password sign-in is off; or the address is a root admin and no email provider is configured; or the email or the link failed. | The dialog says which. They can sign in through an identity provider with that address, or you get a link later. |

A setup link works **once** and for **7 days**. A root admin's link is never shown on screen (it would hand over a root admin account): set up email, or use the setup page or the recovery command for that address.

On the user's page, **Sign-in methods** shows **Pending setup** until the account has a way in. The **Users** list marks such accounts **Pending setup** too, and its **Account setup** filter (**Any setup**, **Pending setup**, **Set up**) lists only those or only the others. For a pending account, **Get setup link** emails a new link or shows it here; any earlier setup link stops working, emailed or shown.

## Reset or remove a password

On the page of an account that has a password:

- **Reset password** emails a reset link (it works for 1 hour) or shows it here once (it works for 24 hours). By default the current password and the person's sessions keep working until they use the link.
- **Sign out and disable the current password now** is for a password that may be known to someone else. It asks again, then disables the current password at once and signs the person out everywhere. Their page then shows **Password (disabled)**, and on their side **Disabled by an administrator**: only a new link from an admin lets them set a password again.
- **Remove password** takes the password away. Their signed-in sessions keep running. If it is their only way to sign in, the dialog asks again (**This is their only way to sign in** → **Remove it anyway**); the account is then **Pending setup** until you send a setup link or they sign in through a provider with that address.

An account that signs in only through a provider gets **Send a link to set a password** instead: the way back in when the instance loses or switches off that provider.

With no [email provider](instance-email.md) configured, **Get setup link**, **Reset password** and **Send a link to set a password** offer only **Show the link here**. **Email it to &lt;address&gt;** stays visible but disabled, with the note "No email provider is configured, so the link cannot be emailed: show it here and hand it over."

A new link from an administrator replaces every earlier link of its kind for that account, emailed or shown, including a forgot-password link the person requested themselves. The other way round does not apply: a forgot-password request replaces only the person's own earlier emailed link, never a link an administrator handed over. Two cases need another route, for **Reset password** and **Send a link to set a password** alike:

- An account that has a sign-in provider connected and an address that is **not verified** (every account from before v0.16.0, until its next provider sign-in with a verified address) cannot be emailed a link: use **Show the link here** and hand it over.
- A root admin's link is never shown on screen. For a root admin in that position, use the [recovery command](#recovery-command-set-a-root-admins-password) or the setup page.

These actions are hidden on your own account. A suspended account cannot be sent setup or reset links (reactivate it first), but its password can be removed. Setup and reset links are unavailable while password sign-in is off; removing a password is not.

## Invitations

A team invitation link works for someone who has no account yet. Signed out, it shows the team, who invited them and the invited address, and offers "Create your account for &lt;address&gt; to join": an optional name and a password. **Create account and join** creates the account and adds them to the team. The address is the invited one and cannot be changed.

- With password sign-in off, the page offers the enabled providers only.
- Someone whose address already has an account gets **Sign in to accept**.
- Under **Invitation only**, this is the way in for a new person, together with admin-created accounts.

**The access allowlist still applies.** An invited address that the allowlist does not admit is refused ("Access to this instance is restricted. Contact your administrator if you believe this is a mistake."), so allow the domain or the address before you invite someone outside it.

**A root admin's address cannot create its account from an invitation.** That account comes from the setup page, the recovery path or a sign-in through a provider.

:::caution[An unverified password account can be taken over by its address's owner]
An account created from an invitation, or set up through a link an admin handed over, has an address nobody has verified. If someone later signs in through a provider that reports that address as **verified**, that sign-in takes the account over: its password and pending links are removed, and its API keys and sessions are revoked. This protects the real owner of the address from an account someone else set up with it. When an email provider is configured, the address then receives an email, "Your &lt;instance name&gt; password was removed", naming the provider that signed in. Once an address is verified (see [Forgot password](#forgot-password)), this no longer happens.
:::

## Forgot password

The sign-in page's password form has **Forgot password?**. The person enters their address and is told to check their email; the page says the same whether or not the address has an account. A reset link works for **1 hour**, and one account gets at most one reset email every 5 minutes.

No email is sent (and the page still says the same) when:

- no instance email provider is configured;
- the account is suspended, or an admin disabled its password;
- the [access allowlist](authentication.md#restricting-who-can-sign-in-optional) does not admit the address;
- the account has a sign-in provider connected and its address is **not verified**. This covers accounts from before v0.16.0 until their next provider sign-in with a verified address: someone who can no longer use their provider needs an admin to show them a reset link ([Reset or remove a password](#reset-or-remove-a-password)).

An address is verified when the person signs in through a provider that reports it verified, completes an emailed setup or reset link, or when the operator sets it up on the setup page or with the recovery command. A provider sign-in verifies the address only when the provider reports that same address as verified.

### Without an email provider

With no instance email provider, the forgot-password page shows **Ask your administrator** instead of a form: an admin issues a reset link and hands it over. On such an instance, an address is only ever verified through a sign-in provider that reports it verified, or, for a root admin, through the setup page or the recovery command. No action in the admin area marks an address verified. See [Instance Email](instance-email.md).

## Related

- [Authentication & MCP Auth](authentication.md): providers, the allowlist and first-run setup
- [Lockout Recovery](lockout-recovery.md): the `admin auth` commands
- [Signing In and Your Account](../account-and-sign-in.md): the user's side
- [Upgrading](upgrading.md#email-and-password-sign-in-v0160): what changes for an existing instance
