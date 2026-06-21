import { render } from '@testing-library/react'

import { useScrollTracking } from '../../src/hooks/useScrollTracking'
import { trackScrollDepth } from '../../src/utils/gtm'

const mockTrackScrollDepth = trackScrollDepth as jest.Mock

function Probe() {
  useScrollTracking()
  return null
}

// Stub viewport/document geometry so the hook computes a deterministic
// scroll percentage: ((scrollTop + innerHeight) / scrollHeight) * 100.
function setGeometry(
  scrollY: number,
  innerHeight: number,
  scrollHeight: number
) {
  Object.defineProperty(window, 'innerHeight', {
    value: innerHeight,
    configurable: true,
    writable: true,
  })
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    value: scrollHeight,
    configurable: true,
    writable: true,
  })
  Object.defineProperty(window, 'scrollY', {
    value: scrollY,
    configurable: true,
    writable: true,
  })
}

// Fire a scroll event and let the 500ms debounce elapse. The hook clears and
// re-arms a single debounce timer per scroll, so each step MUST dispatch exactly
// one scroll and then advance a full 500ms. Batching multiple dispatches before
// advancing would coalesce them into one debounced read and invalidate the
// per-threshold assertions below — keep it one scroll + full debounce per step.
function scrollAndSettle() {
  window.dispatchEvent(new Event('scroll'))
  jest.advanceTimersByTime(500)
}

describe('useScrollTracking', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('reports each crossed threshold as the page is scrolled deeper', () => {
    // innerHeight=100, scrollHeight=400 → percentage = (scrollY + 100) / 400 * 100
    setGeometry(0, 100, 400) // 25%
    render(<Probe />)
    scrollAndSettle()
    expect(mockTrackScrollDepth).toHaveBeenCalledWith(25)

    setGeometry(100, 100, 400) // 50%
    scrollAndSettle()
    expect(mockTrackScrollDepth).toHaveBeenCalledWith(50)

    setGeometry(200, 100, 400) // 75%
    scrollAndSettle()
    expect(mockTrackScrollDepth).toHaveBeenCalledWith(75)

    setGeometry(300, 100, 400) // 100%
    scrollAndSettle()
    expect(mockTrackScrollDepth).toHaveBeenCalledWith(100)

    expect(mockTrackScrollDepth).toHaveBeenCalledTimes(4)
  })

  it('fires each threshold only once even after repeated scrolls', () => {
    setGeometry(300, 100, 400) // 100% — crosses all four thresholds at once
    render(<Probe />)
    scrollAndSettle()

    expect(mockTrackScrollDepth).toHaveBeenCalledWith(25)
    expect(mockTrackScrollDepth).toHaveBeenCalledWith(50)
    expect(mockTrackScrollDepth).toHaveBeenCalledWith(75)
    expect(mockTrackScrollDepth).toHaveBeenCalledWith(100)
    expect(mockTrackScrollDepth).toHaveBeenCalledTimes(4)

    // Scrolling again must not re-report any already-tracked threshold.
    scrollAndSettle()
    expect(mockTrackScrollDepth).toHaveBeenCalledTimes(4)
  })
})
