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

## Day 5 - 2026-02-16 (Rebase Cleanup + Handoff)
**Goal:** Preserve work and return to clean branch state
**Status:** DONE
**Completed:**
- [x] Created safety branch backup/rebase-wip
- [x] Aborted in-progress rebase on e1-scaffold-workspace
- [x] Returned to e1-scaffold-workspace
**Pending:**
- [ ] Decide merge vs rebase to sync origin/e1-scaffold-workspace (ahead 7, behind 2)

## Day 6 - 2026-02-19 (Skills + Rust CI Hardening)
**Goal:** Align repository workflow with local model-agnostic skills system and enforce Rust gates in CI
**Status:** DONE
**Completed:**
- [x] Added local skill registry and canonical agent entry docs (`skills/`, `AGENTS.md`, `CLAUDE.md`, `CODEX.md`)
- [x] Added skills path validator (`scripts/validate-skills-manifest.ps1`) and CI workflow
- [x] Added skill document schema validator (`scripts/validate-skill-docs.ps1`) and CI workflow
- [x] Added Rust CI workflow (`.github/workflows/rust-ci.yml`) with `fmt`, `check`, `clippy`, `test`
- [x] Added docs: `docs/agent-usage.md`, `docs/dev-workflow-status.md`
- [x] Ran local validators successfully
- [x] Applied formatting (`cargo fmt --all`) and confirmed `cargo fmt --all --check` passes
- [x] Installed and validated MSVC toolchain availability
- [x] Ran and passed `cargo check --workspace` (with temp Cargo dirs outside OneDrive)
- [x] Ran and passed `cargo clippy --workspace --all-targets -- -D warnings`
- [x] Ran and passed `cargo test --workspace` (37 tests)
- [x] Documented Windows caveats (`OneDrive` writable target paths + `cp` requirement in `libsql-ffi`)
**Pending:**
- [ ] Continue E2 entity relations/integration test work
**Blockers:**
- None

## Day 7 - 2026-02-20 (ColBERT Zero-Shot Baseline + Sidecar)
**Goal:** Move `yaatal-search` from placeholder to executable zero-shot retrieval baseline
**Status:** DONE
**Completed:**
- [x] Added zero-shot retrieval scaffold in `crates/yaatal-search/src/zero_shot.rs` with `MRR@k`, `Recall@k`, `nDCG@k`
- [x] Added retrieval backend contract (`Retriever`) and baseline evaluator (`evaluate_zero_shot`)
- [x] Added Python ColBERT sidecar in `scripts/colbert_sidecar.py` (`/health`, `/index`, `/search`)
- [x] Added Rust HTTP adapter `ColbertHttpRetriever` in `crates/yaatal-search/src/python_sidecar.rs`
- [x] Updated `crates/yaatal-search/Cargo.toml` for blocking `reqwest` + `serde_json`
- [x] Added docs:
  - `docs/colbert-zero-shot.md`
  - `docs/unsloth-on-device-deployment.md`
  - `README.md` docs links
- [x] Verification:
  - `python -m py_compile scripts/colbert_sidecar.py` passes
  - `cargo fmt --all --check` passes
  - `cargo clippy -p yaatal-search --all-targets -- -D warnings` passes
  - `cargo test -p yaatal-search --offline` passes (3 tests)
**Pending:**
- [ ] Run full workspace gates once `libsql-ffi` `cp` build dependency is available in PATH
- [ ] Execute baseline metrics on real Yaatal labeled retrieval dataset
**Blockers:**
- Workspace `clippy/test` blocked by missing `cp` command required by `libsql-ffi` build script

## Day 8 - 2026-02-21 (WAXAL + Trilingual Retrieval Experiments + Handoff)
**Goal:** Execute real retrieval experiments for ColBERT and produce runnable handoff assets (scripts + notebook + visual outputs)
**Status:** DONE
**Completed:**
- [x] Installed HF workflow skills for this track (`hugging-face-datasets`, `hugging-face-model-trainer`, `hugging-face-trackio`)
- [x] Added experiment runner:
  - `scripts/run_lfm_colbert_waxal.py`
  - Includes WAXAL zero-shot, optional quick fine-tune, post-finetune eval, and metrics/report export
- [x] Added code-switch benchmark mode for WAXAL (`plain`, `codeswitch`, `both`)
- [x] Added trilingual iteration runner:
  - `scripts/run_lfm_colbert_fr_en_wo_iterations.py`
  - Evaluates `english`, `french`, `wolof`, `fr_en_wo_mix`
- [x] Added corpus builder:
  - `scripts/build_trilingual_synthetic_corpus.py`
  - Output: `data/corpus/fr_en_wo_v1` (`documents.jsonl`, `queries.jsonl`, `pairs.parquet`, `manifest.json`)
- [x] Ran WAXAL experiment and saved artifacts:
  - `artifacts/lfm_colbert_waxal/run-20260221-052711/metrics.json`
  - `artifacts/lfm_colbert_waxal/run-20260221-052711/issues_findings.md`
- [x] Ran trilingual zero-shot iteration experiment and saved artifacts:
  - `artifacts/lfm_colbert_fr_en_wo/run-20260221-054839/metrics.json`
  - `artifacts/lfm_colbert_fr_en_wo/run-20260221-054839/issues_findings.md`
- [x] Added visual/report outputs:
  - `artifacts/reports/lfm_colbert_summary.html`
  - `notebooks/lfm_colbert_test_results.ipynb`
- [x] Patched Unsloth-facing notebook for external free-GPU execution:
  - `notebooks/nb/💧_LFM2_ColBERT_350M_Inference.ipynb`
  - Includes WAXAL + code-switch + trilingual eval blocks and optional quick fine-tune cell

**Key Results:**
- WAXAL (`run-20260221-052711`):
  - `plain` zero-shot: `MRR@10 0.6388`, `Recall@10 0.6875`, `nDCG@10 0.6505`
  - `codeswitch` zero-shot: `MRR@10 0.4631`, `Recall@10 0.5375`, `nDCG@10 0.4804`
  - Post-finetune delta:
    - `plain`: `dMRR -0.0544`, `dRecall -0.0125`, `dnDCG -0.0451`
    - `codeswitch`: `dMRR +0.0100`, `dRecall 0.0000`, `dnDCG +0.0077`
- Trilingual (`run-20260221-054839`):
  - `english` MRR@10: `0.2298`
  - `french` MRR@10: `0.1939`
  - `wolof` MRR@10: `0.9900`
  - `fr_en_wo_mix` MRR@10: `0.9800`

**Pending:**
- [ ] Replace synthetic code-switch generation with real production user-code-switch query logs
- [ ] Add cross-lingual hard-negative mining for EN/FR -> WO retrieval
- [ ] Run full Unsloth GPU training loop in hosted notebook environment and compare against local quick-run baselines

**Blockers:**
- Local Python 3.13 runtime incompatibility for `pylate` dependency chain; Python 3.12 workaround required.
- Local Unsloth route still requires CUDA-wheel profile alignment; full run intended for hosted free-GPU notebook.
