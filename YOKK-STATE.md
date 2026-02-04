# YOKK-STATE.md - Current System State

**Last Updated:** 2026-02-04
**Current Phase:** 2.2 (AI Integration) / 2.1 (Post Components) / 1.5 (Onboarding DONE)

## 🏗️ INFRASTRUCTURE
- **Framework:** Next.js 15 (App Router)
- **Data Layer:** Supabase SSR (@supabase/ssr) active.
- **Types:** `lib/supabase/types.ts` synced 1:1 with `schema.sql`.
- **Auth:** Real Supabase Auth (Phone OTP) + FIDO2/Passkey API routes.
- **Offline:** 
  - **Status:** Initialized (Shell Cache).
  - **Mechanism:** `localStorage` for Profile data.
  - **PowerSync:** Scaffolding exists, gracefully handles missing config.

## 📱 FEATURE STATUS
- [x] **Auth:** Functional (Email/Phone).
- [x] **Onboarding:** Functional (Username/Role/Interests).
- [x] **Feed:** Real Data (Reads from `posts` table).
- [x] **Compose:** Functional (Background compression + local drafts).
- [ ] **Profiles:** Demo data only.
- [x] **AI (Bo):** UI complete, Groq integration working.
- [ ] **AI (Bo):** HuggingFace integration PENDING (see docs/HUGGINGFACE_INTEGRATION_PLAN.md).

## 🔌 INTEGRATIONS STATUS
| Integration | Status | Env Var |
|-------------|--------|---------|
| Supabase | CONNECTED | `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_ANON_KEY` |
| Groq | CONNECTED | `GROQ_API_KEY` |
| HuggingFace | PARTIAL | `Huggingface_Yokk` (code uses different name) |
| Vercel Blob | CONNECTED | `BLOB_READ_WRITE_TOKEN` |
| Upstash Redis | CONNECTED | `KV_URL`, `REDIS_URL` |
| OpenRouter | NOT CONFIGURED | Missing `OPENROUTER_API_KEY` |
| PowerSync | OPTIONAL | Missing `NEXT_PUBLIC_POWERSYNC_URL` (offline mode works) |

## ⚠️ TECHNICAL DEBT / ACTION REQUIRED
1. **STORAGE:** Must create `posts` and `launches` public buckets in Supabase.
2. **SYNC:** Need to migrate from `localStorage` to `PowerSync` SQLite for true offline.
3. **PASSKEYS:** API Routes exist but require a live HTTPS domain for full WebAuthn verification.
4. **AI/HF:** HuggingFace provider uses wrong env var name (`HUGGINGFACE_API_KEY` vs `Huggingface_Yokk`).
5. **AI/HF:** Router defines HF tiers but doesn't route to them yet.

## 📋 PENDING PLANS
- **HuggingFace Integration:** See `docs/HUGGINGFACE_INTEGRATION_PLAN.md` (APPROVED - Option B)
  - Status: Ready for Phase 1 implementation
  - Approach: Issue-Driven Development
  - Models: `Qwen2.5-72B-Instruct` (primary), `Mistral-7B-Instruct-v0.2` (fallback)

## 🔗 RESOURCES
- **Main Log:** `MIGRATION_LOG.md`
- **Architect Mandate:** `ARCHITECT.md`
- **Tracker:** `YOKK Project Tracker 2e1b7dd11755812fb694c14fdaff539b.md`
- **HF Integration Plan:** `docs/HUGGINGFACE_INTEGRATION_PLAN.md`
