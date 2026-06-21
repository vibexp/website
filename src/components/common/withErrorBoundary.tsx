import type { ComponentType, ErrorInfo, ReactNode } from 'react'

import ErrorBoundary from './ErrorBoundary'

/**
 * Higher-order component wrapper for Error Boundary
 *
 * This HOC is in a separate file from ErrorBoundary to comply with
 * react-refresh/only-export-components rule while maintaining the HOC pattern.
 */
export function withErrorBoundary<P extends object>(
  Component: ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
): ComponentType<P> {
  return function WrappedWithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback} onError={onError}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}
