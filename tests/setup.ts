import '@testing-library/jest-dom'

import { TextDecoder, TextEncoder } from 'util'

// utils/gtm.ts reads Vite's `import.meta.env`, which is invalid syntax under
// Jest's CommonJS transform. Mock it globally so any module that imports it
// (directly, or transitively via the layout barrel) loads cleanly. Individual
// tests that assert on tracking calls re-mock it locally with their own spies.
jest.mock('@/utils/gtm', () => ({
  trackEvent: jest.fn(),
  trackPageView: jest.fn(),
  trackCTAClick: jest.fn(),
  trackNavClick: jest.fn(),
  trackExternalLink: jest.fn(),
  trackScrollDepth: jest.fn(),
  initializeGTM: jest.fn(),
  addGTMNoScript: jest.fn(),
  GTM_ID: 'GTM-TEST',
  GTM_ENABLED: false,
  // Source the real event-name map (dependency-free module, not globally mocked)
  // so this mock can never drift from the canonical source of truth.
  WEBSITE_EVENTS: jest.requireActual('@/utils/gtmEvents').WEBSITE_EVENTS,
}))

// jsdom does not provide TextEncoder/TextDecoder, which react-router v7 requires
// at import time. Polyfill them before any component test pulls in the router.
if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = TextEncoder as typeof globalThis.TextEncoder
}
if (typeof globalThis.TextDecoder === 'undefined') {
  globalThis.TextDecoder = TextDecoder as typeof globalThis.TextDecoder
}
