import '@testing-library/jest-dom'

import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ScreenshotCarousel } from '../../../src/components/sections/ScreenshotCarousel'
import { trackEvent, WEBSITE_EVENTS } from '@/utils/gtm'

const mockTrackEvent = trackEvent as jest.MockedFunction<typeof trackEvent>

const screenshots = [
  {
    src: '/one.png',
    alt: 'First screenshot',
    title: 'Editor',
    description: 'Edit prompts',
  },
  {
    src: '/two.png',
    alt: 'Second screenshot',
    title: 'Library',
    description: 'Browse prompts',
  },
]

describe('ScreenshotCarousel', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the first slide title and description', () => {
    render(<ScreenshotCarousel screenshots={screenshots} />)

    expect(screen.getByText('Editor')).toBeInTheDocument()
    expect(screen.getByText('Edit prompts')).toBeInTheDocument()
  })

  it('advances to the next slide via the next button', async () => {
    render(<ScreenshotCarousel screenshots={screenshots} />)

    await userEvent.click(
      screen.getByRole('button', { name: /next screenshot/i })
    )
    expect(screen.getByText('Library')).toBeInTheDocument()
  })

  it('wraps to the last slide via the previous button', async () => {
    render(<ScreenshotCarousel screenshots={screenshots} />)

    await userEvent.click(
      screen.getByRole('button', { name: /previous screenshot/i })
    )
    expect(screen.getByText('Library')).toBeInTheDocument()
  })

  it('jumps to a slide via its thumbnail', async () => {
    render(<ScreenshotCarousel screenshots={screenshots} />)

    const thumbnails = screen.getAllByTestId('carousel-thumbnail')
    await userEvent.click(thumbnails[1])
    expect(screen.getByText('Library')).toBeInTheDocument()
  })

  it('calls onImageClick when an image slide is clicked', async () => {
    const onImageClick = jest.fn()
    render(
      <ScreenshotCarousel
        screenshots={screenshots}
        onImageClick={onImageClick}
      />
    )

    await userEvent.click(screen.getByTestId('carousel-image-button'))
    expect(onImageClick).toHaveBeenCalledWith('/one.png', 'First screenshot')
  })

  it('fires GTM video events for a video slide', () => {
    const videoScreenshots = [
      {
        src: '/demo.webm',
        alt: 'Demo',
        title: 'Demo',
        description: 'Watch the demo',
      },
    ]
    render(<ScreenshotCarousel screenshots={videoScreenshots} />)

    const video = screen.getByTestId('carousel-video')
    fireEvent.play(video)
    fireEvent.pause(video)
    fireEvent.ended(video)

    expect(mockTrackEvent).toHaveBeenCalledWith(WEBSITE_EVENTS.VIDEO_PLAY, {
      src: '/demo.webm',
      title: 'Demo',
    })
    expect(mockTrackEvent).toHaveBeenCalledWith(WEBSITE_EVENTS.VIDEO_PAUSE, {
      src: '/demo.webm',
      title: 'Demo',
    })
    expect(mockTrackEvent).toHaveBeenCalledWith(WEBSITE_EVENTS.VIDEO_COMPLETE, {
      src: '/demo.webm',
      title: 'Demo',
    })
  })

  it('auto-advances after the interval and pauses on hover', () => {
    jest.useFakeTimers()
    try {
      render(
        <ScreenshotCarousel screenshots={screenshots} autoPlayInterval={1000} />
      )

      expect(screen.getByText('Editor')).toBeInTheDocument()
      act(() => {
        jest.advanceTimersByTime(1000)
      })
      expect(screen.getByText('Library')).toBeInTheDocument()

      const region = screen.getByTestId('screenshot-carousel')
      fireEvent.mouseEnter(region)
      expect(screen.getByText('Paused')).toBeInTheDocument()
      act(() => {
        jest.advanceTimersByTime(2000)
      })
      // Stays on the same slide while paused.
      expect(screen.getByText('Library')).toBeInTheDocument()

      fireEvent.mouseLeave(region)
      expect(screen.queryByText('Paused')).not.toBeInTheDocument()
    } finally {
      jest.useRealTimers()
    }
  })

  it('does not advance autoplay or emit VIDEO_PAUSE while a video slide plays', () => {
    jest.useFakeTimers()
    try {
      const mixed = [
        {
          src: '/demo.webm',
          alt: 'Demo',
          title: 'Demo',
          description: 'Watch the demo',
        },
        ...screenshots,
      ]
      render(
        <ScreenshotCarousel screenshots={mixed} autoPlayInterval={1000} />
      )

      // The video slide is showing.
      expect(screen.getByTestId('carousel-video')).toBeInTheDocument()

      // Autoplay must not advance off the video slide, so the <video> is never
      // remounted mid-playback and no spurious VIDEO_PAUSE is emitted.
      act(() => {
        jest.advanceTimersByTime(5000)
      })

      expect(screen.getByTestId('carousel-video')).toBeInTheDocument()
      expect(mockTrackEvent).not.toHaveBeenCalledWith(
        WEBSITE_EVENTS.VIDEO_PAUSE,
        expect.anything()
      )
    } finally {
      jest.useRealTimers()
    }
  })

  it('fires VIDEO_COMPLETE and advances when the video ends', () => {
    const mixed = [
      {
        src: '/demo.webm',
        alt: 'Demo',
        title: 'Demo',
        description: 'Watch the demo',
      },
      ...screenshots,
    ]
    render(<ScreenshotCarousel screenshots={mixed} />)

    const video = screen.getByTestId('carousel-video')
    fireEvent.ended(video)

    expect(mockTrackEvent).toHaveBeenCalledWith(WEBSITE_EVENTS.VIDEO_COMPLETE, {
      src: '/demo.webm',
      title: 'Demo',
    })
    // Advancing past the video reveals the next (image) slide.
    expect(screen.getByText('Editor')).toBeInTheDocument()
  })

  it('navigates with the left and right arrow keys', () => {
    render(<ScreenshotCarousel screenshots={screenshots} />)

    const region = screen.getByTestId('screenshot-carousel')

    fireEvent.keyDown(region, { key: 'ArrowRight' })
    expect(screen.getByText('Library')).toBeInTheDocument()

    fireEvent.keyDown(region, { key: 'ArrowLeft' })
    expect(screen.getByText('Editor')).toBeInTheDocument()
  })

  it('exposes carousel region semantics', () => {
    render(
      <ScreenshotCarousel screenshots={screenshots} ariaLabel="Product tour" />
    )

    const region = screen.getByRole('region', { name: 'Product tour' })
    expect(region).toHaveAttribute('aria-roledescription', 'carousel')
  })

  it('sets the correct source type for an mp4 video slide', () => {
    const { container } = render(
      <ScreenshotCarousel
        screenshots={[
          {
            src: '/demo.mp4',
            alt: 'Demo',
            title: 'Demo',
            description: 'Watch the demo',
          },
        ]}
      />
    )

    const source = container.querySelector('source')
    expect(source).toHaveAttribute('type', 'video/mp4')
  })

  it('renders nothing when there are no screenshots', () => {
    const { container } = render(<ScreenshotCarousel screenshots={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})
