import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { Features } from '../../src/pages/Features'
import { trackCTAClick, trackEvent } from '../../src/utils/gtm'

const mockNavigate = jest.fn()

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// gtm.ts uses import.meta.env (Vite), which ts-jest's CommonJS output cannot
// load. Mock the whole module with the functions the page consumes.
jest.mock('../../src/utils/gtm', () => ({
  trackCTAClick: jest.fn(),
  trackEvent: jest.fn(),
}))

const mockTrackCTAClick = trackCTAClick as jest.MockedFunction<
  typeof trackCTAClick
>
const mockTrackEvent = trackEvent as jest.MockedFunction<typeof trackEvent>

function renderFeatures() {
  return render(
    <MemoryRouter>
      <Features />
    </MemoryRouter>
  )
}

describe('Features hub page', () => {
  let windowOpenSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    windowOpenSpy = jest.spyOn(window, 'open').mockImplementation(() => null)
  })

  afterEach(() => {
    windowOpenSpy.mockRestore()
  })

  it('renders the hero heading and all six feature cards', () => {
    renderFeatures()

    expect(
      screen.getByRole('heading', { level: 1, name: /one knowledge base/i })
    ).toBeInTheDocument()

    for (const key of [
      'prompts',
      'blueprints',
      'memory',
      'artifacts',
      'ai-feeds',
      'semantic-search',
    ]) {
      expect(screen.getByTestId(`feature-card-${key}`)).toBeInTheDocument()
    }
  })

  it('fires feature_card_click for a card that links to a detail page', async () => {
    const user = userEvent.setup()
    renderFeatures()

    await user.click(screen.getByTestId('feature-card-prompts'))

    expect(mockTrackEvent).toHaveBeenCalledWith(
      'feature_card_click',
      expect.objectContaining({
        feature: 'prompts',
        destination: '/features/prompts',
      })
    )
  })

  it('fires feature_card_click and navigates home for a card without a detail page', async () => {
    const user = userEvent.setup()
    renderFeatures()

    await user.click(screen.getByTestId('feature-card-ai-feeds'))

    expect(mockTrackEvent).toHaveBeenCalledWith(
      'feature_card_click',
      expect.objectContaining({ feature: 'ai-feeds' })
    )
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('opens the GitHub repo with features_hero UTM params from the hero CTA', async () => {
    const user = userEvent.setup()
    renderFeatures()

    await user.click(screen.getByTestId('features-hero-cta'))

    expect(mockTrackCTAClick).toHaveBeenCalledWith(
      'features_hero',
      'features',
      'github_repo'
    )
    expect(windowOpenSpy).toHaveBeenCalledWith(
      'https://github.com/vibexp/vibexp?utm_source=website&utm_medium=features_hero&utm_campaign=github_repo&utm_content=github_repo',
      '_blank',
      'noopener,noreferrer'
    )
  })
})
