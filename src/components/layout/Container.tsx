import { type HTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

type ContainerProps = HTMLAttributes<HTMLDivElement>

/**
 * Container centers page content at a consistent max width with responsive
 * horizontal padding. It is the single source of truth for page gutters.
 *
 * Composition contract (read before building pages on this shell):
 * - `Section` owns vertical rhythm and may be full-bleed (carry a background);
 *   `Container` owns horizontal max-width + gutters and sits *inside* a Section.
 *   Canonical pattern: `<Section className="bg-muted"><Container>…</Container></Section>`.
 * - Do NOT hand-roll `mx-auto max-w-* px-*` wrappers on page blocks — use
 *   `Container` so every page shares one max width. A block that genuinely needs
 *   a narrower column (prose, a centered card) adds `max-w-prose`/`max-w-*` on an
 *   inner element, not a second page-level container.
 * - Put smooth-scroll anchor ids (e.g. `id="features"`) on the outer `Section`
 *   (it forwards `...props`), not on `Container`.
 */
export function Container({ className, ...props }: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-screen-xl px-4 md:px-6 lg:px-8',
        className
      )}
      {...props}
    />
  )
}
