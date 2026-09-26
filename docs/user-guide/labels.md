# Labels

Every prompt, artifact, blueprint and memory carries **labels**: a short list of
free-form words you use to group and filter resources, such as `onboarding`,
`api` or `billing`. Labels are the one taxonomy shared by all four resource
types. [Metadata](metadata-filtering.md) is for key/value pairs; labels are for
the words you would otherwise have put in a `tags` field.

Prompts have always had labels. Artifacts, blueprints and memories gained them
in v0.13.0, and memories that used to keep tags in `metadata.tags` had them moved
into `labels` by that release's migration: see
[Upgrading](self-hosting/upgrading.md#memory-metadatatags-moved-into-labels-v0130).

## Limits

| Limit | Value |
| --- | --- |
| Labels per resource | 10 |
| Label length | 50 characters |

On artifacts, blueprints and memories, a create or update request over either
limit is rejected: with `400` over the REST API, and with a tool error over
MCP. Prompt labels are not checked against these limits by the server in this
release (the web app's prompt form still stops at 10).

On artifacts, blueprints and memories, labels are normalised on every write:
each one is trimmed, empty ones are dropped, and duplicates collapse to the
first occurrence. What you read back is the normalised list. Prompt labels are
stored as sent.

## Reading and writing labels

`labels` is an array of strings in the request and response body of all four
resource types:

```json
{
  "project_id": "<project-uuid>",
  "text": "Staging deploys go through the release branch, never main.",
  "labels": ["deploy", "staging"]
}
```

On an artifact, blueprint or memory, `labels` is **always present in the
response and never `null`**: a resource with no labels returns `[]`, so a client
can skip the null check. A prompt with no labels may return `null` instead.

On an update, **omit** `labels` to leave them as they are, or send `[]` to
remove them all. Any other list replaces the current one.

In the web app, the create and edit forms of each resource type have a
**Labels** input.

## Filtering by label

The list endpoints of all four resource types take a `labels` query parameter:
a comma-separated list of labels.

```
GET /api/v1/{team_id}/memories?labels=deploy,staging
```

A resource matches when it carries **at least one** of the listed labels, so
adding a label to the filter widens the result rather than narrowing it. The
filter is served by an index on each table.

Each label in the filter is trimmed, and empty entries (`a,,b`, a trailing
comma) are ignored. The filter is rejected with `400` if it names more than
**25** labels or a label longer than **50** characters. The filter allows more
labels than a resource can carry because it is meant to gather resources that
are labelled differently.

`labels` combines with the other filters of a list endpoint, `metadata`
included, with AND.

:::note[Prompts changed in v0.13.0]
Before v0.13.0, `?labels=` on prompts returned only prompts carrying **every**
listed label. It now matches **any** of them, the same as on the other three
resource types. A client that relied on the old behaviour can filter the
response on its side.
:::

## Over MCP

The create and update tools for all four resource types take an optional
`labels` argument, with the same limits as the REST API:

- `vibexp_io_create_prompt` / `vibexp_io_update_prompt`
- `vibexp_io_create_artifact` / `vibexp_io_update_artifact`
- `vibexp_io_create_blueprint` / `vibexp_io_update_blueprint`
- `vibexp_io_create_memory` / `vibexp_io_update_memory`

```json
{
  "team_id": "your-team",
  "project_id": "<project-uuid>",
  "text": "Staging deploys go through the release branch, never main.",
  "labels": ["deploy", "staging"]
}
```

On an update tool, omitting `labels` leaves them unchanged and an empty list
clears them. `vibexp_io_list_resources` does not filter by label; use the REST
`labels` parameter for that.
