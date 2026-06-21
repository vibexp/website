/**
 * useScrollTracking Hook
 *
 * Track scroll depth on pages for engagement metrics
 */

import { useEffect, useRef } from 'react'
import { trackScrollDepth } from '../utils/gtm'

interface UseScrollTrackingOptions {
  thresholds?: number[] // Percentage thresholds to track (default: [25, 50, 75, 100])
  debounceMs?: number // Debounce delay in milliseconds (default: 500)
}

export function useScrollTracking(options: UseScrollTrackingOptions = {}) {
  const { thresholds = [25, 50, 75, 100], debounceMs = 500 } = options

  const trackedThresholds = useRef(new Set<number>())
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      // Clear existing timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }

      // Set new timer
      debounceTimer.current = setTimeout(() => {
        const windowHeight = window.innerHeight
        const documentHeight = document.documentElement.scrollHeight
        const scrollTop = window.scrollY || document.documentElement.scrollTop

        // Calculate scroll percentage
        const scrollPercentage = Math.round(
          ((scrollTop + windowHeight) / documentHeight) * 100
        )

        // Track each threshold once
        thresholds.forEach(threshold => {
          if (
            scrollPercentage >= threshold &&
            !trackedThresholds.current.has(threshold)
          ) {
            trackedThresholds.current.add(threshold)
            trackScrollDepth(threshold)
          }
        })
      }, debounceMs)
    }

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [thresholds, debounceMs])

  // Reset tracked thresholds when page changes
  useEffect(() => {
    trackedThresholds.current.clear()
  }, [])
}
