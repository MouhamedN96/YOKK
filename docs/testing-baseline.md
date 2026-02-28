# Testing Baseline

Date: 2026-02-27

## Scope

This document captures the current Rust testing baseline for `Yaatal-Engine`
and the standard gate commands expected locally and in CI.

## Standard Gates

Run from repository root:

```powershell
pwsh -File .\scripts\run-rust-gates.ps1 -Mode fmt
pwsh -File .\scripts\run-rust-gates.ps1 -Mode check
pwsh -File .\scripts\run-rust-gates.ps1 -Mode clippy
pwsh -File .\scripts\run-rust-gates.ps1 -Mode test
```

Or run all gates:

```powershell
pwsh -File .\scripts\run-rust-gates.ps1 -Mode all
```

## Current Coverage Footprint

- `yaatal-core`: strong unit + integration coverage (AI router, schema relations, sanitize, XP, config helpers).
- `yaatal-api`: strong request/model coverage for auth and identity mapping.
- `yaatal-feed`: light integration-style coverage (pipeline behavior).
- `yaatal-search`: light unit coverage (zero-shot metric evaluation).
- `yaatal-voice`: no dedicated test module currently discovered.

## Known Environment Risks

- Windows native build path can fail when outputs are written inside OneDrive-backed directories.
- `libsql`/parser native build path is sensitive to toolchain and file permissions.
- Parallel cargo/test invocations against the same target directory increase lock and permission errors.

## Baseline Hardening Applied

- Test scripts set deterministic env vars:
  - `CARGO_HOME` -> `%TEMP%/yaatal-cargo-home`
  - `CARGO_TARGET_DIR` -> `%TEMP%/yaatal-target`
  - `CARGO_BUILD_JOBS` -> `1` (serialize native builds for stability)
- Local and CI gate commands are aligned through `scripts/run-rust-gates.ps1`.
- Added Windows CI stabilization job (`continue-on-error`) to track drift without blocking merges.

## Next Additions (Priority)

1. Add dedicated unit tests for `yaatal-voice` (`compress`, `transcribe` behavior contracts).
2. Add API migration-contract tests for schema parity/divergence rules.
3. Expand feed tests to include failure-paths and repo error handling.
4. Promote Windows CI job from stabilization to required after 3 consecutive green runs.
