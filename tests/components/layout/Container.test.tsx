import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

import { Container } from '../../../src/components/layout/Container'

describe('Container', () => {
  it('renders its children', () => {
    render(
      <Container>
        <span>content</span>
      </Container>
    )
    expect(screen.getByText('content')).toBeInTheDocument()
  })

  it('applies the default centered max-width classes', () => {
    render(<Container data-testid="container">child</Container>)
    const container = screen.getByTestId('container')
    expect(container).toHaveClass('mx-auto', 'w-full', 'max-w-screen-xl')
  })

  it('merges a custom className with the defaults', () => {
    render(
      <Container data-testid="container" className="bg-red-500">
        child
      </Container>
    )
    const container = screen.getByTestId('container')
    expect(container).toHaveClass('bg-red-500')
    expect(container).toHaveClass('max-w-screen-xl')
  })
})
