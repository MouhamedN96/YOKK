---
mode: 'agent'
tools: ['codebase', 'terminal', 'editFiles']
description: 'Track B: Implementations loop — update 12 concrete impls (P4a→P4b→P4c→P4d)'
---

# Ralph Track B — Implementations

You are running **Track B** of a parallel feed ingestion implementation.

## PREREQUISITE — DO NOT START until Track A completes P3
Check `shared/prd-track-a.json`: the story `feed-p3` must have `passes: true`.
If it does not, STOP and tell the user to complete Track A through P3 first.

## Your scope
- **P4a**: Update 5 filters → return FilterBitmap, take `&[C]`
- **P4b**: Make TopKSelector async
- **P4c**: Update 2 sources + 3 scorers for Identifiable bound
- **P4d**: Wire FeedBuilder with PipelineConfig + split side effects

## Read these files FIRST
- `shared/persona/ARCHITECT.md` — 6 rules you must follow
- `shared/AGENTS.md` — known gotchas
- `shared/prd-track-b.json` — YOUR stories (read `passes` flags)
- `AGENTS.md`, `ARCHITECT-ENGINE.md`, `SPRINT-LOG.md` — project context

## Process
1. Read `shared/prd-track-b.json`, find first story where `passes: false`
2. Read the new trait signatures from Track A's work in `crates/yaatal-feed/src/pipeline/traits.rs`
3. Update the concrete implementations to match new signatures
4. Run: `cargo check -p yaatal-feed` after each story
5. On pass, update `shared/prd-track-b.json` — set `passes: true`
6. Log to `shared/progress.txt`
7. Move to next story

## IMPORTANT: Minimal diff
Each story touches specific files. Don't refactor unrelated code.
- P4a: filter impl files only
- P4b: selector impl files only
- P4c: source + scorer impl files only
- P4d: FeedBuilder / pipeline wiring only

## Model recommendation
Use **Codex** for P4a (repetitive filter changes) and **Claude Opus** for P4d (complex wiring).
