'use client'

import React from 'react'
import AfricanAuthFlow from '@/components/auth/AfricanAuthFlow'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="space-y-8">
      {/* Back to Home */}
      <Link 
        href="/" 
        className="
          inline-flex items-center gap-2 
          text-sm text-clay-white/60 hover:text-clay-white 
          transition-colors
        "
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-emerald-400">
          Welcome to YOKK
        </h1>
        <p className="text-clay-white/60">
          The AI-Native Developer Community for Africa
        </p>
      </div>

      {/* Auth Flow Component */}
      <AfricanAuthFlow />

      {/* Footer */}
      <p className="text-center text-xs text-clay-white/40">
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  )
}
