/**
 * Canonical analytics event names for the marketing website.
 *
 * Kept deliberately dependency-free (no `import.meta`, no other imports) so the
 * analytics name contract can be unit-tested under Jest's ts-jest CommonJS
 * transform without the Vite env shim, and so `tests/setup.ts` can source the
 * real names instead of hand-duplicating them (preventing mock drift).
 */
declare global {
  interface Window {
    dataLayer: Record<string, unknown>[]
    gtag: (...args: unknown[]) => void
  }
}

export const WEBSITE_EVENTS = {
  // Page views
  PAGE_VIEW: 'page_view',

  // CTA Button clicks
  CTA_CLICK: 'cta_click',

  // Navigation
  NAV_CLICK: 'nav_click',
  FOOTER_LINK_CLICK: 'footer_link_click',
  MOBILE_MENU_OPEN: 'mobile_menu_open',
  MOBILE_MENU_CLOSE: 'mobile_menu_close',
  MOBILE_MENU_NAV_CLICK: 'mobile_menu_nav_click',

  // Feature pages
  FEATURE_PAGE_VIEW: 'feature_page_view',

  // Contact form
  CONTACT_FORM_SUBMIT: 'contact_form_submit',
  CONTACT_FORM_SUCCESS: 'contact_form_success',
  CONTACT_FORM_ERROR: 'contact_form_error',

  // Engagement
  SCROLL_DEPTH: 'scroll_depth',
  VIDEO_PLAY: 'video_play',
  VIDEO_PAUSE: 'video_pause',
  VIDEO_COMPLETE: 'video_complete',

  // Social/External links
  EXTERNAL_LINK_CLICK: 'external_link_click',
  SOCIAL_LINK_CLICK: 'social_link_click',
} as const

export type WebsiteEventName =
  (typeof WEBSITE_EVENTS)[keyof typeof WEBSITE_EVENTS]

// App-level re-entrancy guard for the helper below. It prevents
// `guardedDataLayerPush` from re-entering *itself* synchronously (an app code
// path that calls it again from within its own push). It does NOT intercept
// GTM's internal recursion: GTM overrides `window.dataLayer.push` and re-enters
// through that raw array method, which never routes back through this helper.
// The real protection against the iOS Chrome/WebKit stack overflow is the
// `setTimeout` deferral in `deferGuardedDataLayerPush` (see below).
let isPushingEvent = false

/**
 * Push to `dataLayer` behind an app-level re-entrancy guard.
 *
 * The guard is set before `dataLayer.push` and cleared after, so a synchronous
 * call back into `guardedDataLayerPush` (app-level re-entry) is short-circuited.
 * It cannot suppress GTM's own re-entrant `window.dataLayer.push` calls, which
 * bypass this helper — that path is handled by deferral, not this guard.
 */
export function guardedDataLayerPush(eventData: Record<string, unknown>): void {
  if (isPushingEvent) return
  isPushingEvent = true
  try {
    window.dataLayer.push(eventData)
  } finally {
    isPushingEvent = false
  }
}

/**
 * Defer a guarded `dataLayer.push` to the next macrotask.
 *
 * This is the primary mitigation for the iOS Chrome/WebKit stack overflow: the
 * `setTimeout` breaks the *caller's* synchronous call stack so the push never
 * extends a stack GTM is already unwinding. Each call runs in its own macrotask,
 * so independent events are never dropped (the guard is reset between them).
 * Kept dependency-free (no `import.meta`) so it can be unit-tested under Jest
 * without the Vite env shim.
 */
export function deferGuardedDataLayerPush(
  eventData: Record<string, unknown>
): void {
  setTimeout(() => {
    guardedDataLayerPush(eventData)
  }, 0)
}
