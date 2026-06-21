import '@testing-library/jest-dom'

import { render, screen } from '@testing-library/react'
import { Users } from 'lucide-react'

import { StatsGrid } from '../../../src/components/sections/StatsGrid'

describe('StatsGrid', () => {
  const stats = [
    { value: '10k+', label: 'Users', icon: Users },
    { value: '99.9%', label: 'Uptime' },
  ]

  it('renders each stat value and label', () => {
    render(<StatsGrid stats={stats} />)

    expect(screen.getByText('10k+')).toBeInTheDocument()
    expect(screen.getByText('Users')).toBeInTheDocument()
    expect(screen.getByText('99.9%')).toBeInTheDocument()
    expect(screen.getByText('Uptime')).toBeInTheDocument()
  })

  it('applies a custom columns className', () => {
    render(<StatsGrid stats={stats} columnsClassName="md:grid-cols-2" />)

    const grid = screen.getByTestId('stats-grid').querySelector('div > div')
    expect(grid).toHaveClass('md:grid-cols-2')
  })

  it('renders the icon when supplied and omits it otherwise', () => {
    const { container } = render(<StatsGrid stats={stats} />)
    // Only the first stat has an icon, so exactly one svg should render.
    expect(container.querySelectorAll('svg')).toHaveLength(1)
  })
})
