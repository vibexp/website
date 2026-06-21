/**
 * usePageTracking Hook
 *
 * Automatic page view tracking for React Router
 */

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackPageView, WEBSITE_EVENTS, trackEvent } from '../utils/gtm'

export function usePageTracking() {
  const location = useLocation()

  useEffect(() => {
    // Track page view
    trackPageView(location.pathname, document.title)

    // Track feature page views
    if (location.pathname.startsWith('/features/')) {
      const featureName = location.pathname.split('/features/')[1]
      trackEvent(WEBSITE_EVENTS.FEATURE_PAGE_VIEW, {
        feature_name: featureName,
        page_path: location.pathname,
      })
    }
  }, [location])
}
