/**
 * Which files in docs/ become pages, in what order, under what heading.
 *
 * Imported by both the sync script and astro.config.mjs, so the sidebar and
 * the generated pages cannot disagree about what exists. A doc added to docs/
 * and not listed here fails the build rather than silently never publishing.
 *
 * `file` is the path RELATIVE TO docs/, including its directory, because the
 * docs are nested (`user-guide/`, `developer-guide/backend/`, ...) rather than
 * flat. `slug` mirrors that path with the extension dropped and a directory's
 * `README.md` collapsing to the directory itself - so `user-guide/memory.md`
 * publishes at `/docs/user-guide/memory/` and `user-guide/prompts/README.md`
 * at `/docs/user-guide/prompts/`. Keeping the two shapes in step is what lets
 * sync-docs.mjs resolve a relative link between two docs without a lookup
 * table of exceptions.
 *
 * Every route is the old docs.vibexp.io route with `/docs` in front of it, so
 * a redirect from the retired subdomain is a prefix rewrite and nothing more.
 *
 * `description` overrides the derived <meta> description. Every page carries
 * one here because they were written by hand for the previous docs site and
 * are better than anything derived from a lead paragraph would be.
 *
 * `collapsed` on a group starts it folded in the sidebar. The developer guide
 * is folded because most readers are users, and 20 contributor pages open
 * under theirs would bury the user guide below the fold.
 */
export const GROUPS = [
  { id: 'user', label: 'User guide' },
  { id: 'prompts', label: 'Prompts' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'selfhost', label: 'Self-hosting' },
  { id: 'dev', label: 'Developer guide' },
  { id: 'backend', label: 'Backend', collapsed: true },
  { id: 'frontend', label: 'Frontend', collapsed: true },
  { id: 'deployment', label: 'Deployment', collapsed: true },
  { id: 'contributing', label: 'Contributing', collapsed: true },
];

export const PAGES = [
  {
    file: 'README.md',
    slug: 'index',
    label: 'Overview',
    group: null,
    description:
      'Documentation for VibeXP - running your own instance, connecting Claude Code, Cursor and every MCP client, and working on the project itself.',
  },

  { file: "user-guide/intro.md", slug: "user-guide/intro", label: "Introduction", group: "user",
    description: "VibeXP is your personal AI productivity platform for turning scattered AI outputs into organized, searchable knowledge with persistent context." },
  { file: "user-guide/quick-start.md", slug: "user-guide/quick-start", label: "Quick Start", group: "user",
    description: "Get started with VibeXP in five minutes by signing in, building your first prompt, generating an API key, and connecting your AI tools." },

  { file: "user-guide/prompts/README.md", slug: "user-guide/prompts", label: "Prompts Overview", group: "prompts",
    description: "Create, organize, and reuse AI prompt templates to streamline your workflow and ensure consistent results across any AI model." },
  { file: "user-guide/prompts/getting-started.md", slug: "user-guide/prompts/getting-started", label: "Getting Started", group: "prompts",
    description: "A step-by-step walkthrough for creating, configuring, and saving your first prompt in VibeXP." },
  { file: "user-guide/prompts/managing-prompts.md", slug: "user-guide/prompts/managing-prompts", label: "Managing Prompts", group: "prompts",
    description: "Learn how to view, search, filter, edit, delete, and organize the prompts in your VibeXP library." },
  { file: "user-guide/prompts/advanced-features.md", slug: "user-guide/prompts/advanced-features", label: "Advanced Features", group: "prompts",
    description: "Take your prompts further with variables, prompt references, markdown formatting, and MCP integration." },
  { file: "user-guide/prompts/best-practices.md", slug: "user-guide/prompts/best-practices", label: "Best Practices", group: "prompts",
    description: "Learn how to design, organize, and maintain effective prompts that deliver consistent results." },
  { file: "user-guide/prompts/api-integration.md", slug: "user-guide/prompts/api-integration", label: "API Integration", group: "prompts",
    description: "Access and manage your prompts programmatically through the VibeXP REST API." },
  { file: "user-guide/prompts/faq.md", slug: "user-guide/prompts/faq", label: "FAQ", group: "prompts",
    description: "Common questions and answers about creating, managing, and integrating VibeXP prompts." },

  { file: "user-guide/artifacts.md", slug: "user-guide/artifacts", label: "Artifacts", group: "user",
    description: "Transform your AI conversations into a searchable knowledge base by capturing, organizing, and retrieving code, documentation, and reports." },
  { file: "user-guide/memory.md", slug: "user-guide/memory", label: "Memory", group: "user",
    description: "Your personal AI knowledge vault that remembers project details, preferences, and workflows so you never explain the same thing twice." },
  { file: "user-guide/blueprints.md", slug: "user-guide/blueprints", label: "Blueprints", group: "user",
    description: "Blueprints are the rules and guidelines that shape your AI's behavior, organized per tool, readable by your AI assistants over MCP." },
  { file: "user-guide/metadata-filtering.md", slug: "user-guide/metadata-filtering", label: "Metadata filtering", group: "user",
    description: "Filter artifacts, memories, and blueprints by the metadata your team actually stores, using one JSON query parameter with AND across keys and OR within a key, plus catalog endpoints and MCP tools that let an AI agent discover which keys and values exist." },
  { file: "user-guide/labels.md", slug: "user-guide/labels", label: "Labels", group: "user",
    description: "Labels are the one taxonomy shared by prompts, artifacts, blueprints, and memories: up to 10 free-form words per resource, a comma-separated list filter that matches any listed label, and the same argument on every MCP create and update tool." },
  { file: "user-guide/relations.md", slug: "user-guide/relations", label: "Relations", group: "user",
    description: "Relations are typed, directional links between your prompts, blueprints, memories, and artifacts, building a shared knowledge graph your AI and your team can navigate." },
  { file: "user-guide/mcp-server.md", slug: "user-guide/mcp-server", label: "MCP Server Integration", group: "user",
    description: "Give your AI assistants direct OAuth 2.1 access to your VibeXP prompts, artifacts, blueprints, memories, and feeds through the Model Context Protocol." },
  { file: "user-guide/ai-agents.md", slug: "user-guide/ai-agents", label: "AI Agents (A2A)", group: "user",
    description: "Connect A2A-compatible AI agents to VibeXP, chat with them, and track task execution in real time." },
  { file: "user-guide/feeds.md", slug: "user-guide/feeds", label: "Feeds", group: "user",
    description: "Feeds are channels where your AI agents post their work over MCP and you reply in-thread to steer them — asynchronous collaboration with your assistants." },
  { file: "user-guide/comments.md", slug: "user-guide/comments", label: "Comments", group: "user",
    description: "Team-visible threaded comments on artifacts, memories, prompts, and blueprints, so your team can discuss a resource right where it lives." },
  { file: "user-guide/resource-access-analytics.md", slug: "user-guide/resource-access-analytics", label: "Access Analytics", group: "user",
    description: "See how often each resource is read and where those reads come from, with a compact Access activity chart on every resource detail page." },
  { file: "user-guide/search.md", slug: "user-guide/search", label: "Search Settings", group: "user",
    description: "Search ranking is configured per team. Pick a ranking profile from three presets, or tune the raw relevance and freshness weights. This page covers the presets, how teams inherit the instance defaults, and the pagination cap operators own." },
  { file: "user-guide/team-roles-and-permissions.md", slug: "user-guide/team-roles-and-permissions", label: "Team roles & permissions", group: "user",
    description: "Every member of a VibeXP team has a role — Owner, Admin, or Member — and that role decides what they may do. This page is the full matrix, how to change someone's role, and what API keys and MCP agents are allowed to do on your behalf." },

  { file: "user-guide/integrations/api-keys.md", slug: "user-guide/integrations/api-keys", label: "API Keys", group: "integrations",
    description: "Create and manage API keys for secure authentication of the VibeXP CLI and REST API." },
  { file: "user-guide/integrations/ai-providers.md", slug: "user-guide/integrations/ai-providers", label: "Embedding & Model Providers", group: "integrations",
    description: "Configure per-team embedding providers for semantic search and bring-your-own OpenAI-compatible model providers." },
  { file: "user-guide/integrations/email-provider.md", slug: "user-guide/integrations/email-provider", label: "Email Provider", group: "integrations",
    description: "Send your team's mail through its own SMTP, Mailgun, Postmark, or SendGrid account instead of the instance provider." },
  { file: "user-guide/integrations/github-app.md", slug: "user-guide/integrations/github-app", label: "GitHub App", group: "integrations",
    description: "Connect your team's own GitHub App to VibeXP. Create the App, grant the right permissions and events, paste the credentials, wire the webhook, and troubleshoot a setup that is not receiving events." },

  { file: "user-guide/open-source/README.md", slug: "user-guide/open-source", label: "Open Source", group: "selfhost",
    description: "VibeXP is open source. Learn about its open-core license model, the monorepo layout, and how to get involved." },
  { file: "user-guide/self-hosting/README.md", slug: "user-guide/self-hosting", label: "Self-Hosting", group: "selfhost",
    description: "Run your own VibeXP instance on your own infrastructure and domain with Docker Compose. Covers the configuration model, authentication options, embeddings, and object storage." },
  { file: "user-guide/self-hosting/authentication.md", slug: "user-guide/self-hosting/authentication", label: "Authentication & MCP Auth", group: "selfhost",
    description: "Configure provider-agnostic login (Google, GitHub, or any OIDC provider) and the embedded OAuth 2.1 Authorization Server that secures the MCP endpoint for a self-hosted VibeXP." },
  { file: "user-guide/self-hosting/instance-admin.md", slug: "user-guide/self-hosting/instance-admin", label: "Instance Admin Portal", group: "selfhost",
    description: "Grant instance-wide operators a read-only admin portal on your self-hosted VibeXP for instance stats, users, and teams." },
  { file: "user-guide/self-hosting/upgrading.md", slug: "user-guide/self-hosting/upgrading", label: "Upgrading", group: "selfhost",
    description: "Breaking changes in VibeXP releases and the migration each one needs, newest first. Anything listed here requires action before the new image will start." },
  { file: "user-guide/self-hosting/github-app-migration.md", slug: "user-guide/self-hosting/github-app-migration", label: "Migrating to per-team GitHub Apps", group: "selfhost",
    description: "Upgrade guide for the release that moves GitHub App credentials out of config.yaml and into per-team settings. Requires a config.yaml edit before the instance will start." },
  { file: "user-guide/self-hosting/postgres-pg17-migration.md", slug: "user-guide/self-hosting/postgres-pg17-migration", label: "Upgrading Postgres to 17", group: "selfhost",
    description: "Upgrade guide for v0.10.0, which moves the bundled Postgres image from 16 to 17. Postgres data files are not compatible across major versions, so a populated data volume needs a one-time dump-and-restore (or pg_upgrade) before the new image will start." },
  { file: "user-guide/contributing.md", slug: "user-guide/contributing", label: "Contributing", group: "selfhost",
    description: "Set up a local VibeXP development environment and learn the conventions for contributing to the open-source project." },

  { file: "developer-guide/intro.md", slug: "developer-guide/intro", label: "Developer Guide", group: "dev",
    description: "An orientation to the VibeXP codebase for contributors — the monorepo layout, the tech stack, and where to go next." },
  { file: "developer-guide/getting-started.md", slug: "developer-guide/getting-started", label: "Getting Started", group: "dev",
    description: "Set up a local VibeXP development environment from zero and run the backend and frontend with hot reload." },

  { file: "developer-guide/backend/overview.md", slug: "developer-guide/backend/overview", label: "Backend Overview", group: "backend",
    description: "Architecture, request flow, and package layout of the VibeXP Go backend." },
  { file: "developer-guide/backend/configuration.md", slug: "developer-guide/backend/configuration", label: "Backend Configuration", group: "backend",
    description: "The config.yaml reference for the VibeXP backend — loading, interpolation, secrets, and every configuration key." },
  { file: "developer-guide/backend/database.md", slug: "developer-guide/backend/database", label: "Database & Migrations", group: "backend",
    description: "PostgreSQL, pgvector, and the golang-migrate workflow in the VibeXP backend." },
  { file: "developer-guide/backend/authentication.md", slug: "developer-guide/backend/authentication", label: "Authentication", group: "backend",
    description: "The identity-provider registry, sessions, dev login, API keys, the embedded OAuth 2.1 Authorization Server, and bearer-JWT verification." },
  { file: "developer-guide/backend/mcp-server.md", slug: "developer-guide/backend/mcp-server", label: "MCP Server", group: "backend",
    description: "The OAuth 2.1 MCP resource server, the embedded Authorization Server, audience binding, and exposed tool groups." },
  { file: "developer-guide/backend/api-and-openapi.md", slug: "developer-guide/backend/api-and-openapi", label: "API & OpenAPI", group: "backend",
    description: "The spec-first OpenAPI workflow, resource groups, bundling, validation, and the API-change flow." },
  { file: "developer-guide/backend/code-generation.md", slug: "developer-guide/backend/code-generation", label: "Code Generation", group: "backend",
    description: "The generators behind the VibeXP backend, including oapi-codegen, Wire, mockery, the config schema generator, and the embedded OpenAPI bundle." },
  { file: "developer-guide/backend/testing.md", slug: "developer-guide/backend/testing", label: "Testing", group: "backend",
    description: "Unit tests, integration tests, end-to-end tests, coverage, and mocks for the VibeXP backend." },

  { file: "developer-guide/frontend/overview.md", slug: "developer-guide/frontend/overview", label: "Frontend Overview", group: "frontend",
    description: "Architecture of the VibeXP frontend — a Vite + React + TypeScript SPA embedded in and served by the Go backend, how it talks to the backend, and the local dev loop." },
  { file: "developer-guide/frontend/configuration.md", slug: "developer-guide/frontend/configuration", label: "Frontend Configuration", group: "frontend",
    description: "Reference for the VibeXP frontend's build-time VITE_* variables and the runtime /config.js configuration rendered by the backend." },
  { file: "developer-guide/frontend/building.md", slug: "developer-guide/frontend/building", label: "Building & Serving", group: "frontend",
    description: "How the VibeXP frontend is built and served — make frontend-build, the embedfrontend build tag, the combined multi-stage Docker image, SPA fallback in the Go backend, and the release flow." },
  { file: "developer-guide/frontend/api-integration.md", slug: "developer-guide/frontend/api-integration", label: "Frontend API Integration", group: "frontend",
    description: "How the VibeXP SPA talks to the backend — the generated @vibexp/api-client, the one service-module pattern, the response envelope rule, and the ESLint guardrail that blocks the retired hand-written client." },

  { file: "developer-guide/deployment/self-hosting.md", slug: "developer-guide/deployment/self-hosting", label: "Self-Hosting", group: "deployment",
    description: "Run the published VibeXP image with Docker Compose — quick start, what runs, evaluating with dev-login, and the hardening checklist before exposing it publicly." },
  { file: "developer-guide/deployment/docker.md", slug: "developer-guide/deployment/docker", label: "Docker & Compose", group: "deployment",
    description: "A walkthrough of the VibeXP root docker-compose.yml — the postgres and app services, the combined image and its baked config.yaml, the pgdata volume, the bridge network, and the optional GCS service." },
  { file: "developer-guide/deployment/configuration-reference.md", slug: "developer-guide/deployment/configuration-reference", label: "Configuration Reference", group: "deployment",
    description: "How VibeXP is configured — the required config.yaml, its env-var interpolation, the baked Docker default, and the production-critical values you must set." },

  { file: "developer-guide/contributing/workflow.md", slug: "developer-guide/contributing/workflow", label: "Contribution Workflow", group: "contributing",
    description: "How to branch, commit, and open a pull request for VibeXP — Conventional Commits, PR conventions, licensing, and security." },
  { file: "developer-guide/contributing/pre-commit-and-ci.md", slug: "developer-guide/contributing/pre-commit-and-ci", label: "Pre-commit & CI", group: "contributing",
    description: "The mandatory pre-commit hooks, what CI enforces, and how VibeXP releases the combined container image from a single v* git tag." },
  { file: "developer-guide/contributing/code-conventions.md", slug: "developer-guide/contributing/code-conventions", label: "Code Conventions", group: "contributing",
    description: "The conventions that keep VibeXP consistent — the spec-first backend, generated code, the API change flow, and a deployment-agnostic frontend." },
];
