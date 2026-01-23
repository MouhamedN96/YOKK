'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only initialize in browser and if key exists
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
        person_profiles: 'identified_only',
        capture_pageview: false, // We'll capture manually for App Router
        capture_pageleave: true,
        // African optimization: batch events to reduce requests
        autocapture: {
          dom_event_allowlist: ['click', 'submit'],
          element_allowlist: ['button', 'a', 'form'],
        },
        // Reduce data usage
        disable_session_recording: process.env.NODE_ENV !== 'production',
        // Respect user privacy
        opt_out_capturing_by_default: false,
        // Cookie-less mode for GDPR compliance
        persistence: 'localStorage',
      })
    }
  }, [])

  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return <>{children}</>
  }

  return <PHProvider client={posthog}>{children}</PHProvider>
}
