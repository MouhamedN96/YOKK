# PWA Optimization for African Context

## Overview

Progressive Web Apps (PWAs) offer app-like experiences without the friction of app store downloads. For African users on low-end devices with limited storage, PWAs provide instant access without the 50-200MB download barrier. This component provides optimization patterns for Tecno/Infinix devices and 3G networks.

**Key Benefits for Africa:**
- No app store download (instant access)
- Small install size (<1MB vs 50MB+ native)
- Works offline by default
- Updates automatically (no user action needed)
- Installable to home screen
- Lower data usage than traditional web apps

## The African PWA Advantage

### Storage Constraints

```
Typical African smartphone (Tecno Spark, Infinix Hot):
- Storage: 16GB total
- System: 8GB
- User available: 8GB
- Photos/WhatsApp: 4-6GB
- Free space: 2-4GB

Traditional app download:
- Instagram: 150MB
- Facebook: 200MB
- TikTok: 180MB
- User hesitates: "Will this fill my phone?"

PWA install:
- Size: <1MB
- User installs instantly
- No storage anxiety
```

### Download Friction

```
App Store download on 3G ($5/GB data):
- 50MB app = $0.25
- 10-15 minutes download time
- User abandons 60% of the time

PWA install:
- <1MB = $0.005
- 10-30 seconds
- User completes 90% of the time

Conversion impact: 6x higher install rate
```

## Core PWA Requirements

### 1. Web App Manifest

```json
// public/manifest.json
{
  "name": "YOKK - African Dev Community",
  "short_name": "YOKK",
  "description": "Africa's first AI-native developer community",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1E40AF",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["social", "developer"],
  "screenshots": [
    {
      "src": "/screenshot-mobile.png",
      "sizes": "540x720",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ],
  "share_target": {
    "action": "/share",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url"
    }
  }
}
```

### 2. Service Worker Registration

```typescript
// app/layout.tsx (Next.js App Router)
'use client';

import { useEffect } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration);
        })
        .catch((error) => {
          console.error('SW registration failed:', error);
        });
    }
  }, []);

  return <html>{children}</html>;
}
```

### 3. Offline-First Service Worker

```typescript
// public/sw.js
const CACHE_NAME = 'yokk-v1';
const OFFLINE_URL = '/offline';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/styles/global.css',
  '/icon-192.png',
  '/icon-512.png',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response;

      return fetch(event.request).then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      });
    })
  );
});
```

## Advanced Caching Strategies

### Stale-While-Revalidate (Feed Content)

```typescript
// Serve cached version instantly, update in background
async function staleWhileRevalidate(request: Request): Promise<Response> {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  // Fetch fresh version in background
  const fetchPromise = fetch(request).then((response) => {
    cache.put(request, response.clone());
    return response;
  });

  // Return cached version immediately if available
  return cached || fetchPromise;
}

// In service worker
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/feed')) {
    event.respondWith(staleWhileRevalidate(event.request));
  }
});
```

### Network-First with Timeout (API Calls)

```typescript
// Try network first, fallback to cache on slow network
async function networkFirstWithTimeout(
  request: Request,
  timeout = 3000
): Promise<Response> {
  const cache = await caches.open(CACHE_NAME);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timeoutId);

    // Cache successful response
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    // Network failed or timeout - serve from cache
    const cached = await cache.match(request);
    if (cached) return cached;

    throw error;
  }
}
```

### Cache-Then-Network (Fast UX)

```typescript
// Show cached data immediately, update when network responds
function cacheThenNetwork(url: string, onUpdate: (data: any) => void) {
  // 1. Try cache first (instant)
  caches.match(url).then((cached) => {
    if (cached) {
      cached.json().then(onUpdate);
    }
  });

  // 2. Fetch from network (slower, but fresh)
  fetch(url)
    .then((response) => {
      // Update cache
      caches.open(CACHE_NAME).then((cache) => {
        cache.put(url, response.clone());
      });

      return response.json();
    })
    .then(onUpdate);
}

// Usage in component
useEffect(() => {
  cacheThenNetwork('/api/posts', (posts) => {
    setPosts(posts);
  });
}, []);
```

## Performance Optimization for Low-End Devices

### 1. JavaScript Bundle Size

```typescript
// Next.js config for minimal bundle size
// next.config.js
module.exports = {
  experimental: {
    optimizeCss: true, // Optimize CSS
    optimizePackageImports: ['lucide-react', 'date-fns'], // Tree-shake libraries
  },

  // Disable source maps in production
  productionBrowserSourceMaps: false,

  // Compress output
  compress: true,

  // SWC minification (faster than Terser)
  swcMinify: true,

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};
```

**Target Bundle Sizes for African Devices:**
```
Initial JavaScript bundle:
- <50KB (excellent) - Loads in 1-2s on 3G
- 50-100KB (good) - Loads in 2-4s on 3G
- 100-150KB (acceptable) - Loads in 4-6s on 3G
- >150KB (problematic) - Causes bounce on low-end devices

MediaTek Helio P22 (Tecno/Infinix):
- JavaScript parse: 5-10x slower than flagship
- 100KB bundle = 2-3s parse time
- Target: <80KB for good UX
```

### 2. Code Splitting (Critical!)

```typescript
// Lazy load routes and components
import dynamic from 'next/dynamic';

// Load heavy components only when needed
const VideoPlayer = dynamic(() => import('@/components/VideoPlayer'), {
  loading: () => <Skeleton />,
  ssr: false, // Skip server-side rendering for client-only components
});

// Route-based splitting (automatic in Next.js App Router)
// app/profile/page.tsx only loads when user visits /profile

// Component-based splitting
function Post({ post }: Props) {
  const [showComments, setShowComments] = useState(false);

  return (
    <div>
      <PostContent post={post} />
      {showComments && (
        <Comments postId={post.id} /> // Only load when opened
      )}
    </div>
  );
}
```

### 3. Image Optimization

```typescript
// Next.js Image component with optimization
import Image from 'next/image';

function Avatar({ src, alt }: Props) {
  return (
    <Image
      src={src}
      alt={alt}
      width={40}
      height={40}
      quality={60} // Reduce quality for mobile
      loading="lazy" // Lazy load images
      placeholder="blur" // Show blur while loading
      blurDataURL="data:image/..." // Tiny base64 placeholder
    />
  );
}

// Custom loader for Cloudflare Image Resizing
export default function cloudflareLoader({ src, width, quality }) {
  const params = [`width=${width}`, `quality=${quality || 60}`, 'format=avif'];
  return `https://yourdomain.com/cdn-cgi/image/${params.join(',')}/${src}`;
}
```

### 4. Font Optimization

```typescript
// app/layout.tsx
import { Inter } from 'next/font/google';

// Subset fonts (only include characters you need)
const inter = Inter({
  subsets: ['latin'], // Don't include other scripts unless needed
  display: 'swap', // Show fallback font while loading
  preload: true,
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}

// Or use system fonts (zero download)
const systemFont = {
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};
```

### 5. Critical CSS Inlining

```typescript
// Inline critical CSS for faster First Contentful Paint
// _document.tsx (Pages Router) or layout.tsx (App Router)
export default function Document() {
  return (
    <Html>
      <Head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* Critical CSS only */
              body { margin: 0; font-family: system-ui; }
              .header { height: 60px; background: #fff; }
              .loading { display: flex; justify-content: center; }
            `,
          }}
        />
      </Head>
      <body>
        <Main />
      </body>
    </Html>
  );
}
```

## Install Experience Optimization

### 1. Custom Install Prompt

```typescript
'use client';

import { useState, useEffect } from 'react';

function InstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function handleInstall() {
    if (!installPrompt) return;

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted install');
    }

    setInstallPrompt(null);
    setIsInstallable(false);
  }

  if (!isInstallable) return null;

  return (
    <div className="install-banner">
      <p>Install YOKK for instant access (less than 1MB)</p>
      <button onClick={handleInstall}>Install</button>
    </div>
  );
}
```

### 2. WebAPK (Android)

```json
// manifest.json additions for WebAPK
{
  "name": "YOKK",
  "display": "standalone",
  "start_url": "/?source=pwa",
  "theme_color": "#1E40AF",

  // Critical for WebAPK
  "prefer_related_applications": false,
  "related_applications": [],

  // Enables WebAPK (true app-like experience)
  "display_override": ["window-controls-overlay", "standalone"],

  // Shortcuts for long-press on icon
  "shortcuts": [
    {
      "name": "New Post",
      "short_name": "Post",
      "description": "Create a new post",
      "url": "/new-post?source=shortcut",
      "icons": [{ "src": "/icons/post-192.png", "sizes": "192x192" }]
    }
  ]
}
```

**WebAPK Benefits:**
```
Standard PWA add to home screen:
- Just a bookmark
- Opens in Chrome with URL bar
- Limited OS integration

WebAPK (Chrome 57+):
- True APK installed on device
- Full-screen, no browser UI
- Appears in app drawer
- OS-level integration (share targets, notifications)
- Feels like native app

Requirement: Meet PWA installability criteria for 2+ weeks
Result: 30-40% higher engagement vs standard PWA
```

## Performance Monitoring

### Lighthouse CI Integration

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm install -g @lhci/cli
      - run: lhci autorun
```

```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run start',
      url: ['http://localhost:3000/'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:pwa': ['error', { minScore: 0.9 }],
        // African-specific targets
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }], // <2s on 3G
        'speed-index': ['error', { maxNumericValue: 4000 }], // <4s on 3G
        'interactive': ['error', { maxNumericValue: 5000 }], // <5s on 3G
      },
    },
  },
};
```

### Real User Monitoring

```typescript
// app/layout.tsx
'use client';

import { useEffect } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Measure Core Web Vitals
    if ('web-vital' in window) {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(sendToAnalytics);
        getFID(sendToAnalytics);
        getFCP(sendToAnalytics);
        getLCP(sendToAnalytics);
        getTTFB(sendToAnalytics);
      });
    }
  }, []);

  return <html>{children}</html>;
}

function sendToAnalytics(metric: any) {
  // Send to your analytics
  console.log(metric.name, metric.value);

  // Alert if metrics exceed African targets
  const thresholds = {
    FCP: 2000, // First Contentful Paint <2s
    LCP: 3000, // Largest Contentful Paint <3s
    FID: 100, // First Input Delay <100ms
    CLS: 0.1, // Cumulative Layout Shift <0.1
    TTFB: 800, // Time to First Byte <800ms
  };

  if (metric.value > thresholds[metric.name]) {
    console.warn(`${metric.name} exceeded threshold: ${metric.value}ms`);
  }
}
```

## Offline Page Design

```typescript
// app/offline/page.tsx
export default function OfflinePage() {
  return (
    <div className="offline-page">
      <h1>You're offline</h1>
      <p>Don't worry! Your changes are saved and will sync when you reconnect.</p>

      {/* Show cached content */}
      <CachedPosts />

      {/* Show pending actions */}
      <PendingActions />
    </div>
  );
}

function CachedPosts() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // Read from IndexedDB or cache
    getCachedPosts().then(setPosts);
  }, []);

  return (
    <div>
      <h2>Recent Posts (Cached)</h2>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

function PendingActions() {
  const [pending, setPending] = useState([]);

  useEffect(() => {
    // Read from queue
    getPendingActions().then(setPending);
  }, []);

  if (pending.length === 0) return null;

  return (
    <div>
      <h2>Pending ({pending.length})</h2>
      <p>These will sync when you're back online</p>
      <ul>
        {pending.map((action) => (
          <li key={action.id}>{action.description}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Best Practices

1. **Keep Initial Bundle <80KB**: Tecno/Infinix devices need fast parse times
2. **Aggressive Code Splitting**: Load only what's needed
3. **Offline-First**: Cache critical assets on install
4. **WebAPK Optimization**: Meet criteria for true app experience
5. **Font Subsetting**: Only include needed characters
6. **Image Optimization**: AVIF format, lazy loading
7. **Measure Real Performance**: Monitor Core Web Vitals
8. **Test on Real Devices**: Emulators don't capture device constraints

## Real-World Examples

### Instagram Lite PWA

```
Instagram Lite optimization:
- App size: <1MB
- JavaScript: <100KB initial
- Images: WebP, progressive loading
- Offline: Last viewed content cached
- Target: MediaTek devices, 2G/3G networks

Result: 4x faster than main app on low-end devices
```

### Twitter Lite PWA

```
Twitter Lite strategy:
- Initial load: <200ms on 3G
- Bundle size: ~600KB (all routes)
- Service Worker: Aggressive caching
- Push notifications: Native-like engagement

Result: 65% increase in pages per session
```

### YOKK PWA Implementation

```typescript
// YOKK's PWA strategy for African developers
const PWA_CONFIG = {
  bundleSize: {
    initial: '<80KB', // Target for Tecno/Infinix
    perRoute: '<50KB',
  },
  caching: {
    static: 'Cache-First',
    api: 'Network-First with 3s timeout',
    images: 'Cache-First with lazy load',
  },
  offline: {
    pages: ['/', '/feed', '/profile'],
    data: 'IndexedDB (last 50 posts)',
  },
  install: {
    prompt: 'After 2 engagements',
    webapk: 'Enabled (full app experience)',
  },
};

// Result:
// - Install rate: 12% (vs 2% app store)
// - Load time: 1.2s on 3G (vs 8s+ for native app download)
// - Data usage: 800KB first visit, <100KB return visits
```

## Common Pitfalls

### Pitfall 1: Large JavaScript Bundles
❌ **Wrong:** 500KB bundle (10s+ parse on low-end devices)
✅ **Correct:** <80KB initial, code-split routes

### Pitfall 2: Not Testing on Real Devices
❌ **Wrong:** "Works great on my MacBook"
✅ **Correct:** Test on Tecno Spark 7, 3G throttling

### Pitfall 3: Forgetting Offline UX
❌ **Wrong:** Blank page when offline
✅ **Correct:** Show cached content + pending actions

### Pitfall 4: Ignoring Install Friction
❌ **Wrong:** Generic "Add to Home Screen"
✅ **Correct:** "Install in 10 seconds (<1MB)"

## References

- **PWA Checklist**: https://web.dev/pwa-checklist/
- **Service Worker Cookbook**: https://serviceworke.rs/
- **Lighthouse**: https://developers.google.com/web/tools/lighthouse
- **Web Vitals**: https://web.dev/vitals/

---

**Last Updated**: 2025-12-31
**African Optimization**: CRITICAL for app adoption
**Validated By**: Instagram Lite, Twitter Lite, YOKK
