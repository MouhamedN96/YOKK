'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold bg-gradient-to-r from-sunset-orange via-sunset-red to-sunset-pink bg-clip-text text-transparent">
            404
          </h1>
        </div>

        <h2 className="text-3xl font-bold text-white mb-4">
          Page Not Found
        </h2>

        <p className="text-white/60 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-gradient-to-r from-sunset-orange to-sunset-red text-white rounded-lg font-medium hover:shadow-lg hover:shadow-sunset-orange/25 transition-all"
          >
            Go Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-colors"
          >
            Go Back
          </button>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 max-w-sm mx-auto">
          <Link
            href="/feed"
            className="p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-white/80 hover:text-white"
          >
            <div className="text-2xl mb-2">📰</div>
            <div className="text-sm">Feed</div>
          </Link>

          <Link
            href="/challenges"
            className="p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-white/80 hover:text-white"
          >
            <div className="text-2xl mb-2">🎯</div>
            <div className="text-sm">Challenges</div>
          </Link>

          <Link
            href="/jobs"
            className="p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-white/80 hover:text-white"
          >
            <div className="text-2xl mb-2">💼</div>
            <div className="text-sm">Jobs</div>
          </Link>

          <Link
            href="/profile"
            className="p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-white/80 hover:text-white"
          >
            <div className="text-2xl mb-2">👤</div>
            <div className="text-sm">Profile</div>
          </Link>
        </div>
      </div>
    </div>
  )
}
