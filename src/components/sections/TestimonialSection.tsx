import { useEffect, useState } from 'react'

import { Container, Section } from '@/components/layout'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface Testimonial {
  id: number | string
  name: string
  title: string
  /** Secondary line under the name (e.g. email or company). */
  email?: string
  content: string
  avatar?: string
}

export interface TestimonialSectionProps {
  heading: string
  subheading?: string
  testimonials: Testimonial[]
  /** Auto-rotation interval in ms. Rotation is skipped with a single item. */
  autoRotateInterval?: number
  className?: string
  id?: string
}

/**
 * TestimonialSection rotates through customer quotes on a neutral `Card`, with
 * an `Avatar` for the author. Heading and subheading come from props — nothing
 * is hardcoded.
 */
export function TestimonialSection({
  heading,
  subheading,
  testimonials,
  autoRotateInterval = 5000,
  className,
  id,
}: TestimonialSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (testimonials.length <= 1 || isPaused) return

    const interval = setInterval(() => {
      setCurrentIndex(prevIndex =>
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      )
    }, autoRotateInterval)

    return () => clearInterval(interval)
  }, [testimonials.length, autoRotateInterval, isPaused])

  if (testimonials.length === 0) return null

  const current = testimonials[currentIndex]
  // Up to two initials (first + last word) so the fallback reads as a real
  // monogram (e.g. "Emma Chen" -> "EC") and every card stays visually balanced
  // whether or not it has a photo.
  const initials = current.name
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0))
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <Section
      id={id}
      className={cn('bg-muted', className)}
      data-testid="testimonial-section"
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

        <div
          className="mx-auto mt-12 max-w-3xl"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          data-testid="testimonial-carousel"
        >
          <Card>
            <CardContent className="p-8 text-center">
              <blockquote className="text-xl leading-relaxed text-foreground">
                &ldquo;{current.content}&rdquo;
              </blockquote>
              <div className="mt-6 flex flex-col items-center">
                <Avatar className="h-16 w-16">
                  {current.avatar ? (
                    <>
                      <AvatarImage src={current.avatar} alt={current.name} />
                      <AvatarFallback className="bg-primary/10 text-xl font-semibold text-primary">
                        {initials}
                      </AvatarFallback>
                    </>
                  ) : (
                    // Radix Avatar.Fallback only renders once an Image child
                    // reports its load status; with no photo at all it would stay
                    // empty. Render an initials monogram directly so every card
                    // stays visually balanced.
                    <span
                      aria-label={current.name}
                      className="flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary"
                    >
                      {initials}
                    </span>
                  )}
                </Avatar>
                <div className="mt-4 font-semibold text-foreground">
                  {current.name}
                </div>
                <div className="text-muted-foreground">{current.title}</div>
                {current.email && (
                  <div className="text-sm text-muted-foreground">
                    {current.email}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {testimonials.length > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              {testimonials.map((testimonial, index) => (
                <button
                  key={testimonial.id}
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    'h-3 w-3 rounded-full transition-colors',
                    index === currentIndex
                      ? 'bg-primary'
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  )}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </Container>
    </Section>
  )
}
