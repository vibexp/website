import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  COOKIE_SETTINGS_EVENT,
  denyCookieConsent,
  grantCookieConsent,
  hasCookieConsentDecision,
  revokeCookieConsent,
} from '@/utils/cookieConsent'

/**
 * CookieConsentBanner - A GDPR/CCPA compliant cookie consent banner
 *
 * Features:
 * - Shows on first visit for users who haven't consented
 * - Re-shows after 7 days for users who previously declined
 * - Granted consent is respected indefinitely
 * - Updates Google Consent Mode v2 when users accept cookies
 * - Triggers GTM tags via dataLayer event
 * - Responsive design for mobile and desktop
 * - Accessible with proper ARIA labels
 */
export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false)
  // Tracks whether the banner was re-opened via the "Cookie Settings" control
  // (vs. shown automatically on first visit). Decline then revokes prior consent.
  const openedViaSettings = useRef(false)

  useEffect(() => {
    // Check if user has made a valid consent decision
    if (!hasCookieConsentDecision()) {
      setShowBanner(true)
    }
  }, [])

  useEffect(() => {
    const handleOpenSettings = () => {
      openedViaSettings.current = true
      setShowBanner(true)
    }
    window.addEventListener(COOKIE_SETTINGS_EVENT, handleOpenSettings)
    return () => {
      window.removeEventListener(COOKIE_SETTINGS_EVENT, handleOpenSettings)
    }
  }, [])

  const hideBanner = () => {
    setShowBanner(false)
    openedViaSettings.current = false
  }

  const handleAcceptCookies = () => {
    grantCookieConsent()
    hideBanner()
  }

  const handleDeclineCookies = () => {
    if (openedViaSettings.current) {
      revokeCookieConsent()
    } else {
      denyCookieConsent()
    }
    hideBanner()
  }

  if (!showBanner) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4">
      <Card
        className="mx-auto flex max-w-screen-xl flex-col items-start justify-between gap-4 p-4 shadow-lg sm:flex-row sm:items-center"
        role="dialog"
        aria-labelledby="cookie-consent-title"
        aria-describedby="cookie-consent-description"
      >
        <div className="flex-1">
          <p
            id="cookie-consent-title"
            className="mb-1 text-base font-semibold text-foreground"
          >
            We use cookies
          </p>
          <p
            id="cookie-consent-description"
            className="text-sm leading-relaxed text-muted-foreground"
          >
            We use cookies to improve your experience and analyze site usage. By
            clicking <span className="font-semibold">Accept</span>, you agree to
            our use of cookies.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <Button variant="outline" onClick={handleDeclineCookies}>
            Decline
          </Button>
          <Button onClick={handleAcceptCookies}>Accept</Button>
        </div>
      </Card>
    </div>
  )
}
