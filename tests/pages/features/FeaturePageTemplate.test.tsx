import '@testing-library/jest-dom'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { FeaturePageTemplate } from '@/pages/features/FeaturePageTemplate'
import type { FeaturePageConfig } from '@/pages/features/types'
import { trackEvent } from '@/utils/gtm'

const mockTrackEvent = trackEvent as jest.MockedFunction<typeof trackEvent>

const baseConfig: FeaturePageConfig = {
  seoKey: 'mcpIntegration',
  hero: {
    eyebrow: 'Eyebrow copy',
    heading: 'Feature Heading',
    subcopy: 'Feature subcopy',
  },
  cta: {
    heading: 'Ready to go?',
    description: 'Final pitch',
    campaign: 'mcp_integration',
  },
}

describe('FeaturePageTemplate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the hero heading and the CTA band', () => {
    render(<FeaturePageTemplate config={baseConfig} />)

    expect(
      screen.getByRole('heading', { name: /feature heading/i, level: 1 })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /ready to go\?/i, level: 2 })
    ).toBeInTheDocument()
  })

  it('skips optional bands when their config is absent', () => {
    render(<FeaturePageTemplate config={baseConfig} />)

    expect(screen.queryByTestId('stats-grid')).not.toBeInTheDocument()
    expect(screen.queryByTestId('screenshot-carousel')).not.toBeInTheDocument()
    expect(screen.queryByTestId('faq-section')).not.toBeInTheDocument()
    expect(screen.queryByTestId('sticky-cta')).not.toBeInTheDocument()
  })

  it('renders the sticky CTA when configured', () => {
    render(
      <FeaturePageTemplate
        config={{
          ...baseConfig,
          stickyCta: {
            text: 'Never Lose Context Again',
            mobileText: 'Start Now',
            campaign: 'mcp_integration',
          },
        }}
      />
    )

    expect(screen.getByTestId('sticky-cta')).toBeInTheDocument()
    expect(screen.getByText('Never Lose Context Again')).toBeInTheDocument()
  })

  it('fires the feature_page_cta event and opens the GitHub repo on the primary CTA', async () => {
    const openSpy = jest.spyOn(window, 'open').mockReturnValue(null)

    render(<FeaturePageTemplate config={baseConfig} />)

    const buttons = screen.getAllByRole('button', { name: /view on github/i })
    await userEvent.click(buttons[0])

    expect(mockTrackEvent).toHaveBeenCalledWith('cta_click', {
      location: 'feature_page_cta',
      campaign: 'mcp_integration',
      content: 'github_repo',
    })
    expect(openSpy).toHaveBeenCalledWith(
      'https://github.com/vibexp/vibexp?utm_source=website&utm_medium=feature_page_cta&utm_campaign=github_repo&utm_content=github_repo',
      '_blank',
      'noopener,noreferrer'
    )

    openSpy.mockRestore()
  })

  it('tracks image_zoom_click with the src basename when a screenshot is opened', async () => {
    render(
      <FeaturePageTemplate
        config={{
          ...baseConfig,
          screenshots: {
            heading: 'See it in action',
            screenshots: [
              {
                src: '/images/screenshots/prompt_management_homepage.png',
                alt: 'Prompt Management Dashboard',
                title: 'Dashboard View',
                description: 'Manage all your prompts',
              },
            ],
          },
        }}
      />
    )

    await userEvent.click(screen.getByTestId('carousel-image-button'))

    expect(mockTrackEvent).toHaveBeenCalledWith('image_zoom_click', {
      image_name: 'prompt_management_homepage',
      image_alt: 'Prompt Management Dashboard',
      location: 'screenshot_carousel',
    })
  })

  it('renders extra sections after the why-choose band', () => {
    render(
      <FeaturePageTemplate
        config={{
          ...baseConfig,
          extraSections: [
            {
              kind: 'feature',
              props: {
                heading: 'Supported Integrations',
                features: [
                  {
                    title: 'Claude Code CLI',
                    description: 'Currently Supported',
                  },
                ],
              },
            },
          ],
        }}
      />
    )

    expect(
      screen.getByRole('heading', { name: /supported integrations/i })
    ).toBeInTheDocument()
    expect(screen.getByText('Currently Supported')).toBeInTheDocument()
  })
})
