import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { MobileMenu } from '../../../src/components/layout/MobileMenu'
import {
  trackCTAClick,
  trackEvent,
  trackNavClick,
  WEBSITE_EVENTS,
} from '../../../src/utils/gtm'

const mockNavigate = jest.fn()

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// gtm.ts uses import.meta.env (Vite), which ts-jest's CommonJS output cannot
// load. Mock the whole module with the constants the component consumes.
jest.mock('../../../src/utils/gtm', () => ({
  trackEvent: jest.fn(),
  trackNavClick: jest.fn(),
  trackCTAClick: jest.fn(),
  WEBSITE_EVENTS: {
    MOBILE_MENU_OPEN: 'mobile_menu_open',
    MOBILE_MENU_CLOSE: 'mobile_menu_close',
  },
}))

const mockTrackEvent = trackEvent as jest.MockedFunction<typeof trackEvent>
const mockTrackNavClick = trackNavClick as jest.MockedFunction<
  typeof trackNavClick
>
const mockTrackCTAClick = trackCTAClick as jest.MockedFunction<
  typeof trackCTAClick
>

function renderMobileMenu(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <MobileMenu />
    </MemoryRouter>
  )
}

async function openMenu(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByTestId('mobile-menu-button'))
  return screen.findByTestId('mobile-menu')
}

describe('MobileMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('fires mobile_menu_open when the sheet opens', async () => {
    const user = userEvent.setup()
    renderMobileMenu()

    await openMenu(user)

    expect(mockTrackEvent).toHaveBeenCalledWith(
      WEBSITE_EVENTS.MOBILE_MENU_OPEN,
      { location: 'header' }
    )
  })

  it('renders the nav test ids and CTA labels when open', async () => {
    const user = userEvent.setup()
    renderMobileMenu()

    await openMenu(user)

    expect(screen.getByTestId('mobile-menu-home')).toBeInTheDocument()
    expect(screen.getByTestId('mobile-menu-features')).toBeInTheDocument()
    expect(screen.getByTestId('mobile-menu-how-it-works')).toBeInTheDocument()
    expect(screen.queryByTestId('mobile-menu-pricing')).not.toBeInTheDocument()
    expect(screen.queryByTestId('mobile-menu-contact')).not.toBeInTheDocument()
    expect(screen.getByTestId('mobile-menu-close')).toBeInTheDocument()
    expect(screen.queryByText('Sign In')).not.toBeInTheDocument()
    expect(screen.queryByText('Get Started')).not.toBeInTheDocument()
    expect(screen.getByText('View on GitHub')).toBeInTheDocument()
  })

  it('fires mobile_menu_nav_click and navigates on How it works', async () => {
    const user = userEvent.setup()
    renderMobileMenu()

    await openMenu(user)
    const link = await screen.findByTestId('mobile-menu-how-it-works')
    expect(link).toHaveAttribute('href', '/how-it-works')
    await user.click(link)

    expect(mockTrackNavClick).toHaveBeenCalledWith(
      'How it works',
      '/how-it-works',
      'mobile_menu'
    )
  })

  it('fires mobile_menu_close when the close button is clicked', async () => {
    const user = userEvent.setup()
    renderMobileMenu()

    await openMenu(user)
    await user.click(screen.getByTestId('mobile-menu-close'))

    expect(mockTrackEvent).toHaveBeenCalledWith(
      WEBSITE_EVENTS.MOBILE_MENU_CLOSE,
      { location: 'mobile_menu' }
    )
  })

  it('fires mobile_menu_nav_click and navigates on Home', async () => {
    const user = userEvent.setup()
    renderMobileMenu()

    await openMenu(user)
    const link = await screen.findByTestId('mobile-menu-home')
    expect(link).toHaveAttribute('href', '/')
    await user.click(link)

    expect(mockTrackNavClick).toHaveBeenCalledWith('Home', '/', 'mobile_menu')
  })

  it('fires mobile_menu_nav_click and navigates to the features hub', async () => {
    const user = userEvent.setup()
    renderMobileMenu('/')

    await openMenu(user)
    const link = await screen.findByTestId('mobile-menu-features')
    expect(link).toHaveAttribute('href', '/features')
    await user.click(link)

    expect(mockTrackNavClick).toHaveBeenCalledWith(
      'Features',
      '/features',
      'mobile_menu'
    )
  })

  it('fires cta_click via trackCTAClick and opens the GitHub repo for View on GitHub', async () => {
    const user = userEvent.setup()
    const windowOpenSpy = jest
      .spyOn(window, 'open')
      .mockImplementation(() => null)
    renderMobileMenu()

    await openMenu(user)
    await user.click(screen.getByText('View on GitHub'))

    expect(mockTrackCTAClick).toHaveBeenCalledWith(
      'mobile_menu',
      'github_repo',
      'github_repo'
    )
    expect(windowOpenSpy).toHaveBeenCalledWith(
      'https://github.com/vibexp/vibexp?utm_source=website&utm_medium=mobile_menu&utm_campaign=github_repo&utm_content=github_repo',
      '_blank',
      'noopener,noreferrer'
    )
    windowOpenSpy.mockRestore()
  })
})
