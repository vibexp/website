# Search & AI Summary Settings

Two pages in the admin area hold the instance-wide defaults for search ranking
and for AI summaries. Since v0.15.0 these values are stored in the database and
edited there, under **Settings** → **Search** and **Settings** → **AI Summary**,
instead of in the `search:` and `ai_summary:` sections of `config.yaml`.

A saved change applies to the next request. No restart is needed.

Upgrading from an earlier release with tuned values in `config.yaml`? Read
[Upgrading](upgrading.md#search-ranking-and-ai-summary-defaults-moved-to-admin--settings-v0150)
first: the sections are imported once and ignored afterwards.

## Who can open them

Only an [instance admin](instance-admin.md). The pages live at
`/admin/settings/search` and `/admin/settings/ai-summary`: open the admin area,
then **Settings** → **Search** or **Settings** → **AI Summary**. Everyone else,
team owners included, is sent back to the app's home page, and the API behind
the pages answers 404.

## Search

The search ranking defaults every team without its own search settings ranks
with, plus one value that applies to every team. What the ranking values do is
explained in [Search Settings](../search.md).

**Ranking defaults**

| Field | What it does | Allowed | Built-in default |
| --- | --- | --- | --- |
| **Recency ranking** | Re-rank results by how recently they were created and updated, not by relevance alone. | on / off | off |
| **Relevance weight** | Weight of semantic/keyword relevance. | 0 or more | 0.5 |
| **Created-recency weight** | Weight of how recently the resource was created. | 0 or more | 0.3 |
| **Updated-recency weight** | Weight of how recently the resource was updated. | 0 or more | 0.2 |
| **Half-life (days)** | How quickly recency fades: after this many days a result's recency score halves. | above 0, at most 36500 | 90 |

The three weights are normalized by their sum, so only their ratio matters.
They must not all be zero.

**Instance-wide**

| Field | What it does | Allowed | Built-in default |
| --- | --- | --- | --- |
| **Candidate cap** | How many matches are pulled and re-ranked per search. With recency ranking on, results beyond it are not reachable by pagination. | 1–5000 | 200 |

The candidate cap applies to every team, including teams with their own search
settings. Raising it increases memory and latency for every ranked query on the
instance.

## AI Summary

An AI summary reads the top results of a search and writes a summary of them
with one of the team's own [model providers](../integrations/ai-providers.md#model-providers).
This page holds the defaults a team starts from and the server budgets every
team shares.

**Team defaults**

| Field | What it does | Allowed | Built-in default |
| --- | --- | --- | --- |
| **Enable AI Summary** | Summarize the top search results with the team's model provider. | on / off | on |
| **Results to read** | How many top-ranked results a summary reads. | 1–10 | 5 |
| **Style** | How detailed a summary is. | Concise, Balanced, Detailed | Balanced |
| **Response length (tokens)** | Upper bound on how much a summary may write. | 1–32768 | 800 |

**Advanced / server budgets**

| Field | What it does | Allowed | Built-in default |
| --- | --- | --- | --- |
| **Per-document budget (chars)** | How many characters of each result a summary reads. | 1 or more | 8000 |
| **Total context budget (chars)** | The character budget of one summary's whole context. | at least the per-document budget | 32000 |
| **Request timeout (ms)** | How long the server waits for the model, in milliseconds. | 1 or more | 60000 |

The three server budgets apply to every team, including teams with their own AI
summary settings.

Whatever these defaults say, a team can only use AI summaries once it has at
least one model provider of its own. There is no instance-level model provider.

## Instance defaults and team overrides

A team either has **its own complete profile** or **none at all**. There is no
per-field blend.

- **No profile of its own**: the team uses the instance defaults on these
  pages, and follows along when you change them.
- **Its own profile**: once a team saves its own search settings
  (see [Search Settings](../search.md#inheriting-the-instance-defaults)) or its
  own AI summary settings
  (see [AI Summary](../integrations/ai-providers.md#ai-summary)), every value in
  that profile is the team's. A later change to the instance defaults does not
  reach it.

Search and AI summary are separate profiles: a team can override one and still
inherit the other.

Four values are instance-only. They are not part of any team profile, so they
reach every team, overriding or not:

- the search **Candidate cap**;
- the AI summary **Per-document budget (chars)**;
- the AI summary **Total context budget (chars)**;
- the AI summary **Request timeout (ms)**.

Each page shows how many teams override its settings, so you can tell how far a
change to the defaults will reach.

## Fixed limits

Two limits are built into VibeXP and are the same for the instance defaults and
for every team:

- a summary reads at most **10** results;
- a summary's response length is at most **32768** tokens.

No instance setting narrows them. A team may choose any value up to these
limits whatever the instance defaults are, because a summary runs on the team's
own model provider.

## Built-in defaults and resetting

Until something is saved, a page shows the badge **Using built-in defaults** and
the values in the tables above are in effect. After the first save the badge
reads **Customized**, with who last changed the settings and when.

**Reset to defaults** removes the stored values, so the built-in defaults apply
again. The confirmation dialog lists them before you confirm. The button is
shown only while the page is **Customized**. Resetting one page does not touch
the other.

:::caution[A leftover config section is imported again after a reset]
The `config.yaml` import described in
[Upgrading](upgrading.md#search-ranking-and-ai-summary-defaults-moved-to-admin--settings-v0150)
runs at every start and only checks whether settings are stored. If you reset a
page while a non-default `search:` or `ai_summary:` section is still in your
configuration, the next restart imports that section again. Remove the section
first.
:::

If someone else saved the same page while you were editing, your save is
rejected and nothing is overwritten. Reload the page to see the current values,
then make your change again.

## Change history

Each page ends with a **Change history** card: one entry per change, with who
made it, when, and the before and after value of each field that changed. An
entry is one of:

- **Saved**: an instance admin saved the page.
- **Reset to defaults**: an instance admin reset it.
- **Imported**: the server imported the section from `config.yaml` at startup.
  The entry reads **Imported from config.yaml** in place of a person's name.

## API

The pages are backed by instance-admin endpoints. Non-admin and unauthenticated
requests receive 404.

```bash
GET|PUT|DELETE /api/v1/admin/settings/search
GET            /api/v1/admin/settings/search/audit
GET|PUT|DELETE /api/v1/admin/settings/ai-summary
GET            /api/v1/admin/settings/ai-summary/audit
```

`PUT` replaces the whole set of values: a body that omits a field is rejected
with 400. Pass `expected_version` to have the save rejected with 409 when the
settings changed since you read them. `DELETE` is the reset.

## Related

- [Search Settings](../search.md): what the ranking values do, and the team's
  own Search Settings page.
- [Embedding & Model Providers](../integrations/ai-providers.md#ai-summary):
  the team's own AI Summary settings.
- [Upgrading](upgrading.md#search-ranking-and-ai-summary-defaults-moved-to-admin--settings-v0150):
  what happens to the `search:` and `ai_summary:` config sections in v0.15.0.
