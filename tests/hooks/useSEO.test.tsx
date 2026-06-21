import '@testing-library/jest-dom'

import { render } from '@testing-library/react'

import { useSEO } from '@/hooks/useSEO'
import { defaultSEO, getPageSEO, type SEOProps } from '@/utils/seo'

function SEOProbe({ seo }: { seo: SEOProps }) {
  useSEO(seo)
  return null
}

function metaContent(selector: string): string | null {
  return document.querySelector(selector)?.getAttribute('content') ?? null
}

describe('useSEO DOM wiring', () => {
  beforeEach(() => {
    // jsdom's document.head persists across tests; reset it so each render
    // starts from a clean head and stale tags can't mask a regression.
    document.head.innerHTML = ''
    document.title = ''
  })

  it('writes title, description, keywords for the home page', () => {
    const home = getPageSEO('home')
    render(<SEOProbe seo={home} />)

    expect(document.title).toBe(home.title)
    expect(metaContent('meta[name="description"]')).toBe(home.description)
    expect(metaContent('meta[name="keywords"]')).toBe(home.keywords)
  })

  it('writes the Open Graph tags with og:url = baseUrl + path', () => {
    const home = getPageSEO('home')
    render(<SEOProbe seo={home} />)

    expect(metaContent('meta[property="og:site_name"]')).toBe(
      defaultSEO.siteName
    )
    expect(metaContent('meta[property="og:title"]')).toBe(home.title)
    expect(metaContent('meta[property="og:description"]')).toBe(
      home.description
    )
    expect(metaContent('meta[property="og:type"]')).toBe('website')
    expect(metaContent('meta[property="og:url"]')).toBe(
      `${defaultSEO.baseUrl}${home.path}`
    )
    expect(metaContent('meta[property="og:image"]')).toBe(defaultSEO.ogImage)
    // No explicit dimensions are emitted — scrapers read the real image size.
    expect(document.querySelector('meta[property="og:image:width"]')).toBeNull()
    expect(
      document.querySelector('meta[property="og:image:height"]')
    ).toBeNull()
    expect(metaContent('meta[property="og:image:alt"]')).toBe(home.title)
  })

  it('writes the Twitter Card tags using name= attributes', () => {
    const home = getPageSEO('home')
    render(<SEOProbe seo={home} />)

    expect(metaContent('meta[name="twitter:card"]')).toBe('summary_large_image')
    expect(metaContent('meta[name="twitter:site"]')).toBe(
      defaultSEO.twitterHandle
    )
    expect(metaContent('meta[name="twitter:creator"]')).toBe(
      defaultSEO.twitterHandle
    )
    expect(metaContent('meta[name="twitter:title"]')).toBe(home.title)
    expect(metaContent('meta[name="twitter:description"]')).toBe(
      home.description
    )
    expect(metaContent('meta[name="twitter:image"]')).toBe(
      defaultSEO.twitterImage
    )
    expect(metaContent('meta[name="twitter:image:alt"]')).toBe(home.title)
  })

  it('writes a canonical link to baseUrl + path', () => {
    const home = getPageSEO('home')
    render(<SEOProbe seo={home} />)

    const canonical = document.querySelector('link[rel="canonical"]')
    expect(canonical).not.toBeNull()
    expect(canonical?.getAttribute('href')).toBe(
      `${defaultSEO.baseUrl}${home.path}`
    )
  })

  it('uses the feature page path for canonical and og:url so they differ from home', () => {
    const feature = getPageSEO('promptManagement')
    render(<SEOProbe seo={feature} />)

    const expectedUrl = `${defaultSEO.baseUrl}${feature.path}`
    expect(expectedUrl).not.toBe(`${defaultSEO.baseUrl}/`)
    expect(metaContent('meta[property="og:url"]')).toBe(expectedUrl)
    expect(
      document.querySelector('link[rel="canonical"]')?.getAttribute('href')
    ).toBe(expectedUrl)
    expect(document.title).toBe(feature.title)
    expect(metaContent('meta[name="description"]')).toBe(feature.description)
  })

  it('omits the keywords tag when a page provides no keywords', () => {
    const noKeywords: SEOProps = {
      title: 'A page with no keywords | VibeXP',
      description: 'A page that deliberately provides no keywords.',
      path: '/no-keywords',
      type: 'website',
    }
    expect(noKeywords.keywords).toBeUndefined()

    render(<SEOProbe seo={noKeywords} />)

    expect(document.querySelector('meta[name="keywords"]')).toBeNull()
    expect(document.title).toBe(noKeywords.title)
  })
})
