import { expect, test } from '@playwright/test'

/**
 * Verification suite for the Astro build (issue #1907, phase 5 / #1917).
 *
 * Two guarantees per route:
 *  1. SEO: the static HTML carries a unique, correct `<title>`, exactly one
 *     `<h1>`, a canonical link, a meta description and OG title — the migration's
 *     core goal (correct per-page metadata without running JS).
 *  2. No horizontal overflow at mobile / tablet / desktop widths. The page root
 *     uses `overflow-x-clip`, which HIDES a scrollbar, so checking `scrollWidth`
 *     alone misses clipped overflow — we also assert no element's right edge
 *     exceeds the viewport (the two-col `grid-cols-1` gotcha from project memory).
 */

type Route = { path: string; title: string }

const ROUTES: Route[] = [
  { path: '/', title: 'VibeXP - The Shared Knowledge Base Your AI Builds On' },
  { path: '/how-it-works', title: 'How VibeXP Works - One Shared AI Brain for Teams | VibeXP' },
  { path: '/features', title: 'Features - One Knowledge Base for Every AI Tool | VibeXP' },
  { path: '/features/prompts', title: 'Prompts — Reusable, composable AI prompt templates | VibeXP' },
  { path: '/features/blueprints', title: 'Blueprints — One library for your AI’s rules | VibeXP' },
  { path: '/features/memory', title: 'Memory — The context your AI writes and reads back | VibeXP' },
  { path: '/features/mcp-integration', title: 'MCP Server Integration - Connect AI Tools | VibeXP' },
  { path: '/features/artifacts', title: 'Artifacts Management - Organize AI Content | VibeXP' },
]

const WIDTHS = [
  { name: 'mobile', width: 375, height: 740 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 900 },
]

/**
 * Largest right edge of any element that is NOT intentionally contained by a
 * horizontal scroll/clip ancestor (e.g. the pricing comparison table's
 * `overflow-x-auto` wrapper, or an illustration in an `overflow-x-clip` band).
 * Those elements are wider by design and don't cause page-level overflow; only
 * elements that escape the viewport on their own are real regressions.
 */
async function maxRightEdge(page: import('@playwright/test').Page): Promise<number> {
  return page.evaluate(() => {
    const contained = (el: Element): boolean => {
      let node: Element | null = el.parentElement
      while (node && node !== document.body) {
        const ox = getComputedStyle(node).overflowX
        if (ox === 'auto' || ox === 'scroll' || ox === 'hidden' || ox === 'clip') {
          return true
        }
        node = node.parentElement
      }
      return false
    }
    let max = 0
    for (const el of Array.from(document.body.querySelectorAll('*'))) {
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) continue
      if (contained(el)) continue
      if (r.right > max) max = r.right
    }
    return Math.ceil(max)
  })
}

for (const route of ROUTES) {
  test(`SEO: ${route.path} has correct unique static head`, async ({ page }) => {
    const res = await page.goto(route.path, { waitUntil: 'domcontentloaded' })
    expect(res?.status(), `${route.path} should return 200`).toBe(200)

    await expect(page).toHaveTitle(route.title)

    const h1Count = await page.locator('h1').count()
    expect(h1Count, `${route.path} should have exactly one <h1>`).toBe(1)

    const canonical = page.locator('link[rel="canonical"]')
    await expect(canonical).toHaveAttribute(
      'href',
      `https://vibexp.io${route.path}`
    )

    await expect(page.locator('meta[name="description"]')).toHaveCount(1)
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      'content',
      route.title
    )
  })

  for (const vp of WIDTHS) {
    test(`layout: ${route.path} has no horizontal overflow @ ${vp.name}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto(route.path, { waitUntil: 'networkidle' })

      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }))
      expect(
        scrollWidth,
        `${route.path} @ ${vp.name}: scrollWidth ${scrollWidth} > clientWidth ${clientWidth}`
      ).toBeLessThanOrEqual(clientWidth + 1)

      // overflow-x-clip hides the scrollbar, so also assert nothing is clipped.
      const right = await maxRightEdge(page)
      expect(
        right,
        `${route.path} @ ${vp.name}: an element extends to ${right}px past the ${vp.width}px viewport`
      ).toBeLessThanOrEqual(vp.width + 1)
    })
  }
}
