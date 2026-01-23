# YOKK-STATE.md - Current System State

**Last Updated:** 2026-01-20
**Current Phase:** 2.1 (Post Components) / 1.5 (Onboarding DONE)

## 🏗️ INFRASTRUCTURE
- **Framework:** Next.js 15 (App Router)
- **Data Layer:** Supabase SSR (@supabase/ssr) active.
- **Types:** `lib/supabase/types.ts` synced 1:1 with `schema.sql`.
- **Auth:** Real Supabase Auth (Phone OTP) + FIDO2/Passkey API routes.
- **Offline:** 
  - **Status:** Initialized (Shell Cache).
  - **Mechanism:** `localStorage` for Profile data.
  - **PowerSync:** Scaffolding exists, not yet active.

## 📱 FEATURE STATUS
- [x] **Auth:** Functional (Email/Phone).
- [x] **Onboarding:** Functional (Username/Role/Interests).
- [x] **Feed:** Real Data (Reads from `posts` table).
- [x] **Compose:** Functional (Background compression + local drafts).
- [ ] **Profiles:** Demo data only.
- [ ] **AI (Bo):** Prototype UI, routing logic partial.

## ⚠️ TECHNICAL DEBT / ACTION REQUIRED
1. **STORAGE:** Must create `posts` and `launches` public buckets in Supabase.
2. **SYNC:** Need to migrate from `localStorage` to `PowerSync` SQLite for true offline.
3. **PASSKEYS:** API Routes exist but require a live HTTPS domain (or localhost tweak) for full WebAuthn verification.

## 🔗 RESOURCES
- **Main Log:** `MIGRATION_LOG.md`
- **Architect Mandate:** `ARCHITECT.md`
- **Tracker:** `YOKK Project Tracker 2e1b7dd11755812fb694c14fdaff539b.md`
