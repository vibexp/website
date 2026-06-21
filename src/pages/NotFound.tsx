import { Link } from 'react-router-dom'

import { Container, Section } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { useSEO } from '@/hooks/useSEO'
import { cn } from '@/lib/utils'

/**
 * Catch-all 404 page for unknown routes. Uses the shared design system
 * (Section/Container layout, typography variants, xl Button) so it stays on
 * brand, and routes back home via the client-side router.
 */
export const NotFound = () => {
  useSEO({
    title: 'Page Not Found | VibeXP',
    description:
      "The page you're looking for doesn't exist or may have moved.",
    path: '/404',
  })

  return (
    <Section>
      <Container>
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            404
          </p>
          <h1 className={cn('mt-4', 'type-display')}>
            Page not found
          </h1>
          <p className={cn('mt-6', 'type-lead')}>
            The page you&rsquo;re looking for doesn&rsquo;t exist or may have
            moved. Let&rsquo;s get you back on track.
          </p>
          <div className="mt-8">
            <Button asChild size="xl">
              <Link to="/">Back to home</Link>
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  )
}
