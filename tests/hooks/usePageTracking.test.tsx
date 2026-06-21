import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { usePageTracking } from '../../src/hooks/usePageTracking'
import { trackEvent, trackPageView, WEBSITE_EVENTS } from '../../src/utils/gtm'

const mockTrackPageView = trackPageView as jest.Mock
const mockTrackEvent = trackEvent as jest.Mock

function Probe() {
  usePageTracking()
  return null
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Probe />
    </MemoryRouter>
  )
}

describe('usePageTracking', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('tracks a page view on a non-feature route without a feature_page_view', () => {
    renderAt('/how-it-works')

    expect(mockTrackPageView).toHaveBeenCalledWith(
      '/how-it-works',
      document.title
    )
    expect(mockTrackEvent).not.toHaveBeenCalledWith(
      WEBSITE_EVENTS.FEATURE_PAGE_VIEW,
      expect.anything()
    )
  })

  it('tracks both a page view and a feature_page_view on a feature route', () => {
    renderAt('/features/prompts')

    expect(mockTrackPageView).toHaveBeenCalledWith(
      '/features/prompts',
      document.title
    )
    expect(mockTrackEvent).toHaveBeenCalledWith(
      WEBSITE_EVENTS.FEATURE_PAGE_VIEW,
      {
        feature_name: 'prompts',
        page_path: '/features/prompts',
      }
    )
  })
})
