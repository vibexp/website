# Instance Email

The **instance email provider** is the account your VibeXP instance sends its
own mail through. Since v0.15.0 it is stored in the database and configured in
the admin area, under **Settings** → **Email**, instead of in `config.yaml`.

It carries:

- invitations, notifications and daily digests for every team that has not
  configured [its own provider](../integrations/email-provider.md);
- support requests from the contact form, always, whatever the team uses;
- the account emails of [password sign-in](password-sign-in.md): setup links, password reset links and password-change notices.

:::note[Without a provider, addresses are verified only through sign-in providers]
A password reset email goes only to an address that is verified, or to an account with no sign-in provider connected. On an instance without an email provider, an account's address is only ever verified through a sign-in provider that reports it verified: completing an emailed setup or reset link would also verify it, but that needs email, and no administrator action marks an address verified.
:::

:::caution[Unconfigured instance mail is discarded, not queued]
Until a provider is stored here, every message the instance would send is
silently dropped: no error reaches the person who triggered it, and nothing is
retried later. The only traces are the warnings described under
[Status, health and warnings](#status-health-and-warnings) and a line in the
server log, written at most once every 15 minutes while mail is being
discarded.
:::

## Who can configure it

Only an [instance admin](instance-admin.md). The page lives at
`/admin/settings/email`: open the admin area, then **Settings** → **Email**.
Everyone else, team owners included, is sent back to the app's home page, and
the API behind the page answers 404.

The first instance admin is named in `INSTANCE_ADMIN_EMAILS` (or
`auth.instance_admins` in a mounted `config.yaml`). If that list is empty and
no mail is configured, the server logs a warning at startup that nobody can
configure it.

A saved change applies to the next message. No restart is needed.

## Configure a provider

Pick a provider in the **Provider** card and fill in its fields:

| Provider | Fields | Credential |
| --- | --- | --- |
| **SMTP** | **Host**, **Port**, optional **Username** | **SMTP password** (optional, see [below](#smtp-relay-without-a-credential)) |
| **Mailgun** | **Sending domain** (the bare domain, not a URL), optional **API base URL** for a non-US region | **Sending key** |
| **Postmark** | optional **Message stream** (defaults to `outbound`) | **Server token** |
| **SendGrid** | _(none)_ | **API key** |

Then the **Sender identity** card:

- **From address** (required): the address instance mail is sent from.
- **Display name** (optional): shown beside the from address.
- **Reply-To** (optional): replies go here instead of the from address.
- **Contact form recipient** (optional): the inbox support requests are
  delivered to. Blank uses the from address.

Press **Save changes** to store the configuration.

### How the credential is handled

The credential is stored encrypted with the instance's encryption key
(`ENCRYPTION_KEY`) and is **never returned**, neither by the page nor by the
API: both show only whether one is stored. When you edit a stored
configuration, leave the credential field blank to keep the stored one.
Switching to Mailgun, Postmark or SendGrid needs that provider's own
credential; switching to SMTP with the password left blank stores none (see
[below](#smtp-relay-without-a-credential)). The old provider's credential is
never carried over.

### Internal hosts are allowed

A [team provider](../integrations/email-provider.md) may not point at a
loopback or private address unless the range is declared in
`OUTBOUND_ALLOWED_CIDRS`. The instance provider is exempt from that guard: the
instance admin is the operator, so `localhost`, a sidecar on the Docker network
or a relay inside your VPC work without any allowlist entry.

## SMTP relay without a credential

For SMTP, the **SMTP password** may be left blank. That configures an
unauthenticated relay, such as Mailpit, a sidecar Postfix or a cloud-internal
relay: no credential is stored and no SMTP `AUTH` is attempted.

This applies to the instance provider and to SMTP only. Mailgun, Postmark and
SendGrid always need a credential, and a team's SMTP provider still needs a
password.

To turn a stored, authenticated SMTP configuration into a credential-free one,
use **Remove configuration** and then save it again without a password. Simply
clearing the field does not do it: on a save from SMTP to SMTP a blank password
keeps the stored one.

## Send a test email

**Send test email** sends a real message and reports the outcome without
saving anything:

- With the form untouched, it tests the **stored** configuration.
- After any edit, it tests the **values in the form**, saved or not.

The message always goes to your own account address; there is no recipient
field.

A stored credential is reused for a test only when the test targets the
destination it was issued for: the same SMTP host, port and username, or the
same Mailgun sending domain and API base URL. Change one of those without
typing the credential and the SMTP test runs without a password, which the page
tells you ("This test ran without a password…"); for Mailgun the credential is
then required. Enter the credential to test the new destination with it.

A test send does not change the delivery status described next: only real mail
does.

## Status, health and warnings

The card at the top of the page shows one of three states:

| State | Meaning |
| --- | --- |
| **Not configured** | Nothing is stored. Instance mail is being discarded. |
| **Healthy** | A provider is stored and its last observed send succeeded, or it has not sent anything yet. |
| **Delivery failing** | The last observed send failed. The error and its time are shown. |

It also shows when mail was last delivered successfully and who last saved the
configuration. After a failure followed by a successful send the state returns
to **Healthy**, and the earlier error stays visible for diagnosis.

Two more places warn an instance admin:

- A **banner** across the admin area, "Instance email is not configured" or
  "The last instance email send failed", with a **Configure email** link. It
  can be dismissed for the rest of the browser session and is not shown on the
  Email page itself, which already carries the status card.
- The **Instance email** card on the admin dashboard, reading **Configured**,
  **Not configured** or **Last send failed**.

Both are visible to instance admins only. Team members see no warning at all,
which is why an unconfigured instance is easy to miss from inside a team.

## Change history

The **Change history** card at the bottom of the page lists every save and
removal: who made it, when, and which fields changed. Credentials are never
recorded, only **Credential changed** or **Credential unchanged**.

A configuration imported from `config.yaml` during an upgrade appears here as
**Imported from config.yaml**, with no user attached.

## Remove the configuration

**Remove configuration** deletes the stored provider and its credential. From
that moment instance mail is discarded again until a provider is configured.
Teams with their own provider are unaffected.

:::caution[A leftover `email:` section brings it back]
While the deprecated `email:` section or its environment variables are still
populated, the server imports them again at the next start whenever nothing is
stored. A removed configuration, credential included, therefore returns after a
restart. Delete the section and the variables first: see
[Upgrading from the `email:` config section](#upgrading-from-the-email-config-section).
:::

## Instance and team providers

Which provider carries a message is decided per message:

| The team has | Mail goes through |
| --- | --- |
| its own provider | the team's provider. It never falls back to the instance, even when it is failing. |
| no provider, and the instance is configured | the instance provider |
| no provider, and the instance is not configured | nowhere: the message is discarded |

Support requests always use the instance provider. See
[Email Provider](../integrations/email-provider.md) for the team side.

## Upgrading from the `email:` config section

Before v0.15.0 the instance provider was the `email:` section of `config.yaml`,
set in the published image through `EMAIL_PROVIDER`, `SMTP_HOST` and the other
email environment variables. That section is deprecated: at startup v0.15.0
imports it into the database when nothing is stored there yet, and ignores it
whenever a provider is stored.

→ [Instance email moved to Admin → Settings → Email](upgrading.md#instance-email-moved-to-admin--settings--email-v0150)

## API

The same operations are available to an instance admin under
`/api/v1/admin/settings/email`. Callers who are not instance admins get a 404.

- `GET` returns the configuration and its health. It always answers 200: an
  instance with nothing stored reports `configured: false`.
- `PUT` creates or replaces the configuration. Omit `secret` to keep the stored
  credential; an empty string is rejected.
- `DELETE` removes it, and answers 409 when nothing is stored.
- `POST .../email/test` sends the test message, with the configuration in the
  request body or, without one, the stored configuration.
- `GET .../email/audit` returns the change history, newest first. `limit` is
  1 to 100 (default 20) and `cursor` continues from a previous page.
