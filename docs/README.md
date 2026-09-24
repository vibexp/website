# VibeXP documentation

Everything about VibeXP, the open-source knowledge base your AI tools read from and write back to: running your own instance, connecting Claude Code, Cursor and every other MCP client, and working on the project itself.

These pages are the source of the documentation published at [vibexp.io/docs](https://vibexp.io/docs/). They are plain Markdown and read the same on GitHub.

## User guide

Start here if you use VibeXP, or run it for your team.

- [Introduction](user-guide/intro.md) - what VibeXP is and how the pieces fit together.
- [Quick start](user-guide/quick-start.md) - from an empty machine to your first prompt.
- [Prompts](user-guide/prompts/README.md) - reusable prompt templates with variables and references.
- [Artifacts](user-guide/artifacts.md) - capture and version the content your AI produces.
- [Memory](user-guide/memory.md) - context your AI reads before a task and writes back as it learns.
- [Blueprints](user-guide/blueprints.md) - the rules your AI follows, organized per tool.
- [MCP server](user-guide/mcp-server.md) - connect AI assistants to your VibeXP data over OAuth 2.1.
- [Feeds](user-guide/feeds.md) - follow agents as they work, and reply to steer them.
- [Team roles and permissions](user-guide/team-roles-and-permissions.md) - who can do what in a team.

## Integrations

- [API keys](user-guide/integrations/api-keys.md) - programmatic access for the CLI, REST API, and custom integrations.
- [Embedding and model providers](user-guide/integrations/ai-providers.md)
- [Email provider](user-guide/integrations/email-provider.md)
- [GitHub App](user-guide/integrations/github-app.md)

## Open source and self-hosting

- [Open source](user-guide/open-source/README.md) - licensing and how the repositories are laid out.
- [Self-hosting](user-guide/self-hosting/README.md) - run your own instance with Docker Compose.
- [Upgrading](user-guide/self-hosting/upgrading.md) - the breaking changes to read before you pull a new image.

## Developer guide

Building, self-hosting from source, or contributing to VibeXP.

- [Developer guide](developer-guide/intro.md) - architecture overview and where to start as a contributor.
- [Getting started](developer-guide/getting-started.md) - run the backend and frontend locally from a fresh clone.
- [Backend configuration](developer-guide/backend/configuration.md) - the full environment-variable reference.
- [Self-hosting](developer-guide/deployment/self-hosting.md) - deploy your own instance.
- [Contribution workflow](developer-guide/contributing/workflow.md) - branching, Conventional Commits, pre-commit hooks, and CI.
- [Code generation](developer-guide/backend/code-generation.md) - spec-first OpenAPI, Wire DI, and mockery.
