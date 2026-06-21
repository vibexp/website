import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { Footer } from '../../../src/components/layout/Footer'
import {
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
  WEBSITE_EVENTS: {
    SOCIAL_LINK_CLICK: 'social_link_click',
  },
}))

const mockTrackEvent = trackEvent as jest.MockedFunction<typeof trackEvent>
const mockTrackNavClick = trackNavClick as jest.MockedFunction<
  typeof trackNavClick
>

function renderFooter(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Footer />
    </MemoryRouter>
  )
}

describe('Footer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the footer and brand blurb', () => {
    renderFooter()
    expect(screen.getByTestId('site-footer')).toBeInTheDocument()
    expect(
      screen.getByText(/The shared knowledge base your AI builds on/i)
    ).toBeInTheDocument()
  })

  it('renders the product and project sections', () => {
    renderFooter()
    expect(screen.getByText('Product')).toBeInTheDocument()
    expect(screen.getByText('Project')).toBeInTheDocument()
    expect(screen.queryByText('Privacy Policy')).not.toBeInTheDocument()
    expect(screen.queryByText('Terms & Conditions')).not.toBeInTheDocument()
    expect(screen.queryByText('Contact Us')).not.toBeInTheDocument()
  })

  it('does not render Pricing or Contact links', () => {
    renderFooter()
    expect(
      screen.queryByRole('link', { name: 'Pricing' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Contact' })
    ).not.toBeInTheDocument()
  })

  it('preserves the external Shaharia Lab brand link', () => {
    renderFooter()
    const brandLink = screen.getByRole('link', { name: 'Shaharia Lab OÜ' })
    expect(brandLink).toHaveAttribute(
      'href',
      'https://shaharialab.com?utm_source=vibexp.io&utm_medium=footer&utm_campaign=brand_link'
    )
    expect(brandLink).toHaveAttribute('target', '_blank')
    expect(brandLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders a crawlable Home link and tracks the click', async () => {
    const user = userEvent.setup()
    renderFooter()

    const link = screen.getByRole('link', { name: 'Home' })
    expect(link).toHaveAttribute('href', '/')
    await user.click(link)

    expect(mockTrackNavClick).toHaveBeenCalledWith('Home', '/', 'footer')
  })

  it('renders crawlable feature-page links (incl. the mcp-integration orphan)', () => {
    renderFooter('/')

    expect(screen.getByRole('link', { name: 'Features' })).toHaveAttribute(
      'href',
      '/features'
    )
    expect(screen.getByRole('link', { name: 'Prompts' })).toHaveAttribute(
      'href',
      '/features/prompts'
    )
    expect(
      screen.getByRole('link', { name: 'MCP Integration' })
    ).toHaveAttribute('href', '/features/mcp-integration')
  })

  it('renders the Cookie Settings control in the Project section', () => {
    renderFooter()
    expect(
      screen.getByRole('button', { name: 'Cookie Settings' })
    ).toBeInTheDocument()
  })

  it('dispatches the cookie settings event and tracks the click', async () => {
    const user = userEvent.setup()
    const listener = jest.fn()
    window.addEventListener('vx:open-cookie-settings', listener)
    renderFooter()

    await user.click(screen.getByRole('button', { name: 'Cookie Settings' }))

    expect(mockTrackNavClick).toHaveBeenCalledWith(
      'Cookie Settings',
      '#cookie-settings',
      'footer'
    )
    expect(listener).toHaveBeenCalledTimes(1)
    window.removeEventListener('vx:open-cookie-settings', listener)
  })

  it('fires social_link_click for the GitHub social icon', async () => {
    const user = userEvent.setup()
    renderFooter()

    // Two links share the accessible name "GitHub": the icon-only social link
    // (brand column) and the text link (Project column). The icon link has no
    // visible text content.
    const githubIcon = screen
      .getAllByRole('link', { name: 'GitHub' })
      .find(link => link.textContent === '')
    expect(githubIcon).toBeDefined()
    await user.click(githubIcon as HTMLElement)

    expect(mockTrackEvent).toHaveBeenCalledWith(
      WEBSITE_EVENTS.SOCIAL_LINK_CLICK,
      {
        platform: 'github',
        url: 'https://github.com/vibexp/vibexp',
        location: 'footer',
      }
    )
  })

  it('fires social_link_click for the X social icon', async () => {
    const user = userEvent.setup()
    renderFooter()

    const xIcon = screen.getByRole('link', { name: 'X (Twitter)' })
    await user.click(xIcon)

    expect(mockTrackEvent).toHaveBeenCalledWith(
      WEBSITE_EVENTS.SOCIAL_LINK_CLICK,
      {
        platform: 'x',
        url: 'https://x.com/vibexp_io',
        location: 'footer',
      }
    )
  })
})
