# YOKK Project Tracker

# 🇬🇧 English Version

## Project Overview

**YOKK** is an AI-native platform for Africans with an integrated AI assistant.

> Philosophy: **BOBO** - Build-Own-Bootstrap-Operate
> 

---

## Technical Stack

<aside>
⚠️

**Important:** YOKK uses Supabase + PowerSync (NOT Turso). Turso was planned for NJOOBA but YOKK focuses on PowerSync for offline-first sync.

</aside>

| **Layer** | **Technology** | **Status** |
| --- | --- | --- |
| Frontend | Next.js 15 (Server Components) | In Progress |
| Backend | Supabase (Auth/Postgres) | **Live & Synced** |
| Offline Sync | **PowerSync** (SQLite local sync) | **Scaffolded** |
| AI | Vercel AI SDK (Bo AI) | Partial |
| Styling | Tailwind CSS (Sunset over Dakar) | Complete |

---

## Design System: Sunset over Dakar

- **Fortress Brown** `#1A1412` - Dark glassmorphism base
- **Dakar Gold** `#D4A017` - Glowing borders, CTAs
- **Sand Gray** `#A9A9A9` - Metadata text
- **Sunset Orange** `#F97316` - Fire/trending states

---

# Phase 1: Foundation

<aside>
🏗️

**Goal:** Clean codebase, working auth, basic feed with demo data

</aside>

## 1.1 Codebase Cleanup

- [x]  Audit existing files
- [x]  Remove broken server component pages
- [x]  Keep: types, demo-data, supabase utils, theme, SQL schema
- [x]  Restructure to client-first with demo fallbacks

## 1.2 Database Setup

- [x]  Run `001-yokk-schema.sql` migration
- [x]  Verify RLS policies
- [x]  **Sync Types with Schema (1:1 Match)**
- [x]  **Enable Next.js 15 SSR (`@supabase/ssr`)**

## 1.3 Auth Flow

- [x]  **Login page (client component)**
- [x]  **Signup page with username**
- [x]  **API Routes for Passkeys**
- [x]  **Phone OTP Integration**

## 1.4 Core Layout

- [x]  **Header with search, notifications, profile**
- [x]  **Desktop sidebar navigation (Dynamic)**
- [x]  **Mobile bottom nav with Bo AI button**
- [x]  Responsive breakpoints
- [x]  **Offline Shell (AuthProvider Cache)**

## 1.5 Entry & Onboarding (New)

- [x]  **Onboarding Wizard (Username -> Role -> Interests)**
- [x]  **Server-side Redirect Enforcement**
- [x]  **Login Entry Point**

---

# Phase 2: Social Feed

<aside>
📱

**Goal:** X-style feed with Bilibili density

</aside>

## 2.1 Post Components

- [ ]  PostCard (text, article, product types)
- [ ]  Glassmorphism styling with gold borders
- [ ]  Category badges (AI/ML, FinTech, etc.)
- [ ]  Featured/Fire badges with animations

## 2.2 Feed Features

- [ ]  Infinite scroll with SWR
- [ ]  Category filtering
- [ ]  Sort by: Latest, Trending, Fire
- [ ]  Pull-to-refresh (mobile)

## 2.3 Interactions

- [ ]  Upvote/downvote with optimistic UI
- [ ]  Bookmark posts
- [ ]  Share functionality
- [ ]  Comment count display

## 2.4 Compose

- [ ]  Create post modal/page
- [ ]  Rich text editor (basic)
- [ ]  Category selection
- [ ]  Image upload to Supabase Storage

---

# Phase 3: User Profiles & Gamification

<aside>
🎮

**Goal:** JRPG-style XP system and achievements

</aside>

## 3.1 Profile Page

- [ ]  User info with avatar
- [ ]  Bio and social links
- [ ]  Posts/Articles/Products tabs
- [ ]  Follower/Following counts

## 3.2 XP System

- [ ]  Level calculation (1-50)
- [ ]  XP progress bar with animation
- [ ]  Level titles (Newcomer to Legend)
- [ ]  XP rewards for actions

## 3.3 Achievements

- [ ]  Achievement grid display
- [ ]  Locked/unlocked states
- [ ]  Rarity tiers (Common to Legendary)
- [ ]  Unlock notifications

## 3.4 Social

- [ ]  Follow/unfollow users
- [ ]  Followers list
- [ ]  Following list
- [ ]  Activity feed

---

# Phase 4: Product Launches

<aside>
🚀

**Goal:** ProductHunt-style launch system

</aside>

## 4.1 Launch Page

- [ ]  Featured product hero
- [ ]  Today's launches grid
- [ ]  Top products of week/month
- [ ]  Category filtering

## 4.2 Product Cards

- [ ]  Logo, name, tagline
- [ ]  Upvote button with count
- [ ]  Maker avatar
- [ ]  Launch date

## 4.3 Product Detail

- [ ]  Full description
- [ ]  Screenshots/gallery
- [ ]  Maker info
- [ ]  Comment thread

## 4.4 Submit Product

- [ ]  Multi-step form
- [ ]  Logo upload
- [ ]  Screenshot upload
- [ ]  Category selection

---

# Phase 5: Bo AI Assistant

<aside>
🤖

**Goal:** Grok-like AI integrated into platform

</aside>

## 5.1 Chat Interface

- [ ]  Floating Bo AI button (central nav)
- [ ]  Chat sidebar/drawer
- [ ]  Message history
- [ ]  Streaming responses

## 5.2 AI Features

- [ ]  General chat assistance
- [ ]  Content summarization
- [ ]  Writing help for posts
- [ ]  African tech context awareness

## 5.3 Inline Integration

- [ ]  Mentions @Bo mentions in posts
- [ ]  AI-generated summaries on articles
- [ ]  Suggested responses in comments

---

# Phase 6: Voice Comments

<aside>
🎙️

**Goal:** Audio-first engagement for African users

</aside>

## 6.1 Voice Recorder

- [ ]  Record button with waveform
- [ ]  Playback preview
- [ ]  Duration limit (60s)
- [ ]  Opus encoding for bandwidth

## 6.2 Voice Player

- [ ]  Inline waveform display
- [ ]  Play/pause controls
- [ ]  Duration display

## 6.3 Storage

- [ ]  Upload to Supabase Storage
- [ ]  Compression for low bandwidth
- [ ]  Caching for playback

---

# Phase 7: Offline-First with PowerSync

<aside>
📡

**Goal:** Works without internet for African infrastructure

</aside>

## 7.1 PowerSync Setup

- [ ]  Install and configure PowerSync
- [ ]  Define sync rules
- [ ]  Local SQLite schema

## 7.2 Sync Logic

- [ ]  Queue offline actions
- [ ]  Sync on reconnect
- [ ]  Conflict resolution
- [ ]  Optimistic UI updates

## 7.3 Offline UX

- [ ]  Connection status indicator
- [ ]  Offline mode banner
- [ ]  Cached content display
- [ ]  Pending sync indicator

---

# Phase 8: Polish & Production

<aside>
✨

**Goal:** Production-ready deployment

</aside>

## 8.1 Performance

- [ ]  Lighthouse audit (target 90+)
- [ ]  Image optimization (AVIF/WebP)
- [ ]  Bundle size analysis
- [ ]  Server component optimization

## 8.2 Testing

- [ ]  Unit tests for utilities
- [ ]  Integration tests for auth
- [ ]  E2E tests for critical flows
- [ ]  Mobile device testing

## 8.3 Security

- [ ]  RLS policy audit
- [ ]  Input sanitization
- [ ]  Rate limiting
- [ ]  Error monitoring (Sentry)

## 8.4 Deployment

- [ ]  Vercel production setup
- [ ]  Environment variables
- [ ]  Domain configuration
- [ ]  Analytics setup

---

## Session Log

### Session 001 - 2026-01-06 (Agent: v0)
- Created project tracker in Notion
- Audited codebase for usable vs. noise
- Identified cleanup plan
- Deleted broken server component pages
- Rebuilt all pages with demo data fallbacks

### Session 002 - 2026-01-20 (Agent: The Architect)
**Status:** Phase 1 Complete (1.1 - 1.5)

**Completed:**
1.  **Infrastructure Hardening:**
    - Migrated to Next.js 15 SSR (`@supabase/ssr`).
    - Synced TypeScript types with `schema.sql`.
    - Created `server.ts`, `client.ts`, `middleware.ts`.
2.  **Auth Implementation:**
    - Implemented Real Auth (Phone OTP + Passkey scaffolding).
    - Added `user_security_keys` table to schema.
    - Created API routes for FIDO2/WebAuthn.
3.  **UI Wiring:**
    - Built "Offline Shell" with `AuthProvider` and `localStorage` caching.
    - Refactored `Sidebar` and `Header` to be dynamic.
4.  **Entry System:**
    - Created `/login` and `/onboarding` pages.
    - Enforced onboarding via Server Layout redirect.
5.  **Social Feed & Compose:**
    - Wired Home Feed to Real DB (`posts` table).
    - Built Offline-Resilient Compose Form with Drafts & Compression.

**⚠️ CRITICAL HANDOFF NOTES (Technical Debt):**
- **Storage Buckets Missing:** The code expects a Supabase Storage bucket named `'posts'` for image uploads. This does NOT exist in the schema yet.
  - *Action Required:* Run SQL to create public buckets `posts` and `launches` with RLS policies (Public Read, Auth Insert).
- **PowerSync Not Active:** The offline logic is currently "Cache-First" (localStorage), not true "Sync-Engine" (SQLite).
  - *Action Required:* Initialize PowerSync SDK in Phase 7.

**Next Up:** Phase 3 (Profiles) & Storage Infrastructure.

---

## Architect System Implemented

<aside>
🔄

**Shifting Architect Pattern** - Each Human/AI session embodies the same Architect persona via [`ARCHITECT.md`](http://ARCHITECT.md)

</aside>

**Key Files:**

- [`ARCHITECT.md`](http://ARCHITECT.md) - Persona, vision, session protocol, mutation log
- [`YOKK-STATE.md`](http://YOKK-STATE.md) - Quick current state reference

**Session Protocol:**

1. Agent reads [ARCHITECT.md](http://ARCHITECT.md) first
2. Embodies persona with constraints
3. Checks mutation log for continuity
4. Works on current phase
5. Met à jour le log de mutation avant de terminer

**Resume Command:**

```jsx
Read 
```
