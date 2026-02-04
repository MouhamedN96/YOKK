# YOKK-STATE.md - Current System State

**Last Updated:** 2026-02-04
**Current Phase:** 2.2 (AI Integration COMPLETE) / 2.1 (Post Components) / 1.5 (Onboarding DONE)

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
- [x] **AI (Bo):** HuggingFace integration COMPLETE (Qwen 2.5 72B + Mistral 7B).

## 🔌 INTEGRATIONS STATUS
| Integration | Status | Env Var | Code Status |
|-------------|--------|---------|-------------|
| Supabase | CONNECTED | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Working |
| Groq | CONNECTED | `GROQ_API_KEY` | Working (cloud fallback) |
| HuggingFace | CONNECTED | `Huggingface_Yokk` | Working (primary AI) |
| Vercel Blob | CONNECTED | `BLOB_READ_WRITE_TOKEN` | Working |
| Upstash Redis | CONNECTED | `KV_URL`, `REDIS_URL` | Working |
| Vercel AI Gateway | CONNECTED | Auto-configured | Available |
| OpenRouter | NO API KEY | Missing `OPENROUTER_API_KEY` | Premium tier disabled |
| PowerSync | NO CONFIG | Missing `NEXT_PUBLIC_POWERSYNC_URL` | Graceful fallback |
| N8N | CONFIGURED | `N8N_WEBHOOK_SECRET`, `N8N_BOT_USER_ID` | Ready |

## ⚠️ TECHNICAL DEBT / ACTION REQUIRED

### RESOLVED (Session 005)
- ~~AI/HF Env Var~~ - Fixed: Uses `Huggingface_Yokk`
- ~~AI/HF Models~~ - Fixed: Uses `Qwen2.5-72B-Instruct` and `Mistral-7B-Instruct-v0.2`
- ~~AI/HF Routing~~ - Fixed: `tier2-hf-qwen` and `tier3-hf-audio` route to HuggingFace

### MEDIUM Priority
1. **STORAGE:** Must create `posts` and `launches` public buckets in Supabase.
2. **PASSKEYS:** API Routes exist but require HTTPS domain for WebAuthn.

### LOW Priority
3. **SYNC:** Migrate from `localStorage` to `PowerSync` SQLite for true offline.
4. **OpenRouter:** Add API key to enable Claude premium tier.

## 📋 COMPLETED PLANS
- **HuggingFace Integration:** COMPLETE (Session 005)
  - Models: `Qwen/Qwen2.5-72B-Instruct` (primary), `mistralai/Mistral-7B-Instruct-v0.2` (fallback)
  - Test endpoint: `/api/test/hf`
  - See `docs/HUGGINGFACE_INTEGRATION_PLAN.md` for details

## 🔗 RESOURCES
- **Main Log:** `MIGRATION_LOG.md`
- **Architect Mandate:** `ARCHITECT.md`
- **Tracker:** `YOKK Project Tracker 2e1b7dd11755812fb694c14fdaff539b.md`
- **HF Integration Plan:** `docs/HUGGINGFACE_INTEGRATION_PLAN.md`
