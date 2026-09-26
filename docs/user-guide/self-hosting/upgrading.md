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

### Memory `metadata.tags` moved into `labels` (v0.13.0)

v0.13.0 gives every resource type one taxonomy. Its database migration, `016`,
adds a `labels text[] NOT NULL DEFAULT '{}'` column with a GIN index to
`artifacts`, `blueprints` and `memories` (prompts already had one), and then
**moves each memory's `metadata.tags` into `labels` and removes the `tags` key
from `metadata`**. That is a rewrite of existing rows, not only a new column, so
it is worth knowing what it does before you upgrade.

:::caution[A long tag list is narrowed, not preserved]
The backfill normalises tags exactly as the API normalises labels on every
write. Each tag is trimmed, empty ones are dropped, duplicates collapse to the
first occurrence, each tag is truncated to **50 characters**, and a memory keeps
at most its first **10** tags. A memory that had 15 distinct tags ends up with
10 labels, and the other 5 are gone from it. If that matters to you, take a
backup, or export every memory's `metadata.tags` first:

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
  non-ASCII space (a non-breaking space, say) keeps it until the memory's next
  write, which trims it.
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

After the upgrade, the memory create and edit forms still show a **Tags** card next to the
new **Labels** input, and the memory list a **Tags** column. Both read
`metadata.tags`, so they are empty for every migrated memory: your tags are in
**Labels**. Anything typed into the Tags card is folded into `labels` on save,
so it is confusing rather than lossy.

The same release changes the prompt list filter. `?labels=a,b` on prompts used
to return prompts carrying **every** listed label; it now returns prompts
carrying **at least one**, which is what the filter means on artifacts,
blueprints and memories too. See [Labels](../labels.md) for labels on every
resource type.

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
