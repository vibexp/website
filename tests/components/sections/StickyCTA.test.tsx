import '@testing-library/jest-dom'

import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { StickyCTA } from '../../../src/components/sections/StickyCTA'
import { trackCTAClick } from '@/utils/gtm'

jest.mock('@/utils/gtm', () => ({
  trackCTAClick: jest.fn(),
}))

const mockTrackCTAClick = trackCTAClick as jest.MockedFunction<
  typeof trackCTAClick
>

/** Sets window.scrollY and fires a scroll event so the bar re-evaluates. */
function scrollTo(y: number) {
  Object.defineProperty(window, 'scrollY', {
    value: y,
    writable: true,
    configurable: true,
  })
  act(() => {
    fireEvent.scroll(window)
  })
}

describe('StickyCTA', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    scrollTo(0)
  })

  it('stays hidden until the reader scrolls past the reveal threshold', () => {
    render(<StickyCTA text="Text" mobileText="Mobile" campaign="sticky" />)

    // Hidden on initial paint (no collision with the sticky header).
    expect(screen.getByTestId('sticky-cta')).toHaveAttribute(
      'aria-hidden',
      'true'
    )

    scrollTo(700)

    expect(screen.getByTestId('sticky-cta')).toHaveAttribute(
      'aria-hidden',
      'false'
    )
  })

  it('renders the desktop and mobile messages and a default button label once revealed', () => {
    render(
      <StickyCTA
        text="Free and open source"
        mobileText="Open source"
        campaign="sticky"
      />
    )

    scrollTo(700)

    expect(screen.getByText('Free and open source')).toBeInTheDocument()
    expect(screen.getByText('Open source')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'View on GitHub' })
    ).toBeInTheDocument()
  })

  it('tracks the CTA and opens the GitHub repo on click', async () => {
    const openSpy = jest.spyOn(window, 'open').mockReturnValue(null)

    render(<StickyCTA text="Text" mobileText="Mobile" campaign="sticky_cta" />)

    scrollTo(700)
    await userEvent.click(
      screen.getByRole('button', { name: 'View on GitHub' })
    )

    expect(mockTrackCTAClick).toHaveBeenCalledWith(
      'sticky_cta',
      'sticky_cta',
      'github_repo'
    )
    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'https://github.com/vibexp/vibexp?utm_source=website&utm_medium=sticky_cta'
      ),
      '_blank',
      'noopener,noreferrer'
    )
    expect(openSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('app.vibexp.io'),
      expect.anything(),
      expect.anything()
    )

    openSpy.mockRestore()
  })
})
