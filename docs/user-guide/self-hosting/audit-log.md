# Audit Log

The **audit log** is one record of who changed what across a self-hosted
VibeXP instance: resource writes, sign-ins and other security events, team and
admin changes, refused actions and the recovery command. Each event says who
did it, when, through which channel (the web app, the CLI, an AI tool over
MCP, the API), and how it ended.

It was added in v0.17.0 and is **on by default**: events are kept for 2 weeks,
and each one stores the client's IP address and user agent. Upgrading? Read
[Upgrading](upgrading.md#audit-log-v0170) first.

## Who can open it

Only an [instance admin](instance-admin.md), root or granted. In the admin
area:

- **Audit** (`/admin/audit`) is the log itself.
- **Settings** → **Audit log** (`/admin/settings/audit-log`) sets the retention
  and the IP address and user agent capture.

Everyone else, team owners included, cannot see either page, and the API
behind them answers 404. Teams cannot change the audit settings.

## What is recorded

| Area | Operations |
| --- | --- |
| **Resources** | Prompts, blueprints and artifacts created, updated, moved to another project, deleted, locked and unlocked. Memories created, updated, moved and deleted. Feeds created, updated and deleted; feed items created, deleted, archived and unarchived. Projects created, updated and deleted, and a project's resources migrated to another project in the same team (one event on the source project). |
| **Auth** | Sign-in, failed sign-in, sign-out, a setup session started, sessions revoked. API keys created and revoked, all API access of a user revoked. A password set, changed, removed, a reset requested and a reset link issued. A sign-in identity connected or disconnected. An MCP client registered, MCP consent granted or denied. |
| **Team** | Teams created, updated and deleted. Invitations sent, accepted, rejected and revoked. Members added, removed and their role changed. Ownership transferred. Team settings changed: search, AI summary, email, model and embedding providers, freshness, GitHub App, custom types and custom statuses. |
| **Instance** | Instance settings changed (email, search, AI summary, site info, sign-in providers, allowlist, sign-in policy, instance admins, setup). Users created, updated, suspended, reactivated and deleted in the admin area. |
| **Authorization** | An action refused because the caller lacks the permission, with the permission and the caller's role. |
| **Audit** | An admin list exported to CSV, and the audit settings changed. |

**Reads are not recorded**, and neither is the content of a resource or a
secret. An update records which fields changed, with the old and new values of
small fields such as a name or a status and before and after values for
settings and roles, but a changed content field shows only
"changed (content is not recorded)".

The [recovery command](lockout-recovery.md) records its changes too. They
show the actor `recovery-cli` and the channel CLI, with the operating-system
user and host name that ran it in the details.

### What an event holds

- **Who**: the actor's name, email and user id, and whether it was a user, the
  system or an anonymous caller. An AI tool that acts with a user's API key or
  MCP sign-in is recorded as that user.
- **How**: the channel (**Web**, **CLI**, **MCP**, **API** or **System**), the
  MCP client's name for an AI tool, the API key's name, the client IP address
  and user agent, and the request id.
- **What**: the operation, the resource with its type, name and id, and the
  team and project.
- **Outcome**: **Success**, **Denied** or **Failed**.

Names are copied into the event when it is written, so an event stays readable
after the user, team or resource it names is deleted.

## Browse the log

**Audit** lists events newest first, 50 per page, with **Previous** and
**Next**. The columns are **Time**, **Actor**, **Operation**, **Resource**,
**Scope** (the team, with the project below it), **Channel** and **Outcome**.
Click a row to open the event's details in a drawer, grouped into **Who**,
**How** and **What**, with any changes, the event's details and its raw
metadata. An IP address or user agent that was not stored shows
**Not captured**.

Without a date range in the address, the page shows the last 7 days.

### Filters

| Filter | Matches |
| --- | --- |
| Search box | Part of a resource name, an actor's email or an IP address, ignoring case |
| User | Events by one user |
| Team | Events in one team |
| Project | Events in one project |
| Operation | One or more operations, grouped as **Resources**, **Auth**, **Team**, **Instance**, **Authorization** and **Audit** |
| Date range | Events in a time window |
| **Advanced filters** → resource type | One resource type |
| **Advanced filters** → channel | One or more of **Web**, **CLI**, **MCP**, **API**, **System** |
| **Advanced filters** → outcome | One or more of **Success**, **Denied**, **Failed** |

Filters combine: an event must match all of them. **Clear** removes them all.
The filters are kept in the page's address, so a filtered view can be
bookmarked or shared with another admin.

**Presets** saves the current filters under a name (**Save current filters…**)
and applies a saved set again. Presets are personal, up to 20 per admin.

### Export to CSV

**Export CSV** downloads every event that matches the current filters, not just
the current page, as `admin-audit-YYYYMMDD.csv`. An export holds at most
**50,000** events: when more match, the file stops there and ends with a
`# TRUNCATED` line, and a notice says how many events matched in total. Narrow the
filters to get the rest.

The columns are `created_at`, `operation`, `outcome`, `source`, `actor_type`,
`actor_email`, `actor_name`, `actor_user_id`, `team_name`, `team_id`,
`project_name`, `project_id`, `resource_type`, `resource_name`, `resource_id`,
`assistant_name`, `api_key_name`, `ip`, `user_agent`, `request_id` and
`metadata` (as JSON). A cell that starts with `=`, `+`, `-`, `@`, a tab or a carriage return gets a
leading `'`, so a spreadsheet does not run it as a formula.

Every completed export is itself recorded in the audit log.

## Audit log settings

Open the admin area, then **Settings** → **Audit log**. The settings apply to
the whole instance.

| Setting | Default | Rule |
| --- | --- | --- |
| **Retention** | 2 weeks | 1 to 52 weeks |
| **Capture IP address and user agent** | On | |

- **Retention**: once a day, the server deletes every event older than the
  retention. Lowering it shows a warning before you save: the next daily
  purge deletes the older events, and that cannot be undone. A change applies
  at the next purge, with no restart.
- **Capture IP address and user agent**: switching it off affects new events
  only. Events already stored keep their IP address and user agent until they
  are purged.

**Reset to defaults** restores 2 weeks and capture on. Every change is listed
under **Change history** on the same page, and also recorded in the audit log.

:::caution[IP addresses and user agents are personal data]
With capture on, every event stores the client's IP address and user agent.
Make sure your privacy policy covers them, or switch capture off. Retention
also bounds how long the rest of each event (names, email addresses) is kept.
:::

### The daily purge

The purge runs in the server, once at startup and then every 24 hours. With
several replicas, only one purges at a time. It reads the retention on every
run, and if it cannot read the settings it deletes nothing. There is nothing
to configure: the audit log has no `config.yaml` keys or environment
variables.

## Limits

- **Append-only through VibeXP, not tamper-evident.** VibeXP never edits or
  deletes an event except in the retention purge, but the events are ordinary
  database rows with no hash chain or signature. Anyone with write access to
  the database can change them.
- **Best-effort recording.** An event is written in the background after the
  action, and recording never blocks or fails the action itself. An event can
  be lost if the database write fails, or if the server stops before it is
  written. The server logs such failures and counts them in the
  `vx_audit_events_dropped_total` metric.

## API

The pages are clients of the instance admin API, which answers 404 to anyone
who is not an instance admin:

| Method and path | Does |
| --- | --- |
| `GET /api/v1/admin/audit-events` | List events, newest first. Filters: `q`, `actor_user_id`, `team_id`, `project_id`, `operation`, `resource_type`, `source`, `outcome`, `from` (inclusive) and `to` (exclusive). `operation`, `source` and `outcome` can be repeated. Paged with `limit` (up to 200, default 50) and `cursor` |
| `GET /api/v1/admin/audit-events/export` | The same filters, as CSV. The `X-Export-Total-Count` and `X-Export-Truncated` headers report the full count and whether the file was capped |
| `GET /api/v1/admin/settings/audit-log` | Read the settings, their limits and the stored version |
| `PUT /api/v1/admin/settings/audit-log` | Save the settings. Pass `expected_version` to get a 409 instead of overwriting someone else's change |
| `DELETE /api/v1/admin/settings/audit-log` | Reset to the defaults |
| `GET /api/v1/admin/settings/audit-log/audit` | Page through the settings' change history |

## Related

- [Instance Admin Portal](instance-admin.md): who is an instance admin.
- [Lockout Recovery](lockout-recovery.md): the recovery command, whose changes
  are recorded here.
- [Upgrading](upgrading.md#audit-log-v0170):
  what changes when you upgrade to v0.17.0.
