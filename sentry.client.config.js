import * as Sentry from '@sentry/astro'

/**
 * Client-side Sentry init for the marketing website's Astro build (static
 * Cloudflare Pages output — no SSR, so there is no server/edge config).
 * Auto-loaded by the `@sentry/astro` integration (see `astro.config.mjs`) and
 * injected into every page.
 *
 * The DSN is read from `PUBLIC_SENTRY_DSN`, injected at build time by the deploy
 * workflow. With NO hardcoded fallback: when the var is absent — local dev,
 * `astro build` without config, PR CI — Sentry stays uninitialized so we never
 * ship dev/test noise to the shared org error quota. The DSN value itself is a
 * public, client-side token by design.
 *
 * Mirrors the filters of the SPA's `src/utils/sentry.ts` (errors only; benign
 * extension/network/ResizeObserver noise dropped). Reports under the same
 * `vibexp-website` Sentry project as the SPA build.
 */
const dsn = import.meta.env.PUBLIC_SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,
    environment: import.meta.env.PROD ? 'production' : import.meta.env.MODE,

    // Errors only: no performance tracing and no session replay. Keeps the
    // shared free Sentry quota safe and the client bundle small.
    tracesSampleRate: 0,

    ignoreErrors: [
      'top.GLOBALS',
      'chrome-extension://',
      'moz-extension://',
      'NetworkError',
      'Failed to fetch',
      'Network request failed',
      'ResizeObserver loop',
    ],
  })
}
