/**
 * @jest-environment jsdom
 */

/**
 * Unit tests for cookieConsent utility
 */
// Declare global types for gtag and dataLayer (from gtm.ts)
declare global {
  interface Window {
    dataLayer: Record<string, unknown>[]
    gtag: (...args: unknown[]) => void
  }
}

import {
  grantCookieConsent,
  denyCookieConsent,
  revokeCookieConsent,
  hasCookieConsentDecision,
  openCookieSettings,
  COOKIE_SETTINGS_EVENT,
} from '../../src/utils/cookieConsent'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
})

// Mock window.gtag
const mockGtag = jest.fn()
Object.defineProperty(global.window, 'gtag', {
  value: mockGtag,
  writable: true,
})

// Mock window.dataLayer
const mockDataLayer: unknown[] = []
Object.defineProperty(global.window, 'dataLayer', {
  value: mockDataLayer,
  writable: true,
})

// Get reference to dataLayer after module initialization
const getDataLayer = () => (global.window as Window).dataLayer as unknown[]

describe('cookieConsent', () => {
  beforeEach(() => {
    localStorageMock.clear()
    jest.clearAllMocks()
    mockDataLayer.length = 0
    // Reset dataLayer reference to ensure it's always available after tests that set it to undefined
    Object.defineProperty(global.window, 'dataLayer', {
      value: mockDataLayer,
      writable: true,
    })
    // Reset gtag reference
    Object.defineProperty(global.window, 'gtag', {
      value: mockGtag,
      writable: true,
    })
    // Use fake timers to control setTimeout behavior
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('grantCookieConsent', () => {
    it('should save consent to localStorage with timestamp', () => {
      grantCookieConsent()

      const stored = localStorageMock.getItem('cookieConsent')
      expect(stored).toBeDefined()

      const consentData = JSON.parse(stored!)
      expect(consentData.status).toBe('granted')
      expect(consentData.timestamp).toBeDefined()
      expect(typeof consentData.timestamp).toBe('number')
    })

    it('should call gtag with granted consent values', () => {
      grantCookieConsent()
      // gtag/dataLayer calls are deferred via setTimeout to avoid iOS Chrome GTM recursion
      jest.runAllTimers()

      expect(mockGtag).toHaveBeenCalledWith('consent', 'update', {
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
        analytics_storage: 'granted',
      })
    })

    it('should push cookie_consent_update event to dataLayer', () => {
      grantCookieConsent()
      // gtag/dataLayer calls are deferred via setTimeout to avoid iOS Chrome GTM recursion
      jest.runAllTimers()

      expect(getDataLayer()).toHaveLength(1)
      expect(getDataLayer()[0]).toEqual({
        event: 'cookie_consent_update',
        consent_status: 'granted',
      })
    })

    it('should not throw when localStorage.setItem throws SecurityError', () => {
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('The operation is insecure.', 'SecurityError')
      })

      expect(() => grantCookieConsent()).not.toThrow()
    })

    it('should still call gtag when localStorage.setItem throws SecurityError', () => {
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('The operation is insecure.', 'SecurityError')
      })

      grantCookieConsent()
      jest.runAllTimers()

      expect(mockGtag).toHaveBeenCalledWith('consent', 'update', {
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
        analytics_storage: 'granted',
      })
    })

    it('should store consent even if gtag throws', () => {
      const throwingGtag = jest.fn(() => {
        throw new Error('gtag error')
      })
      Object.defineProperty(global.window, 'gtag', {
        value: throwingGtag,
        writable: true,
      })

      // gtag and dataLayer are always defined in production (via index.html)
      // but we still want localStorage to be saved even if there's an error
      grantCookieConsent()

      // localStorage is saved synchronously before the setTimeout
      const stored = localStorageMock.getItem('cookieConsent')
      expect(stored).toBeDefined()

      // Running timers will throw inside setTimeout — that's expected behaviour
      expect(() => jest.runAllTimers()).toThrow()
    })
  })

  describe('denyCookieConsent', () => {
    it('should save decline to localStorage with timestamp', () => {
      denyCookieConsent()

      const stored = localStorageMock.getItem('cookieConsent')
      expect(stored).toBeDefined()

      const consentData = JSON.parse(stored!)
      expect(consentData.status).toBe('denied')
      expect(consentData.timestamp).toBeDefined()
      expect(typeof consentData.timestamp).toBe('number')
    })

    it('should push cookie_consent_update event to dataLayer', () => {
      denyCookieConsent()
      // gtag/dataLayer calls are deferred via setTimeout to avoid iOS Chrome GTM recursion
      jest.runAllTimers()

      expect(getDataLayer()).toHaveLength(1)
      expect(getDataLayer()[0]).toEqual({
        event: 'cookie_consent_update',
        consent_status: 'denied',
      })
    })

    it('should call gtag with denied consent values', () => {
      denyCookieConsent()
      // gtag/dataLayer calls are deferred via setTimeout to avoid iOS Chrome GTM recursion
      jest.runAllTimers()

      expect(mockGtag).toHaveBeenCalledWith('consent', 'update', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied',
      })
    })

    it('should not throw when localStorage.setItem throws SecurityError', () => {
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('The operation is insecure.', 'SecurityError')
      })

      expect(() => denyCookieConsent()).not.toThrow()
    })

    it('should still call gtag when localStorage.setItem throws SecurityError', () => {
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('The operation is insecure.', 'SecurityError')
      })

      denyCookieConsent()
      jest.runAllTimers()

      expect(mockGtag).toHaveBeenCalledWith('consent', 'update', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied',
      })
    })
  })

  describe('revokeCookieConsent', () => {
    it('should remove the stored consent decision', () => {
      grantCookieConsent()
      expect(localStorageMock.getItem('cookieConsent')).not.toBeNull()

      revokeCookieConsent()

      expect(localStorageMock.getItem('cookieConsent')).toBeNull()
    })

    it('should make hasCookieConsentDecision return false afterwards', () => {
      grantCookieConsent()
      expect(hasCookieConsentDecision()).toBe(true)

      revokeCookieConsent()

      expect(hasCookieConsentDecision()).toBe(false)
    })

    it('should call gtag with denied consent values', () => {
      grantCookieConsent()
      jest.clearAllMocks()

      revokeCookieConsent()
      jest.runAllTimers()

      expect(mockGtag).toHaveBeenCalledWith('consent', 'update', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied',
      })
    })

    it('should push a revoked cookie_consent_update event to dataLayer', () => {
      revokeCookieConsent()
      jest.runAllTimers()

      expect(getDataLayer()).toHaveLength(1)
      expect(getDataLayer()[0]).toEqual({
        event: 'cookie_consent_update',
        consent_status: 'revoked',
      })
    })

    it('should not throw when localStorage.removeItem throws SecurityError', () => {
      jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new DOMException('The operation is insecure.', 'SecurityError')
      })

      expect(() => revokeCookieConsent()).not.toThrow()
    })
  })

  describe('openCookieSettings', () => {
    it('should dispatch the cookie settings event', () => {
      const listener = jest.fn()
      window.addEventListener(COOKIE_SETTINGS_EVENT, listener)

      openCookieSettings()

      expect(listener).toHaveBeenCalledTimes(1)
      window.removeEventListener(COOKIE_SETTINGS_EVENT, listener)
    })
  })

  describe('hasCookieConsentDecision', () => {
    it('should return false when no consent exists', () => {
      expect(hasCookieConsentDecision()).toBe(false)
    })

    it('should return false when localStorage.getItem throws SecurityError', () => {
      jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new DOMException('The operation is insecure.', 'SecurityError')
      })

      expect(hasCookieConsentDecision()).toBe(false)
    })

    it('should return true for granted consent (any age)', () => {
      grantCookieConsent()
      expect(hasCookieConsentDecision()).toBe(true)
    })

    it('should return true for recently declined consent (< 7 days)', () => {
      denyCookieConsent()
      expect(hasCookieConsentDecision()).toBe(true)
    })

    it('should return false for expired declined consent (≥ 7 days)', () => {
      denyCookieConsent()

      // Manually set timestamp to 8 days ago
      const stored = localStorageMock.getItem('cookieConsent')!
      const consentData = JSON.parse(stored)
      consentData.timestamp = Date.now() - 8 * 24 * 60 * 60 * 1000 // 8 days ago
      localStorageMock.setItem('cookieConsent', JSON.stringify(consentData))

      expect(hasCookieConsentDecision()).toBe(false)
    })

    it('should return false exactly at 7 days boundary (consent expires at 7 days)', () => {
      denyCookieConsent()

      // Manually set timestamp to exactly 7 days ago
      const stored = localStorageMock.getItem('cookieConsent')!
      const consentData = JSON.parse(stored)
      consentData.timestamp = Date.now() - 7 * 24 * 60 * 60 * 1000 // exactly 7 days
      localStorageMock.setItem('cookieConsent', JSON.stringify(consentData))

      expect(hasCookieConsentDecision()).toBe(false)
    })

    it('should return true exactly at 6.99 days', () => {
      denyCookieConsent()

      // Manually set timestamp to 6.99 days ago
      const stored = localStorageMock.getItem('cookieConsent')!
      const consentData = JSON.parse(stored)
      consentData.timestamp = Date.now() - 6.99 * 24 * 60 * 60 * 1000
      localStorageMock.setItem('cookieConsent', JSON.stringify(consentData))

      expect(hasCookieConsentDecision()).toBe(true)
    })

    it('should handle legacy format (plain string)', () => {
      localStorageMock.setItem('cookieConsent', 'granted')
      expect(hasCookieConsentDecision()).toBe(true)

      localStorageMock.setItem('cookieConsent', 'denied')
      expect(hasCookieConsentDecision()).toBe(true)
    })

    it('should return false for malformed data', () => {
      localStorageMock.setItem('cookieConsent', 'invalid-json')
      expect(hasCookieConsentDecision()).toBe(false)
    })

    it('should handle unknown status gracefully', () => {
      const consentData = {
        status: 'unknown' as const,
        timestamp: Date.now(),
      }
      localStorageMock.setItem('cookieConsent', JSON.stringify(consentData))

      expect(hasCookieConsentDecision()).toBe(false)
    })
  })

  describe('consent expiry behavior', () => {
    it('should keep granted consent valid indefinitely', () => {
      grantCookieConsent()

      // Set timestamp to 1 year ago
      const stored = localStorageMock.getItem('cookieConsent')!
      const consentData = JSON.parse(stored)
      consentData.timestamp = Date.now() - 365 * 24 * 60 * 60 * 1000 // 1 year ago
      localStorageMock.setItem('cookieConsent', JSON.stringify(consentData))

      expect(hasCookieConsentDecision()).toBe(true)
    })

    it('should expire declined consent after 7 days', () => {
      denyCookieConsent()

      // Initially should have decision
      expect(hasCookieConsentDecision()).toBe(true)

      // Set timestamp to 8 days ago
      const stored = localStorageMock.getItem('cookieConsent')!
      const consentData = JSON.parse(stored)
      consentData.timestamp = Date.now() - 8 * 24 * 60 * 60 * 1000
      localStorageMock.setItem('cookieConsent', JSON.stringify(consentData))

      // Should now show banner again
      expect(hasCookieConsentDecision()).toBe(false)
    })

    it('should allow user to grant consent after expiry', () => {
      denyCookieConsent()

      // Set timestamp to 8 days ago (expired)
      const stored = localStorageMock.getItem('cookieConsent')!
      const consentData = JSON.parse(stored)
      consentData.timestamp = Date.now() - 8 * 24 * 60 * 60 * 1000
      localStorageMock.setItem('cookieConsent', JSON.stringify(consentData))

      // Should show banner again
      expect(hasCookieConsentDecision()).toBe(false)

      // User grants consent
      grantCookieConsent()

      // Should now have valid decision
      expect(hasCookieConsentDecision()).toBe(true)
    })
  })
})
