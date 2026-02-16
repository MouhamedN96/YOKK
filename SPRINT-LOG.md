# SPRINT LOG — Yaatal Engine

## Day 0 — 2026-02-14 (Setup)
**Goal:** Scaffold workspace, create issues, establish SSOT
**Completed:**
- [x] Repo created under Yaatal-labs org
- [x] Root files pushed (.gitignore, .env.example, Cargo.toml, configs)
- [x] Master build document created
- [x] Issues E1-E8 defined

## Day 1 — 2026-02-14 (E1 SCAFFOLD)
**Goal:** E1 scaffold + start E7 kill gate
**Status:** IN PROGRESS
**Completed:**
- [x] All workspace crates created (yaatal-core, yaatal-api, yaatal-voice, yaatal-search, yokk-mobile)
- [x] yaatal-core modules: ai, auth, design, gamification, models, sanitize
- [x] migrations/001_initial.sql — 10 tables + indexes
- [x] ARCHITECT-ENGINE.md + SPRINT-LOG.md
- [x] Version decisions: Dioxus 0.7.2, SeaORM 1.x + libsql 2-layer
**Pending:**
- [x] cargo build --workspace passes
- [x] cargo test --workspace passes (23/23)
- [ ] PR opened and merged
**Decision:** E1 scaffold complete. Build and tests green. PR blocked on gh CLI auth.

## Day 2 — 2026-02-15 (E1 Build Fixes)
**Goal:** Get E1 builds and tests passing
**Status:** DONE
**Completed:**
- [x] Fixed SeaORM DeriveActiveEnum (String(None) → String(StringLen::None))
- [x] Fixed sanitize regex (lookahead → simple pattern)
- [x] Added missing serde_json dep to yaatal-voice
- [x] Removed unused AiTask import
- [x] cargo build --workspace passes (0 errors)
- [x] cargo test --workspace passes (23/23 green)
**Pending:**
- [ ] PR opened and merged (gh CLI auth blocker)

## Risks / Notes (Active)
- yaatal-api is a placeholder; Loco scaffold must exist before E4 can compile.
- Config loader now exists in yaatal-core; decide whether yaatal-api should reuse it or use its own Loco config.
- AI router offline/2G gating and shared rate limiting are not yet defined.

## Day 3 - 2026-02-15 (E2 Schema + Models)
**Goal:** Align models with migrations and add db helpers
**Status:** IN PROGRESS
**Completed:**
- [x] Added missing fields to profile and post models
- [x] Added SeaORM models for remaining tables in 001_initial.sql
- [x] Added db helpers for config loading, connection, and migrations
- [x] Added serde_yaml dependency to yaatal-core
**Pending:**
- [x] cargo test -p yaatal-core — verified in Session 005 (30 tests green)

## Day 4 — 2026-02-16 (Voice Crate Hardening)
**Goal:** Review and harden yaatal-voice for production safety
**Status:** DONE
**Completed:**
- [x] Verified Codex's E2 work: cargo build + cargo test pass (30 core tests green)
- [x] Voice recorder rewrite: replaced all unwrap() with proper error handling (RecorderError enum via thiserror)
- [x] WAV encoding: changed from 32-bit float to 16-bit PCM (Whisper API compatibility)
- [x] Added f32→i16 clamping conversion
- [x] Added concurrent-start guard (AlreadyRecording error)
- [x] Added device config mismatch warning
- [x] Added accessors: is_recording(), sample_count(), sample_rate(), channels()
- [x] Transcription rewrite: TranscriptionError enum (Network, Api, ModelLoading, EmptyResult)
- [x] Handle HuggingFace 503 "model loading" responses with estimated_time
- [x] Added 30s timeout to API calls
- [x] Fixed duration_ms (was hardcoded to 0)
- [x] Added transcribe_with_model() for model selection
- [x] Added 8 voice tests: WAV header, 16-bit PCM, f32 clamping, clear, empty, error display
- [x] cargo build --workspace: 0 errors, 0 warnings
- [x] cargo test --workspace: 38/38 passing (30 core + 8 voice)
