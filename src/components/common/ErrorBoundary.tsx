/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI.
 *
 * Integrated with Sentry for automatic error tracking.
 */

import * as Sentry from '@sentry/react'
import { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showDialog?: boolean // Whether to show Sentry user feedback dialog
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  eventId: string | null
}

/**
 * Error Boundary with Sentry Integration
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Update state with error info
    this.setState({
      errorInfo,
    })

    // Capture the error with Sentry
    const eventId = Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
          errorBoundary: this.constructor.name,
        },
      },
    })

    this.setState({ eventId })

    // Call custom error handler if provided
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo)
      } catch (handlerError) {
        console.error(
          '[ErrorBoundary] Error in custom error handler:',
          handlerError
        )
        Sentry.captureException(handlerError)
      }
    }

    // Log error to console in development
    if (import.meta.env.DEV) {
      console.group('[ErrorBoundary] React Error Caught')
      console.error('Error:', error)
      console.error('Error Info:', errorInfo)
      console.error('Component Stack:', errorInfo.componentStack)
      console.error('Sentry Event ID:', eventId)
      console.groupEnd()
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    })
  }

  handleReportFeedback = () => {
    if (this.state.eventId) {
      Sentry.showReportDialog({
        eventId: this.state.eventId,
        title: 'Help us improve',
        subtitle: 'Please describe what happened before the error occurred',
        subtitle2: '',
        labelComments: 'What happened?',
        labelClose: 'Cancel',
        labelSubmit: 'Submit',
      })
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI - styled for the marketing website
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-br from-background to-muted">
          <div className="text-center max-w-2xl bg-card rounded-2xl shadow-xl p-8 md:p-12 border border-border">
            <div className="text-destructive text-6xl mb-6">⚠️</div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Oops! Something went wrong
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              We've encountered an unexpected error. Our team has been notified
              and we're looking into it. Please try refreshing the page.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={this.handleRetry}
                className="w-full sm:w-auto px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Try Again
              </button>

              {this.props.showDialog && this.state.eventId && (
                <button
                  onClick={this.handleReportFeedback}
                  className="w-full sm:w-auto px-8 py-3 bg-background text-foreground border-2 border-input rounded-lg hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all font-semibold"
                >
                  Report Issue
                </button>
              )}

              <a
                href="/"
                className="w-full sm:w-auto px-8 py-3 bg-background text-foreground border-2 border-input rounded-lg hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all font-semibold text-center"
              >
                Go Home
              </a>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <details className="mt-8 text-left">
                <summary className="cursor-pointer text-muted-foreground font-semibold hover:text-foreground text-sm">
                  Error Details (Development Mode)
                </summary>
                <div className="mt-4 p-4 bg-destructive/10 border-2 border-destructive/30 rounded-lg text-sm text-destructive overflow-auto max-h-96">
                  <div className="font-semibold mb-2 text-destructive">
                    Error:
                  </div>
                  <pre className="mb-4 whitespace-pre-wrap text-xs">
                    {this.state.error.toString()}
                  </pre>

                  {this.state.errorInfo?.componentStack && (
                    <>
                      <div className="font-semibold mb-2 text-destructive">
                        Component Stack:
                      </div>
                      <pre className="whitespace-pre-wrap text-xs">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </>
                  )}

                  {this.state.eventId && (
                    <div className="mt-4 text-xs text-destructive font-mono">
                      Sentry Event ID: {this.state.eventId}
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Export the index file for easy imports
 */
export default ErrorBoundary
