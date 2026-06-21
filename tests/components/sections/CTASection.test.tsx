import '@testing-library/jest-dom'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { CTASection } from '../../../src/components/sections/CTASection'
import { trackCTAClick } from '@/utils/gtm'

jest.mock('@/utils/gtm', () => ({
  trackCTAClick: jest.fn(),
}))

const mockTrackCTAClick = trackCTAClick as jest.MockedFunction<
  typeof trackCTAClick
>

describe('CTASection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the heading and description', () => {
    render(<CTASection heading="Ready to start?" description="Join today" />)

    expect(
      screen.getByRole('heading', { name: /ready to start/i, level: 2 })
    ).toBeInTheDocument()
    expect(screen.getByText('Join today')).toBeInTheDocument()
  })

  it('opens the GitHub repo and tracks the CTA on the default primary action', async () => {
    const openSpy = jest.spyOn(window, 'open').mockReturnValue(null)

    render(<CTASection heading="Heading" campaign="home_cta" />)

    await userEvent.click(
      screen.getByRole('button', { name: /view on github/i })
    )

    expect(mockTrackCTAClick).toHaveBeenCalledWith(
      'cta_section',
      'home_cta',
      'github_repo'
    )
    expect(openSpy).toHaveBeenCalledWith(
      'https://github.com/vibexp/vibexp?utm_source=website&utm_medium=cta_section&utm_campaign=github_repo&utm_content=github_repo',
      '_blank',
      'noopener,noreferrer'
    )

    openSpy.mockRestore()
  })

  it('uses a custom primary action when provided', async () => {
    const onClick = jest.fn()
    render(
      <CTASection
        heading="Heading"
        primaryAction={{ label: 'Talk to sales', onClick }}
      />
    )

    await userEvent.click(
      screen.getByRole('button', { name: /talk to sales/i })
    )
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(mockTrackCTAClick).not.toHaveBeenCalled()
  })

  it('renders a secondary action as a link', () => {
    render(
      <CTASection
        heading="Heading"
        secondaryAction={{ label: 'Learn more', href: '/features' }}
      />
    )

    expect(screen.getByRole('link', { name: /learn more/i })).toHaveAttribute(
      'href',
      '/features'
    )
  })
})
