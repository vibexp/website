import { ChevronLeft, ChevronRight, Pause, type LucideIcon } from 'lucide-react'
import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { trackEvent, WEBSITE_EVENTS } from '@/utils/gtm'

export interface Screenshot {
  src: string
  alt: string
  title: string
  description: string
  /** Optional lucide icon component rendered beside the title. */
  icon?: LucideIcon
}

export interface ScreenshotCarouselProps {
  screenshots: Screenshot[]
  /** Auto-advance interval in ms. Paused on hover. */
  autoPlayInterval?: number
  /** Called when a (non-video) screenshot is clicked, to open a lightbox. */
  onImageClick?: (src: string, alt: string) => void
  className?: string
  id?: string
  /** Accessible name for the carousel region. */
  ariaLabel?: string
}

function isVideo(src: string) {
  return src.endsWith('.webm') || src.endsWith('.mp4')
}

function videoType(src: string) {
  return src.endsWith('.mp4') ? 'video/mp4' : 'video/webm'
}

/**
 * ScreenshotCarousel cycles through product screenshots and videos with
 * prev/next controls, a thumbnail strip, and hover-to-pause autoplay. Video
 * slides fire `video_play` / `video_pause` / `video_complete` GTM events.
 *
 * NOTE: Unlike the page-band sections, this is an embeddable media component:
 * it does not compose `Section`+`id` and instead forwards `id` to its root
 * `<div>` so a page can anchor to or slot the carousel inside its own band.
 */
export function ScreenshotCarousel({
  screenshots,
  autoPlayInterval = 4000,
  onImageClick,
  className,
  id,
  ariaLabel,
}: ScreenshotCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const goToNext = useCallback(() => {
    setCurrentIndex(prevIndex =>
      prevIndex === screenshots.length - 1 ? 0 : prevIndex + 1
    )
  }, [screenshots.length])

  const goToPrevious = useCallback(() => {
    setCurrentIndex(prevIndex =>
      prevIndex === 0 ? screenshots.length - 1 : prevIndex - 1
    )
  }, [screenshots.length])

  // A video slide drives its own pacing: autoplay is suspended while it plays
  // (so the slide isn't remounted mid-playback, which would emit a spurious
  // `video_pause` and pre-empt `video_complete`) and resumes only once the
  // video's `ended` event advances past it.
  const currentIsVideo =
    screenshots.length > 0 && isVideo(screenshots[currentIndex].src)

  useEffect(() => {
    if (isPaused || currentIsVideo || screenshots.length <= 1) return

    intervalRef.current = setInterval(goToNext, autoPlayInterval)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPaused, currentIsVideo, goToNext, autoPlayInterval, screenshots.length])

  if (screenshots.length === 0) return null

  const current = screenshots[currentIndex]
  const Icon = current.icon

  const trackVideo = (event: string) => {
    trackEvent(event, { src: current.src, title: current.title })
  }

  const handleVideoEnded = () => {
    trackVideo(WEBSITE_EVENTS.VIDEO_COMPLETE)
    if (screenshots.length > 1) goToNext()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (screenshots.length <= 1) return
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      goToNext()
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      goToPrevious()
    }
  }

  return (
    <div
      id={id}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      className={cn('relative', className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onKeyDown={handleKeyDown}
      data-testid="screenshot-carousel"
    >
      <Card className="overflow-hidden">
        <div className="relative bg-muted" key={currentIndex}>
          {isVideo(current.src) ? (
            <video
              autoPlay
              muted
              playsInline
              aria-label={current.title}
              className="h-auto w-full"
              onPlay={() => trackVideo(WEBSITE_EVENTS.VIDEO_PLAY)}
              onPause={() => trackVideo(WEBSITE_EVENTS.VIDEO_PAUSE)}
              onEnded={handleVideoEnded}
              data-testid="carousel-video"
            >
              <source src={current.src} type={videoType(current.src)} />
            </video>
          ) : (
            <button
              type="button"
              onClick={() => onImageClick?.(current.src, current.alt)}
              className="block w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`Enlarge ${current.alt}`}
              data-testid="carousel-image-button"
            >
              <img
                src={current.src}
                alt={current.alt}
                loading="lazy"
                className="h-auto w-full"
              />
            </button>
          )}

          {isPaused && screenshots.length > 1 && (
            <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground shadow-sm">
              <Pause className="h-3 w-3" aria-hidden="true" />
              Paused
            </div>
          )}

          {screenshots.length > 1 && (
            <>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                onClick={goToPrevious}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full"
                aria-label="Previous screenshot"
              >
                <ChevronLeft />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                onClick={goToNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full"
                aria-label="Next screenshot"
              >
                <ChevronRight />
              </Button>
            </>
          )}
        </div>

        <div className="p-6">
          <h3
            className={cn(
              'flex items-center gap-2',
              'type-card-title'
            )}
          >
            {Icon && (
              <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
            )}
            {current.title}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {current.description}
          </p>
        </div>
      </Card>

      {screenshots.length > 1 && (
        <div className="mt-4 flex justify-center gap-3">
          {screenshots.map((screenshot, index) => (
            <button
              key={screenshot.src}
              type="button"
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'h-16 w-24 overflow-hidden rounded-md border-2 bg-muted transition-colors',
                index === currentIndex
                  ? 'border-primary'
                  : 'border-transparent hover:border-input'
              )}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentIndex}
              data-testid="carousel-thumbnail"
            >
              {isVideo(screenshot.src) ? (
                <span className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                  {screenshot.title}
                </span>
              ) : (
                <img
                  src={screenshot.src}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
