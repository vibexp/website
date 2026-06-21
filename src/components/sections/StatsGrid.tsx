import { type LucideIcon } from 'lucide-react'

import { Container, Section } from '@/components/layout'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface Stat {
  value: string
  label: string
  /** Optional lucide icon component rendered above the value. */
  icon?: LucideIcon
}

export interface StatsGridProps {
  stats: Stat[]
  /** Tailwind grid-cols utility applied at the `md` breakpoint. */
  columnsClassName?: string
  className?: string
  id?: string
}

/**
 * StatsGrid renders a neutral `Card` grid of headline metrics (value + label,
 * optional lucide icon). No gradients or hover-scale — just the shared card.
 */
export function StatsGrid({
  stats,
  columnsClassName = 'md:grid-cols-4',
  className,
  id,
}: StatsGridProps) {
  return (
    <Section
      id={id}
      className={cn('bg-background', className)}
      data-testid="stats-grid"
    >
      <Container>
        <div className={cn('grid grid-cols-1 gap-6', columnsClassName)}>
          {stats.map(stat => {
            const Icon = stat.icon
            return (
              <Card key={stat.label}>
                <CardContent className="flex flex-col items-center p-6 text-center">
                  {Icon && (
                    <Icon
                      className="mb-3 h-8 w-8 text-primary"
                      aria-hidden="true"
                    />
                  )}
                  <div className="type-stat">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </Container>
    </Section>
  )
}
