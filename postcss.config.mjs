// PostCSS config consumed by the Astro build (issue #1907) to process Tailwind
// v4. The SPA's vite.config.ts sets `css.postcss.plugins` inline, which takes
// precedence over this file, so the SPA build is unaffected. Mirrors the SPA's
// single-plugin pipeline (@tailwindcss/postcss) so the generated CSS is identical.
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
