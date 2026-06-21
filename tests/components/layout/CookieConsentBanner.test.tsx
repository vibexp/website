import '@testing-library/jest-dom'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { CookieConsentBanner } from '../../../src/components/ui/CookieConsentBanner'
import {
  COOKIE_SETTINGS_EVENT,
  denyCookieConsent,
  grantCookieConsent,
  hasCookieConsentDecision,
  revokeCookieConsent,
} from '../../../src/utils/cookieConsent'

jest.mock('../../../src/utils/cookieConsent', () => ({
  COOKIE_SETTINGS_EVENT: 'vx:open-cookie-settings',
  grantCookieConsent: jest.fn(),
  denyCookieConsent: jest.fn(),
  revokeCookieConsent: jest.fn(),
  hasCookieConsentDecision: jest.fn(),
}))

const mockGrant = grantCookieConsent as jest.MockedFunction<
  typeof grantCookieConsent
>
const mockDeny = denyCookieConsent as jest.MockedFunction<
  typeof denyCookieConsent
>
const mockRevoke = revokeCookieConsent as jest.MockedFunction<
  typeof revokeCookieConsent
>
const mockHasDecision = hasCookieConsentDecision as jest.MockedFunction<
  typeof hasCookieConsentDecision
>

describe('CookieConsentBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders when no consent decision exists', () => {
    mockHasDecision.mockReturnValue(false)
    render(<CookieConsentBanner />)
    expect(screen.getByText('We use cookies')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Accept' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Decline' })).toBeInTheDocument()
  })

  it('does not render when a consent decision already exists', () => {
    mockHasDecision.mockReturnValue(true)
    render(<CookieConsentBanner />)
    expect(screen.queryByText('We use cookies')).not.toBeInTheDocument()
  })

  it('calls grantCookieConsent and hides the banner when Accept is clicked', async () => {
    const user = userEvent.setup()
    mockHasDecision.mockReturnValue(false)
    render(<CookieConsentBanner />)

    await user.click(screen.getByRole('button', { name: 'Accept' }))

    expect(mockGrant).toHaveBeenCalledTimes(1)
    expect(screen.queryByText('We use cookies')).not.toBeInTheDocument()
  })

  it('calls denyCookieConsent and hides the banner when Decline is clicked', async () => {
    const user = userEvent.setup()
    mockHasDecision.mockReturnValue(false)
    render(<CookieConsentBanner />)

    await user.click(screen.getByRole('button', { name: 'Decline' }))

    expect(mockDeny).toHaveBeenCalledTimes(1)
    expect(mockRevoke).not.toHaveBeenCalled()
    expect(screen.queryByText('We use cookies')).not.toBeInTheDocument()
  })

  it('re-opens when the cookie settings event fires even after a prior decision', () => {
    mockHasDecision.mockReturnValue(true)
    render(<CookieConsentBanner />)

    expect(screen.queryByText('We use cookies')).not.toBeInTheDocument()

    act(() => {
      window.dispatchEvent(new CustomEvent(COOKIE_SETTINGS_EVENT))
    })

    expect(screen.getByText('We use cookies')).toBeInTheDocument()
  })

  it('revokes consent when Decline is clicked on a settings-opened banner', async () => {
    const user = userEvent.setup()
    mockHasDecision.mockReturnValue(true)
    render(<CookieConsentBanner />)

    act(() => {
      window.dispatchEvent(new CustomEvent(COOKIE_SETTINGS_EVENT))
    })

    await user.click(screen.getByRole('button', { name: 'Decline' }))

    expect(mockRevoke).toHaveBeenCalledTimes(1)
    expect(mockDeny).not.toHaveBeenCalled()
    expect(screen.queryByText('We use cookies')).not.toBeInTheDocument()
  })
})
