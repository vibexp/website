import { type VariantProps } from 'class-variance-authority'

import { Container, Section } from '@/components/layout'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { openGitHubRepo } from '@/utils/github'
import { trackCTAClick } from '@/utils/gtm'

/** A call-to-action button in the CTA band. */
export interface CTAAction {
  label: string
  onClick?: () => void
  href?: string
  variant?: VariantProps<typeof buttonVariants>['variant']
}

export interface CTASectionProps {
  heading: string
  description?: string
  /**
   * Campaign slug used for the default primary action's `cta_click` GTM event.
   * Only needed when `primaryAction` is omitted.
   */
  campaign?: string
  /** Label for the default primary action. */
  primaryButtonText?: string
  /** Overrides the default "open the GitHub repo" primary action entirely. */
  primaryAction?: CTAAction
  secondaryAction?: CTAAction
  className?: string
  id?: string
}

function renderAction(
  action: CTAAction,
  fallbackVariant: CTAAction['variant']
) {
  const variant = action.variant ?? fallbackVariant
  if (action.href) {
    return (
      <Button asChild size="lg" variant={variant}>
        <a href={action.href} onClick={action.onClick}>
          {action.label}
        </a>
      </Button>
    )
  }
  return (
    <Button size="lg" variant={variant} onClick={action.onClick}>
      {action.label}
    </Button>
  )
}

/**
 * CTASection is a neutral call-to-action band. When no `primaryAction` is
 * supplied it falls back to opening the public GitHub repo with surface-scoped
 * UTM params and firing the `cta_click` GTM event.
 */
export function CTASection({
  heading,
  description,
  campaign = 'website',
  primaryButtonText = 'View on GitHub',
  primaryAction,
  secondaryAction,
  className,
  id,
}: CTASectionProps) {
  const openGitHub = () => {
    trackCTAClick('cta_section', campaign, 'github_repo')
    openGitHubRepo('cta_section')
  }

  const primary: CTAAction = primaryAction ?? {
    label: primaryButtonText,
    onClick: openGitHub,
  }

  return (
    <Section
      id={id}
      className={cn('bg-muted', className)}
      data-testid="cta-section"
    >
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="type-section">
            {heading}
          </h2>
          {description && (
            <p className={cn('mt-4', 'type-lead')}>
              {description}
            </p>
          )}
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            {renderAction(primary, 'default')}
            {secondaryAction && renderAction(secondaryAction, 'outline')}
          </div>
        </div>
      </Container>
    </Section>
  )
}
