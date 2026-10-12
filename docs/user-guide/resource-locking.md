# Resource locking

A **lock** marks a prompt, blueprint, or artifact as "in use: do not remove or re-file". While a resource is locked it cannot be deleted, and the fields that identify and classify it (its slug, status, project, labels and a few more) cannot be changed. Its content stays editable.

Lock a resource when something depends on finding it where it is: a prompt an automation calls by slug, a blueprint your agents are told to follow, an artifact a nightly job reads.

## What a lock does

A lock protects a resource's **identity, not its content**:

- **Delete is refused for everyone**, Owners and Admins included, until the resource is unlocked.
- **Frozen fields cannot be changed.** Which fields those are depends on the resource type; see [What is frozen and what stays editable](#what-is-frozen-and-what-stays-editable).
- **Everything else can still be edited**, by anyone who could edit it before.

Every lock carries a **reason**, written by the person who placed it and shown to the whole team.

## What can be locked

| Resource | Lockable |
| --- | :---: |
| Prompts | ✅ |
| Blueprints | ✅ |
| Artifacts | ✅ |
| Memories | — |
| Agents | — |

## Lock a resource

1. Open the prompt, blueprint, or artifact.
2. Click **Lock**. A dialog titled **Lock prompt?**, **Lock blueprint?** or **Lock artifact?** opens.
3. Fill in **Reason**. It is required: 1 to 500 characters once surrounding whitespace is trimmed.
4. Click **Lock**.

**Any team member can lock** an unlocked resource, whoever created it.

Locking is not an edit. It creates no new version and does not change the resource's last-updated time.

## Unlock a resource

Open the locked resource and click **Unlock**. Two kinds of people can do that:

| Who | Can unlock |
| --- | --- |
| The member who placed the lock | Their own locks |
| An **Owner** or **Admin** | Any lock in the team |

Unlocking somebody else's lock is the `resource.unlock.any` permission in [Team roles & permissions](team-roles-and-permissions.md). Other members see neither **Lock** nor **Unlock** on a resource someone else has locked.

## What is frozen and what stays editable

| | Frozen while locked | Still editable |
| --- | --- | --- |
| **Prompt** | slug, status, project, labels, MCP exposure (`mcp_expose`) | name, description, body, restoring a version |
| **Blueprint** | slug, status, type, subtype, project, labels, metadata, path | title, description, content, restoring a version |
| **Artifact** | slug, status, type, project, labels, metadata | title, description, content, restoring a version, attachments (upload and delete) |

Sending a frozen field with the value it already has is not a change, so a client that always submits the whole resource keeps working as long as the frozen fields are untouched.

## Where you see a lock

- **Lists**: a lock icon next to the name on the prompt, blueprint and artifact lists. Each of those lists has a lock-state filter with two options, **All lock states** (the default) and **Locked only**.
- **Detail page**: a **Locked by** row in the Metadata section names the member holding the lock; the reason is in its tooltip. **Delete** is not offered while the resource is locked.
- **Lock history**: a section on the detail page listing each lock and unlock, newest first. It appears once the resource has been locked at least once.
- **Edit page**: a notice reading "Locked by {name}: {reason}" lists the frozen fields, and those fields are disabled.

## Side effects

A lock also stops a few indirect changes that would delete the resource or rewrite one of its frozen fields. Each of these is refused, with nothing changed, until the resources named in the refusal are unlocked:

- **Deleting or migrating a project** that contains a locked prompt, blueprint or artifact. A migration is refused whether or not the locked resource was among those selected.
- **Deleting a custom artifact type** that a locked artifact uses.
- **Deleting a [custom status](statuses.md#delete-a-status)** that a locked prompt, blueprint or artifact carries.

Two things a lock does **not** stop:

- **A GitHub blueprint re-import** still updates a locked blueprint's synced fields, and leaves the lock in place. See [Blueprints](blueprints.md#update-aware-re-import).
- **Deleting the locker's account** releases the locks they hold. The lock history records it as an unlock with no member named.

:::caution[Removing a member does not release their locks]
When the member who placed a lock is removed from the team, the lock stays, and they can no longer release it themselves. An Owner or Admin has to unlock the resource.
:::

## AI agents and MCP

AI assistants connected over the [MCP server](mcp-server.md) respect locks and can place them, but cannot remove them.

- **Locking.** `vibexp_io_lock_resource` locks one resource:

  | Parameter | Required | Meaning |
  | --- | --- | --- |
  | `team_id` | yes | Team UUID or slug |
  | `resource_type` | yes | `prompt`, `blueprint` or `artifact` |
  | `slug` | yes | Slug of the resource |
  | `project_id` | for `blueprint` and `artifact` | The project the resource belongs to |
  | `comment` | yes | Why it is locked, at most 500 characters |

- **No unlock tool.** An agent can place a guard; only a person can remove one, in the web app or through the REST API.
- **Writes and deletes are refused the same way.** An MCP update that changes a frozen field, or a delete, fails with a tool error that names the locker and quotes the reason:

  ```text
  Failed to delete artifact: cannot delete: this artifact is locked by Ada Lovelace: "Used by the nightly release agent"
  Failed to update prompt: cannot change status: this prompt is locked by Ada Lovelace: "Used by the nightly release agent"
  ```

- **Reads do not show lock state.** `vibexp_io_get_resource`, `vibexp_io_list_resources` and the other MCP read tools leave the lock out of their results. An agent learns about a lock from a refused write, or from the lock tool's "already locked" answer, which names the holder and the reason.

## REST API

All routes are team-scoped. Prompt routes have no project segment; blueprint and artifact routes do.

| Operation | Prompt | Blueprint / Artifact |
| --- | --- | --- |
| Lock: `POST`, body `{"comment": "..."}` | `/api/v1/{team_id}/prompts/{slug}/lock` | `/api/v1/{team_id}/blueprints/{project_id}/{slug}/lock`<br>`/api/v1/{team_id}/artifacts/{project_id}/{slug}/lock` |
| Unlock: `DELETE` | same path | same path |
| History: `GET` | `/api/v1/{team_id}/prompts/{slug}/lock/history` | the lock path followed by `/history` |

That is nine operations: lock, unlock and history for each of the three types. Lock and unlock answer `200` with the updated resource. An API key acts as the member who created it, so the unlock rule above applies to it unchanged.

### The `lock` object

Every prompt, blueprint and artifact payload carries a `lock` key. It is `null` when the resource is unlocked:

```json
{
  "lock": {
    "locked_by": {
      "user_id": "01234567-89ab-cdef-0123-456789abcdef",
      "display_name": "Ada Lovelace"
    },
    "comment": "Used by the nightly release agent",
    "locked_at": "2026-10-11T10:15:30Z"
  }
}
```

### Filtering lists

The list endpoints for prompts, blueprints and artifacts accept `locked=true` (only locked resources) or `locked=false` (only unlocked ones). Omit the parameter for no lock filtering. The web app's filter offers only the first of the two.

### History

Any team member can read a resource's lock history. It is newest first and not paginated: at most the 100 most recent events are returned.

```json
{
  "events": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "action": "unlock",
      "actor": { "user_id": "…", "display_name": "Grace Hopper" },
      "comment": null,
      "created_at": "2026-10-12T08:00:00Z"
    },
    {
      "id": "123e4567-e89b-12d3-a456-426614174001",
      "action": "lock",
      "actor": { "user_id": "…", "display_name": "Ada Lovelace" },
      "comment": "Used by the nightly release agent",
      "created_at": "2026-10-11T10:15:30Z"
    }
  ]
}
```

`action` is `lock` or `unlock`. `comment` is the reason on a `lock` event and `null` on an `unlock`. `actor` is `null` once that user's account has been deleted.

### Errors

| Status | Code | When | `metadata` |
| --- | --- | --- | --- |
| `400` | | The lock `comment` is empty after trimming, or longer than 500 characters | |
| `403` | | Unlocking a lock someone else placed without `resource.unlock.any`, or not a member of the team | |
| `409` | `RESOURCE_LOCKED` | Locking a resource that is already locked. The existing lock is left untouched | |
| `409` | `RESOURCE_NOT_LOCKED` | Unlocking a resource that is not locked | |
| `423` | `RESOURCE_WRITE_LOCKED` | Deleting a locked resource, or an update that changes one of its frozen fields | `resource_type`, `field` (the frozen field; absent on a delete), `locked_by`, `comment` |
| `423` | `HAS_LOCKED_RESOURCES` | Deleting or migrating a project, or deleting a custom type or status, that locked resources stand in the way of | `locked_resources[]`: each with `resource_type`, `id`, `slug`, `title`; at most 100 listed |

`423 Locked` is therefore two different answers: check the code, not only the status. `metadata.field` uses the request's field names, so a frozen project is reported as `project_id`.

## Related features

- [Team roles & permissions](team-roles-and-permissions.md): who holds `resource.unlock.any`
- [MCP Server Integration](mcp-server.md): the full tool reference
- [Prompts](prompts/managing-prompts.md), [Blueprints](blueprints.md), [Artifacts](artifacts.md): the resources a lock applies to
