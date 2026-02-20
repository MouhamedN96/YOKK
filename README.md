# Yaatal Engine

**AI-native infrastructure for African-first applications. Built in Rust.**

> Owned by YAATAL LABS LLC

---

## What is this?

Yaatal Engine is a reusable Rust workspace that provides shared infrastructure
for African-first applications. The first consumer is
[YOKK](https://github.com/MouhamedN96/YOKK) — a community platform for
African tech builders.

## Architecture

```
crates/yaatal-core     — AI router, models, gamification, design tokens
crates/yaatal-api      — Loco HTTP backend
crates/yaatal-voice    — cpal recording + Whisper transcription
crates/yaatal-search   — ColBERT semantic search (future)
apps/yokk-mobile       — YOKK Dioxus mobile app
```

## Crates

| Crate | Purpose | Status |
|-------|---------|--------|
| `yaatal-core` | Shared types, AI cascade, XP system, models | In Progress |
| `yaatal-api` | Loco REST API | Scaffold |
| `yaatal-voice` | Audio recording + transcription | Scaffold |
| `yaatal-search` | Semantic search | Planned |
| `yokk-mobile` | YOKK Dioxus frontend | Planned |

## Getting Started

```bash
# Clone
git clone https://github.com/Yaatal-labs/Yaatal-Engine.git
cd Yaatal-Engine

# Build
cargo build --workspace

# Test
cargo test --workspace

# Environment
cp .env.example .env
# Fill in your API keys
```

## Configuration

Config files are in `config/`:
- `development.yaml` — local dev (SQLite file, disk storage)
- `test.yaml` — tests (in-memory DB)
- `production.yaml` — deployed (Turso, S3, real keys)

## Local AI Skills

This repository includes a model-agnostic local skills system:

- `AGENTS.md` (canonical instructions for coding agents)
- `skills/manifest.yaml` (skill registry)
- `skills/rust-e2e-ai-agent/SKILL.md` (Rust end-to-end workflow)

Entry files for specific models also point to the same source:

- `CLAUDE.md`
- `CODEX.md`

Validation commands (run from repo root):

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\validate-skills-manifest.ps1
powershell -ExecutionPolicy Bypass -File .\scripts\validate-skill-docs.ps1
```

Related CI workflows:

- `.github/workflows/validate-skills-manifest.yml`
- `.github/workflows/validate-skill-docs.yml`
- `.github/workflows/rust-ci.yml`

Agent usage examples:

- `docs/agent-usage.md`
- `docs/dev-workflow-status.md`
- `docs/unsloth-on-device-deployment.md`
- `docs/colbert-zero-shot.md`

### Dev Notes (Windows)

If Cargo fails in OneDrive-backed paths or native builds on Windows:

```powershell
New-Item -ItemType Directory -Force -Path "$env:TEMP\yaatal-cargo-home" | Out-Null
New-Item -ItemType Directory -Force -Path "$env:TEMP\yaatal-target" | Out-Null
$env:CARGO_HOME = "$env:TEMP\yaatal-cargo-home"
$env:CARGO_TARGET_DIR = "$env:TEMP\yaatal-target"
cargo check --workspace
```

Also ensure a `cp` command is available in PATH for `libsql-ffi` build scripts
(Git for Windows typically provides this).

## License

MIT OR Apache-2.0
