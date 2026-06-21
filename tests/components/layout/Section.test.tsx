import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

import { Section } from '../../../src/components/layout/Section'

describe('Section', () => {
  it('renders its children inside a section element', () => {
    const { container } = render(
      <Section>
        <span>content</span>
      </Section>
    )
    expect(screen.getByText('content')).toBeInTheDocument()
    expect(container.querySelector('section')).toBeInTheDocument()
  })

  it('applies the default vertical rhythm classes', () => {
    render(<Section data-testid="section">child</Section>)
    const section = screen.getByTestId('section')
    expect(section).toHaveClass('py-12', 'md:py-16', 'lg:py-20')
  })

  it('merges a custom className with the defaults', () => {
    render(
      <Section data-testid="section" className="bg-muted">
        child
      </Section>
    )
    const section = screen.getByTestId('section')
    expect(section).toHaveClass('bg-muted')
    expect(section).toHaveClass('py-12')
  })
})
