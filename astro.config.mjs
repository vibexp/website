import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'astro/config'
import sentry from '@sentry/astro'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Sentry error tracking is opt-in. The open-source build ships with NO Sentry
// config: the integration is only added when an operator provides credentials
// via env (SENTRY_AUTH_TOKEN for build-time source-map upload, or a runtime
// PUBLIC_SENTRY_DSN). Org/project are read from env too, so no private values
// are hard-coded in this public repo.
const sentryEnabled = Boolean(
  process.env.SENTRY_AUTH_TOKEN || process.env.PUBLIC_SENTRY_DSN
)
const integrations = [react(), sitemap()]
if (sentryEnabled) {
  integrations.unshift(
    sentry({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      // Source maps are deleted after upload so they never deploy publicly.
      sourcemaps: { filesToDeleteAfterUpload: ['./dist/**/*.map'] },
    })
  )
}

// `astro build` pre-renders every route to a plain `.html` file in `dist/`,
// published as a static site to GitHub Pages (see .github/workflows/publish.yml).
// No SSR adapter, no Functions.
export default defineConfig({
  site: 'https://vibexp.io',
  // Pre-render every route to a plain `.html` file at build time. Served at the
  // slash-free path by GitHub Pages' pretty-URL resolution (e.g. /features.html
  // is served for /features), keeping URLs aligned with the canonical tags and
  // sitemap.
  output: 'static',
  // Astro routing lives in `astro-src/` so `.astro` pages never collide with the
  // React page COMPONENTS in `src/pages/*.tsx` (which the `.astro` pages import
  // and render as islands). Shared components/hooks/utils/styles import from
  // `src/` via the `@` alias below.
  srcDir: './astro-src',
  outDir: './dist',
  // Emit flat `/<route>.html` served at the slash-free path with no redirect.
  // `directory` format (the default) emits `<route>/index.html`, which makes
  // Cloudflare Pages 308-redirect `/pricing` → `/pricing/` and diverge from the
  // SPA's slash-free URLs and the canonical tags / sitemap. (Lesson from the
  // shaharia-lab/shaharialab.com SPA→Astro migration, PR #34.)
  build: { format: 'file' },
  trailingSlash: 'never',
  integrations,
  vite: {
    // Tailwind v4 is processed through PostCSS (postcss.config.mjs with
    // @tailwindcss/postcss), NOT the @tailwindcss/vite plugin: the retired SPA's
    // direct `vite 8` (rolldown) dep still hoists above Astro's nested vite 7, so
    // @tailwindcss/vite would bind to the wrong vite instance and fail ("Missing
    // field tsconfigPaths"). PostCSS sidesteps the dual-vite clash.
    resolve: {
      alias: {
        // `@ -> ./src` for the shared React components/hooks/utils.
        '@': path.resolve(__dirname, './src'),
        // The page/chrome components still `import 'react-router-dom'`; alias it
        // to the MPA shim so they hydrate as islands with no <Router> ancestor
        // (useNavigate -> window.location, <Link> -> <a href>).
        // See src/lib/astro-router-shim.tsx.
        'react-router-dom': path.resolve(
          __dirname,
          './src/lib/astro-router-shim.tsx'
        ),
      },
    },
    // Pre-bundle react-dom/client so the astro-island hydration runtime gets a
    // proper ESM facade with named exports (mirrors blog/astro.config.mjs).
    optimizeDeps: { include: ['react-dom/client'] },
  },
})
