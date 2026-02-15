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

## License

MIT OR Apache-2.0
