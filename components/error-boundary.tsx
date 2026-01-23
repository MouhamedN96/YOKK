'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-charcoal-base/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-sunset-red/20 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-sunset-red"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Something went wrong
            </h2>
            <p className="text-white/60 mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.reload()
              }}
              className="px-6 py-3 bg-gradient-to-r from-sunset-orange to-sunset-red text-white rounded-lg font-medium hover:shadow-lg hover:shadow-sunset-orange/25 transition-all"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Simple error fallback component for smaller sections
export function ErrorFallback({ error, reset }: { error: Error; reset?: () => void }) {
  return (
    <div className="bg-charcoal-base/40 border border-white/5 rounded-xl p-6 text-center">
      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-sunset-red/20 flex items-center justify-center">
        <svg
          className="w-6 h-6 text-sunset-red"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <p className="text-white/80 text-sm mb-3">Failed to load this section</p>
      <p className="text-white/40 text-xs mb-4">{error.message}</p>
      {reset && (
        <button
          onClick={reset}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/80 text-sm rounded-lg transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  )
}
