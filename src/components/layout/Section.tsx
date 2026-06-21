import { type HTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

type SectionProps = HTMLAttributes<HTMLElement>

/**
 * Section provides consistent vertical rhythm between page blocks. It renders a
 * semantic `<section>` so pages compose cleanly without bespoke spacing.
 *
 * Section is the *outermost* block wrapper and may be full-bleed (carry a
 * background); wrap its content in a `Container` for max-width + gutters — see
 * the composition contract in `Container.tsx`. Inner sub-blocks use plain
 * spacing utilities rather than nesting another `Section` (avoids nested
 * `<section>` landmarks).
 */
export function Section({ className, ...props }: SectionProps) {
  return (
    <section className={cn('py-12 md:py-16 lg:py-20', className)} {...props} />
  )
}
