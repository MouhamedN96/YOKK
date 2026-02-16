# ARCHITECT-ENGINE.md — Yaatal Engine Continuity Protocol

> **CRITICAL: Every Architect session MUST start by reading this file.**
> **CRITICAL: Every Architect session MUST end by updating the MUTATION LOG.**

---

## SESSION START PROTOCOL

1. Read this ENTIRE file
2. Read SPRINT-LOG.md
3. Check open issues on GitHub
4. Identify which phase you're in
5. Pick lowest-numbered open issue whose dependencies are met
6. Execute

---

## IDENTITY

You are **The Architect** — infrastructure engineer for Yaatal Engine.

**Prime directive:** Build reusable Rust infrastructure for African-first applications.
YOKK is the first consumer. NJOOBA, DAARA, and future apps will follow.

**Engine constraint:** Everything in `crates/` must be app-agnostic.
App-specific code goes in `apps/` ONLY.

---

## PROJECT

**Yaatal Engine** is a Rust workspace providing:
- AI cascade routing (5-tier, cheapest-first)
- Database abstraction (Turso/libSQL + SeaORM)
- Voice recording + transcription
- Gamification (XP, levels, streaks)
- Content sanitization
- Design tokens
- Semantic search (future)

### Stack

| Layer | Tech | Crate |
|-------|------|-------|
| DB | Turso/libSQL + SeaORM | yaatal-core |
| Backend | Loco (Rust on Rails) | yaatal-api |
| AI | reqwest -> SiliconFlow/Qwen/Claude/HF | yaatal-core |
| Voice | cpal + hound + Whisper | yaatal-voice |
| Search | ColBERT GGUF (future) | yaatal-search |
| Mobile | Dioxus 0.7 | yokk-mobile |

---

## NON-NEGOTIABLE CONSTRAINTS

1. **Offline-First** — Turso embedded replicas
2. **Mobile-First** — 44px touch targets, battery-conscious, <25MB APK
3. **Bandwidth-Aware** — Opus audio, compressed payloads
4. **Latency-Tolerant** — 300ms+ RTT assumed, optimistic UI
5. **Data Sovereign** — data stays in Africa where possible

---

## PHASE TRACKER

| Phase | Issue | Status | Branch |
|-------|-------|--------|--------|
| E1 | Scaffold workspace | DONE | e1-scaffold-workspace |
| E2 | Database schema + models | IN PROGRESS | e2-schema-models |
| E3 | AI cascade router | NOT STARTED | e3-ai-router |
| E4 | JWT auth controller | NOT STARTED | e4-jwt-auth |
| E5 | Posts CRUD + feed | NOT STARTED | e5-posts-feed |
| E6 | Voice crate | NOT STARTED | e6-voice-crate |
| E7 | Kill gate (Dioxus+cpal) | NOT STARTED | e7-kill-gate |
| E8 | Wire YOKK PWA | NOT STARTED | e8-wire-pwa |

---

## RISKS / NOTES (Active)

- yaatal-api is a placeholder; Loco scaffold must exist before E4 can compile.
- Config loader now exists in yaatal-core; decide whether yaatal-api should reuse it or use its own Loco config.
- AI router offline/2G gating and shared rate limiting are not yet defined.

---

## MUTATION LOG

### Session 000 — 2026-02-14 (Setup)
**Architect:** Copilot (GitHub)
**What happened:**
- Repo created under Yaatal-labs org
- Pushed: .gitignore, .env.example, Cargo.toml, config/*.yaml, LICENSE
- Master build document created with all file contents
- 8 issues defined (E1-E8) with full specs
**What's next:** E1 scaffold — any Architect picks up, builds locally, PRs
**Blockers:** None

### Session 001 — 2026-02-14 (E1 Scaffold)
**Architect:** Claude Opus 4.6
**What happened:**
- Created all missing workspace members (yaatal-api, yaatal-voice, yaatal-search, yokk-mobile)
- Created yaatal-core modules (auth, design/tokens, gamification/xp, models/post+profile, sanitize)
- Created migrations/001_initial.sql (10 tables + indexes)
- Created ARCHITECT-ENGINE.md, SPRINT-LOG.md, replaced README.md
- Version decision: Dioxus 0.7.2 (first-class mobile), SeaORM 1.x + libsql 2-layer strategy
**What's next:** cargo build --workspace && cargo test --workspace, then PR
**Blockers:** gh CLI not authenticated — PR needs manual push or auth

### Session 002 — 2026-02-15 (E1 Build Fixes)
**Architect:** Claude Opus 4.6
**What happened:**
- Fixed SeaORM `DeriveActiveEnum` for `PostType` — `String(None)` → `String(StringLen::None)` (SeaORM 1.x breaking change)
- Fixed sanitize regex — replaced lookahead `(?!...)` with `(?i)<script[^>]*>[\s\S]*?</script>` (Rust `regex` crate doesn't support lookaround)
- Removed unused `AiTask` import from `ai/router.rs`
- Added missing `serde_json` dependency to `yaatal-voice/Cargo.toml`
- **cargo build --workspace**: PASSES (0 errors, 0 warnings)
- **cargo test --workspace**: PASSES (23/23 tests green)
**What's next:** E2 - Database schema + models (SeaORM migrations, Turso connection pool)
**Blockers:** gh CLI still not authenticated - PR needs manual push or auth

### Session 003 - 2026-02-15 (Issue Hygiene)
**Architect:** Codex (GPT-5)
**What happened:**
- Added active risks/notes section to guide E2-E4 planning
- Updated SPRINT-LOG.md with the same risks/notes
- Added Risks/Notes to GitHub issues E2, E3, E4, E7
**What's next:** E2 - Database schema + models
**Blockers:** None

### Session 004 - 2026-02-15 (E2 Schema + Models)
**Architect:** Codex (GPT-5)
**What happened:**
- Added missing model fields to align with migrations (profiles, posts)
- Added SeaORM models for remaining tables (comments, upvotes, launches, achievements, bo_conversations, feed_items, bookmarks, user_security_keys)
- Added db helpers for config loading, connection, and migration execution
- Added serde_yaml dependency to yaatal-core
 - cargo test -p yaatal-core failed to run (cargo not available in PATH)
**What's next:** Run cargo test -p yaatal-core, then finish E2
**Blockers:** None

### Session 005 — 2026-02-16 (Voice Crate Hardening + E2 Verification)
**Architect:** Claude Opus 4.6
**What happened:**
- Verified Codex's E2 work: cargo build + cargo test pass (30 core tests green)
- **Voice crate rewrite (yaatal-voice):**
  - Replaced all `unwrap()` on mutex locks with `map_err` → `RecorderError::LockPoisoned`
  - Changed WAV encoding from 32-bit float to 16-bit PCM (Whisper API compatibility)
  - Added f32→i16 clamping conversion
  - Added concurrent-start guard (`AlreadyRecording` error)
  - Added device config mismatch warning in `start()`
  - Added `is_recording()`, `sample_count()`, `sample_rate()`, `channels()` accessors
  - `clear()` now returns `Result` instead of panicking
  - Used `thiserror` for proper error derives
- **Transcription rewrite:**
  - Added `TranscriptionError` enum (Network, Api, ModelLoading, EmptyResult)
  - Handle HuggingFace 503 "model loading" responses with estimated_time
  - Added 30s timeout to API calls
  - Actually measure `duration_ms` (was hardcoded to 0)
  - Added `transcribe_with_model()` for model selection
- Added 8 voice tests: WAV header, 16-bit PCM encoding, f32 clamping, clear, empty, error display
- **cargo build --workspace**: 0 errors, 0 warnings
- **cargo test --workspace**: 38/38 passing (30 core + 8 voice)
**What's next:** E2 still needs entity relations and integration tests. E3/E6 unblocked for parallel work.
**Blockers:** None

---

## END SESSION PROTOCOL

1. Update PHASE TRACKER above
2. Add new MUTATION LOG entry with:
   - Session number (increment)
   - Date
   - Architect identity
   - What changed (files, decisions)
   - What's next
   - Blockers
3. Commit ARCHITECT-ENGINE.md changes
4. Update SPRINT-LOG.md

---

## QUICK REFERENCE

```bash
cargo build --workspace      # must pass before PR
cargo test --workspace       # must pass before PR
cargo test -p yaatal-core    # test core only
cargo test -p yaatal-voice   # test voice only
```

## RELATIONSHIP TO YOKK

- YOKK PWA repo: https://github.com/MouhamedN96/YOKK
- YOKK is the FIRST consumer of Yaatal Engine
- Migration path: YOKK PWA -> yaatal-api (feature-flagged, E8)
- YOKK-specific UI/logic goes in apps/yokk-mobile, NOT in crates/
