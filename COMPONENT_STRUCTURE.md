# YOKK Component Structure

## Visual Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER (Header.tsx)                                            │
│  ┌──────┬──────────────────────────────────┬───────────────┐   │
│  │ YOKK │  🔍 Search...                    │  ☀️  👤 Sign In│   │
│  └──────┴──────────────────────────────────┴───────────────┘   │
└─────────────────────────────────────────────────────────────────┘
┌──────────────┬──────────────────────────────────────────────────┐
│              │                                                  │
│  SIDEBAR     │  MAIN CONTENT                                    │
│  (Sidebar)   │  (Your page content)                             │
│              │                                                  │
│  📍 Home     │  ┌─────────────────────────────────────────┐    │
│  💬 Questions│  │  Welcome to YOKK                        │    │
│  🚀 Launches │  │  Community stats, trending posts, etc.  │    │
│  🏆 Leaderbd │  └─────────────────────────────────────────┘    │
│              │                                                  │
│  ┌────────┐  │                                                  │
│  │+NewPost│  │  [Ambient gradient effects]                     │
│  └────────┘  │                                                  │
│              │                                                  │
│  Drafts (3)  │                                                  │
│  Bookmarks   │                                                  │
│              │                                                  │
│  ┌────────┐  │                                                  │
│  │👤 Guest│  │                                                  │
│  │Level 1 │  │                                                  │
│  │███▒▒15%│  │                                                  │
│  └────────┘  │                                                  │
└──────────────┴──────────────────────────────────────────────────┘
```

## Mobile Layout (< 1024px)

```
┌─────────────────────────────────────────┐
│  HEADER                                 │
│  ┌──┬──────┬─────────────┬───┬─────┐   │
│  │☰ │ YOKK │  🔍 Search  │ ☀️ │ 👤  │   │
│  └──┴──────┴─────────────┴───┴─────┘   │
└─────────────────────────────────────────┘
│                                         │
│  MAIN CONTENT (full width)              │
│                                         │
│  [Content scrolls here]                 │
│                                         │
│                                         │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│  MOBILE NAV                   │
│  [🏠]  [💬]  [ ➕ ]  [🚀]  [🏆]        │
└─────────────────────────────────────────┘

[SIDEBAR - Overlay when ☰ clicked]
┌──────────────┐
│  SIDEBAR     │
│  (slides in) │
│              │
│  📍 Home     │
│  💬 Questions│
│  🚀 Launches │
│  🏆 Leaderbd │
│  ...         │
└──────────────┘
```

## Component Hierarchy

```
RootLayout (app/layout.tsx)
└── MainLayout (app/(main)/layout.tsx) - Client Component
    ├── Header (components/layout/Header.tsx)
    │   ├── Logo
    │   ├── Search Bar
    │   │   └── Search Results Dropdown
    │   ├── Theme Toggle
    │   └── User Menu
    │
    ├── Sidebar (components/layout/Sidebar.tsx)
    │   ├── Navigation Items
    │   │   ├── Home
    │   │   ├── Questions (with badge)
    │   │   ├── Launches
    │   │   └── Leaderboard
    │   ├── CTA Button ("New Post")
    │   ├── Secondary Actions
    │   │   ├── Drafts (with count)
    │   │   └── Bookmarks
    │   └── User Stats Card
    │
    └── Main Content Area
        └── {children} - Your page components
            └── Example: HomePage (app/(main)/page.tsx)
                ├── Welcome Section
                ├── Stats Grid
                ├── Trending Posts
                └── Call to Action
```

## State Management Flow

```
MainLayout (useState)
    │
    ├── [isSidebarOpen, setIsSidebarOpen]
    │   │
    │   ├──> Header (onMenuClick prop)
    │   │       └── triggers: setIsSidebarOpen(true)
    │   │
    │   └──> Sidebar (isOpen, onClose props)
    │           └── triggers: setIsSidebarOpen(false)
    │
    └── Theme State (in Header)
        └── [theme, setTheme] + localStorage sync
```

## Responsive Breakpoints

```
Mobile        Tablet         Desktop        Wide
0───────────640──────────1024──────────1280──────────>

< 640px:
- Compact header
- Icon-only user button
- Sidebar: overlay (hidden by default)
- Mobile nav: visible (optional)

640px - 1024px:
- Full header
- Sidebar: overlay
- "Sign In" button visible

>= 1024px:
- Sidebar: always visible (fixed)
- Full header features
- No mobile nav
- Maximum spacing
```

## File Dependencies

```
app/(main)/layout.tsx
  ↓ imports
  ├── @/components/layout/Header
  └── @/components/layout/Sidebar

components/layout/Header.tsx
  ↓ imports
  ├── lucide-react: { Search, Sun, Moon, User, Menu }
  ├── framer-motion: { motion, AnimatePresence }
  └── React hooks: { useState, useEffect }

components/layout/Sidebar.tsx
  ↓ imports
  ├── next/navigation: { usePathname }
  ├── next/link: { Link }
  ├── lucide-react: { Home, MessageCircle, Rocket, Trophy, ... }
  ├── framer-motion: { motion }
  └── React

components/layout/MobileNav.tsx (optional)
  ↓ imports
  ├── next/navigation: { usePathname }
  ├── next/link: { Link }
  ├── lucide-react: { Home, MessageCircle, ... }
  └── framer-motion: { motion }
```

## Theme Integration

```
Theme Toggle (Header.tsx)
    ↓
localStorage.setItem('theme', 'dark' | 'light')
    ↓
document.documentElement.setAttribute('data-theme', value)
    ↓
CSS Selectors in globals.css
    ├── [data-theme="dark"] body { ... }
    └── [data-theme="light"] body { ... }
```

## Animation Timeline

```
Page Load:
  0ms:  Header slides down (y: -100 → 0)
  0ms:  Sidebar slides in (x: -280 → 0)
  0ms:  Stats cards fade in (staggered 100ms)
  500ms: Posts fade in (staggered 100ms)
  800ms: CTA section fades in

User Interaction:
  - Hover: 200ms transition
  - Click: Scale animation (0.98x)
  - Theme toggle: 200ms icon rotation
  - Search expand: Auto width transition
  - Active nav: Layout animation (spring)
```

## CSS Class Patterns

```
Layout Classes:
- Container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
- Sticky Header: "sticky top-0 z-50"
- Fixed Sidebar: "fixed lg:sticky h-screen"
- Glass Effect: "bg-white/5 backdrop-blur-xl border border-white/10"

Interactive States:
- Hover: "hover:bg-white/10 hover:text-clay-white"
- Focus: "focus:outline-none focus:ring-2 focus:ring-violet-500/50"
- Active: "bg-gradient-to-r from-violet-500/20 to-emerald-500/20"

Typography:
- Heading: "font-heading font-bold text-clay-white"
- Body: "font-body text-clay-white/70"
- Small: "text-sm text-clay-white/60"

Gradients:
- Violet-Emerald: "bg-gradient-to-r from-violet-500 to-emerald-500"
- Background: "bg-gradient-to-br from-[#0a0a0a] via-[#0d0d0d]"
```

## Accessibility Tree

```
<html data-theme="dark">
  <body>
    <div> (min-h-screen)
      <header role="banner">
        <button aria-label="Toggle menu">☰</button>
        <a href="/">YOKK</a>
        <input aria-label="Search" />
        <button aria-label="Switch to light mode">☀️</button>
        <button aria-label="User menu">👤</button>
      </header>

      <div> (flex container)
        <aside role="navigation">
          <nav>
            <a href="/">Home</a>
            <a href="/questions">Questions</a>
            ...
          </nav>
          <button>New Post</button>
        </aside>

        <main role="main">
          {page content}
        </main>
      </div>
    </div>
  </body>
</html>
```

## Performance Metrics

```
Bundle Size (estimated):
- Header.tsx: ~8 KB
- Sidebar.tsx: ~10 KB
- Layout.tsx: ~4 KB
- Total: ~22 KB (gzipped: ~6 KB)

First Contentful Paint:
- Header: < 100ms
- Sidebar: < 150ms
- Content: < 200ms

Animation Performance:
- 60 FPS on modern devices
- GPU-accelerated transforms
- Reduced motion support
```

---

**Quick Reference Card**

| Component | Purpose | Mobile | Desktop |
|-----------|---------|--------|---------|
| Header | Top nav, search, theme | Compact | Full |
| Sidebar | Main navigation | Overlay | Fixed |
| MobileNav | Bottom nav (optional) | Visible | Hidden |
| Layout | Container & state | Flex column | Flex row |

**Key Files:**
- `app/(main)/layout.tsx` - Main wrapper
- `components/layout/Header.tsx` - Top bar
- `components/layout/Sidebar.tsx` - Side nav
- `app/globals.css` - Theme styles
- `tailwind.config.ts` - Design tokens
