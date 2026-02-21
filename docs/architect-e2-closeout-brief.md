# Architect E2 Closeout Brief

Date: 2026-02-21
Owner: Next Architect
Primary continuity file: `ARCHITECT-ENGINE.md`

## Objective

Close Phase E2 (`Database schema + models`) to a production-ready baseline by wiring SeaORM relations and adding integration coverage for schema behavior.

## Current State Snapshot

- Migration exists: `migrations/001_initial.sql`
- Model files exist for all tables in `crates/yaatal-core/src/models/`
- E2 gap: all model relation enums are empty (`enum Relation {}`), so entity graph navigation and relational query composition are not implemented.
- DB helpers exist in `crates/yaatal-core/src/db.rs` but have no integration test coverage.

## In Scope (Required)

1. Implement SeaORM entity relations for all FK-backed models.
2. Add integration tests validating migrations, FK behavior, and key uniqueness constraints.
3. Verify Rust quality gates for workspace or, if blocked by environment, at least `yaatal-core` with blocker documented.
4. Update continuity logs (`ARCHITECT-ENGINE.md`, `SPRINT-LOG.md`) with what changed and what remains.

## Exact File Targets

- `crates/yaatal-core/src/models/profile.rs`
- `crates/yaatal-core/src/models/post.rs`
- `crates/yaatal-core/src/models/comments.rs`
- `crates/yaatal-core/src/models/upvotes.rs`
- `crates/yaatal-core/src/models/launches.rs`
- `crates/yaatal-core/src/models/achievements.rs`
- `crates/yaatal-core/src/models/bo_conversations.rs`
- `crates/yaatal-core/src/models/bookmarks.rs`
- `crates/yaatal-core/src/models/user_security_keys.rs`
- `crates/yaatal-core/src/models/feed_items.rs` (explicitly leave relation empty with note: no FK)
- `crates/yaatal-core/src/models/mod.rs` (exports/ordering if needed)
- `crates/yaatal-core/src/db.rs` (only if helper testability adjustments are required)
- `crates/yaatal-core/tests/e2_schema_relations.rs` (new)

## Relation Matrix To Implement

- `posts.author_id -> profiles.id`
- `comments.post_id -> posts.id`
- `comments.author_id -> profiles.id`
- `comments.parent_id -> comments.id` (self reference)
- `upvotes.user_id -> profiles.id`
- `launches.author_id -> profiles.id`
- `achievements.user_id -> profiles.id`
- `bo_conversations.user_id -> profiles.id`
- `bookmarks.user_id -> profiles.id`
- `user_security_keys.user_id -> profiles.id`

## Test Coverage Requirements

1. Migration smoke test:
   - Run `run_migrations_from_file` against test DB.
   - Assert expected tables exist.
2. FK enforcement test:
   - Invalid child insert fails (e.g., `posts.author_id` missing profile).
   - Valid parent+child insert succeeds.
3. Uniqueness constraints test:
   - `upvotes(user_id, target_type, target_id)` unique.
   - `bookmarks(user_id, target_type, target_id)` unique.
4. Relation query test:
   - At least one `find_related`/join path per major edge (`profile -> posts`, `post -> comments`, `comment -> parent`).

## Definition of Done

- No remaining `enum Relation {}` in FK-backed model files.
- Integration tests for migration + FK + uniqueness + relation queries are present and passing.
- `cargo fmt --all --check` passes.
- `cargo clippy --workspace --all-targets -- -D warnings` passes, or blocker documented with exact command output.
- `cargo test --workspace` passes, or blocker documented with exact command output.
- Mutation log and sprint log are updated for this session.

## Recommended Execution Order

1. Implement relation enums and `Related` impls.
2. Add integration tests under `crates/yaatal-core/tests/`.
3. Run `fmt`, `clippy`, `test`.
4. Update `ARCHITECT-ENGINE.md` and `SPRINT-LOG.md`.
5. Commit with message: `Finalize E2 SeaORM relations and schema integration tests`.

## Known Environment Risk (Windows)

- `libsql-ffi` can fail if `cp` is missing in PATH.
- OneDrive-backed paths may fail for cargo outputs.
- If encountered, use temp dirs for `CARGO_HOME` and `CARGO_TARGET_DIR` (documented in `README.md` and `docs/dev-workflow-status.md`).

## Full Project Scope Queue (After E2)

1. E3 AI cascade router hardening:
   - Define offline/2G gating policy and shared rate limiting.
   - Add deterministic fallback tests across tiers.
2. E4 JWT auth controller:
   - Scaffold Loco API surface and token/session lifecycle.
   - Align with reusable `yaatal-core` auth primitives.
3. E5 Posts CRUD + feed:
   - Build API endpoints on top of finalized models/relations.
   - Add authorization checks and pagination behavior.
4. E6 Voice crate integration:
   - Wire hardened `yaatal-voice` into API flow.
   - Add operational handling for model-loading/network failures.
5. E7 Kill gate (Dioxus + cpal):
   - Enforce platform capability checks and safe fallback UX.
6. E8 Wire YOKK PWA:
   - Feature-flagged migration path from YOKK to `yaatal-api`.

## Parallel Search/Retrieval Track (Non-Blocking for E2)

- Current artifacts and scripts are in place:
  - `scripts/run_lfm_colbert_waxal.py`
  - `scripts/run_lfm_colbert_fr_en_wo_iterations.py`
  - `scripts/build_trilingual_synthetic_corpus.py`
  - `artifacts/lfm_colbert_waxal/run-20260221-052711/metrics.json`
  - `artifacts/lfm_colbert_fr_en_wo/run-20260221-054839/metrics.json`
- Next retrieval improvements:
  - Replace synthetic code-switch queries with real user data.
  - Add hard-negative mining for EN/FR -> WO alignment.
  - Run full hosted GPU Unsloth training loop and compare against current baseline.
