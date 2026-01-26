import type { NextConfig } from 'next'
import withPWAInit from '@ducanh2912/next-pwa'

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
    skipWaiting: true,
  },
})

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Type checking done in CI, skip during build to save memory
    ignoreBuildErrors: true,
  },
  // Disable source maps in production to reduce memory usage
  productionBrowserSourceMaps: false,
  // Reduce build memory usage
  swcMinify: true,
  // Memory optimization for Vercel
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@swc/core-linux-x64-gnu',
      'node_modules/@swc/core-linux-x64-musl',
      'node_modules/@esbuild/linux-x64',
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', '@powersync/web'],
    // Reduce memory pressure during build
    webpackMemoryOptimizations: true,
  },
  // Webpack config for memory optimization
  webpack: (config, { isServer }) => {
    // Handle WASM files for PowerSync
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    }

    // Reduce memory during build - don't override splitChunks
    if (!isServer) {
      config.optimization.moduleIds = 'deterministic'
    }

    return config
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com", // Next.js requires unsafe-eval for dev
              "style-src 'self' 'unsafe-inline'", // Tailwind requires unsafe-inline
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://mszpwskawqeljizftyeo.supabase.co wss://mszpwskawqeljizftyeo.supabase.co https://n8n.njooba.com https://*.posthog.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
}

export default withPWA(nextConfig)
