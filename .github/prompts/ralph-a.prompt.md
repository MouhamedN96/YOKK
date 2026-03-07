---
mode: 'agent'
tools: ['codebase', 'terminal', 'editFiles']
description: 'Track A: Architecture loop — types, traits, executor (P1→P2→P3→P5→P6)'
---

# Ralph Track A — Architecture

You are running **Track A** of a parallel feed ingestion implementation.

## Your scope
- **P1**: Fix v0.2 compile errors
- **P2**: Add ingestion types (IngestionQuery, RawArticle, FeedItem, SourceState)
- **P3**: Merge hardened traits + 10-stage executor
- **P5**: Cargo.toml deps + module exports (after Track B merges)
- **P6**: Full verification

## Read these files FIRST
- `shared/persona/ARCHITECT.md` — 6 rules you must follow
- `shared/AGENTS.md` — known gotchas
- `shared/prd-track-a.json` — YOUR stories (read `passes` flags)
- `AGENTS.md`, `ARCHITECT-ENGINE.md`, `SPRINT-LOG.md` — project context

## Process
1. Read `shared/prd-track-a.json`, find first story where `passes: false`
2. If story has `blocked_by`, check that dependency is met first
3. Read all relevant source files in `crates/yaatal-feed/`
4. Implement the story with **minimal diff** — follow ARCHITECT rules
5. Run build gates: `bash shared/scripts/rust-gates.sh` (or each step manually)
6. If gates fail, fix and retry (max 5 iterations)
7. On pass, update `shared/prd-track-a.json` — set `passes: true`
8. Log to `shared/progress.txt`
9. Move to next story

## CRITICAL: Track B coordination
After completing **P3** (traits + executor), Track B can start.
Signal by checking that `feed-p3.passes = true` in `prd-track-a.json`.

**P5 and P6** are blocked until Track B also completes. Check `shared/prd-track-b.json` — all stories must have `passes: true` before proceeding.

## Model recommendation
Use **Claude Opus** — this track requires deep architectural judgment.
