# Agent Instructions (Model-Agnostic)

This repository uses a shared local skills system under `skills/`.

## Required startup

1. Read `skills/manifest.yaml`.
2. Select relevant skill(s) by task intent.
3. Load each selected `SKILL.md` and follow its workflow.

## Current local skills

- `skills/rust-e2e-ai-agent/SKILL.md`

## Priority rules

1. Follow repository architecture constraints in `ARCHITECT-ENGINE.md`.
2. Keep reusable engine code in `crates/` and app-specific code in `apps/`.
3. Verify with Rust gates before completion:
   - `cargo fmt --all --check`
   - `cargo clippy --workspace --all-targets -- -D warnings`
   - `cargo test --workspace`
