# Upgrading

Most VibeXP releases upgrade in place: pull the new image, restart, done. This
page lists the exceptions.

## Versioning and support

VibeXP publishes one image, `ghcr.io/vibexp/vibexp`, tagged `X.Y.Z` per release.

| Tag | Points at |
| --- | --- |
| `X.Y.Z` | that exact release, immutable |
| `latest` | the highest published version, not the most recent build: a backport patch on an older line never moves it |

The bundled `docker-compose.yml` tracks `latest`. Pin to `X.Y.Z` instead if you
want upgrades to be a deliberate step:

```yaml
image: ghcr.io/vibexp/vibexp:0.10.0
```

**Patch releases are supported on the newest minor line only.** Now that
`0.10.0` has shipped, fixes go to `0.10.x`, not `0.9.x`. To stay on a supported
version, follow the newest minor.

A patch release (`0.10.0` to `0.10.1`) contains bug fixes and security fixes
only. It never adds a database migration and never changes the API, so it is
always a straight image bump with no action on your side. Anything that needs a
schema or API change ships as a minor release and appears below if it requires
action.

**Everything below needs action when you upgrade**, either before the new image
will start or immediately after. Entries are newest first: if you are skipping
several releases, work upwards from the version you are on and apply every one
in between.

## Breaking changes

### Email and password sign-in (v0.16.0)

This release adds [email and password sign-in](password-sign-in.md). **Its
defaults change nothing**: password sign-in is off, and the registration mode
is **Open**, which is how every instance worked until now. Three things happen
at the upgrade itself.

**Email addresses become case-insensitive, and the upgrade stops on a clash.**
The first start runs a database migration that stores every account's email
address in lower case and makes addresses unique regardless of case. If two
accounts differ only by the case of their address (`Ana@example.com` and
`ana@example.com`), nothing can choose between them, so the migration changes
nothing and the server does not start. The log names the accounts:

```text
migration 023 stopped: these accounts have email addresses that differ only by letter case: …
```

To continue:

1. For each group it names, change the email of, or delete, every account but
   one.
2. Mark the failed migration as not applied:
   `UPDATE schema_migrations SET version = 22, dirty = false;`
3. Start VibeXP again.

Team invitation addresses are stored in lower case too; that cannot clash.

**One account can hold several sign-in methods.** Sign-in identities move to
their own table, so an account can have a password and several providers. A
sign-in through a provider that reports a **verified** address matching an
existing account now connects to that account. People can see and disconnect their
methods under **Settings** → **Account settings**
([Signing In and Your Account](../account-and-sign-in.md#sign-in-methods)).

**Existing provider accounts get no reset email until their address is
verified.** Accounts created before this release have no record of whether
their address was verified. Such an account gets no forgot-password email until its next sign-in through a provider that
reports the address verified. Someone who can no longer use their provider
needs a reset link from an administrator
([Reset or remove a password](password-sign-in.md#reset-or-remove-a-password)).
Dev-login accounts never get reset emails.

Nothing else needs action. To use passwords, switch them on under
**Settings** → **Authentication** → **Sign-in and registration**, and
[configure an email provider](instance-email.md) so that people can reset
their own passwords.

### Company branding moved to Site info (v0.15.0)

The company branding of an instance (its name, logo, support and legal links)
is no longer configured with `frontend.*` keys or `VITE_*` variables. It is
**site info** now: stored in the database and edited by an instance admin in
the admin area under **Settings** → **Site info**. See
[Site Info (Branding)](site-info.md).

These seven config keys are removed:

`frontend.site_name`, `frontend.site_legal_name`, `frontend.site_url`,
`frontend.terms_url`, `frontend.privacy_url`, `frontend.support_email`,
`frontend.brand_logo_url`.

So are the seven `VITE_*` variables that carried the same values:

`VITE_SITE_NAME`, `VITE_SITE_LEGAL_NAME`, `VITE_SITE_URL`, `VITE_TERMS_URL`,
`VITE_PRIVACY_URL`, `VITE_SUPPORT_EMAIL`, `VITE_BRAND_LOGO_URL`.

In the published image, `VITE_SITE_NAME`, `VITE_SITE_URL`, `VITE_SUPPORT_EMAIL`
and `VITE_BRAND_LOGO_URL` were the ones the image's own configuration read from
the container environment. The other three took effect only through their
`frontend.*` key in a mounted `config.yaml`, or in a frontend you built
yourself.

:::danger[Nothing is imported, and you may get no warning]
Unlike the other settings that moved to the admin area in v0.15.0, these values
are **not** imported. After the upgrade the instance shows VibeXP's own name and
logo, and no support, terms or privacy links, until you enter the values again.

Whether the server tells you depends on how you set them:

- **In a mounted `config.yaml`**: the file still loads. For each of the keys
  above that has a non-empty value, the server logs one warning,
  `config key "frontend.site_name" is deprecated: ...`, and it logs it again on
  **every** start until you delete the key.
- **Only as environment variables**, which is the usual Docker and Docker
  Compose setup: there is **no warning at all**. The configuration baked into
  the image no longer reads those variables, so the server never sees them.
:::

What to do after upgrading:

1. Sign in as an instance admin and open the admin area, then **Settings** →
   **Site info**. If you have no instance admin, set `INSTANCE_ADMIN_EMAILS`
   first (see [Instance Admin Portal](instance-admin.md)).
2. Enter the values again. The old settings map to the fields like this:

   | Old key / variable | Site info field |
   | --- | --- |
   | `frontend.site_name` / `VITE_SITE_NAME` | **Company name** |
   | `frontend.site_url` / `VITE_SITE_URL` | **Website** |
   | `frontend.support_email` / `VITE_SUPPORT_EMAIL` | **Company email** (the Support link falls back to it) |
   | `frontend.terms_url` / `VITE_TERMS_URL` | **Terms of service URL** |
   | `frontend.privacy_url` / `VITE_PRIVACY_URL` | **Privacy policy URL** |
   | `frontend.brand_logo_url` / `VITE_BRAND_LOGO_URL` | **Logo URL** |
   | `frontend.site_legal_name` / `VITE_SITE_LEGAL_NAME` | None. The copyright line uses the company name |

   Two defaults are gone with the keys. The terms and privacy links used to
   fall back to `/terms-and-conditions` and `/privacy-policy` under the site
   URL; now a link shows only when you enter its URL. The brand logo used to be
   only the link-preview image of a shared prompt; **Logo URL** is shown across
   the app and in emails.
3. Delete the keys from `config.yaml` and the variables from your deployment.

**The privacy policy URL has one home now.** It used to be an email setting as
well, printed in the email footer. In v0.15.0:

- The `email.privacy_policy_url` config key is removed. Like the keys above, a
  `config.yaml` that still sets it loads with a warning on every start, and the
  value is ignored, not imported.
- A privacy policy URL already **stored in the database** with the instance
  email settings is moved into site info automatically, by migration `021`. It
  is skipped, and the stored value dropped, when the value is empty, is the old
  placeholder `https://example.com/privacy-policy`, is longer than 2048
  characters, or site info already has a privacy policy URL.
- The admin email settings API (`/api/v1/admin/settings/email`) no longer
  returns `privacy_policy_url`, and a request that still sends it gets `400`.

After upgrading, check **Privacy policy URL** on the Site info page: it is what
the email footer, the sign-in page and the user menu link to.

### Sign-in providers and the access allowlist moved to the database (v0.15.0)

The sign-in providers (Google, GitHub, OIDC) and the access allowlist are no
longer read from `config.yaml`. They are stored in the database, with each
client secret encrypted, and an instance admin edits them in the admin area
under **Settings** → **Authentication**: see
[Authentication & MCP Auth](authentication.md). A change there applies with no
restart. The `auth.providers`, `auth.provider`, `auth.google`, `auth.github`,
`auth.oidc` and `auth.access_allowlist` keys are **deprecated**.

**If you run the published image with environment variables**, which is the
usual Docker and Docker Compose setup, these are the variables that feed those
keys, and all of them are deprecated:

`AUTH_PROVIDER`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
`GOOGLE_REDIRECT_URI`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`,
`GITHUB_REDIRECT_URI`, `OIDC_ISSUER_URL`, `OIDC_CLIENT_ID`,
`OIDC_CLIENT_SECRET`, `OIDC_REDIRECT_URI`, `AUTH_ALLOWED_DOMAINS`,
`AUTH_ALLOWED_EMAILS`.

These stay exactly as they are: `INSTANCE_ADMIN_EMAILS`,
`SESSION_ENCRYPTION_KEY`, `ENCRYPTION_KEY`, `OAUTH_AS_ISSUER_URL`,
`MCP_RESOURCE_URI` and `FRONTEND_BASE_URL`. A multi-provider list set as
`auth.providers` in a mounted `config.yaml` is handled the same way as
`AUTH_PROVIDER`.

**What v0.15.0 does at startup.** Providers and the allowlist are handled
separately, and you do not have to do anything for sign-in to keep working:

- **Providers.** If the database holds no provider, the server imports every
  provider that was enabled (named in `AUTH_PROVIDER` or `auth.providers`) and
  complete (a client ID and a client secret, plus the issuer URL for OIDC).
  Each keeps its name as its slug (`google`, `github`, `oidc`) and the label it
  had on the sign-in page, so the sign-in page does not change. The set is
  stored all at once or not at all. A provider that is not imported is logged
  at `WARN` as `A config.yaml auth provider was not imported`, with the reason:
  for example credentials set for a provider that was not enabled, or a
  missing secret.
- **Allowlist.** If the database holds no allowlist, the server imports
  `AUTH_ALLOWED_DOMAINS` and `AUTH_ALLOWED_EMAILS`. An entry that is not a
  valid domain or email address is dropped and logged, and the rest is kept.
  If no entry is valid, nothing is imported, the server logs an error, and
  sign-in is open to everyone the providers accept.

For an upgrading instance this happens on the first start of v0.15.0. Nothing
in the import can stop the server: a failure is logged and the instance starts
with what is stored.

**While something is stored, the database wins.** The variables are ignored:
changing `GOOGLE_CLIENT_SECRET` or `AUTH_ALLOWED_DOMAINS` and restarting no
longer changes anything. While any of them is still set, the server logs a
deprecation warning on every start, one per key, beginning
`config key "auth.provider" is deprecated`.

**With nothing stored, the variables are imported again.** The check is made
at every start, and it looks only at whether a provider (or an allowlist) is
stored. So if an admin deletes every provider, or uses **Reset to open
access** on the allowlist, while the variables are still set, the next restart
brings the old values back. The same goes for an allowlist removed with the
`allowlist clear` recovery command.

**The redirect URI is no longer configurable.** Every provider now redirects
to `<FRONTEND_BASE_URL>/api/v1/auth/callback`, and `GOOGLE_REDIRECT_URI`,
`GITHUB_REDIRECT_URI` and `OIDC_REDIRECT_URI` are ignored. Earlier releases sent
whatever those variables held. If the value you had set is anything other than
`<FRONTEND_BASE_URL>/api/v1/auth/callback`, the provider's console is
registered with an address VibeXP no longer uses, and it will refuse every
sign-in after the upgrade. The server logs a `WARN` naming the provider and
both addresses when it sees this, but by then sign-in is already failing.

**The allowlist is now enforced on every request, not only at sign-in.** A
signed-in user whose address no longer matches is signed out on their next
request. Root admins (`INSTANCE_ADMIN_EMAILS`) are always allowed; see
[Restricting who can sign in](authentication.md#restricting-who-can-sign-in-optional).

**A new instance needs none of these variables.** With no provider stored and
none to import, the server logs a one-time `SETUP URL` at startup instead: see
[First-run setup](authentication.md#first-run-setup).

:::caution[Check the redirect URI before you upgrade]
A sign-in provider that rejects the redirect URI locks out everyone who uses
it. Compare what is registered in the provider's console with
`<FRONTEND_BASE_URL>/api/v1/auth/callback` before you pull the new image, and
add that address there if it is missing. Most providers accept several
redirect URIs, so you can add it next to the old one.
:::

Who is affected: every instance that signs users in through Google, GitHub or
an OIDC provider, or that sets an access allowlist. An instance used only on
localhost with dev login is not.

What to do:

1. **Before upgrading**, make sure `<FRONTEND_BASE_URL>/api/v1/auth/callback`
   is registered as a redirect URI in each provider's console.
2. **Before upgrading**, make sure `INSTANCE_ADMIN_EMAILS` names at least one
   address you can sign in with. Only an instance admin can open the new
   settings page (see [Instance Admin Portal](instance-admin.md)).
3. Pull the new image and restart. In the logs, look for
   `Imported the config.yaml auth providers into the database` and, if you had
   an allowlist, `Imported the config.yaml auth.access_allowlist into the
   database`. Read any `was not imported` warning next to them.
4. Sign in, open the admin area and then **Settings** → **Authentication**.
   Check that each provider you expect is listed and enabled, and that the
   **Access allowlist** card shows **Restricted** with your domains and
   addresses if you had an allowlist.
5. Remove the thirteen environment variables above from your deployment, or
   the six keys from a mounted `config.yaml`. From now on, change these
   settings in the admin area.

Do step 5 soon, not eventually. While the variables remain they can bring back
a provider or an allowlist you removed, and they are scheduled to become a
startup failure: no earlier than the second minor release after v0.15.0, the
server will refuse to start while any of them is still set.

If sign-in does not work after the upgrade, see
[Lockout Recovery](lockout-recovery.md).

### Status fields are open strings in the API clients (v0.15.0)

v0.15.0 lets a team add [custom statuses](../statuses.md) to its prompts,
artifacts, blueprints and memories, so the `status` of a resource is no longer
one of a fixed list.

**What changed.** In v0.14.0 the OpenAPI schemas `PromptStatus`,
`ArtifactStatus`, `BlueprintStatus` and `MemoryStatus` were closed enums. In
v0.15.0 each is a plain string of at most 50 characters. The two API clients,
`@vibexp/api-client` and `github.com/vibexp/api-client-go`, are generated from
that spec, so their releases built from the v0.15.0 spec type these four as
plain strings too. In the Go client each is now an alias of `string`, with no
status constants.

**Who is affected.**

- Code built on either API client that uses the generated status enum type or
  its constants, or that switches exhaustively over it. It has to change when
  you update the client: Go code that names a generated status constant no
  longer compiles, and a switch that used to cover every value no longer does.
- Any API consumer that assumes a response `status` is one of the old values,
  whatever client it uses. Nothing differs until a team creates a custom
  status; from then on a resource can come back with a value such as
  `in-review`.

**What to do.** Treat `status` as a string. Compare it against the values you
care about and give every switch a default branch for the ones you do not know.
To learn which statuses a team has, and which of them are live, call
`GET /api/v1/{team_id}/statuses?resource_type=<type>`.

Requests are not loosened by this: a `status` the team does not have is still
rejected with `400`, on writes and on list filters.

### Prompts in any status except draft can be exposed over MCP (v0.15.0)

**What changed.** v0.14.0 exposed a prompt over MCP only when its status was
`published` and **Available in MCP** (`mcp_expose`) was on. v0.15.0 exposes
every prompt that is **not a `draft`** and has `mcp_expose` on, both as a
native MCP prompt and through `vibexp_io_render_prompt`.

**Who is affected.** Nobody on the day of the upgrade: until a team adds a
custom prompt status, every prompt is `draft` or `published`, and those two
behave as before. It starts to matter the first time a team gives a prompt a
[custom status](../statuses.md). A prompt in a status such as `in-review` or
`deprecated` is served to connected MCP clients like a published one, because a
custom status is always live.

**What to do.** If your team used "not published" to mean "not visible to AI
tools", keep such prompts in `draft`, or turn **Available in MCP** off on them.
A custom status does not hide a prompt.

### Search ranking and AI summary defaults moved to Admin → Settings (v0.15.0)

The instance-wide search ranking defaults and AI summary defaults are no longer
read from `config.yaml`. They are stored in the database, and an instance admin
edits them in the admin area under **Settings** → **Search** and **Settings** →
**AI Summary**: see
[Search & AI Summary Settings](search-and-ai-summary-settings.md). The `search:`
and `ai_summary:` sections are **deprecated**, and so are the four environment
variables that feed `ai_summary:` in the published image:

`AI_SUMMARY_ENABLED`, `AI_SUMMARY_TOP_N`, `AI_SUMMARY_REQUEST_TIMEOUT`,
`AI_SUMMARY_STYLE`.

The published image has no `search:` section and no environment variables for
it, so search values can only come from a `config.yaml` you mounted yourself.

**What v0.15.0 does at startup.** Each section is handled on its own. The
server compares the section's effective values with the built-in defaults and
checks whether settings are already stored in the database:

| Section's values | Nothing stored yet | Settings already stored |
| --- | --- | --- |
| Same as the built-in defaults | Nothing happens | Nothing happens |
| Different from the built-in defaults | The section is imported, with an **Imported** entry in the page's change history | The section is ignored, with a warning in the log at every start |

For an upgrading instance with tuned values, the import happens on the first
start of v0.15.0, and the log line names the section. The check is made at
every start, though, and it looks only at whether settings are stored. The
import never stops the server from starting.

Two details:

- An invalid `ai_summary:` section logs an error, imports nothing, and leaves
  the built-in defaults in effect. An invalid `search:` section still stops the
  server at startup, as it did before.
- `ai_summary.max_top_n` and `ai_summary.max_output_tokens_ceiling` are ignored
  and never imported. A non-default value only logs a warning.

**Teams are no longer capped by the instance.** Before v0.15.0, `max_top_n`
(default 10) and `max_output_tokens_ceiling` (default 4096) bounded what a team
could choose for its own AI summary settings. They no longer bound anything:
every team may choose up to **10** results and **32768** response tokens. On an
instance that never touched these keys, the limit on a team's response length
therefore rises from 4096 to 32768 tokens. If you lowered either key to cap
your teams, that cap is gone too. There is no replacement setting.

**Who is affected:** instances with a `search:` or `ai_summary:` section that
differs from the built-in defaults, including an instance that sets any of the
four `AI_SUMMARY_*` variables to a non-default value. If you never changed
these values, nothing is imported; the only change is the higher limit on a
team's response length described above.

**What to do:**

1. Upgrade and start v0.15.0.
2. As an instance admin, open **Settings** → **Search** and **Settings** →
   **AI Summary** in the admin area and check the values. An imported page
   shows the badge **Customized**.
3. Remove the `search:` and `ai_summary:` sections from a mounted
   `config.yaml`, and unset the four `AI_SUMMARY_*` variables. From now on,
   change these values in the admin area.

Do step 3 before the next minor release: both sections and the `AI_SUMMARY_*`
variables are scheduled for removal there, and a leftover section is planned to
stop the server from starting. Removing them now also avoids a surprise: while
a non-default section remains, **Reset to defaults** on the matching admin page
is undone at the next restart, because the section is imported again.

### Instance email moved to Admin → Settings → Email (v0.15.0)

The provider your instance sends its own mail through (invitations,
notifications and digests for every team without a provider of its own, and all
support requests) is no longer read from `config.yaml`. It is stored in the database,
with its credential encrypted, and an instance admin edits it in the admin area
under **Settings** → **Email**: see [Instance Email](instance-email.md). The
`email:` section and the environment variables that feed it in the published
image are **deprecated**:

`EMAIL_PROVIDER`, `EMAIL_FROM_ADDRESS`, `SMTP_HOST`, `SMTP_PORT`,
`SMTP_USERNAME`, `SMTP_PASSWORD`, `MAILGUN_BASE_URL`, `MAILGUN_DOMAIN`,
`MAILGUN_SENDING_KEY`, `POSTMARK_SERVER_TOKEN`, `SENDGRID_API_KEY`.

`email.contact_recipient_address` and `email.postmark.message_stream` have no
environment variable and exist only in a mounted `config.yaml`; they are
deprecated with the rest.

**What v0.15.0 does at startup.** If the database holds no instance provider
and the section is populated, the server imports it: provider, settings, sender
address, contact recipient and the selected provider's credential. For an
upgrading instance that happens on the first start of v0.15.0. The check is
made at every start, though, and it looks only at whether a provider is
stored. "Populated" means the section could actually have sent
mail:

| `EMAIL_PROVIDER` | Imported when |
| --- | --- |
| `smtp` (the default) | host and port are set, and either a password is set or the host and port are not the built-in `smtp.gmail.com:587` |
| `mailgun` | the sending domain and the sending key are set |
| `postmark` | the server token is set |
| `sendgrid` | the API key is set |

Two cases import **nothing**, and leave the instance with no mail:

- **Mail was never configured.** The published image defaults to
  `smtp.gmail.com:587` with no password, which is not a working configuration,
  so it is not imported.
- **No usable from address.** The import needs `EMAIL_FROM_ADDRESS`, or an
  `SMTP_USERNAME` that is itself an email address. With neither, the server
  logs an error and imports nothing.

Only the credential of the selected provider is taken; a key set for another
provider is left behind. None of this can stop the server: whatever goes wrong
with the import is logged, and the instance starts with mail unconfigured.

**While a provider is stored, the database wins.** Whether it was stored by the
import or by an admin, the section is ignored: changing `SMTP_HOST` and
restarting no longer changes anything. While the section is still populated the
server logs a deprecation warning on every start.

**With nothing stored, the section is imported again.** That has two
consequences. If the import was skipped for a missing from address, set
`EMAIL_FROM_ADDRESS` and restart instead of retyping the form. And if an admin
uses **Remove configuration** while the variables are still set, the next
restart brings the old provider and its credential back.

:::caution[Check that mail still works after the upgrade]
An instance with no stored provider discards its mail without an error, so a
failed or skipped import shows up as invitations that never arrive. Verify it
rather than assuming it.
:::

What to do after upgrading:

1. Sign in as an instance admin and open the admin area, then **Settings** →
   **Email**. Configuring mail needs an instance admin: if you have none, set
   `INSTANCE_ADMIN_EMAILS` first (see [Instance Admin Portal](instance-admin.md)).
2. Check that the status card names your provider and that **Change history**
   lists an **Imported from config.yaml** entry.
3. Press **Send test email**. The message goes to your own account address.
4. If nothing was imported, fill in the form on that page and save it.
5. Remove the eleven environment variables above from your deployment, or the
   `email:` section from a mounted `config.yaml`. Until you do, a restart after
   **Remove configuration** imports them again.

The privacy policy URL from the `email:` section is not carried over: it is
part of site info now. See
[Company branding moved to Site info](#company-branding-moved-to-site-info-v0150).

The `email:` section will be removed in the next minor release, where a
`config.yaml` that still contains it will stop the server from starting. Do
step 5 before that upgrade.

### Prompt label filter now matches any label (v0.13.0)

v0.13.0 changes what `?labels=` means on the prompt list endpoint,
`GET /api/v1/{team_id}/prompts`, so that it behaves the same as on artifacts,
blueprints and memories. Nothing in the database changes; only the answers to
requests that already worked do.

- **Any, not all.** `?labels=a,b` used to return only prompts carrying **both**
  `a` and `b`. It now returns prompts carrying **at least one** of them, so
  adding a label to the filter widens the result instead of narrowing it.
- **New `400` responses.** A filter naming more than **25** labels, or a label
  longer than **50** characters, used to be passed to the database as it was.
  It is now rejected with `400`.
- **Empty entries are ignored.** `?labels=a,,b` and `?labels=a,` used to match
  no prompt at all, because no prompt carries an empty label. They now filter on
  `a` and `b`, and on `a`. Each entry is also trimmed, so `?labels=a, b` now
  filters on `b` rather than on ` b`.

If a script relied on the old all-of behaviour, filter on one label and check
the rest on the client (every prompt in the response carries its `labels`), or
send the request once per label and intersect the results. See
[Labels](../labels.md#filtering-by-label) for how the filter works on every
resource type.

### Memory `metadata.tags` moved into `labels` (v0.13.0)

v0.13.0 gives every resource type one taxonomy. Its database migration, `016`,
adds a `labels text[] NOT NULL DEFAULT '{}'` column with a GIN index to
`artifacts`, `blueprints` and `memories` (prompts already had one), and then
**moves each memory's `metadata.tags` into `labels` and removes the `tags` key
from `metadata`**. That is a rewrite of existing rows, not only a new column, so
it is worth knowing what it does before you upgrade.

:::caution[A long tag list is narrowed, not preserved]
The backfill normalises tags the way the server still normalises `metadata.tags`
sent by an old client (explicit `labels` over the limits are rejected instead).
Each tag is trimmed, empty ones are dropped, duplicates collapse to the first
occurrence, each tag is truncated to **50 characters**, and a memory keeps at
most its first **10** tags. A memory that had 15 distinct tags ends up with 10
labels, and the other 5 are gone from it. If that matters to you, take a backup,
or export every memory's `metadata.tags` first:

```sql
SELECT id, metadata->'tags' FROM memories
 WHERE jsonb_typeof(metadata->'tags') = 'array';
```
:::

The rest of the migration:

- **Only an array is moved.** A `tags` value that is not a JSON array (a string,
  a number, an object) is ordinary metadata that happens to share the name: the
  migration leaves it in `metadata` untouched.
- **Nothing looks freshly edited.** The trigger that bumps `updated_at` is
  suspended for the backfill, so migrated memories keep their timestamps, and
  search recency ranking and freshness still reflect real edits.
- **Whitespace.** The backfill trims ASCII whitespace. A tag carrying a
  non-ASCII space (a non-breaking space, say) keeps it until the memory's labels
  are next saved: any edit from the web app does that, but an API or MCP update
  that omits `labels` does not.
- **Old clients keep working, with one catch.** A client that still sends
  `metadata: {"tags": [...]}` on a memory has those tags folded into `labels` by
  the server (normalised and capped the same way, never rejected), so nothing
  puts the key back. But on an **update**, `metadata.tags` sent without
  `labels` **replaces** the memory's labels with those tags, dropping any label
  added since. Move such scripts over to `labels`.
- **Rolling back** (running 016's down migration) writes each memory's `labels`
  back to `metadata.tags`, except where `metadata` already holds a non-array
  `tags` value: that value is kept, and that memory's labels are lost with the
  dropped column. The same down migration also drops the `labels` column on
  artifacts and blueprints, whose labels are not saved anywhere, and the memory
  `title` column that v0.13.0 added alongside it, so every memory title goes
  too.

After the upgrade, the memory create and edit forms still show a **Tags** card
next to the new **Labels** input, and the memory list a **Tags** column. Both
read `metadata.tags`, so they are empty for every migrated memory: your tags are
in **Labels**. Anything typed into the Tags card is folded into `labels` on save,
after the labels already set, so existing labels are never lost; tags beyond the
10-label cap are dropped without an error.

The same release changes the prompt list filter: see
[Prompt label filter now matches any label](#prompt-label-filter-now-matches-any-label-v0130).

### Bundled Postgres upgraded from 16 to 17 (v0.10.0)

The Postgres image shipped in the combined-image `docker-compose.yml` moved from
`pgvector/pgvector:pg16` to `pgvector/pgvector:pg17`. Postgres data files are
**not compatible across major versions**, so a Postgres 17 image started on a
data directory created by Postgres 16 refuses to start. If you run the bundled
Postgres with a populated data volume, you must dump-and-restore (or
`pg_upgrade`) the volume once before pulling the new image. Managed / external
Postgres is unaffected: the pin only governs the bundled container.

→ [Upgrading Postgres to 17](postgres-pg17-migration.md)

### Cookie consent removed, GTM now loads on the container ID alone (v0.10.0)

`VITE_GTM_ENABLED` no longer exists. Google Tag Manager loads whenever
`VITE_GTM_ID` is set, with no separate on/off flag. **If you had a GTM ID set
but the flag off, GTM will now load.** Unset `VITE_GTM_ID` before you upgrade if
you do not want that.

Remove `VITE_GTM_ENABLED` from your environment. The backend ignores it, so
leaving it in place is harmless but misleading.

The cookie-consent banner is gone too, along with the Consent Mode v2 bootstrap
and the login-time auto-grant. A self-hosted deployment should not inherit the
maintainer's compliance model, so consent is now yours to configure inside your
own tag container. Consent decisions stored in browsers are evicted on next
load, not migrated.

### GitHub App configuration moved to per-team settings (v0.9.0)

GitHub App credentials used to be instance-wide: one App in `config.yaml`,
shared by every team. They are now registered **per team** and stored encrypted
in the database. You must delete the top-level `github:` section from your
`config.yaml` or the backend refuses to start, drop the `GITHUB_APP_*` /
`GITHUB_WEBHOOK_*` environment variables, and re-register the App on each team
that uses the integration.

This does **not** affect `auth.github`, the GitHub web-login OAuth client.

→ [Migrating to per-team GitHub Apps](github-app-migration.md)
