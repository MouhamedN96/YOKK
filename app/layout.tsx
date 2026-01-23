import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ErrorBoundary } from '@/components/error-boundary'
import { PowerSyncProvider } from '@/lib/powersync/Provider'
import { PostHogProvider } from '@/components/providers/PostHogProvider'
import { PostHogPageView } from '@/components/providers/PostHogPageView'
import YOKKInitializer from '@/components/YOKKInitializer'

export const viewport: Viewport = {
  themeColor: '#E65100',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: 'YOKK - AI-Native Developer Platform for Africa',
  description: 'Learn, engage, develop, connect, and grow with developers across Africa',
  manifest: '/manifest.json',
  keywords: ['developers', 'africa', 'community', 'tech', 'pan-african', 'learning', 'yokk', 'ai'],
  authors: [{ name: 'YOKK Team' }],
  openGraph: {
    title: 'YOKK - AI-Native Developer Platform for Africa',
    description: 'Where African developers grow together with AI assistance',
    type: 'website',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'YOKK',
  },
  icons: {
    apple: '/icons/icon-192x192.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className="texture-mudcloth overscroll-none">
        <PostHogProvider>
          {/* @ts-expect-error React 19 types */}
          <ErrorBoundary>
            <PowerSyncProvider>
              <PostHogPageView />
              <YOKKInitializer />
              <div className="min-h-screen">
                {children}
              </div>
            </PowerSyncProvider>
          </ErrorBoundary>
        </PostHogProvider>
      </body>
    </html>
  )
}
