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
