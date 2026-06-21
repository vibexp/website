import '@testing-library/jest-dom'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { HeroSection } from '../../../src/components/sections/HeroSection'

describe('HeroSection', () => {
  it('renders the heading, eyebrow, and subcopy', () => {
    render(
      <HeroSection
        eyebrow="New"
        heading="Manage your prompts"
        subcopy="The platform for prompt engineering"
      />
    )

    expect(
      screen.getByRole('heading', { name: /manage your prompts/i })
    ).toBeInTheDocument()
    expect(screen.getByText('New')).toBeInTheDocument()
    expect(
      screen.getByText(/platform for prompt engineering/i)
    ).toBeInTheDocument()
  })

  it('invokes the primary action onClick when the button is clicked', async () => {
    const onClick = jest.fn()
    render(
      <HeroSection
        heading="Hello"
        primaryAction={{ label: 'Get Started', onClick }}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: /get started/i }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders an action as a link when href is provided', () => {
    render(
      <HeroSection
        heading="Hello"
        secondaryAction={{ label: 'Docs', href: '/docs' }}
      />
    )

    const link = screen.getByRole('link', { name: /docs/i })
    expect(link).toHaveAttribute('href', '/docs')
  })

  it('renders the reassurance line when provided', () => {
    render(
      <HeroSection
        heading="Hello"
        reassurance="Free and open source • Self-host it"
      />
    )

    expect(
      screen.getByText(/free and open source • self-host it/i)
    ).toBeInTheDocument()
  })

  it('renders the media slot when provided', () => {
    render(
      <HeroSection
        heading="Hello"
        media={<div data-testid="hero-media">media</div>}
      />
    )

    expect(screen.getByTestId('hero-media')).toBeInTheDocument()
  })

  it('forwards the id to the section landmark', () => {
    render(<HeroSection heading="Hello" id="hero" />)
    expect(screen.getByTestId('hero-section')).toHaveAttribute('id', 'hero')
  })
})
