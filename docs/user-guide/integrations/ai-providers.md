# Embedding & Model Providers

Each team brings its own AI endpoints. Two provider types are configured under
**Settings** → **Integration**:

- **Embedding Providers** power semantic search across prompts, artifacts,
  blueprints, and memories.
- **Model Providers** register OpenAI-compatible LLM endpoints for the team.

Both are team-scoped, managed entirely in the app, and store API keys
encrypted. Nothing is configured through server environment variables.

:::caution[Owner or Admin, and a publicly routable URL]
Adding or editing a provider needs the **Owner** or **Admin** role (the
`team.settings.update` permission; see [Team roles and permissions](../team-roles-and-permissions.md)).
The base URL must be publicly routable: VibeXP rejects loopback, private, and
link-local addresses (including cloud metadata endpoints like `169.254.169.254`)
with `destination_not_allowed`, and the check applies to the stored provider,
not just the initial connectivity test. Local development against `localhost` is
exempt.

Self-hosting the endpoint on your own private network (Ollama, TEI, vLLM on a
Docker subnet)? An operator can declare that range in `OUTBOUND_ALLOWED_CIDRS`
so the guard allows it. See
[Self-Hosting](../self-hosting/README.md#search-and-embeddings).
:::

## Embedding providers

An embedding provider is any OpenAI-compatible `/v1/embeddings` endpoint:
OpenAI, Ollama, LocalAI, vLLM, HuggingFace TEI, and similar.

### Adding a provider

1. Open **Settings** → **Integration** → **Embedding Providers**
2. Click to add a provider and fill in:

| Field | Default | Purpose |
| --- | --- | --- |
| Base URL, API key, provider type | _(required)_ | The endpoint to call. The key is stored encrypted. |
| Model | _(required)_ | The embedding model id. Tagged on every vector and used as the search filter. |
| Chunk size | 1000 | How much text goes into each embedding chunk. |
| Chunk overlap | 200 | Overlap between chunks (must be smaller than the chunk size). |
| Concurrency | 1 | Max concurrent embedding requests sent to this provider. |
| Query / document prefix | _(empty)_ | Optional instruction prefixes for asymmetric models (mxbai, BGE, E5). |

3. Save. The provider is **validated on save**: VibeXP calls the endpoint and
   requires **1024-dimension** vectors. The vector width is fixed and not
   configurable, so pick a model that outputs (or can be asked for) 1024
   dimensions.

Once saved, embedding starts automatically for the team's existing content.

### Coverage, reprocess, and clear

The Embedding Providers page shows **coverage cards**: how much of the team's
content is embedded, pending, or failed. Two actions are available:

- **Reprocess pending**: re-enqueue anything not yet embedded.
- **Clear all embeddings**: delete every stored vector for the team. Content
  is untouched; embeddings are rebuilt on the next processing pass.

:::caution[Changing a provider re-embeds everything]
Changing a provider's identity (endpoint or model) wipes that team's vectors
and re-embeds all content, so the search index stays consistent. Expect a
re-embedding pass after such a change. Editing only chunk sizing, concurrency,
or prefixes fills gaps instead of wiping.
:::

### Without a provider

Everything still works: content saves normally and search falls back to
keyword (full-text) mode, which includes typo tolerance. Only semantic search
is unavailable.

## Model providers

Model providers let a team bring its own OpenAI-compatible LLM endpoint.

1. Open **Settings** → **Integration** → **Model Providers**
2. Add the endpoint URL, API key, and model details
3. Save. The provider's connectivity is **validated on save**.

API keys are stored encrypted and can be updated or removed anytime.

## AI Summary

With a model provider in place, search can summarize its top results with it.
The settings are a card on the same **Model Providers** page, below the
providers. Until the team has at least one model provider the card only says
that AI Summary needs one.

| Field | What it does | Allowed |
| --- | --- | --- |
| **Enable AI Summary** | Summarize the top search results with this team's model. | on / off |
| **Provider** | Which model provider writes the summary: **Team default** or a specific one. | any of the team's model providers |
| **Style** | How detailed the summary is. | Concise, Balanced, Detailed |
| **Results to read** | How many top-ranked results the summary reads. | 1–10 |
| **Response length (tokens)** | Upper bound on how much the summary may write. | 1–32768 |

Changing them needs the **Owner** or **Admin** role, like the providers
themselves.

A team either has its own complete AI summary profile or none at all:

- **Using instance defaults**: the team has saved nothing, so it uses the
  defaults its operator set, with **Team default** as the provider, and follows
  along when the operator changes them.
- **Customized for this team**: the team's saved values apply, and later
  changes to the instance defaults no longer affect it.

**Reset to defaults** drops the team's profile so it inherits again. It returns
to whatever the instance defaults are at that moment.

The limits of 10 results and 32768 tokens are fixed. Since v0.15.0 they are the
same for every team and no instance setting narrows them. An operator still
sets how much text of each result a summary reads and how long the server waits
for the model, and those apply to every team: see
[Search & AI Summary Settings](../self-hosting/search-and-ai-summary-settings.md).

## API access

Both provider types have team-scoped REST endpoints:

```bash
# Embedding providers
GET|POST   /api/v1/{team_id}/settings/embedding-providers
GET|PUT|DELETE /api/v1/{team_id}/settings/embedding-providers/{id}
POST       /api/v1/{team_id}/settings/embedding-providers/validate
GET        /api/v1/{team_id}/settings/embedding-providers/coverage
POST       /api/v1/{team_id}/settings/embedding-providers/{id}/reprocess
DELETE     /api/v1/{team_id}/settings/embedding-providers/embeddings

# Model providers
GET|POST   /api/v1/{team_id}/settings/model-providers
GET|PUT|DELETE /api/v1/{team_id}/settings/model-providers/{id}
POST       /api/v1/{team_id}/settings/model-providers/validate

# AI summary settings
GET|PUT|DELETE /api/v1/{team_id}/settings/ai-summary
```

In the AI summary settings response, `max_top_n` and
`max_output_tokens_ceiling` are deprecated: since v0.15.0 they always report
the fixed limits, 10 and 32768.

See [API Keys](api-keys.md) for authentication.

## Related

- [Memory](../memory.md) and [Artifacts](../artifacts.md) explain
  how semantic search is used day to day.
- Self-hosters: see
  [Self-Hosting → Search and embeddings](../self-hosting/README.md#search-and-embeddings).
