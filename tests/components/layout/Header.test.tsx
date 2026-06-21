import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { Header } from '../../../src/components/layout/Header'
import { trackCTAClick, trackNavClick } from '../../../src/utils/gtm'

const mockNavigate = jest.fn()

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

jest.mock('../../../src/utils/gtm', () => ({
  trackNavClick: jest.fn(),
  trackCTAClick: jest.fn(),
}))

const mockTrackNavClick = trackNavClick as jest.MockedFunction<
  typeof trackNavClick
>
const mockTrackCTAClick = trackCTAClick as jest.MockedFunction<
  typeof trackCTAClick
>

function renderHeader(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Header />
    </MemoryRouter>
  )
}

describe('Header', () => {
  let windowOpenSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    windowOpenSpy = jest.spyOn(window, 'open').mockImplementation(() => null)
  })

  afterEach(() => {
    windowOpenSpy.mockRestore()
  })

  it('renders the header, logo and nav test ids', () => {
    renderHeader()
    expect(screen.getByTestId('site-header')).toBeInTheDocument()
    expect(screen.getByTestId('logo-link')).toBeInTheDocument()
    expect(screen.getByTestId('header-nav')).toBeInTheDocument()
    expect(screen.getByTestId('nav-home')).toBeInTheDocument()
    expect(screen.getByTestId('nav-features')).toBeInTheDocument()
    expect(screen.getByTestId('nav-how-it-works')).toBeInTheDocument()
    expect(screen.queryByTestId('nav-pricing')).not.toBeInTheDocument()
    expect(screen.queryByTestId('nav-contact')).not.toBeInTheDocument()
  })

  it('fires nav_click via trackNavClick and navigates on How it works click', async () => {
    const user = userEvent.setup()
    renderHeader()

    await user.click(screen.getByTestId('nav-how-it-works'))

    expect(mockTrackNavClick).toHaveBeenCalledWith(
      'How it works',
      '/how-it-works',
      'header'
    )
    expect(screen.getByTestId('nav-how-it-works')).toHaveAttribute(
      'href',
      '/how-it-works'
    )
  })

  it('fires nav_click via trackNavClick and navigates on Home click', async () => {
    const user = userEvent.setup()
    renderHeader()

    await user.click(screen.getByTestId('nav-home'))

    expect(mockTrackNavClick).toHaveBeenCalledWith('Home', '/', 'header')
    expect(screen.getByTestId('nav-home')).toHaveAttribute('href', '/')
  })

  it('does not render Pricing or Contact nav links', () => {
    renderHeader()

    expect(
      screen.queryByRole('link', { name: 'Pricing' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Contact' })
    ).not.toBeInTheDocument()
  })

  it('fires cta_click via trackCTAClick and opens the GitHub repo on View on GitHub', async () => {
    const user = userEvent.setup()
    renderHeader()

    await user.click(screen.getByRole('button', { name: 'View on GitHub' }))

    expect(mockTrackCTAClick).toHaveBeenCalledWith(
      'header',
      'github_repo',
      'github_repo'
    )
    expect(windowOpenSpy).toHaveBeenCalledWith(
      'https://github.com/vibexp/vibexp?utm_source=website&utm_medium=header&utm_campaign=github_repo&utm_content=github_repo',
      '_blank',
      'noopener,noreferrer'
    )
  })

  it('navigates to the features hub on the home page', async () => {
    const user = userEvent.setup()
    renderHeader('/')

    await user.click(screen.getByTestId('nav-features'))

    expect(mockTrackNavClick).toHaveBeenCalledWith(
      'Features',
      '/features',
      'header'
    )
    expect(screen.getByTestId('nav-features')).toHaveAttribute(
      'href',
      '/features'
    )
  })

  it('navigates to the features hub from another page', async () => {
    const user = userEvent.setup()
    renderHeader('/how-it-works')

    await user.click(screen.getByTestId('nav-features'))

    expect(mockTrackNavClick).toHaveBeenCalledWith(
      'Features',
      '/features',
      'header'
    )
    expect(screen.getByTestId('nav-features')).toHaveAttribute(
      'href',
      '/features'
    )
  })

  it('renders the mobile menu trigger button', () => {
    renderHeader()
    expect(screen.getByTestId('mobile-menu-button')).toBeInTheDocument()
  })
})
