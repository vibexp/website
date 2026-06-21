import { Container, Section } from '@/components/layout'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'

export interface FAQ {
  q: string
  a: string
}

export interface FAQSectionProps {
  heading: string
  subheading?: string
  faqs: FAQ[]
  className?: string
  id?: string
}

/**
 * FAQSection renders questions and answers as a shadcn `Accordion` (single,
 * collapsible) rather than native `<details>`.
 */
export function FAQSection({
  heading,
  subheading,
  faqs,
  className,
  id,
}: FAQSectionProps) {
  return (
    <Section
      id={id}
      className={cn('bg-background', className)}
      data-testid="faq-section"
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

        <Accordion
          type="single"
          collapsible
          className="mx-auto mt-12 max-w-3xl"
          data-testid="faq-accordion"
        >
          {faqs.map((faq, index) => (
            <AccordionItem key={`${index}-${faq.q}`} value={`faq-${index}`}>
              <AccordionTrigger className="text-base font-semibold text-foreground">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </Section>
  )
}
