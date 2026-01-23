# GEMINI.md - Context & Instructions for AI Agents

## 🌍 Project Overview: YOKK

**YOKK** is an AI-native developer community platform built specifically for the African market. It combines features of **X (Twitter)**, **Bilibili**, **Truth Social**, and **Product Hunt**, integrated with a proprietary AI assistant named **Bo**.

### Core Philosophy: **BOBO**
- **B**uild: Own the stack.
- **O**wn: Data sovereignty.
- **B**ootstrap: Revenue-first.
- **O**perate: Self-sufficient infrastructure.

### Critical Constraints
1.  **Offline-First:** Users have intermittent connectivity. (PowerSync + SQLite).
2.  **Bandwidth-Aware:** Every byte counts. (Client-side compression, minimal payloads).
3.  **Latency-Tolerant:** Optimistic UI is mandatory.
4.  **Mobile-First:** Touch targets > 44px. Responsive design is not optional.

---

## 🏗️ Technical Architecture

- **Frontend:** Next.js 15 (App Router) with React Server Components.
- **Styling:** Tailwind CSS with "Sunset Over Dakar" design system.
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Edge Functions).
- **Offline Sync:** PowerSync (SQLite local sync) - *Implementation Pending*.
- **AI:** Vercel AI SDK -> OpenRouter -> Groq/Claude.
- **Type Safety:** TypeScript types synced 1:1 with Supabase SQL schema.

### Key Directories
- `app/`: Next.js App Router pages and layouts.
- `components/`: Reusable UI components (Glassmorphism style).
- `lib/supabase/`: Core infrastructure (Client, Server, Middleware, Types).
- `supabase/`: Database schema (`schema.sql`) and migrations.
- `aftech-stack/`: Architectural benchmarks and documentation.

---

## 🤖 The "Architect" Protocol (MANDATORY)

This project uses a **Persistent Persona** called "The Architect".
**Every session MUST begin by reading `ARCHITECT.md`.**

### Quick Start for Agents
1.  **Read `ARCHITECT.md`**: Understand your role and voice.
2.  **Read `YOKK-STATE.md`**: Check the current technical state and blockers.
3.  **Check `MIGRATION_LOG.md`**: See what was just changed.
4.  **Update Logs**: Before ending a session, you MUST update the Mutation Log in `ARCHITECT.md`.

---

## 🛠️ Development & Commands

### Setup & Run
```bash
npm install        # Install dependencies
npm run dev        # Start development server
npm run build      # Build for production
```

### Database & Types
The project relies on strict type synchronization.
```bash
# If schema.sql changes, you must update lib/supabase/types.ts manually
# or run the generation script (if configured).
# Currently: lib/supabase/types.ts is the Source of Truth for TypeScript.
```

### Verification
- **Health Check:** `app/api/system/health/route.ts`
- **Auth:** `lib/auth/african-auth.ts` (Handles Phone OTP & Passkeys)

---

## 🚧 Current Status (Session 002 Handoff)

**Phase 1 (Foundation) is COMPLETE.**
- **SSR:** Enabled via `@supabase/ssr`.
- **Auth:** Real Phone OTP + Passkeys implemented.
- **UI:** "Offline Shell" with `localStorage` caching active.
- **Feed:** Wired to real Supabase data.

**Immediate Technical Debt:**
1.  **Storage:** Supabase Storage buckets `posts` and `launches` do NOT exist. Uploads will fail.
2.  **PowerSync:** Not yet active. Offline mode is currently "Cache-Only".

**Next Priority:**
- Create Storage Buckets.
- Build Phase 3 (User Profiles).
