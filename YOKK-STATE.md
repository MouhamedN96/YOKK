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
| Integration | Status | Env Var | Code Status |
|-------------|--------|---------|-------------|
| Supabase | CONNECTED | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Working |
| Groq | CONNECTED | `GROQ_API_KEY` | Working (primary AI) |
| HuggingFace | ENV READY | `Huggingface_Yokk` | Code uses wrong var name |
| Vercel Blob | CONNECTED | `BLOB_READ_WRITE_TOKEN` | Working |
| Upstash Redis | CONNECTED | `KV_URL`, `REDIS_URL` | Working |
| Vercel AI Gateway | CONNECTED | Auto-configured | Available |
| OpenRouter | NO API KEY | Missing `OPENROUTER_API_KEY` | Premium tier disabled |
| PowerSync | NO CONFIG | Missing `NEXT_PUBLIC_POWERSYNC_URL` | Graceful fallback |
| N8N | CONFIGURED | `N8N_WEBHOOK_SECRET`, `N8N_BOT_USER_ID` | Ready |

## ⚠️ TECHNICAL DEBT / ACTION REQUIRED

### HIGH Priority
1. **AI/HF Env Var:** `lib/ai/huggingface-provider.ts` line 4 uses `HUGGINGFACE_API_KEY` - should be `Huggingface_Yokk`
2. **AI/HF Models:** Config references models not on free API (`Qwen3-Omni-30B`, `LFM2-Audio-1.5B`)
3. **AI/HF Routing:** `hybrid-router.ts` imports HF but never calls it - `tier2-hf-qwen` falls through to Groq

### MEDIUM Priority
4. **STORAGE:** Must create `posts` and `launches` public buckets in Supabase.
5. **PASSKEYS:** API Routes exist but require HTTPS domain for WebAuthn.

### LOW Priority
6. **SYNC:** Migrate from `localStorage` to `PowerSync` SQLite for true offline.
7. **OpenRouter:** Add API key to enable Claude premium tier.

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
