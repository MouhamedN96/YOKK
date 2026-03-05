# AGENTS.md — Yaatal Engine Agent Protocol

This file defines the **coding workflow protocol** for AI agents in this repository.
Model-agnostic. For project context, stack, constraints, and phase tracking, read `ARCHITECT-ENGINE.md`.

## Required Startup

1. Read `ARCHITECT-ENGINE.md` (project context, phase tracker, constraints)
2. Read `SPRINT-LOG.md` (session history, current state)
3. Read `skills/manifest.yaml` → load relevant `skills/*/SKILL.md` by task intent

## Code Style

All crates inherit workspace lints via `[lints] workspace = true`.
CI promotes all warnings to errors (`-D warnings`). Key implications:

- **Production code:** No bare `unwrap()`, `expect()`, `panic!()`, `todo!()`, `dbg!()`, `println!()` — use `#[allow(clippy::<lint>)]` with a justification comment
- **Test modules:** Add `#[allow(clippy::unwrap_used, clippy::expect_used)]` on `mod tests`
- **Integration test roots:** Add `#![allow(clippy::unwrap_used, clippy::expect_used)]`
- **Arc cloning:** `Arc::clone(&arc)` not `arc.clone()` (lint: `clone_on_ref_ptr`)
- **LazyLock regex:** `expect()` with per-static `#[allow(clippy::expect_used)]` — compile-time constants are safe

Full lint table in root [Cargo.toml](Cargo.toml) under `[workspace.lints.clippy]`.

## Build and Test

Run these gates **in order** before every commit:

```bash
cargo fmt --all --check
cargo check --workspace
cargo clippy --workspace --all-targets -- -D warnings
cargo test  --workspace -- --test-threads=1
```

Or via unified script: `.\scripts\run-rust-gates.ps1 -Mode all`

### CI Jobs (`.github/workflows/rust-ci.yml`)

| Job | OS | Blocking? |
|-----|----|-----------|
| `fmt-check` | ubuntu-latest | Yes |
| `check` | ubuntu-latest | Yes |
| `clippy` | ubuntu-latest | Yes |
| `test` | ubuntu-latest | Yes |
| `windows-stability` | windows-latest | No (`continue-on-error`) |

### Windows Dev Caveats

- `.cargo/config.toml` is **gitignored** — never commit; each machine has its own
- OneDrive paths break cargo — override `CARGO_HOME` / `CARGO_TARGET_DIR` to `%TEMP%`
- `libsql-ffi` build needs `cp` in PATH (Git `usr/bin`) and `cl.exe` (MSVC)

## Project Conventions

Patterns that differ from defaults — see codebase for examples:

- **`crates/` = app-agnostic, `apps/` = app-specific** — the single most important boundary
- **Dual config:** Loco owns server/auth/DB config; `yaatal-core` owns AI keys
- **Dual migrations:** `migrations/*.sql` (core) + `yaatal-api/migration/` (SeaORM/Loco)
- **Dual users:** Loco `users` (auth) + yaatal-core `profiles` (domain), linked by `user_id`
- **SeaORM fixtures:** Use `Set(value)` matching column type — not `Set(Some(value))` for non-Option columns
- **Feed types are generic:** `FeedCandidate`, `FeedQuery`, `ContentType` — not YOKK-specific names

## Collaboration

- Multiple AI agents contribute (Claude, Codex, Antigravity, Copilot) — sessions logged in `SPRINT-LOG.md`
- This file is canonical — `CLAUDE.md` and `CODEX.md` redirect here
- Conventional commits: `feat:`, `fix:`, `ci:`, `docs:`, `refactor:`, `test:`
- Keep changes scoped, reversible, small-blast-radius
- If uncertain, leave a concrete `TODO` with context — not a hidden guess

## Anti-Patterns

- Do not put app-specific code in `crates/`
- Do not commit `.cargo/config.toml`
- Do not use `unwrap()`/`expect()` without `#[allow]` + justification
- Do not mix formatting-only changes with functional changes
- Do not bypass failing CI checks without explanation
- Do not include personal/sensitive data in tests, fixtures, or commits
