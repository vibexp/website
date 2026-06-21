/**
 * JSON-LD structured data for the marketing site, baked into the static `<head>`
 * of every page (see `astro-src/components/SEO.astro`). Ported verbatim from the
 * SPA's `index.html` so search/AI crawlers read the exact same SoftwareApplication
 * + Organization graph they do today — now without executing JavaScript.
 */

export const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'VibeXP',
  applicationCategory: 'ProductivityApplication',
  operatingSystem: 'Web, Windows, macOS, Linux',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
    description: 'Forever free plan available',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '400',
  },
  description:
    'AI productivity platform for managing prompts, memories, and artifacts with MCP integration',
  url: 'https://vibexp.io',
  screenshot: 'https://vibexp.io/screenshot.png',
  featureList: [
    'Prompt Template Management',
    'Memory Management',
    'Artifact Storage',
    'MCP Server Integration',
    'API Access',
    'Version Control',
  ],
}

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'VibeXP',
  url: 'https://vibexp.io',
  logo: 'https://vibexp.io/logo.png',
  sameAs: ['https://x.com/vibexp_io', 'https://github.com/shaharia-lab/vibexp'],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Support',
    email: 'support@vibexp.io',
  },
}

/**
 * Escape a JSON-LD payload for safe inlining: `<`, `>`, `&` and the
 * line/paragraph separators U+2028/U+2029 become `\uXXXX` forms so the payload
 * can never break out of the `<script>` element or derail an HTML/JS parser.
 */
export function escapeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}
