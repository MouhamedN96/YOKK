---
name: rust-e2e-ai-agent
description: End-to-end Rust development workflow for AI coding agents in this workspace.
---

# Rust E2E AI Agent

## When To Use

Use for:

- New Rust service or crate setup
- Feature implementation with tests
- Debugging build/test/lint failures
- CI hardening for Rust workspaces

## Inputs

- Target scope (`workspace`, `crate`, or file/module)
- Rust version/channel constraints
- Whether network-dependent checks are allowed

## Steps

1. Discover workspace state:
   - `cargo metadata --no-deps`
   - `cargo fmt --all --check`
2. Run correctness checks:
   - `cargo check --workspace`
   - `cargo clippy --workspace --all-targets -- -D warnings`
3. Run tests:
   - `cargo test --workspace`
   - If needed, narrow to crate: `cargo test -p <crate>`
4. Apply minimal fixes:
   - Prefer targeted edits over broad rewrites.
   - Keep app-agnostic logic in `crates/`; app-specific logic in `apps/`.
5. Re-run verification:
   - Repeat fmt, check, clippy, and tests until clean.
6. CI alignment:
   - Ensure `.github/workflows` runs `fmt`, `check`, `clippy`, `test`.

## Verification

Success criteria:

- `cargo fmt --all --check` passes
- `cargo clippy --workspace --all-targets -- -D warnings` passes
- `cargo test --workspace` passes
- No new warnings in changed code

## Outputs

- Clean Rust changes with tests
- Updated CI if missing required Rust gates
- Short change summary with touched paths and commands run
