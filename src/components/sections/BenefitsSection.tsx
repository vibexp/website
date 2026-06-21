import { Check, type LucideIcon } from 'lucide-react'

import { Container, Section } from '@/components/layout'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface Benefit {
  /** Optional lucide icon component rendered beside the title. */
  icon?: LucideIcon
  title: string
  points: string[]
  /** Optional code sample rendered in a monospace block. */
  codeSnippet?: string
  /** Highlights the card with a badge (see `popularLabel`). */
  popular?: boolean
}

export interface BenefitsSectionProps {
  heading: string
  subheading?: string
  benefits: Benefit[]
  columnsClassName?: string
  /** Text shown in the badge on `popular` cards. */
  popularLabel?: string
  className?: string
  id?: string
}

/**
 * BenefitsSection renders a `Card` grid where each card lists its points with
 * lucide check icons. Hover is a subtle background shift — no glow or scale.
 */
export function BenefitsSection({
  heading,
  subheading,
  benefits,
  columnsClassName = 'md:grid-cols-3',
  popularLabel = 'Most Popular',
  className,
  id,
}: BenefitsSectionProps) {
  return (
    <Section
      id={id}
      className={cn('bg-background', className)}
      data-testid="benefits-section"
    >
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="type-section">
            {heading}
          </h2>
          {subheading && (
            <p className={cn('mt-4', 'type-lead')}>
              {subheading}
            </p>
          )}
        </div>

        <div className={cn('mt-12 grid grid-cols-1 gap-6', columnsClassName)}>
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <Card
                key={`${index}-${benefit.title}`}
                className={cn(
                  'relative transition-colors hover:bg-muted/50',
                  benefit.popular && 'border-primary'
                )}
              >
                {benefit.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    {popularLabel}
                  </Badge>
                )}
                <CardHeader className="flex-row items-center gap-3 space-y-0">
                  {Icon && (
                    <Icon
                      className="h-6 w-6 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                  )}
                  <CardTitle className="text-xl">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {benefit.points.map((point, pointIndex) => (
                      <li
                        key={`${pointIndex}-${point}`}
                        className="flex items-start gap-2"
                      >
                        <Check
                          className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                          aria-hidden="true"
                        />
                        <span className="text-muted-foreground">{point}</span>
                      </li>
                    ))}
                  </ul>
                  {benefit.codeSnippet && (
                    <pre
                      tabIndex={0}
                      className="overflow-x-auto rounded-md bg-muted p-4 font-mono text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      {benefit.codeSnippet}
                    </pre>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </Container>
    </Section>
  )
}
