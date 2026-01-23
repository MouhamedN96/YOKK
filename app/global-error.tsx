'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html lang="en">
      <body className="bg-charcoal-darker">
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-charcoal-base/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-sunset-orange/20 to-sunset-red/20 flex items-center justify-center animate-pulse">
              <svg
                className="w-10 h-10 text-sunset-red"
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

            <h1 className="text-2xl font-bold text-white mb-3">
              Critical Error
            </h1>

            <p className="text-white/70 mb-6">
              The application encountered a critical error. Please refresh the page.
            </p>

            {error.message && (
              <div className="mb-6 p-4 bg-black/20 rounded-lg border border-white/5">
                <p className="text-sm text-white/50 font-mono break-words">
                  {error.message}
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={reset}
                className="px-6 py-3 bg-gradient-to-r from-sunset-orange to-sunset-red text-white rounded-lg font-medium hover:shadow-lg hover:shadow-sunset-orange/25 transition-all"
              >
                Retry
              </button>

              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-colors"
              >
                Reload App
              </button>
            </div>

            {error.digest && (
              <p className="mt-6 text-xs text-white/30">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  )
}
