// Google Analytics gtag function type definitions
declare global {
  interface Window {
    dataLayer: Record<string, unknown>[]
    gtag: (...args: unknown[]) => void
  }
}

// No hard-coded container ID: the open-source repo ships with analytics OFF.
// Set VITE_GTM_ID at build time to enable Google Tag Manager for a deployment;
// left unset, GTM_ID is empty and every GTM loader below is skipped.
export const GTM_ID = import.meta.env.VITE_GTM_ID || ''
export const GTM_ENABLED = import.meta.env.VITE_GTM_ENABLED !== 'false'

export const initializeGTM = () => {
  if (!GTM_ENABLED || !GTM_ID) {
    if (import.meta.env.DEV) {
      console.log('GTM is disabled or GTM_ID is not provided')
    }
    return
  }

  // dataLayer is already initialized in index.html with consent defaults
  // Just push the GTM start event
  window.dataLayer.push({
    'gtm.start': new Date().getTime(),
    event: 'gtm.js',
  })

  // Add GTM script
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`

  const firstScript = document.getElementsByTagName('script')[0]
  if (firstScript && firstScript.parentNode) {
    firstScript.parentNode.insertBefore(script, firstScript)
  } else {
    document.head.appendChild(script)
  }

  if (import.meta.env.DEV) {
    console.log(`GTM initialized with ID: ${GTM_ID}`)
  }
}

export const addGTMNoScript = () => {
  if (!GTM_ENABLED || !GTM_ID) {
    return
  }

  // Add noscript fallback
  const noscript = document.createElement('noscript')
  const iframe = document.createElement('iframe')
  iframe.src = `https://www.googletagmanager.com/ns.html?id=${GTM_ID}`
  iframe.height = '0'
  iframe.width = '0'
  iframe.style.display = 'none'
  iframe.style.visibility = 'hidden'

  noscript.appendChild(iframe)
  document.body.insertBefore(noscript, document.body.firstChild)
}

// Synchronous re-entrancy guard for trackEvent itself. The deferred push has its
// own guard inside deferGuardedDataLayerPush (see gtmEvents.ts); this one prevents
// a trackEvent → trackEvent loop within the same synchronous tick.
let _isTrackingEvent = false

// Canonical analytics event names and the dependency-free guarded-push helper live
// in a module without `import.meta` so they can be unit-tested without the Vite env
// shim. WEBSITE_EVENTS is re-exported for back-compat: existing
// `import { WEBSITE_EVENTS } from '@/utils/gtm'` consumers are unchanged.
import { deferGuardedDataLayerPush, WEBSITE_EVENTS } from './gtmEvents'

export { WEBSITE_EVENTS }
export type { WebsiteEventName } from './gtmEvents'

// Helper function to track custom events
export const trackEvent = (
  eventName: string,
  parameters?: Record<string, unknown>
) => {
  // Short-circuit synchronous re-entrant trackEvent calls within the same tick.
  if (_isTrackingEvent) return

  if (!GTM_ENABLED || !window.dataLayer) {
    if (import.meta.env.DEV) {
      console.log('[GTM] Event would be tracked:', eventName, parameters)
    }
    return
  }

  _isTrackingEvent = true
  try {
    const prefixedEventName = `vx_website_${eventName}`

    // Destructure to exclude 'event' from parameters so it can't overwrite the prefixed name.
    const { event: _event, ...otherParameters } = parameters || {}

    const eventData = {
      event: prefixedEventName,
      timestamp: Date.now(),
      page_path: window.location.pathname,
      page_url: window.location.href,
      ...otherParameters,
    }

    // Defer the push to the next macrotask. This breaks the caller's synchronous
    // call stack, which is what actually prevents the iOS Chrome/WebKit stack
    // overflow (RangeError) — the push never extends a stack GTM is unwinding.
    // The guard inside the deferred callback only covers app-level re-entry; see
    // deferGuardedDataLayerPush in gtmEvents.ts for the full rationale.
    deferGuardedDataLayerPush(eventData)

    if (import.meta.env.DEV) {
      console.log('[GTM] Event tracked:', eventData)
    }
  } finally {
    _isTrackingEvent = false
  }
}

// Helper function to track page views
export const trackPageView = (path?: string, title?: string) => {
  trackEvent(WEBSITE_EVENTS.PAGE_VIEW, {
    page_path: path || window.location.pathname,
    page_title: title || document.title,
    page_url: window.location.href,
  })
}

// Helper function to track CTA clicks
export const trackCTAClick = (
  location: string,
  campaign: string,
  content: string
) => {
  trackEvent(WEBSITE_EVENTS.CTA_CLICK, {
    location,
    campaign,
    content,
    button_text: content,
  })
}

// Helper function to track navigation clicks
export const trackNavClick = (
  linkText: string,
  destination: string,
  location: 'header' | 'footer' | 'mobile_menu'
) => {
  const eventName =
    location === 'mobile_menu'
      ? WEBSITE_EVENTS.MOBILE_MENU_NAV_CLICK
      : location === 'footer'
        ? WEBSITE_EVENTS.FOOTER_LINK_CLICK
        : WEBSITE_EVENTS.NAV_CLICK

  trackEvent(eventName, {
    link_text: linkText,
    destination,
    location,
  })
}

// Helper function to track external link clicks
export const trackExternalLink = (
  url: string,
  linkText: string,
  location: string
) => {
  trackEvent(WEBSITE_EVENTS.EXTERNAL_LINK_CLICK, {
    external_url: url,
    link_text: linkText,
    location,
  })
}

// Helper function to track scroll depth
export const trackScrollDepth = (percentage: number, section?: string) => {
  trackEvent(WEBSITE_EVENTS.SCROLL_DEPTH, {
    scroll_percentage: percentage,
    section,
  })
}
