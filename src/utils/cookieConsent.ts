// Import global type declarations from gtm.ts
declare global {
  interface Window {
    dataLayer: Record<string, unknown>[]
    gtag: (...args: unknown[]) => void
  }
}

const CONSENT_STORAGE_KEY = 'cookieConsent'
const CONSENT_EXPIRY_DAYS = 7 // Re-show banner after 7 days for declined consent

/**
 * DOM event dispatched to re-open the cookie consent banner from anywhere in the
 * app (e.g. the footer "Cookie Settings" control), without coupling those
 * call-sites to the banner component's internal state.
 */
export const COOKIE_SETTINGS_EVENT = 'vx:open-cookie-settings'

/**
 * Re-open the cookie consent banner regardless of any prior consent decision.
 *
 * Satisfies GDPR Article 7(3): withdrawing consent must be as easy as giving it.
 * The banner listens for {@link COOKIE_SETTINGS_EVENT} and shows itself again.
 */
export function openCookieSettings(): void {
  window.dispatchEvent(new CustomEvent(COOKIE_SETTINGS_EVENT))
}

// Re-entrancy guard: prevents infinite recursion between gtag/dataLayer.push and GTM
// on iOS Chrome (WebKit) where GTM consent updates can fire re-entrant dataLayer.push calls
let _isUpdatingConsent = false

interface ConsentData {
  status: 'granted' | 'denied'
  timestamp: number
}

/**
 * Grant cookie consent and update Google Consent Mode v2
 * This should be called when users explicitly grant consent (e.g., by accepting the banner)
 *
 * Granted consent is stored indefinitely without expiry.
 */
export function grantCookieConsent(): void {
  // Save consent to localStorage with timestamp
  const consentData: ConsentData = {
    status: 'granted',
    timestamp: Date.now(),
  }
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consentData))
  } catch (e) {
    if (!(e instanceof DOMException)) throw e
    // localStorage is not accessible (private browsing, cookies disabled, SecurityError)
    // Consent will apply for this session only
  }

  // Use setTimeout to break potential recursive call stack on iOS Chrome + GTM.
  // On iOS WebKit, GTM processing a consent update can fire a re-entrant dataLayer.push
  // which causes: gtag → dataLayer.push → GTM fires re-entrant push → stack overflow.
  // The re-entrancy guard (_isUpdatingConsent) provides a second layer of protection.
  setTimeout(() => {
    if (_isUpdatingConsent) return
    _isUpdatingConsent = true
    try {
      // Update Google Consent Mode v2 (Unlocks GA4/Google Ads)
      // gtag is defined in index.html before any other scripts load
      window.gtag('consent', 'update', {
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
        analytics_storage: 'granted',
      })

      // Push Custom Event (Triggers 3rd party tags in GTM)
      window.dataLayer.push({
        event: 'cookie_consent_update',
        consent_status: 'granted',
      })
    } finally {
      _isUpdatingConsent = false
    }
  }, 0)
}

/**
 * Deny cookie consent
 * This should be called when users explicitly decline cookies
 *
 * Declined consent expires after 7 days, after which the banner will be shown again.
 */
export function denyCookieConsent(): void {
  // Save decline to localStorage with timestamp
  const consentData: ConsentData = {
    status: 'denied',
    timestamp: Date.now(),
  }
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consentData))
  } catch (e) {
    if (!(e instanceof DOMException)) throw e
    // localStorage is not accessible (private browsing, cookies disabled, SecurityError)
    // Consent will apply for this session only
  }

  // Use setTimeout to break potential recursive call stack on iOS Chrome + GTM.
  // See grantCookieConsent for full explanation.
  setTimeout(() => {
    if (_isUpdatingConsent) return
    _isUpdatingConsent = true
    try {
      // Explicitly set consent to denied (reinforces the default state)
      // This ensures Google knows the user explicitly declined
      window.gtag('consent', 'update', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied',
      })

      // Push decline event to dataLayer
      window.dataLayer.push({
        event: 'cookie_consent_update',
        consent_status: 'denied',
      })
    } finally {
      _isUpdatingConsent = false
    }
  }, 0)
}

/**
 * Revoke a previously granted (or denied) cookie consent decision.
 *
 * Satisfies GDPR Article 7(3): users must be able to withdraw consent as easily
 * as they gave it. Clears the stored decision so {@link hasCookieConsentDecision}
 * returns false (the banner re-appears on the next page load) and fires a Consent
 * Mode v2 `update` with all signals denied so Google stops using prior consent.
 */
export function revokeCookieConsent(): void {
  // Clear the stored decision so the banner re-shows on the next page load.
  try {
    localStorage.removeItem(CONSENT_STORAGE_KEY)
  } catch (e) {
    if (!(e instanceof DOMException)) throw e
    // localStorage is not accessible (private browsing, cookies disabled, SecurityError)
    // There is no stored decision to clear in that case.
  }

  // Use setTimeout to break potential recursive call stack on iOS Chrome + GTM.
  // See grantCookieConsent for full explanation.
  setTimeout(() => {
    if (_isUpdatingConsent) return
    _isUpdatingConsent = true
    try {
      window.gtag('consent', 'update', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied',
      })

      // Push revoke event to dataLayer so GTM can react to the withdrawal.
      // 'revoked' is intentionally distinct from denyCookieConsent's 'denied'
      // so GTM tags can tell a fresh decline from a withdrawal of prior consent;
      // the gtag consent 'update' above is what actually enforces compliance.
      window.dataLayer.push({
        event: 'cookie_consent_update',
        consent_status: 'revoked',
      })
    } finally {
      _isUpdatingConsent = false
    }
  }, 0)
}

/**
 * Check if user has made a consent decision that is still valid
 * - Granted consent: valid indefinitely
 * - Declined consent: expires after 7 days
 *
 * @returns true if user has a valid consent decision, false otherwise
 */
export function hasCookieConsentDecision(): boolean {
  let consentStr: string | null
  try {
    consentStr = localStorage.getItem(CONSENT_STORAGE_KEY)
  } catch (e) {
    if (!(e instanceof DOMException)) throw e
    // localStorage is not accessible (private browsing, cookies disabled, SecurityError)
    // Return false to show the consent banner
    return false
  }
  if (!consentStr) return false

  try {
    const consentData: ConsentData = JSON.parse(consentStr)

    // If consent was granted, it's valid indefinitely
    if (consentData.status === 'granted') {
      return true
    }

    // If consent was denied, check if it has expired (7 days)
    if (consentData.status === 'denied') {
      const daysSinceDecision =
        (Date.now() - consentData.timestamp) / (1000 * 60 * 60 * 24)
      return daysSinceDecision < CONSENT_EXPIRY_DAYS
    }

    return false
  } catch {
    // Fallback for legacy format (plain string) - only valid for known values
    return consentStr === 'granted' || consentStr === 'denied'
  }
}
