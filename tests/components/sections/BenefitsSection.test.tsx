import '@testing-library/jest-dom'

import { render, screen } from '@testing-library/react'
import { Rocket } from 'lucide-react'

import { BenefitsSection } from '../../../src/components/sections/BenefitsSection'

describe('BenefitsSection', () => {
  const benefits = [
    {
      icon: Rocket,
      title: 'Ship faster',
      points: ['Reusable prompts', 'Version history'],
      popular: true,
    },
    {
      title: 'Stay organized',
      points: ['Tags and folders'],
      codeSnippet: 'vibexp list',
    },
  ]

  it('renders the heading, subheading, and benefit titles', () => {
    render(
      <BenefitsSection
        heading="Why teams choose us"
        subheading="The benefits"
        benefits={benefits}
      />
    )

    expect(
      screen.getByRole('heading', { name: /why teams choose us/i, level: 2 })
    ).toBeInTheDocument()
    expect(screen.getByText('The benefits')).toBeInTheDocument()
    expect(screen.getByText('Ship faster')).toBeInTheDocument()
    expect(screen.getByText('Stay organized')).toBeInTheDocument()
  })

  it('renders all points within each benefit', () => {
    render(<BenefitsSection heading="Heading" benefits={benefits} />)

    expect(screen.getByText('Reusable prompts')).toBeInTheDocument()
    expect(screen.getByText('Version history')).toBeInTheDocument()
    expect(screen.getByText('Tags and folders')).toBeInTheDocument()
  })

  it('renders the default popular badge label and code snippet when present', () => {
    render(<BenefitsSection heading="Heading" benefits={benefits} />)

    expect(screen.getByText('Most Popular')).toBeInTheDocument()
    expect(screen.getByText('vibexp list')).toBeInTheDocument()
  })

  it('makes the scrollable code snippet block keyboard-focusable', () => {
    render(<BenefitsSection heading="Heading" benefits={benefits} />)

    const codeBlock = screen.getByText('vibexp list')
    expect(codeBlock.tagName).toBe('PRE')
    expect(codeBlock).toHaveAttribute('tabindex', '0')
  })

  it('renders a custom popular badge label when popularLabel is provided', () => {
    render(
      <BenefitsSection
        heading="Heading"
        benefits={benefits}
        popularLabel="Best Value"
      />
    )

    expect(screen.getByText('Best Value')).toBeInTheDocument()
    expect(screen.queryByText('Most Popular')).not.toBeInTheDocument()
  })
})
