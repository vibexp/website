/**
 * Sentry Error Tracking Configuration
 *
 * Initializes Sentry for website error monitoring and tracking.
 * Provides proper error tracking, performance monitoring, and user context.
 */

import * as Sentry from '@sentry/react'

/**
 * Initialize Sentry with configuration
 * Should be called as early as possible in the application lifecycle
 */
export function initSentry() {
  // Only initialize in production (when VITE_GTM_ENABLED=true is set)
  const isProduction = import.meta.env.PROD
  const gtmEnabled = import.meta.env.VITE_GTM_ENABLED === 'true'
  const sentryDsn = import.meta.env.VITE_WEBSITE_SENTRY_DSN
  const environment = isProduction ? 'production' : import.meta.env.MODE

  // Only initialize if in production mode (same as GTM)
  if (!isProduction || !gtmEnabled) {
    console.log('[Sentry] Disabled in development mode')
    return
  }

  // Don't initialize if no DSN provided
  if (!sentryDsn) {
    console.warn('[Sentry] DSN not configured, skipping initialization')
    return
  }

  Sentry.init({
    dsn: sentryDsn,

    // Environment configuration
    environment,

    // Enable structured logging
    enableLogs: true,

    // Integrations
    integrations: [
      // Browser tracing for performance monitoring
      Sentry.browserTracingIntegration(),

      // Console logging integration - send console.log, console.warn, and console.error to Sentry
      Sentry.consoleLoggingIntegration({
        levels: ['warn', 'error'], // Only log warnings and errors, not all logs
      }),

      // Replay integration for session replay (optional)
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Performance Monitoring
    tracesSampleRate: isProduction ? 0.1 : 1.0, // 10% in production, 100% in dev

    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

    // Release tracking
    release: import.meta.env.VITE_APP_VERSION || 'unknown',

    // Additional configuration
    beforeSend(event, hint) {
      // Filter out specific errors or add custom logic
      const error = hint.originalException

      // Add any custom filtering logic here
      if (error instanceof Error && error.message?.includes('ResizeObserver')) {
        return null // Don't send ResizeObserver errors
      }

      return event
    },

    // Ignore specific errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'chrome-extension://',
      'moz-extension://',

      // Network errors that are expected
      'NetworkError',
      'Failed to fetch',
      'Network request failed',

      // ResizeObserver errors (benign)
      'ResizeObserver loop',
    ],
  })

  // Add release metadata to Sentry context
  Sentry.setContext('release_metadata', {
    sha: (import.meta.env.VITE_RELEASE_SHA as string | undefined) ?? 'dev',
    date:
      (import.meta.env.VITE_RELEASE_DATE as string | undefined) ?? 'unknown',
  })

  if (import.meta.env.DEV) {
    console.log(`[Sentry] Initialized for ${environment} environment`)
  }
}

/**
 * Capture an exception manually
 */
export function captureException(
  error: Error,
  context?: Record<string, unknown>
) {
  Sentry.captureException(error, {
    contexts: context ? { custom: context } : undefined,
  })
}

/**
 * Capture a message manually
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info'
) {
  Sentry.captureMessage(message, level)
}

/**
 * Set user context for Sentry (for when we add authentication)
 */
export function setSentryUser(
  user: { id: string; email?: string; username?: string } | null
) {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    })
  } else {
    Sentry.setUser(null)
  }
}

/**
 * Add breadcrumb for tracking user actions
 */
export function addBreadcrumb(
  message: string,
  category: string,
  level: Sentry.SeverityLevel = 'info',
  data?: Record<string, unknown>
) {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
  })
}
