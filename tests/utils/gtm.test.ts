/**
 * @jest-environment jsdom
 */

/**
 * Tests for the trackEvent re-entrancy guard. The guard lives in the
 * dependency-free helpers in gtmEvents.ts — gtm.ts itself reads Vite's
 * `import.meta.env`, which cannot be transformed under Jest's CommonJS
 * transform, so we exercise the guard at its real boundary.
 */
declare global {
  interface Window {
    dataLayer: Record<string, unknown>[]
    gtag: (...args: unknown[]) => void
  }
}

import {
  deferGuardedDataLayerPush,
  guardedDataLayerPush,
} from '../../src/utils/gtmEvents'

describe('gtm re-entrancy guard', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    Object.defineProperty(global.window, 'dataLayer', {
      value: [] as Record<string, unknown>[],
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('guardedDataLayerPush', () => {
    it('pushes the event once', () => {
      guardedDataLayerPush({ event: 'vx_website_test' })

      expect(window.dataLayer).toHaveLength(1)
      expect(window.dataLayer[0]).toEqual({ event: 'vx_website_test' })
    })

    it('suppresses app-level re-entry that routes back through the helper', () => {
      // App-level re-entry: code that calls guardedDataLayerPush again from
      // within the same push (NOT GTM's internal raw-push recursion — see the
      // "does not stop GTM's raw re-entrant push" test below for that path).
      const realPush = window.dataLayer.push.bind(window.dataLayer)
      window.dataLayer.push = jest.fn((entry: Record<string, unknown>) => {
        const length = realPush(entry)
        // Re-enter via the helper exactly once; the guard must block it.
        guardedDataLayerPush({ event: 'vx_website_reentrant' })
        return length
      }) as typeof window.dataLayer.push

      guardedDataLayerPush({ event: 'vx_website_test' })

      // Only the original event is recorded; the re-entrant helper call was blocked.
      expect(window.dataLayer).toHaveLength(1)
      expect(window.dataLayer[0]).toEqual({ event: 'vx_website_test' })
    })

    it('does NOT stop GTM-style re-entry via the raw dataLayer.push', () => {
      // Real GTM overrides window.dataLayer.push and re-enters through that raw
      // array method, never through guardedDataLayerPush — so the isPushingEvent
      // guard cannot see it. This test documents that limitation honestly: GTM
      // bounds its own recursion; our protection is the deferral, not this guard.
      const realPush = window.dataLayer.push.bind(window.dataLayer)
      let gtmDepth = 0
      window.dataLayer.push = jest.fn((entry: Record<string, unknown>) => {
        const length = realPush(entry)
        if (gtmDepth < 2) {
          gtmDepth++
          // GTM's raw re-entry — bypasses the guard entirely.
          window.dataLayer.push({ event: 'gtm_internal' })
        }
        return length
      }) as typeof window.dataLayer.push

      guardedDataLayerPush({ event: 'vx_website_test' })

      // The guard did not block GTM's raw re-entrant pushes: original + 2 internal.
      expect(window.dataLayer).toHaveLength(3)
    })

    it('clears the guard so an independent later push still goes through', () => {
      guardedDataLayerPush({ event: 'vx_website_first' })
      guardedDataLayerPush({ event: 'vx_website_second' })

      expect(window.dataLayer).toHaveLength(2)
    })
  })

  describe('deferGuardedDataLayerPush', () => {
    it('defers the push off the caller stack until timers flush', () => {
      // The deferral is the real stack-overflow mitigation: nothing is pushed
      // synchronously, so the push never extends the caller's call stack.
      deferGuardedDataLayerPush({ event: 'vx_website_test' })

      expect(window.dataLayer).toHaveLength(0)

      jest.runAllTimers()

      expect(window.dataLayer).toHaveLength(1)
      expect(window.dataLayer[0]).toEqual({ event: 'vx_website_test' })
    })

    it('does not drop independent events deferred within the same tick', () => {
      // Each call schedules its own macrotask, so the guard is reset between
      // them and distinct events are all delivered (no false de-duplication).
      deferGuardedDataLayerPush({ event: 'vx_website_first' })
      deferGuardedDataLayerPush({ event: 'vx_website_second' })

      jest.runAllTimers()

      expect(window.dataLayer).toHaveLength(2)
      expect(window.dataLayer).toEqual([
        { event: 'vx_website_first' },
        { event: 'vx_website_second' },
      ])
    })
  })
})
