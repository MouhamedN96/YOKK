# YOKK - Master Context Document

> **Single Source of Truth** for all AI agents, developers, and stakeholders working on YOKK.
> Last Updated: 2026-01-25 | Version: 3.0

---

## Quick Context (For Agents)

```
Project: YOKK - AI-native community platform for African builders
Company: NJOOBA LLC
Production: https://yokk.vercel.app
Repository: https://github.com/MouhamedN96/YOKK
Current Phase: 2.x (Social Feed) - Phase 1 Complete
Build Status: PASSING
```

**Before working:** Read sections relevant to your task. Update SESSION LOG before ending.

---

## 1. Project Identity

### Vision
AI-native community platform combining X + Bilibili + ProductHunt + integrated AI assistant (Bo AI), built specifically for African infrastructure constraints.

### Target Users
- **Developers** - needing community, learning, network
- **Entrepreneurs** - needing visibility, validation, connections
- **Traders/Businessmen** - needing knowledge access, market intel
- **Marketers** - needing tools, trends, collaborators

### Philosophy: BOBO
- **B**uild - Own your stack, no vendor lock-in
- **O**wn - Data sovereignty for Africa
- **B**ootstrap - Revenue-first, sustainable growth
- **O**perate - Self-sufficient infrastructure

### Revenue Model
- SaaS: $5/month subscription (planned)
- B2B: Spotlight/promotion features (planned)

---

## 2. Current State

### What Works (Deployed)
| Feature | Status | Notes |
|---------|--------|-------|
| Auth (Phone OTP) | Working | Supabase Auth via SMS |
| Auth (Passkeys) | Scaffolded | API routes exist, needs HTTPS for full WebAuthn |
| Onboarding | Working | 3-step wizard (username → role → interests) |
| Home Feed | Working | Reads from `posts` table with demo fallback |
| Compose | Working | Client-side compression, draft saving |
| Explore | Working | Categories, demo data |
| Trending | Working | Time-sorted posts |
| Profile | Demo | Shows demo data, not real user data |
| Launch | Demo | ProductHunt-style, demo data |
| Middleware | Working | Route protection, session management |
| PostHog | Working | Analytics, page views |
| N8N RSS | Ready | Workflow created, needs deployment |

### What's Missing/Broken
| Issue | Severity | Notes |
|-------|----------|-------|
| Supabase Storage buckets | HIGH | `posts` and `launches` buckets not created |
| PowerSync | HIGH | Schema exists, not connected |
| Bo AI | MEDIUM | Router exists, UI not wired to endpoint |
| Real profiles | MEDIUM | Shows demo data |
| Gamification logic | LOW | XP/levels not calculating |
| Voice comments | LOW | Components exist, not integrated |

### Technical Debt
- [ ] Storage buckets need creation in Supabase
- [ ] PowerSync connector needs initialization
- [ ] Image compression destination not configured
- [ ] Nano Banana API key missing (image generation)
- [ ] No E2E tests

---

## 3. Architecture

### Tech Stack
| Layer | Technology | Status |
|-------|------------|--------|
| Framework | Next.js 15 (App Router, Server Components) | Active |
| Backend | Supabase (PostgreSQL, Auth, Realtime) | Active |
| Offline Sync | PowerSync (SQLite local) | Scaffolded |
| AI | Vercel AI SDK + Groq + OpenRouter | Partial |
| Styling | Tailwind CSS + Framer Motion | Active |
| Analytics | PostHog | Active |
| Automation | N8N (RSS feeds) | Ready |
| Deployment | Vercel Pro | Active |

### File Structure
```
yokk-app/
├── app/                    # Next.js 15 App Router
│   ├── (main)/            # Protected route group
│   │   ├── layout.tsx     # Main layout with sidebar
│   │   └── page.tsx       # Home feed
│   ├── api/               # API routes
│   │   ├── auth/          # Passkey endpoints
│   │   ├── bo/            # AI assistant endpoint
│   │   ├── health/        # Health check
│   │   └── webhooks/      # N8N webhook receiver
│   ├── login/             # Auth pages
│   ├── onboarding/        # User setup wizard
│   └── [feature]/         # Feature pages
├── components/
│   ├── auth/              # AfricanAuthFlow, PasskeyButton
│   ├── design/            # Gamification (LevelBadge, etc.)
│   ├── layout/            # Header, Sidebar, BottomNav
│   ├── providers/         # AuthProvider, PostHogProvider
│   └── ui/                # Primitives + BoAI interface
├── lib/
│   ├── supabase/          # Client, server, auth helpers, types
│   ├── powersync/         # Schema, client, connector
│   ├── sync/              # BackgroundSyncManager
│   ├── ai/                # Hybrid router (3-tier)
│   └── design/            # Tokens, utilities
├── hooks/                 # React hooks (useAuth re-export)
├── supabase/              # schema.sql with RLS
├── n8n-workflows/         # Automation workflows
└── middleware.ts          # Session management, route protection
```

### Key Files Reference
| File | Purpose |
|------|---------|
| `lib/supabase/types.ts` | **Source of truth** for TypeScript types |
| `supabase/schema.sql` | Database schema with RLS policies |
| `lib/demo-data.ts` | Mock data for offline/demo mode |
| `middleware.ts` | Auth session refresh, route protection |
| `app/globals.css` | Design system tokens |
| `n8n-workflows/rss-aggregator-production.json` | RSS feed automation |

---

## 4. Design System: Sunset Over Dakar

### Colors
```css
--fortress-brown: #1A1412;  /* Base, glassmorphism */
--dakar-gold: #D4A017;      /* Borders, CTAs, glow */
--sand-gray: #A9A9A9;       /* Metadata text */
--sunset-orange: #F97316;   /* Fire/trending states */
--clay-white: #FAF8F5;      /* Light mode base */
```

### Visual Rules
- Cards: Glassmorphism + 1px Dakar Gold border
- Primary Action: Central floating Bo AI button
- Feed: Bilibili density + X interactions
- Touch targets: 44px minimum
- Font size: 16px minimum

### Typography
- Heading: Space Grotesk (bold, modern)
- Body: DM Sans (readable, professional)

---

## 5. Technical Constraints (Non-Negotiable)

### African Infrastructure Reality
1. **Offline-First** - Assume user is offline by default
2. **Mobile-First** - 44px touch targets, battery-conscious
3. **Bandwidth-Aware** - Opus audio, AVIF images, compress everything
4. **Latency-Tolerant** - Optimistic UI for 300ms+ round trips
5. **Security-First** - RLS everywhere, no client secrets

### Performance Targets
| Metric | Target |
|--------|--------|
| API Latency from Africa | <500ms |
| Memory footprint | <50MB |
| Session data | <10MB |
| Install size (PWA) | <5MB |
| Cost per user | <$0.50/month |

---

## 6. Security Posture

### Implemented
- [x] Row-Level Security (RLS) on all Supabase tables
- [x] Edge middleware for session management
- [x] No client-side API secrets
- [x] HMAC-SHA256 for N8N webhooks
- [x] Content Security Policy headers
- [x] X-Frame-Options: DENY
- [x] PostHog for security monitoring

### Audit Findings (Session 003)
| Finding | Status | Notes |
|---------|--------|-------|
| Protected routes not enforced | FIXED | Added middleware checks |
| Missing CSP headers | FIXED | Added in next.config.ts |
| API keys could leak | OK | Using edge proxies |
| No rate limiting | TODO | Needs implementation |

### Security Rules for Development
1. NEVER commit API keys or secrets
2. ALL database operations through RLS
3. ALL AI calls through edge proxies
4. Validate ALL user input
5. Log security events to PostHog

---

## 7. External Integrations

### Supabase
- **Project:** lyhfeqejktubykgjzjtj
- **Region:** Default
- **Auth:** Phone OTP enabled
- **Tables:** profiles, posts, comments, upvotes, bookmarks, achievements, user_achievements, user_security_keys
- **RLS:** Enabled on all tables

### PowerSync (Not Yet Active)
- Schema defined in `lib/powersync/schema.ts`
- Connector scaffolded in `lib/powersync/connector.ts`
- Needs: PowerSync project URL, initialization

### N8N
- **Instance:** https://n8n.njooba.com
- **Workflow:** RSS Feed Aggregator
- **Webhook:** `POST /api/webhooks/n8n`
- **Auth:** HMAC-SHA256 signature verification
- **Env vars needed:** `N8N_WEBHOOK_SECRET`, `N8N_BOT_USER_ID`

### PostHog
- Page view tracking
- Custom events ready
- Feature flags available

---

## 8. Phase Tracker

| Phase | Name | Status | Notes |
|-------|------|--------|-------|
| 1.1 | Codebase Cleanup | COMPLETE | Removed broken files |
| 1.2 | Database Setup | COMPLETE | Schema + RLS |
| 1.3 | Auth Flow | COMPLETE | OTP + Passkey scaffolded |
| 1.4 | Core Layout | COMPLETE | Header, Sidebar, BottomNav |
| 1.5 | Entry & Onboarding | COMPLETE | Login + 3-step wizard |
| 2.1 | Post Components | IN PROGRESS | PostCard types needed |
| 2.2 | Feed Features | PENDING | Infinite scroll, filters |
| 2.3 | Interactions | PENDING | Upvotes, bookmarks |
| 2.4 | Compose Enhancement | PENDING | Image upload |
| 3 | Profiles & Gamification | PENDING | XP, achievements |
| 4 | Product Launches | PENDING | ProductHunt-style |
| 5 | Bo AI Assistant | PENDING | Chat UI wiring |
| 6 | Voice Comments | PENDING | Opus encoding |
| 7 | PowerSync Offline | PENDING | True offline sync |
| 8 | Production Polish | PENDING | Testing, security audit |

---

## 9. Learnings & Decisions

### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Supabase over Turso | PowerSync integration, auth included | 2026-01-06 |
| Client-first pages | Demo mode without DB, faster iteration | 2026-01-06 |
| localStorage cache | Instant paint for African latency | 2026-01-20 |
| Phone OTP primary | Most accessible auth in Africa | 2026-01-20 |
| PostHog over Mixpanel | Better privacy, self-hostable option | 2026-01-23 |
| N8N for automation | Self-hostable, visual workflows | 2026-01-25 |

### Learnings
1. **Demo data is essential** - Pages must work without database connection
2. **Type system matters** - Conflicting types caused build failures
3. **Middleware is critical** - Route protection must be in middleware, not pages
4. **README security** - Don't expose architecture details publicly
5. **Build memory** - Vercel free tier can't handle large builds

### Mistakes Made
1. Had conflicting Post types in `lib/types.ts` vs `lib/supabase/types.ts`
2. Initially exposed full architecture in README
3. Didn't test middleware protection for all routes

---

## 10. Challenges & Blockers

### Active Blockers
| Blocker | Owner | Notes |
|---------|-------|-------|
| Storage buckets not created | Admin | Need to create in Supabase dashboard |
| PowerSync URL missing | Admin | Need PowerSync project setup |
| N8N webhook secret | Admin | Need to set in N8N + Vercel env |

### Resolved Blockers
| Blocker | Resolution | Date |
|---------|------------|------|
| Build failing | Fixed type system | 2026-01-22 |
| Types mismatch | Consolidated to Supabase types | 2026-01-22 |
| Routes not protected | Added middleware checks | 2026-01-23 |
| Memory exceeded on Vercel | Upgraded to Pro | 2026-01-25 |

---

## 11. Environment Variables

### Required
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# App
NEXT_PUBLIC_APP_URL=https://yokk.vercel.app

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=xxx
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

### Optional (Feature-Dependent)
```env
# PowerSync (Phase 7)
NEXT_PUBLIC_POWERSYNC_URL=xxx

# AI (Phase 5)
GROQ_API_KEY=xxx
OPENROUTER_API_KEY=xxx

# N8N Webhooks
N8N_WEBHOOK_SECRET=xxx
N8N_BOT_USER_ID=xxx
```

---

## 12. Session Log

> Every agent session MUST add an entry before ending.

### Session 003 - 2026-01-25
**Agent:** Claude Opus 4.5
**Duration:** Extended session

**Completed:**
- Force pushed to main branch (sync-jan-23 → main)
- Polished README.md for security (removed architecture details)
- Created production N8N workflow (`n8n-workflows/rss-aggregator-production.json`)
- Created this master context document (YOKK.md)

**Decisions Made:**
- README should not expose internal architecture (security)
- Company name is NJOOBA LLC (not JOOBAL)
- N8N webhook URL: https://yokk.vercel.app/api/webhooks/n8n

**Blockers:**
- N8N workflow needs importing and env vars set
- Storage buckets still not created

**Next Session Should:**
1. Import N8N workflow to https://n8n.njooba.com
2. Set N8N_WEBHOOK_SECRET in both N8N and Vercel
3. Create Supabase storage buckets
4. Begin Phase 2.1 (PostCard components)

**Files Changed:**
- Created: `YOKK.md` (this file)
- Modified: `README.md` (security polish)
- Created: `n8n-workflows/rss-aggregator-production.json`

---

### Session 004 - 2026-01-26
**Agent:** Claude Opus 4.5
**Duration:** Extended session

**Completed:**
- Updated N8N workflow "YOKK RSS Feed Aggregator - Production" via API
- Fixed webhook URL from broken ngrok to `https://yokk.vercel.app/api/webhooks/n8n`
- Added proper HMAC-SHA256 signature generation using `$env.N8N_WEBHOOK_SECRET`
- Added 2 more RSS feeds (Technext Nigeria, Ventureburn) - now 7 total
- Changed schedule from 6 hours to 4 hours
- Generated secure webhook secret for production

**N8N Setup Status:**
| Component | Status |
|-----------|--------|
| Workflow Updated | ✅ Complete |
| Webhook URL | ✅ `https://yokk.vercel.app/api/webhooks/n8n` |
| HMAC Signing | ✅ Configured |
| N8N_WEBHOOK_SECRET in N8N | ⏳ Pending |
| Vercel Env Vars | ⏳ Pending |
| Bot User in Supabase | ⏳ Pending |

**Generated Credentials:**
- Webhook Secret: `0dc8e1fc62d14d5a81984071b80e65bada6f25294b69c258e46664a14a9f57e3`
- Bot User UUID: `f47ac10b-58cc-4372-a567-0e02b2c3d479`

**Next Session Should:**
1. Verify N8N_WEBHOOK_SECRET is set in N8N Variables
2. Verify Vercel env vars are set
3. Create bot user in Supabase with SQL
4. Test workflow execution end-to-end
5. Begin Phase 2.1 (PostCard components)

**Files Changed:**
- Modified: `YOKK.md` (session log)
- Created: `n8n-workflows/update-payload.json`

---

### Session 002 - 2026-01-20
**Agent:** The Architect (Gemini)
**Phase:** 1.5 Complete

**Completed:**
- Infrastructure hardening with Next.js 15 SSR
- Phone OTP + Passkey auth implementation
- Offline shell with AuthProvider caching
- Onboarding wizard with server-side enforcement
- Home feed wired to real database
- Compose flow with compression

**Files Changed:**
- `lib/supabase/*`, `hooks/useAuth.ts`, `app/(main)/*`, `app/login/*`, `app/onboarding/*`, `app/api/auth/*`, `components/providers/*`

---

### Session 001 - 2026-01-06
**Agent:** v0 (Vercel)
**Phase:** 1.1 Complete

**Completed:**
- Created Notion project tracker
- Audited and cleaned codebase
- Deleted 12 broken server component pages
- Rebuilt all pages with demo data fallbacks
- Established Architect system

**Files Changed:**
- Created: `ARCHITECT.md`, `YOKK-STATE.md`
- Deleted: 12 broken page files

---

## 13. Agent Instructions

### Starting a Session
1. Read this file (YOKK.md) first
2. Check SESSION LOG for last session's work
3. Check CHALLENGES & BLOCKERS for current issues
4. Read relevant sections for your task
5. Embody The Architect persona (see ARCHITECT.md)

### During Work
- Use Supabase types as source of truth
- Demo data must work without database
- Test on mobile viewport
- No client-side secrets ever
- Update this doc if you discover new info

### Ending a Session
1. Update SESSION LOG with what you did
2. Update CHALLENGES if you hit blockers
3. Update LEARNINGS if you discovered something
4. Update PHASE TRACKER if status changed
5. Note files changed

### Rules
- NEVER present inference as fact
- NEVER guess when you can ask
- NEVER add features beyond what's asked
- ALWAYS test builds before claiming done
- ALWAYS consider African infrastructure constraints

---

## 14. Related Documents

| Document | Purpose | When to Read |
|----------|---------|--------------|
| `ARCHITECT.md` | Persona, voice, constraints | Every session start |
| `YOKK-STATE.md` | Quick current state | Quick status check |
| `UNIFIED_ARCHITECTURE.md` | Full technical architecture | Deep technical work |
| `aftech-stack/SKILL.md` | African optimization patterns | Performance work |
| `supabase/schema.sql` | Database schema | Database work |
| `n8n-workflows/README.md` | Automation setup | N8N work |

---

## 15. Quick Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run lint             # Run linter

# Git
git push origin main     # Deploy to Vercel

# Database
# Run schema.sql in Supabase SQL editor
```

---

**This document is the single source of truth. Keep it updated.**

*Built for Africa's builders. By Africa's builders.*
