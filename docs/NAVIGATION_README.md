# YOKK App Navigation & Layout

High-quality, production-ready navigation system for the YOKK developer community platform.

## Components Created

### 1. Header (`components/layout/Header.tsx`)
A sticky, responsive header with premium UI/UX features.

**Features:**
- **Logo**: Gradient "YOKK" logo with hover glow effect
- **Search Bar**:
  - Expandable on focus
  - Live search results dropdown (placeholder)
  - Icon animations
  - Keyboard accessible
- **Theme Toggle**:
  - Smooth sun/moon icon transitions
  - Persists to localStorage
  - Supports both light and dark modes
- **User Menu**:
  - Avatar with gradient background
  - "Sign In" button on desktop
  - Mobile-optimized avatar button
- **Mobile Menu**: Hamburger button (triggers sidebar)
- **Scroll Effect**: Enhanced backdrop blur and shadow when scrolling

**Props:**
```typescript
interface HeaderProps {
  onMenuClick?: () => void  // Callback for mobile menu toggle
}
```

**Responsive Breakpoints:**
- Mobile: < 640px (compact search, icon-only user button)
- Tablet: 640px - 1024px (full search, "Sign In" button)
- Desktop: > 1024px (all features visible)

---

### 2. Sidebar (`components/layout/Sidebar.tsx`)
A collapsible sidebar navigation with active state indicators.

**Features:**
- **Navigation Items**:
  - Home (with Home icon)
  - Questions (with badge showing count)
  - Launches (with Rocket icon)
  - Leaderboard (with Trophy icon)
- **Active State**:
  - Gradient background on active route
  - Animated vertical indicator bar
  - Icon background glow effect
- **CTA Button**:
  - Prominent "New Post" button with gradient
  - Shimmer animation on hover
  - Sparkles icon animation
- **Secondary Actions**:
  - Drafts (with count badge)
  - Bookmarks
- **User Stats Card**:
  - User avatar and level
  - Progress bar with animation
  - Guest user placeholder
- **Mobile Behavior**:
  - Slides in from left
  - Overlay background
  - Touch-friendly close on overlay click

**Props:**
```typescript
interface SidebarProps {
  isOpen?: boolean      // Controls sidebar visibility (mobile)
  onClose?: () => void  // Callback to close sidebar
}
```

**State Management:**
- Uses Next.js `usePathname()` for active route detection
- Smooth transitions via Framer Motion
- Layout animations for active indicator

---

### 3. Main Layout (`app/(main)/layout.tsx`)
The main layout wrapper that composes Header and Sidebar.

**Features:**
- **Responsive Grid**:
  - Mobile: Stacked layout with overlay sidebar
  - Desktop: Fixed sidebar + scrollable content
- **Ambient Effects**:
  - Gradient glow orbs (violet and emerald)
  - Subtle background gradients
  - Depth and atmosphere
- **Content Container**:
  - Max-width 7xl (1280px)
  - Responsive padding
  - Centered content

**Layout Structure:**
```
┌─────────────────────────────────────┐
│           Header (sticky)           │
├─────────┬───────────────────────────┤
│         │                           │
│ Sidebar │      Main Content         │
│ (fixed) │    (scrollable)           │
│         │                           │
└─────────┴───────────────────────────┘
```

---

### 4. Mobile Navigation (`components/layout/MobileNav.tsx`)
Bottom navigation bar for mobile devices (< 1024px).

**Features:**
- **Bottom Bar**: Fixed at screen bottom
- **Navigation Icons**: Same routes as sidebar
- **Floating Action Button**:
  - Centered, elevated "New Post" button
  - Gradient background
  - Pulse animation
- **Active State**:
  - Layout animation for active indicator
  - Color transitions
- **Safe Area**: Respects device safe area insets

**Note:** Optional component - can be added to layout for mobile-first apps.

---

### 5. Demo Home Page (`app/(main)/page.tsx`)
A showcase page demonstrating the layout with real content.

**Features:**
- **Welcome Section**: Hero text with gradient
- **Stats Grid**:
  - 4 stat cards (Users, Questions, Launches, Contributors)
  - Hover effects with gradient backgrounds
  - Icon animations
- **Trending Posts**:
  - Post cards with upvote buttons
  - Category badges
  - Author and comment metadata
- **Call to Action**: Gradient CTA card with animation

---

## Design System

### Colors
Following the requested palette:

**Primary:**
- Background: `slate-900` / `#0a0a0a` (dark mode)
- Text: `white` / `clay-white` (#FAF8F5)

**Accent:**
- Violet: `#8b5cf6` (violet-500)
- Success: `#10b981` (emerald-500)

**Additional (from existing theme):**
- Terracotta: `#E07856`
- Savanna Gold: `#F2A541`
- Charcoal: `#1F1F1F`

### Typography
```css
font-heading: 'Space Grotesk'
font-body: 'DM Sans'
```

**Sizes:**
- H1: 28px (mobile) - 40px (desktop)
- H2: 20px
- Body: 15px
- Caption: 13px

### Spacing
4px base scale:
- xs: 8px
- sm: 12px
- md: 16px
- lg: 24px
- xl: 32px

### Border Radius
- sm: 8px
- md: 12px
- lg: 16px

### Shadows
Warm depth with terracotta tint:
- sm: `0 2px 4px rgba(224, 120, 86, 0.08)`
- md: `0 4px 12px rgba(224, 120, 86, 0.12)`
- lg: `0 8px 24px rgba(224, 120, 86, 0.16)`

---

## Animations

### Framer Motion Animations Used:
1. **Header**: Slide down on mount
2. **Sidebar**: Slide in from left
3. **Active Indicators**: Layout animation with spring physics
4. **Theme Toggle**: Rotate and fade icons
5. **Search Dropdown**: Fade and slide
6. **Hover States**: Scale transforms (1.02-1.1x)
7. **Stats Cards**: Staggered fade-in
8. **Progress Bar**: Width animation

### Transition Settings:
```typescript
// Spring physics for smooth, natural motion
{ type: 'spring', stiffness: 300, damping: 30 }

// Fade transitions
{ duration: 0.2 }
```

---

## Accessibility Features

### Keyboard Navigation:
- All interactive elements are keyboard accessible
- Focus rings: `focus:ring-2 focus:ring-violet-500/50`
- Logical tab order

### ARIA Labels:
- `aria-label` on icon-only buttons
- Descriptive button labels
- Semantic HTML (`<nav>`, `<header>`, `<aside>`, `<main>`)

### Screen Readers:
- Meaningful link text
- Hidden labels for icon buttons
- Status announcements for theme changes

### Focus States:
- Visible focus indicators
- Custom focus ring colors
- Focus-visible support

---

## Responsive Design

### Mobile (< 640px):
- Collapsible sidebar (overlay)
- Compact header
- Icon-only user button
- Reduced padding

### Tablet (640px - 1024px):
- Full header features
- Sidebar overlay
- Standard padding

### Desktop (> 1024px):
- Fixed sidebar always visible
- Full header with all features
- Maximum spacing

### Breakpoint Classes:
```css
sm:  /* >= 640px */
md:  /* >= 768px */
lg:  /* >= 1024px */
xl:  /* >= 1280px */
```

---

## Dark Mode Support

### Implementation:
Theme controlled via `data-theme` attribute on `<html>`:
```typescript
document.documentElement.setAttribute('data-theme', 'dark')
```

### CSS Variables (via Tailwind):
Light mode overrides defined in `globals.css` with `[data-theme="light"]` selectors.

**Dark Theme:**
- Background: `#0a0a0a`
- Text: `#FAF8F5`
- Cards: `rgba(255, 255, 255, 0.05)`
- Borders: `rgba(255, 255, 255, 0.1)`

**Light Theme:**
- Background: Brown/Beige gradient
- Text: Dark brown `#2d1f14`
- Cards: Warm beige glass
- Borders: Brown tints

---

## Performance Optimizations

### Code Splitting:
- Client components marked with `'use client'`
- Next.js automatic code splitting
- Lazy loading for animations

### Image Optimization:
- Using Next.js `<Image>` component (when needed)
- Gradient backgrounds via CSS (no images)
- Icon sprites via lucide-react

### Animation Performance:
- GPU-accelerated transforms
- `will-change` hints
- Reduced motion support via `prefers-reduced-motion`

### Bundle Size:
- Tree-shaking of unused icons
- Minimal dependencies
- No heavy animation libraries beyond Framer Motion

---

## Usage Example

```tsx
// app/(main)/your-page/page.tsx
export default function YourPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-heading font-bold text-clay-white">
        Your Page Title
      </h1>

      {/* Your content here */}
    </div>
  )
}
```

The layout is automatically applied to all pages in the `(main)` route group.

---

## Browser Support

### Tested Browsers:
- Chrome/Edge: 90+
- Firefox: 88+
- Safari: 14+
- Mobile Safari: 14+
- Chrome Android: 90+

### Fallbacks:
- Backdrop blur: Graceful degradation
- CSS Grid: Flexbox fallback
- Custom properties: Hard-coded values

---

## Dependencies

Required packages (already installed):
```json
{
  "framer-motion": "^12.23.24",
  "lucide-react": "^0.553.0",
  "next": "^15.1.7",
  "react": "^19.2.0",
  "tailwindcss": "^3.4.18"
}
```

---

## File Structure

```
yokk-app/
├── app/
│   ├── (main)/
│   │   ├── layout.tsx          ← Main layout wrapper
│   │   └── page.tsx            ← Demo home page
│   ├── layout.tsx              ← Root layout
│   └── globals.css             ← Theme styles
├── components/
│   └── layout/
│       ├── Header.tsx          ← Sticky header
│       ├── Sidebar.tsx         ← Navigation sidebar
│       └── MobileNav.tsx       ← Bottom mobile nav
└── tailwind.config.ts          ← Design tokens
```

---

## Customization

### Changing Colors:
Edit `tailwind.config.ts` color palette:
```typescript
colors: {
  terracotta: { primary: '#E07856' },
  // Add your custom colors
}
```

### Adding Nav Items:
Edit the `navItems` array in `Sidebar.tsx`:
```typescript
const navItems: NavItem[] = [
  { label: 'New Page', href: '/new', icon: YourIcon },
  // ...
]
```

### Adjusting Animations:
Modify Framer Motion props in components:
```typescript
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5 }}
>
```

---

## Development Tips

### Local Development:
```bash
cd yokk-app
npm run dev
```

### Type Checking:
```bash
npm run lint
npx tsc --noEmit
```

### Build for Production:
```bash
npm run build
npm start
```

---

## Future Enhancements

Potential improvements:
1. **Search**: Implement real search with backend API
2. **User Auth**: Replace placeholder with real authentication
3. **Notifications**: Add notification dropdown to header
4. **Keyboard Shortcuts**: Command palette (Cmd+K)
5. **Breadcrumbs**: Add breadcrumb navigation
6. **Infinite Scroll**: For feed/posts
7. **Skeleton Loaders**: Loading states for async content
8. **Offline Support**: PWA with service worker

---

## Troubleshooting

### Sidebar not appearing on mobile:
Check that `isOpen` state is managed correctly in the layout.

### Theme not persisting:
Ensure localStorage is available (client-side only).

### Animations not smooth:
- Check browser hardware acceleration
- Reduce motion in OS settings may disable animations

### Icons not loading:
Verify `lucide-react` is installed correctly.

---

## License

Part of the YOKK/NJOOBA project.

---

**Built with care for the developer community. 🚀**
