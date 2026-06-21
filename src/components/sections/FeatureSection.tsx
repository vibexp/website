import { type LucideIcon } from 'lucide-react'

import { Container, Section } from '@/components/layout'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface FeatureItem {
  /** Optional lucide icon component rendered in the card header. */
  icon?: LucideIcon
  title: string
  description: string
}

export interface FeatureSectionProps {
  heading: string
  /** Lead paragraph(s) shown below the heading. */
  description?: string | string[]
  features: FeatureItem[]
  /** Tailwind grid-cols utility applied at the `md` breakpoint. */
  columnsClassName?: string
  className?: string
  id?: string
}

/**
 * FeatureSection (a.k.a. "What is") pairs a heading and lead description with a
 * neutral `Card` grid describing the product's features.
 */
export function FeatureSection({
  heading,
  description,
  features,
  columnsClassName = 'md:grid-cols-3',
  className,
  id,
}: FeatureSectionProps) {
  const paragraphs = Array.isArray(description)
    ? description
    : description
      ? [description]
      : []

  return (
    <Section
      id={id}
      className={cn('bg-background', className)}
      data-testid="feature-section"
    >
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="type-section">
            {heading}
          </h2>
          {paragraphs.map((paragraph, index) => (
            <p
              key={`${index}-${paragraph}`}
              className={cn('mt-4', 'type-lead')}
            >
              {paragraph}
            </p>
          ))}
        </div>

        {features.length > 0 && (
          <div className={cn('mt-12 grid grid-cols-1 gap-6', columnsClassName)}>
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card
                  key={`${index}-${feature.title}`}
                  className="transition-colors hover:bg-muted/50"
                >
                  <CardHeader>
                    {Icon && (
                      <Icon
                        className="mb-2 h-6 w-6 text-primary"
                        aria-hidden="true"
                      />
                    )}
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        )}
      </Container>
    </Section>
  )
}
