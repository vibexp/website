# Open Source

VibeXP is an open-source, AI-native workspace for prompts, artifacts, memories, and blueprints — with semantic search, an activity feed, team workspaces, and a built-in [MCP](https://modelcontextprotocol.io) server so AI agents can read and write your knowledge directly.

The full source lives on GitHub at **[vibexp/vibexp](https://github.com/vibexp/vibexp)**. Clone it, run it locally, and [self-host](../self-hosting/README.md) your own instance on your own domain.

:::note[No paid tiers]
This repository is open-sourced from the production codebase. Billing and subscription code has been removed — **all features are available with no paid tiers**. Any references to "Free / Pro / Enterprise" tiers in older documentation are deployment-defined limits, not VibeXP product tiers.
:::

## License

VibeXP is licensed under **MIT**: one license for every repository in the project.

| Component | Repository | License |
| --- | --- | --- |
| Core REST + MCP API (`backend/`) | `vibexp/vibexp` | MIT |
| Web application (`frontend/`) | `vibexp/vibexp` | MIT |
| Website, documentation and blog | `vibexp/website` | MIT |
| Command-line client | `vibexp/cli` | MIT |
| Generated TS API client (`@vibexp/api-client`) | `vibexp/api-client-js` | MIT |
| Design tokens + brand (`@vibexp/design-system`) | separate package | MIT |

Versions of `vibexp/vibexp` up to and including the 0.14 line were published under AGPL-3.0-or-later and keep that license. MIT applies from the next release on.

## Repository layout

VibeXP is split across several repositories under [`github.com/vibexp`](https://github.com/vibexp). The main `vibexp/vibexp` repo holds the two independently deployable components — the Go backend and the React frontend. The frontend's shared `@vibexp/*` packages are published to **public npm**, so a fresh install needs **no auth token**.

| Path / Repo | What it is | Stack |
| --- | --- | --- |
| `backend/` (in `vibexp/vibexp`) | Core REST + MCP API | Go, PostgreSQL + pgvector |
| `frontend/` (in `vibexp/vibexp`) | Web application | React + Vite |
| `vibexp/cli` | Command-line client | TypeScript + Bun |
| `vibexp/api-client-js` | Generated TS API client (`@vibexp/api-client`) | TypeScript |
| `vibexp/website` | Website, documentation and blog ([vibexp.io](https://vibexp.io)) | Astro + Starlight |

## Where to file issues

- **Bugs and feature requests**: open an issue at [github.com/vibexp/vibexp/issues](https://github.com/vibexp/vibexp/issues).
- **Security vulnerabilities**: do **not** use public issues. Follow the private disclosure process in the repository's [`SECURITY.md`](https://github.com/vibexp/vibexp/blob/main/SECURITY.md).
- **Questions and contributions**: see the [Contributing](../contributing.md) guide.

## Branding

The "VibeXP" name and logo are brand assets of the project maintainer. If you run a fork, use your own name and branding — the site/email branding and all domains are overridable via environment variables. See [Self-Hosting → Branding](../self-hosting/README.md#branding).

## Next steps

- [Self-Hosting](../self-hosting/README.md) — run your own instance with Docker Compose.
- [Contributing](../contributing.md) — set up a development environment and open a PR.
