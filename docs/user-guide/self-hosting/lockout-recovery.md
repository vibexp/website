# Lockout Recovery

The sign-in providers, password sign-in and the access allowlist are edited in the admin area, behind sign-in. A wrong client secret on the only provider, a provider that was disabled by mistake, a lost admin password on a password-only instance, or an allowlist that leaves out every admin can therefore lock everyone out of the page that would fix it. This page is the way back in. Both paths need access to the server, not to the app.

| Situation | Fix |
| --- | --- |
| A provider was disabled and none is left to sign in with | [`providers enable <slug>`](#the-admin-auth-commands) |
| The only provider is misconfigured (wrong secret, wrong issuer) | [`setup rearm`](#the-admin-auth-commands), then correct it on the setup page |
| A password-only instance: the root admin's password is lost or was disabled | [`password set --email <root-admin-email>`](#set-a-root-admins-password) |
| A password-only instance: the root admin has no account yet | [`setup rearm`](#the-admin-auth-commands), then **Use email and password** on the setup page |
| The allowlist shuts out the people who could change it | Sign in as a root admin, who is exempt from the allowlist. If no root admin can sign in either, [`allowlist clear`](#the-admin-auth-commands) |
| You cannot run a command in the container | [Recovery mode](#recovery-mode) |

If the problem is that nobody is an instance admin, no recovery is needed: set `INSTANCE_ADMIN_EMAILS` and restart (see [Instance Admin Portal](instance-admin.md)).

## The `admin auth` commands

The server binary has a set of break-glass commands that edit the stored authentication settings directly in the database. In the published image the binary is `/app/main`, so run them with `docker exec`:

```bash
docker exec <container> ./main admin auth providers list
docker exec <container> ./main admin auth providers enable <slug>
docker exec <container> ./main admin auth providers disable <slug>
docker exec <container> ./main admin auth allowlist clear
docker exec <container> ./main admin auth setup rearm
docker exec -it <container> ./main admin auth password set --email <root-admin-email>
```

With the bundled `docker-compose.yml`, the same commands are `docker compose exec app ./main admin auth …`.

:::note[The tool calls itself `vibexp`]
The built-in help and some messages name the binary `vibexp`, as in ``run `vibexp admin auth setup rearm` ``. The image has no `vibexp` command: wherever you read that, run `./main` with the same arguments.
:::

How they behave:

- They load the same `config.yaml` as the server and connect straight to the database, so inside the container they need no extra configuration.
- They do not need a running server, and they need no restart: a running server picks the change up within seconds.
- Every change is recorded in the change history under **Settings** → **Authentication**, where it is attributed to **Server CLI** instead of a user.
- They never run database migrations. After an upgrade, start the server once before using them; on a database that is not migrated yet they stop with a message saying so.

| Command | What it does |
| --- | --- |
| `providers list` | Lists the stored providers: slug, type, whether each is enabled, its display name, and whether a client secret is stored. The secret itself is never printed. |
| `providers enable <slug>` | Offers the provider at sign-in again. |
| `providers disable <slug>` | Stops offering the provider at sign-in. Unlike the admin area, it does not ask for confirmation when this leaves no enabled provider; it tells you that the instance is now in setup mode. |
| `allowlist clear` | Removes the access allowlist, so sign-in is open to every account the providers accept. |
| `setup rearm` | Forces setup mode on and prints a new setup URL, valid for 24 hours. Any earlier setup URL and setup session stop working. |
| `password set --email <address>` | Sets the password of a root admin whose account exists. See [below](#set-a-root-admins-password). |

`setup rearm` is the command for a provider you have to edit rather than switch on or off. Open the URL it prints: the setup page lists the stored providers, and you can correct, add or enable one there, then finish by signing in as a root admin, exactly as in [first-run setup](authentication.md#first-run-setup). Setup mode stays on until that sign-in, even though a provider is enabled.

```text
Authentication setup re-armed. Any earlier setup URL and setup session no longer work.
Open this URL within 24 hours to configure sign-in:
https://<your-app-host>/setup?token=…
```

:::caution[A cleared allowlist comes back if the old variables are still set]
If `AUTH_ALLOWED_DOMAINS` or `AUTH_ALLOWED_EMAILS` (or `auth.access_allowlist` in a mounted `config.yaml`) is still set from before v0.15.0, the server imports it again at the next start whenever no allowlist is stored. Remove those variables before you restart, or the list you cleared returns. See the [upgrade note](upgrading.md#sign-in-providers-and-the-access-allowlist-moved-to-the-database-v0150).
:::

## Set a root admin's password

On an instance that runs on passwords alone, losing the last admin password is a lockout. Setup mode then comes back by itself: it is on whenever no sign-in method is usable, so the next start logs a new `SETUP URL` (see [When the last way in is lost](password-sign-in.md#when-the-last-way-in-is-lost)). The other way back is to set the password directly:

```bash
docker exec -it <container> ./main admin auth password set --email admin@example.com
```

- The address must be listed in `INSTANCE_ADMIN_EMAILS` (`auth.instance_admins`), and **its account must already exist**. The command cannot create it: for a root admin with no account yet, run `setup rearm` and use **Use email and password** on the setup page.
- The password is never a flag or an argument. In a terminal it is asked for twice, without echo; otherwise it is read from standard input, for example `printf '%s' "$NEW_PASSWORD" | docker exec -i <container> ./main admin auth password set --email admin@example.com`.
- It must be at least 12 characters, not a common password and not the email address.
- The account's sessions are ended; its API keys are kept.
- `--enable-login` also switches password sign-in on for the instance, for when it was switched off.
- The password change itself is not recorded in the change history under **Settings** → **Authentication**. Switching password sign-in on with `--enable-login` is, attributed to **Server CLI**.

## Recovery mode

Set `AUTH_SETTINGS_RECOVERY_MODE=true` (`auth.recovery_mode` in a mounted `config.yaml`) and restart the server. While the flag is set:

- Setup mode is forced on, and the server logs a new `SETUP URL` at `WARN` on **every** start, replacing the previous one.
- The server also logs a warning on every start that recovery mode is on, so the flag is not left set unnoticed.
- The configured providers keep working: people who can sign in are not interrupted.

```bash
docker compose logs app | grep "SETUP URL"
```

Open the URL, repair the providers or the allowlist on the setup page, and check that you can sign in. Then **remove the flag and restart**: recovery mode is meant to be temporary, and while it is on, each restart puts a working setup URL in the logs.

## Keep the setup URL private

Whoever holds a valid setup URL can change the instance's sign-in providers and its access allowlist without signing in. Treat the log line like a credential, and finish setup (or remove the recovery flag) promptly.

## Related

- [Authentication & MCP Auth](authentication.md): providers, the allowlist and first-run setup
- [Instance Admin Portal](instance-admin.md): root admins and granted admins
- [Email and Password Sign-In](password-sign-in.md): password sign-in, the setup page's password path and admin reset links
