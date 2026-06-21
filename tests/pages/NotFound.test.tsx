import '@testing-library/jest-dom'

import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { NotFound } from '@/pages/NotFound'

describe('NotFound', () => {
  it('renders the 404 heading and a link back home', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    )

    expect(
      screen.getByRole('heading', { name: /page not found/i, level: 1 })
    ).toBeInTheDocument()

    const homeLink = screen.getByRole('link', { name: /back to home/i })
    expect(homeLink).toBeInTheDocument()
    expect(homeLink).toHaveAttribute('href', '/')
  })
})
