import { Container, Section } from '@/components/layout'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface HowItWorksStep {
  title: string
  description: string
}

export interface HowItWorksSectionProps {
  heading: string
  subheading?: string
  steps: HowItWorksStep[]
  className?: string
  id?: string
}

/**
 * HowItWorksSection lays out sequential steps with auto-numbered badges and a
 * clean vertical connector. Step numbers are derived from order, so pages only
 * supply title + description.
 */
export function HowItWorksSection({
  heading,
  subheading,
  steps,
  className,
  id,
}: HowItWorksSectionProps) {
  return (
    <Section
      id={id}
      className={cn('bg-background', className)}
      data-testid="how-it-works-section"
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

        <ol className="mx-auto mt-12 max-w-3xl space-y-6">
          {steps.map((step, index) => (
            <li key={`${index}-${step.title}`} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground"
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
                {index < steps.length - 1 && (
                  <span
                    className="mt-2 w-px flex-1 bg-border"
                    aria-hidden="true"
                  />
                )}
              </div>
              <Card className="min-w-0 flex-1">
                <CardContent className="p-6">
                  <h3 className="type-card-title">
                    {step.title}
                  </h3>
                  <p className="mt-2 break-words text-muted-foreground">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  )
}
