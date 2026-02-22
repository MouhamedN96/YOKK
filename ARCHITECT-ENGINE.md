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
| E2 | Database schema + models | DONE | e2-schema-models |
| E3 | AI cascade router | DONE | e3-ai-router |
| E4 | JWT auth controller (Loco) | DONE | e4-jwt-auth |
| E5 | Posts CRUD + feed | IN PROGRESS | e5-posts-feed |
| E6 | Voice crate | NOT STARTED | e6-voice-crate |
| E7 | Kill gate (Dioxus+cpal) | NOT STARTED | e7-kill-gate |
| E8 | Wire YOKK PWA | NOT STARTED | e8-wire-pwa |

---

## RISKS / NOTES (Active)

- ~~yaatal-api is a placeholder~~ → RESOLVED: Loco SaaS scaffold in place (Session 014)
- ~~AI router offline/2G gating and shared rate limiting are not yet defined~~ → RESOLVED: E3 complete (Session 013)
- Config: yaatal-api uses Loco's own config (`config/development.yaml`); yaatal-core retains its own config loader. Both coexist — Loco manages server/auth/DB, yaatal-core manages AI keys.
- Loco users table vs yaatal-core profiles: dual-table strategy decided. Loco owns `users` (auth), yaatal-core owns `profiles` (domain). Link via `user_id → users.id` migration needed (E5 scope).
- Production DB: Loco uses `sqlx-sqlite` for dev. Turso production adapter is E8 scope.

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

### Session 006 - 2026-02-16 (Rebase Cleanup + Handoff)
**Architect:** Codex (GPT-5)
**What happened:**
- Found in-progress rebase on e1-scaffold-workspace with conflicts
- Created safety branch backup/rebase-wip
- Aborted rebase and returned to e1-scaffold-workspace
**What's next:** Decide whether to merge or rebase origin/e1-scaffold-workspace into local (ahead 7, behind 2), then resume E3 or finish E2 cleanup
**Blockers:** None

### Session 007 - 2026-02-19 (Skills + CI Workflow Alignment)
**Architect:** Codex (GPT-5)
**What happened:**
- Added model-agnostic skills governance docs and references:
  - `AGENTS.md`, `CLAUDE.md`, `CODEX.md`, `architect.md`
  - `skills/manifest.yaml`, `skills/rust-e2e-ai-agent/SKILL.md`, `skills/README.md`
- Added skills validation automation:
  - `scripts/validate-skills-manifest.ps1`
  - `scripts/validate-skill-docs.ps1`
  - `.github/workflows/validate-skills-manifest.yml`
  - `.github/workflows/validate-skill-docs.yml`
- Added Rust CI workflow:
  - `.github/workflows/rust-ci.yml` (`fmt`, `check`, `clippy`, `test`)
- Added implementation docs:
  - `docs/agent-usage.md`
  - `docs/dev-workflow-status.md`
  - updated `README.md` local skills + troubleshooting section
- Verification:
  - Skills validators pass
  - `cargo fmt --all` applied successfully
  - `cargo fmt --all --check` passes
  - `cargo check`, `cargo clippy`, `cargo test` blocked by missing native C compiler required by `libsql-ffi`
**What's next:** Install native C build tooling on local dev machine/runner, then rerun `cargo check --workspace`, `cargo clippy --workspace --all-targets -- -D warnings`, and `cargo test --workspace`
**Blockers:** Local environment missing compiler toolchain for `libsql-ffi` build script

### Session 008 - 2026-02-19 (Windows Build Remediation + Gate Verification)
**Architect:** Codex (GPT-5)
**What happened:**
- Verified MSVC toolchain availability (`cl.exe`) via Visual Studio Build Tools developer shell
- Diagnosed OneDrive path issue causing non-writable cargo build output directories
- Diagnosed `libsql-ffi` Windows build-script requirement for `cp` command
- Ran workspace gates with Windows-safe environment:
  - `CARGO_HOME` and `CARGO_TARGET_DIR` moved to `%TEMP%`
  - `cargo check --workspace`: PASS
  - `cargo clippy --workspace --all-targets -- -D warnings`: PASS
  - `cargo test --workspace`: PASS (37 tests)
- Fixed clippy failure in `crates/yaatal-core/src/design/tokens.rs` by replacing runtime constant assertion test with a const assertion
- Updated `README.md` and `docs/dev-workflow-status.md` with final Windows troubleshooting guidance
**What's next:** Keep E2 in progress and continue entity relations/integration test work
**Blockers:** None (local gate verification succeeded with documented Windows setup)

### Session 009 - 2026-02-20 (ColBERT Zero-Shot + Python Sidecar)
**Architect:** Codex (GPT-5)
**What happened:**
- Implemented `yaatal-search` zero-shot retrieval evaluation scaffold:
  - `crates/yaatal-search/src/zero_shot.rs`
  - Metrics: `MRR@k`, `Recall@k`, `nDCG@k`
  - Added unit tests for perfect/partial/invalid cases
- Added Python sidecar integration for ColBERT retrieval:
  - `scripts/colbert_sidecar.py` (`/health`, `/index`, `/search`)
  - `crates/yaatal-search/src/python_sidecar.rs` (`ColbertHttpRetriever`)
  - Exported modules from `crates/yaatal-search/src/lib.rs`
- Updated search crate dependencies for HTTP integration:
  - `crates/yaatal-search/Cargo.toml` (`reqwest` blocking + `serde_json`)
- Added deployment and retrieval docs:
  - `docs/colbert-zero-shot.md`
  - `docs/unsloth-on-device-deployment.md`
  - updated `README.md` docs references
- Verification:
  - `python -m py_compile scripts/colbert_sidecar.py`: PASS
  - `cargo fmt --all --check`: PASS
  - `cargo clippy -p yaatal-search --all-targets -- -D warnings`: PASS
  - `cargo test -p yaatal-search --offline`: PASS (3 tests)
  - Workspace gates still blocked by local `libsql-ffi` build-script `cp` dependency in PATH
**What's next:** Plug real labeled Yaatal retrieval dataset into sidecar-backed baseline runs; decide serving strategy for ColBERT in app environments
**Blockers:** Full workspace verification blocked by missing `cp` command required by `libsql-ffi` build script

### Session 010 - 2026-02-21 (WAXAL + Trilingual Retrieval Experiments, Notebook Handoff)
**Architect:** Codex (GPT-5)
**What happened:**
- Installed and used Hugging Face workflow skills for dataset querying, trainer workflow guidance, and metric tracking:
  - `hugging-face-datasets`
  - `hugging-face-model-trainer`
  - `hugging-face-trackio`
- Added runnable experiment scripts:
  - `scripts/run_lfm_colbert_waxal.py` (WAXAL zero-shot + optional fine-tune + post-eval)
  - `scripts/run_lfm_colbert_fr_en_wo_iterations.py` (FR/EN/WO + mixed-query zero-shot iterations)
  - `scripts/build_trilingual_synthetic_corpus.py` (HF trilingual corpus + synthetic code-switch pairs)
- Added code-switch evaluation mode to WAXAL run path (`plain`, `codeswitch`, `both`).
- Executed WAXAL run artifacts and metrics:
  - `artifacts/lfm_colbert_waxal/run-20260221-052711/metrics.json`
  - Codeswitch slice improved slightly post-finetune (`dMRR +0.0100`, `dnDCG +0.0077`) while plain slice regressed.
- Executed trilingual zero-shot iteration run:
  - `artifacts/lfm_colbert_fr_en_wo/run-20260221-054839/metrics.json`
  - Strong Wolof/mix retrieval and weak English/French retrieval against Wolof-indexed docs.
- Built reusable corpus from HF trilingual source + synthetic mixed queries:
  - `data/corpus/fr_en_wo_v1/manifest.json` (`2000` docs, `8000` query/doc pairs).
- Added visual/report assets for handoff:
  - `artifacts/reports/lfm_colbert_summary.html`
  - `notebooks/lfm_colbert_test_results.ipynb`
- Updated Unsloth-facing Liquid ColBERT notebook with WAXAL + trilingual evaluation flow and optional quick fine-tune cell:
  - `notebooks/nb/💧_LFM2_ColBERT_350M_Inference.ipynb`
**What's next:**
- Replace synthetic code-switch query generation with real production code-switched user query samples.
- Add hard-negative mining for EN/FR -> WO retrieval alignment in fine-tune batches.
- Run full Unsloth GPU notebook training loop externally (local GPU VRAM is insufficient for stable fine-tune path).
**Blockers:**
- Local Python 3.13 + `pylate` compatibility constraints required Python 3.12 runtime for experiments.
- Local Unsloth run path needs CUDA-enabled torch wheel profile; local checks defaulted to CPU torch in this environment.

### Session 011 - 2026-02-21 (E2 Assignable Closeout Brief + Scope Queue)
**Architect:** Codex (GPT-5)
**What happened:**
- Added execution-ready E2 handoff brief:
  - `docs/architect-e2-closeout-brief.md`
- Captured exact E2 closure scope:
  - SeaORM relation wiring targets by model file
  - Required integration tests (migrations, FK enforcement, uniqueness, relation queries)
  - Definition-of-done and verification gates
- Captured full-project continuation queue (E3-E8) and parallel retrieval track context.
**What's next:**
- Execute `docs/architect-e2-closeout-brief.md` to complete E2 in code, then move to E3.
**Blockers:**
- None

### Session 012 - 2026-02-21 (E2 Relations + Integration Tests Completed)
**Architect:** Codex (GPT-5)
**What happened:**
- Implemented SeaORM relations for all FK-backed models:
  - `crates/yaatal-core/src/models/profile.rs`
  - `crates/yaatal-core/src/models/post.rs`
  - `crates/yaatal-core/src/models/comments.rs`
  - `crates/yaatal-core/src/models/upvotes.rs`
  - `crates/yaatal-core/src/models/launches.rs`
  - `crates/yaatal-core/src/models/achievements.rs`
  - `crates/yaatal-core/src/models/bo_conversations.rs`
  - `crates/yaatal-core/src/models/bookmarks.rs`
  - `crates/yaatal-core/src/models/user_security_keys.rs`
  - `crates/yaatal-core/src/models/feed_items.rs` (explicit note retained: no FK)
- Added integration coverage for E2 schema behaviors:
  - `crates/yaatal-core/tests/e2_schema_relations.rs`
  - Covers migration table existence, FK enforcement, uniqueness constraints, and relation/join query paths.
- Verification:
  - `cargo fmt --all --check`: PASS
  - `cargo clippy --workspace --all-targets -- -D warnings`: PASS
  - `cargo test --workspace`: PASS
- Added doc discoverability link:
  - `README.md` now references `docs/architect-e2-closeout-brief.md`
**What's next:**
- Start E3 (AI cascade router hardening): define offline/2G gating and shared rate-limit behavior, then add deterministic fallback tests.
**Blockers:**
- None

### Session 013 - 2026-02-21 (E3 AI Cascade Router Hardening)
**Architect:** Claude (Anthropic)
**What happened:**
- Added `network.rs`: `NetworkCondition` enum (`Offline`, `TwoG`, `ThreeG`, `FourGPlus`) with `Ord` comparison, `NetworkGate` trait (injectable for testing), `DefaultNetworkGate` (always `FourGPlus`)
- Added `rate_limit.rs`: Token-bucket `RateLimiter` + `RateLimiterPool` (per-provider, pure `std`, no external deps)
- Rewrote `router.rs` — data-driven architecture:
  - `TierConfig` struct + `DEFAULT_TIERS` const array replaces hardcoded match arms
  - 5 tiers: T1 on-device placeholder, T2 SiliconFlow/LFM2, T3 SiliconFlow/Qwen, T4 OpenRouter/Claude (NEW), T5 HuggingFace/Mistral
  - Offline/2G gating: tiers skipped when `network < tier.min_network`
  - Sensitivity routing: sensitive queries skip `sensitive_capable == false` tiers
  - Rate limiting: `RateLimiterPool` check before each HTTP call
  - Real latency: `Instant::now()` measurement replaces hardcoded `0`
  - Constructor returns `Result` instead of `expect()`
  - `AiRouter::with_options()` for test injection of `NetworkGate`
- Updated `mod.rs`: exports `network` + `rate_limit` modules
- Updated `lib.rs`: re-exports `NetworkCondition`, `NetworkGate`, `RateLimiterPool`
- Added `tests/e3_ai_router.rs` — 10 deterministic integration tests (zero network calls):
  - `route_offline_returns_tier1_only`, `route_2g_returns_tier1_only`
  - `route_sensitive_skips_non_capable_tiers`, `route_non_sensitive_uses_tier1`
  - `route_all_tiers_exhausted_when_no_keys`, `route_latency_is_populated`
  - `constructor_returns_result`, `classify_default_is_chat`
  - `network_condition_ordering`, `rate_limiter_pool_basics`
- Verification:
  - `cargo fmt --all --check`: PASS
  - `cargo clippy -p yaatal-core --all-targets -- -D warnings`: PASS (0 warnings)
  - `cargo test -p yaatal-core`: PASS (all existing + 10 new E3 tests)
**What's next:**
- E4 (JWT auth controller): scaffold Loco in `yaatal-api`, add JWT middleware
**Blockers:**
- None

### Session 014 — 2026-02-21 (E4 JWT Auth / Loco SaaS Scaffold)
**Architect:** Antigravity (Google DeepMind)
**What happened:**
- Researched Loco framework documentation: starters, JWT auth middleware, testing patterns, asset serving options
- Installed Loco CLI v0.16.3 (`cargo install loco`)
- User ran `loco new` interactively (SaaS starter, SQLite, Async workers, no asset serving) → scaffolded into `crates/yaatal-api`
- Integrated Loco into workspace:
  - Removed standalone `[workspace]` from generated `Cargo.toml`
  - Added `version.workspace = true`, `edition.workspace = true`, `license.workspace = true`
  - Added `yaatal-core` as dependency
  - Added `loco-rs = { version = "0.16" }` to workspace root deps
- Fixed `include_dir!` paths with `$CARGO_MANIFEST_DIR` prefix (required for workspace builds)
- Configured JWT auth in `config/development.yaml`:
  - Env-var secret (`JWT_SECRET` with dev default)
  - 72h expiry (African latency aware)
  - Bearer + Cookie (`yaatal_token`) fallback chain
- Auth endpoints out of the box: register, login, verify, forgot/reset password, magic link, current user, resend verification
- Full Loco module structure: `app.rs`, `controllers/auth.rs`, `models/users.rs`, `views/auth.rs`, `mailers/auth.rs`, `workers/downloader.rs`, `tasks/`, `fixtures/users.yaml`
- Verification:
  - `cargo check --workspace`: PASS
  - `cargo clippy -p yaatal-api --all-targets`: PASS (clean)
  - `cargo test -p yaatal-core`: PASS (40/40 — no regressions)
**What's next:**
- E5 (Posts CRUD + feed): use Loco scaffold generators (`cargo loco generate scaffold`) for post/comment CRUD, wire gamification XP hooks
- Link users ↔ profiles migration (add `user_id` FK to profiles table)
**Blockers:**
- None

### Session 015 — 2026-02-21 (E5 Feed Pipeline Genericization)
**Architect:** Antigravity (Google DeepMind)
**What happened:**
- Extracted and integrated `yaatal-feed` (based on X-algorithm) into workspace
- Genericized core pipeline to be app-agnostic (removed YOKK-specific types)
- Renamed `VoicePostCandidate` to `FeedCandidate`
- Renamed `YokkFeedQuery` to `FeedQuery`
- Introduced extensible `ContentType` (Voice, Text, ProductListing, CourseModule) to support Social Commerce (NJOOBA, DAARA)
- Extracted hardcoded weights into configurable `WeightConfig` for multi-app setups
- Refactored filters and scorers to use new generic types
- Documented remaining compilation errors for handoff
**What's next:**
- Fix remaining compile errors (`post_id` -> `id` mismatches, trait constraint issues in `builder.rs`, `MAX_POST_AGE_HOURS` config)
- Add Loco scaffolds for Post/Comment CRUD operations
**Blockers:**
- Residual field/trait mismatches in the newly genericized `yaatal-feed` crate (needs manual fixing before it compiles cleanly)

### Session 016 — 2026-02-22 (E5 Feed Compile Unblock + Offline Verification)
**Architect:** Codex (GPT-5)
**What happened:**
- Resolved `yaatal-feed` compile blockers introduced during E5 genericization:
  - Replaced stale `post_id` field usage with canonical `id` in filters:
    - `crates/yaatal-feed/src/filters/dedup_filter.rs`
    - `crates/yaatal-feed/src/filters/seen_posts_filter.rs`
  - Added missing selector constructor:
    - `crates/yaatal-feed/src/selectors/mod.rs` (`TopKSelector::new`)
  - Removed stale constant dependency and made age filtering config-driven:
    - `crates/yaatal-feed/src/filters/age_filter.rs`
    - `crates/yaatal-feed/src/builder.rs` (passes `config.max_post_age_hours`)
- Verification (local, offline):
  - `cargo test -p yaatal-feed --offline`: PASS (3 tests)
  - `cargo test -p yaatal-core --offline`: PASS
  - `cargo test -p yaatal-search --offline`: PASS
  - `cargo check --workspace --offline`: blocked at `libsql-ffi` build script (`cp` program not found in current shell)
**What's next:**
- Continue E5 by wiring Post/Comment CRUD scaffolds in `yaatal-api` and linking users↔profiles (`user_id` FK migration path).
- Run full workspace gates from a shell with real GNU `cp` and native C toolchain (`cl.exe`) available.
**Blockers:**
- Environment/toolchain blocker for workspace-level checks in this shell: `libsql-ffi` requires external `cp` binary (PowerShell alias is insufficient).

### Session 017 — 2026-02-22 (E5 API Auth Stabilization + Handoff Branching)
**Architect:** Codex (GPT-5)
**What happened:**
- Organized continuation branches for scoped E5 work:
  - `organized/e5-feed` (feed-only testable slice)
  - `organized/e5-api-auth` (Loco auth slice)
- Diagnosed auth request-test failures (HTTP 500 during register path) to missing Loco template extension variants.
- Added `.t` template files expected by Loco mailer lookup:
  - `crates/yaatal-api/src/mailers/auth/welcome/{subject.t,html.t,text.t}`
  - `crates/yaatal-api/src/mailers/auth/forgot/{subject.t,html.t,text.t}`
  - `crates/yaatal-api/src/mailers/auth/magic_link/{subject.t,html.t,text.t}`
- Committed fix on `organized/e5-api-auth`:
  - `e22b5e4 api/auth: add .t mail templates for loco mailer compatibility`
- Verification (stage/auth scope):
  - `cargo test -p yaatal-api --tests --offline`: PASS (`23 passed, 0 failed`)
**What's next:**
- Cherry-pick `e22b5e4` into primary E5 integration branch (`e5-posts-feed`) or merge `organized/e5-api-auth`.
- Continue E5 API scope: scaffold Post/Comment CRUD and add `profiles.user_id -> users.id` migration + relation wiring.
- Re-run workspace gates once online registry/toolchain environment is stable (`check`, `clippy`, `test`).
**Blockers:**
- No code blocker in auth scope after template fix.
- Environment remains sensitive to offline Cargo cache integrity and crates.io connectivity in restricted shells.

### Session 018 — 2026-02-22 (E5 Post/Comment CRUD + Users↔Profiles Link)
**Architect:** Antigravity (DeepMind)
**What happened:**
- Created 3 Loco SeaORM migrations:
  - `m20260222_000001_add_user_id_to_profiles`: adds `user_id` UUID column + unique index to `profiles`
  - `m20260222_000002_create_posts`: creates `posts` table matching `001_initial.sql` with FKs and indexes
  - `m20260222_000003_create_comments`: creates `comments` table with FKs to posts, profiles, and self-referential parent
- Added `user_id: Option<String>` field to `crates/yaatal-core/src/models/profile.rs`
- Created `crates/yaatal-api/src/services/xp_service.rs`: wraps `yaatal_core::gamification::xp` for DB-persisted XP awards
- Created `crates/yaatal-api/src/controllers/posts.rs`: full CRUD (create/list/show/update/delete) with JWT auth, author-only guards, pagination, XP integration (+25 PostArticle)
- Created `crates/yaatal-api/src/controllers/comments.rs`: CRUD (create/list/delete) nested under posts, JWT auth, XP integration (+10 Comment)
- Created view structs: `views/posts.rs`, `views/comments.rs`
- Wired modules in `lib.rs`, `controllers/mod.rs`, `views/mod.rs`
- Registered routes in `app.rs`
- Verification:
  - `cargo check -p yaatal-api`: PASS
  - `cargo check --workspace`: PASS
**What's next:**
- Run `cargo clippy --workspace` and `cargo test -p yaatal-api` for full verification
- Proceed with E6 (Voice Crate Wiring) or E7 (Kill Gate)
**Blockers:**
- None — workspace compiles cleanly
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
