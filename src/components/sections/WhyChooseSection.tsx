import { Check, type LucideIcon } from 'lucide-react'

import { Container, Section } from '@/components/layout'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface WhyChooseItem {
  /** Optional lucide icon; defaults to a check when omitted. */
  icon?: LucideIcon
  text: string
}

export interface WhyChooseTestimonial {
  quote: string
  author: string
  role: string
  company: string
  /** Fallback initials shown when no image is supplied. */
  initials?: string
  image?: string
}

export interface WhyChooseSectionProps {
  heading: string
  subheading?: string
  items: WhyChooseItem[]
  testimonial?: WhyChooseTestimonial
  columnsClassName?: string
  className?: string
  id?: string
}

/**
 * WhyChooseSection presents a checklist of reasons on neutral cards, with an
 * optional supporting testimonial rendered using `Avatar`.
 */
export function WhyChooseSection({
  heading,
  subheading,
  items,
  testimonial,
  columnsClassName = 'md:grid-cols-2',
  className,
  id,
}: WhyChooseSectionProps) {
  return (
    <Section
      id={id}
      className={cn('bg-muted', className)}
      data-testid="why-choose-section"
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

        <div className={cn('mt-12 grid grid-cols-1 gap-4', columnsClassName)}>
          {items.map((item, index) => {
            const Icon = item.icon ?? Check
            return (
              <Card
                key={`${index}-${item.text}`}
                className="transition-colors hover:bg-background"
              >
                <CardContent className="flex items-start gap-3 p-4">
                  <Icon
                    className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <span className="font-medium text-foreground">
                    {item.text}
                  </span>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {testimonial && (
          <Card className="mx-auto mt-8 max-w-3xl">
            <CardContent className="p-8">
              <blockquote className="text-lg italic text-foreground">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <div className="mt-6 flex items-center gap-3">
                <Avatar>
                  {testimonial.image && (
                    <AvatarImage
                      src={testimonial.image}
                      alt={testimonial.author}
                    />
                  )}
                  <AvatarFallback>
                    {testimonial.initials ??
                      testimonial.author.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-foreground">
                    {testimonial.author}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role} &bull; {testimonial.company}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </Container>
    </Section>
  )
}
