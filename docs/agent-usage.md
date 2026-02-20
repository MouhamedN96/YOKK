# Agent Usage Guide

This repo uses a local, model-agnostic skill system.

## Source Of Truth

- `AGENTS.md` is canonical.
- `skills/manifest.yaml` is the registry.
- Skill documents live at `skills/*/SKILL.md`.

## Project Boundaries

- Shared infrastructure and reusable logic: `crates/`
- App-specific logic: `apps/`
- Architecture continuity protocol: `ARCHITECT-ENGINE.md`

## Example Flows

### 1) Feature work in `yaatal-core`

Use when implementing reusable engine capabilities.

1. Load `skills/rust-e2e-ai-agent/SKILL.md`.
2. Keep code in `crates/yaatal-core`.
3. Run verification gates:
   - `cargo fmt --all --check`
   - `cargo clippy --workspace --all-targets -- -D warnings`
   - `cargo test --workspace`

### 2) Voice bug fix in `yaatal-voice`

Use when fixing recorder/transcription behavior.

1. Load `skills/rust-e2e-ai-agent/SKILL.md`.
2. Scope edits to `crates/yaatal-voice`.
3. Run targeted and workspace checks:
   - `cargo test -p yaatal-voice`
   - `cargo test --workspace`

### 3) YOKK-specific UI change

Use when work is app-specific.

1. Keep changes in `apps/yokk-mobile`.
2. Do not move app-specific behavior into `crates/`.
3. Run workspace checks before completion.

## Skill Validation Commands

Run from repo root:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\validate-skills-manifest.ps1
powershell -ExecutionPolicy Bypass -File .\scripts\validate-skill-docs.ps1
```
