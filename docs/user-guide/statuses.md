# Statuses

Every prompt, artifact, blueprint and memory carries a **status**: one value
that says where the resource is in its life, such as `draft` or `active`. Each
resource type comes with a few built-in statuses, and since v0.15.0 a team can
add **custom statuses** of its own, such as `in-review` or `approved`, next to
them.

## Built-in statuses

The built-in (system) statuses are the same for every team. They cannot be
renamed or deleted.

| Resource type | Built-in statuses | Default | Not live |
| --- | --- | --- | --- |
| Prompt | `draft`, `published` | `draft` | `draft` |
| Artifact | `active`, `draft`, `archived` | `active` | `draft`, `archived` |
| Blueprint | `active`, `expired` | `active` | `expired` |
| Memory | `active`, `draft`, `archived` | `active` | `draft`, `archived` |

The **Default** column is the status a resource gets when none is supplied. The
**Not live** column is explained under [What "live" means](#what-live-means).

## Managing custom statuses

Open your team, then **Settings → Statuses** (URL
`/teams/<team>/settings/statuses`). The page has one tab per resource type
(**Prompts**, **Blueprints**, **Memories**, **Artifacts**), and each tab lists
that type's statuses with four columns:

- **Name**: the display name.
- **Slug**: the value stored on resources and used in the API and over MCP.
- **Origin**: **System** for a built-in status, **Custom** for one your team
  added.
- **In use**: how many of the team's resources of that type carry the status.

Every team member can open the page and see the list. Creating, renaming and
deleting a custom status needs the `team.settings.update` permission, which
team owners and admins hold: see
[Team Roles and Permissions](team-roles-and-permissions.md). A member sees the
same list without the **Create status** button or the rename and delete
actions.

### Create a status

Choose the tab of the resource type, click **Create status**, and fill in:

- **Name**: 1 to 50 characters. Surrounding whitespace is trimmed.
- **Slug**: lowercase letters and numbers in hyphen-separated groups, such as
  `in-review`, at most 50 characters. The form fills it in from the name until
  you edit it yourself.

The rules:

- A custom status belongs to **one resource type**. A status you add on the
  **Prompts** tab is not available on artifacts; add it on each tab where you
  want it.
- A slug must be unique within the team for that resource type.
- The five built-in slugs (`active`, `draft`, `archived`, `published`,
  `expired`) are reserved on **every** resource type. You cannot, for example,
  add `published` as an artifact status.
- A team can have at most **20 custom statuses per resource type**.

### Rename a status

Renaming changes the display name only. The **slug cannot be changed** after
the status is created, because the slug is the value stored on every resource
that carries it.

### Delete a status

Deleting a custom status moves every resource that carries it to the default
status of its type, in the same operation: **`draft` for prompts, `active` for
artifacts, blueprints and memories**. The confirmation dialog says how many
resources will move and where to. Being moved this way does not change a
resource's `updated_at`, so the delete does not reorder your lists.

A status carried by a **locked** prompt, blueprint or artifact cannot be
deleted: nothing is changed, and you have to unlock the resource first.
Memories cannot be locked, so this never blocks a memory status.

:::caution[Deleting a prompt status takes its prompts out of MCP]
Prompts in a deleted custom status become drafts, and a draft prompt is never
exposed over MCP. Move them to **Published** or another status first if they
should stay available to connected clients.
:::

## What "live" means

A status is either **live** or not. Live means current, usable content; a
status that is not live marks work in progress or retired content, and takes
the resource out of the places live content is read.

**A custom status is always live.** Only built-in statuses are not live, and
which ones depends on the resource type (the **Not live** column above):

| Resource type | Not-live statuses | What a not-live resource is left out of |
| --- | --- | --- |
| Prompt | `draft` | Search, and MCP (never a native MCP prompt, not renderable with `vibexp_io_render_prompt`) |
| Artifact | `draft`, `archived` | Search, and the artifact list when a keyword search is applied |
| Blueprint | `expired` | Search |
| Memory | `draft`, `archived` | Search, and the memory list when a keyword search is applied |

So to hide something, use the type's built-in not-live status, not a custom
one. A custom status called `hidden` or `deprecated` hides nothing: its
resources stay in search, and its prompts stay exposed over MCP when
**Available in MCP** is on.

Not live does not mean invisible everywhere. Without a keyword search, the
artifact and memory lists hide `archived` resources but still show drafts, and
filtering a list by a status returns exactly the resources in that status,
whatever it is.

## Using statuses in the app

The status picker on the create and edit forms, the status filter on the list
pages and the status badge on prompts, artifacts, blueprints and memories all
follow the team's statuses for that resource type, and show the display name.
A custom status appears there as soon as it is created.

## API

| Method | Path | What it does |
| --- | --- | --- |
| `GET` | `/api/v1/{team_id}/statuses?resource_type=<type>` | List the statuses of one resource type: built-in first, then custom |
| `POST` | `/api/v1/{team_id}/statuses` | Create a custom status (`resource_type`, `slug`, `name`) |
| `PATCH` | `/api/v1/{team_id}/statuses/{id}` | Rename a custom status (`name` only) |
| `DELETE` | `/api/v1/{team_id}/statuses/{id}` | Delete a custom status and reassign its resources |

`resource_type` is one of `prompt`, `artifact`, `blueprint` or `memory`, and is
required on the list request. Any team member can list; the other three need
`team.settings.update` and answer `403` without it.

```bash
curl -X POST "https://<your-vibexp-host>/api/v1/{team_id}/statuses" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"resource_type": "artifact", "slug": "in-review", "name": "In review"}'
```

Each status in a response has `resource_type`, `slug`, `name`, `is_system`,
`is_live` and `usage_count`. A custom status also has `id`, `created_at` and
`updated_at`; a built-in one has none of the three.

What the write endpoints answer when a request is refused:

- `400`: an invalid slug or name, an unknown `resource_type`, or the team
  already has 20 custom statuses for that resource type.
- `409`: the slug is a built-in status, or the team already has that slug for
  that resource type.
- `423` on delete, with code `HAS_LOCKED_RESOURCES`: a locked prompt, blueprint
  or artifact carries the status.

A successful delete returns `reassigned_count` and `reassigned_to`.

### Setting a status on a resource

The `status` field of a prompt, artifact, blueprint or memory takes the slug,
on create, on update and as a list filter. It accepts the built-in statuses of
that resource type and the team's custom statuses for it. Anything else is
rejected with `400`, and the message lists the allowed values:

```
invalid status: must be one of: active, draft, archived, in-review
```

## Over MCP

An agent cannot guess which statuses a team has, so the MCP server has a tool
for it: `vibexp_io_list_statuses` returns the built-in and custom statuses of
one resource type, or of all four, each with its `slug`, `name`, `is_system`
and `is_live`. Call it before setting or filtering by `status`. Parameters and
return fields are in
[MCP Server Integration](mcp-server.md#search-and-resource-reads).

The `status` parameter of the create and update tools, and of
`vibexp_io_list_resources`, takes the slug. A status the team does not have
comes back as a tool error that lists the allowed values.
