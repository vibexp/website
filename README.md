# VibeXP website — Astro + React + Tailwind CSS

The marketing website for [VibeXP](https://github.com/vibexp/vibexp) — the
open-source, self-hostable knowledge base your AI builds on.

A statically-generated **Astro** site (real per-route HTML for SEO/LLM crawlers).
Page content is authored as React components in `src/` and rendered as Astro
islands; routing lives in `astro-src/`. Tailwind CSS v4 + the public
[`@vibexp/design-system`](https://www.npmjs.com/package/@vibexp/design-system)
tokens.

## Getting Started

```bash
npm ci
npm run dev      # astro dev → http://localhost:4321
```

## Scripts

- `npm run dev` — Astro dev server (http://localhost:4321)
- `npm run build` — `astro build` → static `dist/`
- `npm run preview` — preview the built `dist/`
- `npm run lint` / `npm run lint:fix` — ESLint (`.ts`/`.tsx`/`.astro`)
- `npm run format` — Prettier
- `npm run type-check` — `astro check` (uses `tsconfig.astro.json`)
- `npm run test` — unit tests (Jest)
- `npm run test:e2e` — end-to-end tests (Playwright)

## Architecture

- **Routing** lives in `astro-src/pages/*.astro` (Astro's `srcDir` is `astro-src`,
  kept separate from the React page components in `src/pages/*.tsx`). Each route
  imports its page component and renders it as an island inside `BaseLayout.astro`.
- **Page content** is React components in `src/`, rendered as Astro islands
  (`client:load` for interactive pages, zero-JS for static prose).
- **`react-router-dom`** is aliased to `src/lib/astro-router-shim.tsx` so the
  reused components do MPA `<a>` / `window.location` navigation.
- **SEO** (`<title>`/canonical/OG/JSON-LD + Consent Mode v2 + GTM) is baked into
  the static `<head>` by `astro-src/components/SEO.astro` + `BaseLayout.astro`.
- **Tailwind v4** is processed via PostCSS (`postcss.config.mjs`).
- **Sentry** (`@sentry/astro`) is opt-in — it stays disabled unless its env vars
  are set, so the open-source build ships with no error-tracking config.

## Deployment

The site is published to **GitHub Pages** on the custom domain **vibexp.io**
(`public/CNAME`). `astro build` (`output: 'static'`) pre-renders every route to
static HTML and emits its own `404.html`. Two GitHub Actions workflows:

- **`.github/workflows/ci.yml`** — lint, type-check, test and build on PRs.
- **`.github/workflows/publish.yml`** — builds and deploys to GitHub Pages on
  push to `main`.

The `@vibexp/design-system` package is on the public npm registry, so builds need
no auth token.

## License

[AGPL-3.0-or-later](./LICENSE).
