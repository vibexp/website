# CLAUDE.md

Guidance for Claude Code working in this repository.

## What this is

The whole public web presence of **VibeXP**, an open-source, self-hostable AI
knowledge base: the landing page, the feature pages, the documentation and the
blog, all published to **https://vibexp.io**. This is a **public** repository:
never commit secrets, real API keys, DSNs, or tokens. There is no hosted/paid
product; primary CTAs point at self-hosting (`/#install`) and the GitHub repo
(`https://github.com/vibexp/vibexp`).

It is built on the same template as the other Shaharia Lab open-source sites
(`shaharia-lab/slackcli` `web/`, `shaharia-lab/agento` `web/`) and must stay
uniform with them in look, structure and tooling. The difference: those live in
a `web/` folder inside their product repo, while here the site IS the repo, so
everything sits at the root and the product lives elsewhere (`vibexp/vibexp`).
When a fix lands in one of the sibling sites' template files, port it here, and
the other way round.

## Commands

```bash
npm ci
npm run dev          # sync docs + release data, then astro dev -> :4321
npm run build        # clean + sync + astro build -> dist/
npm run check        # astro check (types)
npm run check:links  # every internal link and #fragment in dist/ resolves
npm run build:og     # re-render public/og.png from design/og-image.html (needs Chrome)
```

CI (`.github/workflows/site-check.yml`) runs build, check and check:links on
every PR. Run all three before committing.

## Layout

- **Astro + Starlight.** Starlight owns `/docs/`; everything else is a plain
  Astro page under `src/pages/` using `src/layouts/Page.astro`.
- **Design:** tokens come from the public npm package `@shaharia-lab/agento-code`
  (shared by every sibling site), imported through `src/styles/tokens.css`, the
  one stylesheet both halves of the site load. VibeXP uses the `ink` accent
  (monochrome); tokens.css pins it for the Starlight half too. Fonts are
  self-hosted via `@fontsource` (`src/styles/fonts.css`). Use token variables,
  never raw colours.
- **Docs:** `docs/` is the single source, plain Markdown that reads on GitHub
  (H1 title, relative `.md` links). `scripts/sync-docs.mjs` generates
  `src/content/docs/docs/` (gitignored, never edit). Every file must be listed
  in `docs.manifest.mjs` (sidebar order, labels, descriptions) or the build
  fails. Starlight asides (`:::note`) are allowed.
- **Blog:** `src/content/blog/*.md`, schema in `src/content.config.ts`. The
  filename is the URL slug (`/blog/<slug>/`). Diagrams are pre-rendered SVGs,
  not a runtime: see `design/blog/README.md`.
- **Feature pages:** `/features/<slug>/` are one template
  (`src/pages/features/[slug].astro`) fed by `features.config.mjs`; the landing
  FAQ is `faq.config.mjs`. Both are also emitted as structured data, so every
  claim in them must be true of the docs.
- **Release data:** `scripts/fetch-release.mjs` writes `src/data/release.json`
  and `repo.json` (gitignored) from the vibexp/vibexp GitHub API at build time;
  it never fails the build.
- **Config:** `site.config.mjs` is the one place the address, repos, consent and
  GTM helpers live. `REPO` is the product, `SITE_REPO` is this repo.

## Documentation rules

- **Docs track the latest published release of each product, never `main`.**
  Validate every claim against the product source at its release tag
  (`../vibexp`, `../cli`, ... checked out at the tag). `.vibexp-release` records
  the core version the docs were last synced to.
- The whole sync runs through the **`update-docs`** skill
  (`.claude/skills/update-docs/SKILL.md`, scope `core`, `cli`, ... or `all`);
  the `vibexp-release` scheduled job and vibexp/vibexp's `release` skill hand
  their docs step to it. It ends at an approved, unmerged PR.
- Writing style: no em dashes, concise, scannable (short paragraphs, lists and
  tables over prose).

## Deployment (GitHub Pages)

`pages.yml` builds and deploys on push to `main`, daily, on
`repository_dispatch: vibexp-release`, and by hand. The custom domain is
`public/CNAME` (the vibexp org is not managed in terraform, unlike the sibling
sites). Analytics only exist when the `PUBLIC_GTM_ID` repo variable is set.

## Gotchas

- `public/logo.svg` and `public/logo.png` look unused but are hotlinked from
  outside: the product README and the product's email template
  (`backend/internal/services/templates/email/base.html`). Do not delete them.
- Routes are the old ones kept on purpose: `/how-it-works/`, `/features/*`, and
  `/docs/<old docs.vibexp.io path>`, `/blog/<old blog slug>/`.
- Hand-written hrefs go through `url()` from site.config.mjs.
- The terminal replay on the landing page (`src/components/Term.astro`) shows
  real MCP tool names; keep them in step with the MCP server.

## Conventions

- TypeScript strict via `astro check`; no `any` in new code.
- Comments explain why, in the voice of the existing files.
- License: AGPL-3.0-or-later.
