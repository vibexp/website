import { type ReactNode, useEffect, useState } from 'react'

import { Container } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { openGitHubRepo } from '@/utils/github'
import { trackCTAClick } from '@/utils/gtm'

export interface StickyCTAProps {
  /** Message shown on larger screens. */
  text: string
  /** Shorter message shown on small screens. */
  mobileText: string
  /** Optional leading icon (lucide element). */
  icon?: ReactNode
  /** Label for the action button. */
  buttonText?: string
  /** Campaign slug for UTM params and the `cta_click` GTM event. */
  campaign: string
  /**
   * Surface name used for the `cta_click` event `location` and `utm_medium`.
   * Defaults to `sticky_cta`; pass a page-specific value (e.g.
   * `features_sticky`) to attribute the click to a particular page surface.
   */
  location?: string
  /** Scroll offset (px) past which the bar slides in. Defaults to 600. */
  revealAfter?: number
  className?: string
}

/**
 * StickyCTA is a minimal promo bar pinned to the top of the viewport. It stays
 * hidden on initial paint and slides in once the reader has scrolled past
 * `revealAfter` (default 600px), so it never collides with the sticky `Header`
 * on first load. Clicking the button opens the public GitHub repo with
 * surface-scoped UTM params and fires `cta_click`.
 *
 * NOTE: Unlike the page-band sections, this is a fixed-position bar, not a
 * scroll anchor — it deliberately does not compose `Section` or expose an `id`
 * anchor; it overlays the page from the top of the viewport instead.
 */
export function StickyCTA({
  text,
  mobileText,
  icon,
  buttonText = 'View on GitHub',
  campaign,
  location = 'sticky_cta',
  revealAfter = 600,
  className,
}: StickyCTAProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > revealAfter)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [revealAfter])

  const handleClick = () => {
    trackCTAClick(location, campaign, 'github_repo')
    openGitHubRepo(location)
  }

  return (
    <div
      className={cn(
        'fixed inset-x-0 top-0 z-50 border-b border-border bg-background transition-transform duration-300 ease-out',
        visible ? 'translate-y-0' : 'pointer-events-none -translate-y-full',
        className
      )}
      data-testid="sticky-cta"
      aria-hidden={!visible}
    >
      <Container className="flex items-center justify-between py-3">
        <div className="flex items-center gap-3">
          {icon}
          <span className="hidden font-medium text-foreground sm:inline">
            {text}
          </span>
          <span className="font-medium text-foreground sm:hidden">
            {mobileText}
          </span>
        </div>
        <Button size="sm" onClick={handleClick}>
          {buttonText}
        </Button>
      </Container>
    </div>
  )
}
