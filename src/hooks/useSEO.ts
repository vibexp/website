import { useEffect } from 'react'
import type { SEOProps } from '../utils/seo'
import { defaultSEO } from '../utils/seo'

export function useSEO({
  title,
  description,
  path,
  keywords,
  type = 'website',
  image,
  twitterImage,
}: SEOProps) {
  useEffect(() => {
    const fullUrl = `${defaultSEO.baseUrl}${path}`
    const fullTitle = path === '/' ? title : `${title}`

    // Update title
    document.title = fullTitle

    // Update or create meta tags
    const updateMetaTag = (
      name: string,
      content: string,
      property?: boolean
    ) => {
      const attribute = property ? 'property' : 'name'
      let element = document.querySelector(`meta[${attribute}="${name}"]`)

      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attribute, name)
        document.head.appendChild(element)
      }

      element.setAttribute('content', content)
    }

    // Basic meta tags
    updateMetaTag('description', description)
    if (keywords) updateMetaTag('keywords', keywords)

    // Open Graph tags
    updateMetaTag('og:site_name', defaultSEO.siteName, true)
    updateMetaTag('og:title', fullTitle, true)
    updateMetaTag('og:description', description, true)
    updateMetaTag('og:type', type, true)
    updateMetaTag('og:url', fullUrl, true)
    updateMetaTag('og:image', image ?? defaultSEO.ogImage, true)
    // No og:image:width/height — scrapers read the asset's real dimensions.
    updateMetaTag('og:image:alt', fullTitle, true)

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image')
    updateMetaTag('twitter:site', defaultSEO.twitterHandle)
    updateMetaTag('twitter:creator', defaultSEO.twitterHandle)
    updateMetaTag('twitter:title', fullTitle)
    updateMetaTag('twitter:description', description)
    updateMetaTag('twitter:image', twitterImage ?? defaultSEO.twitterImage)
    updateMetaTag('twitter:image:alt', fullTitle)

    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', fullUrl)
  }, [title, description, path, keywords, type, image, twitterImage])
}
