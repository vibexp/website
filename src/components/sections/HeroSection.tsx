import { type VariantProps } from 'class-variance-authority'
import { type ReactNode } from 'react'

import { Container, Section } from '@/components/layout'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/** A single call-to-action rendered as a `Button` in the hero. */
export interface HeroAction {
  label: string
  /** Click handler — use this to fire analytics and navigate. */
  onClick?: () => void
  /** Render the action as a link instead of a button-styled `<a>`. */
  href?: string
  variant?: VariantProps<typeof buttonVariants>['variant']
  /** Test id forwarded to the rendered button/link for E2E selectors. */
  testId?: string
}

export interface HeroSectionProps {
  /** Small eyebrow label rendered above the heading. */
  eyebrow?: string
  heading: string
  /** Supporting copy beneath the heading; accepts inline markup (e.g. `<code>`). */
  subcopy?: ReactNode
  primaryAction?: HeroAction
  secondaryAction?: HeroAction
  /** Small reassurance line rendered beneath the actions (e.g. "Free and open source"). */
  reassurance?: string
  /** Optional media (image, video, screenshot carousel) rendered beside the copy. */
  media?: ReactNode
  className?: string
  /** Anchor id forwarded to the outer `Section`. */
  id?: string
}

function renderAction(
  action: HeroAction,
  fallbackVariant: HeroAction['variant']
) {
  const variant = action.variant ?? fallbackVariant
  if (action.href) {
    return (
      <Button asChild size="xl" variant={variant}>
        <a
          href={action.href}
          onClick={action.onClick}
          data-testid={action.testId}
        >
          {action.label}
        </a>
      </Button>
    )
  }
  return (
    <Button
      size="xl"
      variant={variant}
      onClick={action.onClick}
      data-testid={action.testId}
    >
      {action.label}
    </Button>
  )
}

/**
 * HeroSection is the restrained marketing hero shared across pages: an optional
 * eyebrow, heading, subcopy, up to two actions, and an optional media slot. It
 * intentionally avoids gradient orbs, blur, and glassmorphism — copy is supplied
 * by the page, never hardcoded here.
 */
export function HeroSection({
  eyebrow,
  heading,
  subcopy,
  primaryAction,
  secondaryAction,
  reassurance,
  media,
  className,
  id,
}: HeroSectionProps) {
  return (
    <Section
      id={id}
      className={cn('bg-background', className)}
      data-testid="hero-section"
    >
      <Container>
        <div
          className={cn(
            'grid items-center gap-10',
            media ? 'lg:grid-cols-2' : 'mx-auto max-w-3xl text-center'
          )}
        >
          <div>
            {eyebrow && (
              <Badge variant="secondary" className="mb-4">
                {eyebrow}
              </Badge>
            )}
            <h1 className="type-display">
              {heading}
            </h1>
            {subcopy && (
              <p
                className={cn('mt-6', 'type-lead')}
              >
                {subcopy}
              </p>
            )}
            {(primaryAction || secondaryAction) && (
              <div
                className={cn(
                  'mt-8 flex flex-col gap-3 sm:flex-row',
                  !media && 'sm:justify-center'
                )}
              >
                {primaryAction && renderAction(primaryAction, 'default')}
                {secondaryAction && renderAction(secondaryAction, 'outline')}
              </div>
            )}
            {reassurance && (
              <p
                className={cn(
                  'mt-4 text-sm font-medium text-foreground',
                  !media && 'text-center'
                )}
              >
                {reassurance}
              </p>
            )}
          </div>
          {media && <div className="w-full">{media}</div>}
        </div>
      </Container>
    </Section>
  )
}
