import { useEffect } from 'react'

import { useScrollTracking } from '@/hooks/useScrollTracking'
import { trackEvent, trackPageView, WEBSITE_EVENTS } from '@/utils/gtm'

/**
 * MPA replacement for the SPA's `usePageTracking` (which fired on react-router
 * location changes). In the Astro multi-page model every navigation is a full
 * page load, so a single pageview fires once per mount; scroll-depth tracking is
 * reused unchanged. Rendered `client:load` from `BaseLayout.astro` and renders
 * nothing.
 */
export function SiteAnalytics() {
  useScrollTracking()

  useEffect(() => {
    trackPageView(window.location.pathname, document.title)

    if (window.location.pathname.startsWith('/features/')) {
      const featureName = window.location.pathname.split('/features/')[1]
      trackEvent(WEBSITE_EVENTS.FEATURE_PAGE_VIEW, {
        feature_name: featureName,
        page_path: window.location.pathname,
      })
    }
  }, [])

  return null
}
