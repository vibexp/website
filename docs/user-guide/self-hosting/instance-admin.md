# Instance Admin Portal

The **instance admin portal** gives operators of a self-hosted VibeXP an instance-wide view of stats, users, teams and projects, and the instance's own settings. It is meant for whoever runs the deployment, not for day-to-day team collaboration.

## Instance admin vs team roles

An instance admin is an **instance-wide operator role**, separate from the [team roles](../team-roles-and-permissions.md) (owner, admin, member) that govern a single team. A team owner or admin controls one team; an instance admin sees every user and every team on the whole instance and manages the settings that apply to all of them.

The role is dormant by default: with no instance admins configured, no one has the role.

## Root admins and granted admins

There are two kinds of instance admin. Both open the same portal; they differ in where the role comes from and in who can change it.

| | Root admin | Granted admin |
| --- | --- | --- |
| Defined in | The server configuration: `auth.instance_admins`, or `INSTANCE_ADMIN_EMAILS` in Docker | The database, from the admin area |
| Added or removed by | Editing the configuration and restarting | A root admin, with no restart |
| Can grant or remove other admins | Yes | No |
| Exempt from the [access allowlist](authentication.md#restricting-who-can-sign-in-optional) | Yes | No |
| Can be suspended, deleted or have the role removed in the admin area | No | Yes |

Root admins are the trust root of the instance. Because they come from the configuration and not from stored data, whoever operates the server can always restore admin access by editing it.

### Name the root admins

Root admins are matched by email, **case-insensitive**. Configure them one of two ways:

- **Config file**: set `auth.instance_admins` to a YAML list of emails in `config.yaml`.
- **Docker env var**: set `INSTANCE_ADMIN_EMAILS` to a comma-separated list of emails. The shipped `config.docker.yaml` wires this in as `instance_admins: "${INSTANCE_ADMIN_EMAILS:-}"`.

```yaml
# config.yaml
auth:
  instance_admins:
    - alice@example.com
    - bob@example.com
```

```bash
# Docker
INSTANCE_ADMIN_EMAILS=alice@example.com,bob@example.com
```

Name at least one before you set up sign-in: [first-run setup](authentication.md#first-run-setup) finishes when a root admin signs in.

### Grant the role to someone else

Open **Settings** → **Authentication** in the portal. The **Instance admins** card lists the root admins, each with a **config** badge, followed by the granted admins and the date each was granted.

A root admin sees a **Grant instance admin to** field on that card: enter the email address of an existing, active user and press **Grant**. **Remove** next to a granted admin takes the role away again: they keep their account and their teams, and lose the portal on their next request. A granted admin who is suspended does not hold the role while suspended.

A granted admin sees the same list without those controls. A root admin cannot be granted or removed here, since their role comes from the configuration.

See [Authentication & MCP Auth](authentication.md) for how sign-in is configured, and the [Configuration reference](../../developer-guide/deployment/configuration-reference.md) for all config options.

## What it unlocks

Instance admins get an **`/admin` portal** in the web app, reachable from the **Admin Portal** entry in the user menu:

- **Dashboard**: instance-wide counts (users, teams, prompts, artifacts, memories) and the running backend version.
- **Users**: a list of all users with their team counts, and a detail view showing each user's team memberships and role per team. Since v0.16.0 an admin can also create users before they sign in, hand over setup links, and reset or remove passwords: see [Email and Password Sign-In](password-sign-in.md#create-users-and-hand-over-setup-links).
- **Teams**: a list of all teams with owner and member count, and a detail view showing the owner and full member list.
- **Projects**: a list of every project on the instance.

Since v0.15.0 the portal is also where the instance's settings are edited, under **Settings**:

- **Authentication**: password sign-in and the registration mode, the sign-in providers, the access allowlist, the instance admins, and a change history with a tab for each (**Providers**, **Allowlist**, **Admins**, **Setup**, and since v0.16.0 **Sign-in policy**). See [Authentication & MCP Auth](authentication.md). If a change there locks you out, see [Lockout Recovery](lockout-recovery.md).
- **Site info**: the company name, logo and links shown across the instance and in its emails. See [Site Info (Branding)](site-info.md).
- **Email**: the instance's outbound mail. See [Instance Email](instance-email.md).
- **Search** and **AI Summary**: the search ranking and AI summary defaults. See [Search & AI Summary Settings](search-and-ai-summary-settings.md).

## Not advertised to non-admins

The portal is invisible unless you hold the role:

- The `/api/v1/admin` API returns **404 (Not Found)**, not 403, to non-admins and unauthenticated callers, so the surface is never advertised.
- The **Admin Portal** menu entry appears only for instance admins.
- The `is_instance_admin` flag is exposed on `GET /auth/me`, and the web app uses it to show the entry and guard the routes.
