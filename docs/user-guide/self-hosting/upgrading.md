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

`email.privacy_policy_url` is not carried over. v0.15.0 ignores the key and
warns about it at startup; set the privacy policy link in the admin area's
**Site info** settings instead, then delete the key.

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
