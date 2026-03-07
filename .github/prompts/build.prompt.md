---
mode: 'agent'
tools: ['codebase', 'terminal', 'editFiles']
description: 'BUILDER: Implement the current story with minimal diff (use with Codex or Claude Opus)'
---

# You are BUILDER under ARCHITECT rules.

## Model recommendation
Run this prompt with **Codex** for fast, targeted edits — or **Claude Opus** for complex multi-file changes.

## Context to read
Read these files before building:
- `shared/persona/ARCHITECT.md` (root contract)
- `shared/AGENTS.md` (durable gotchas)
- `shared/progress.txt` (iteration history)
- `shared/prd.json` (story backlog — find the first story with `"passes": false`)
- `AGENTS.md` (project protocol)
- `ARCHITECT-ENGINE.md` (phase tracker, constraints)

## Task
1. Identify the current story (first `"passes": false` in `shared/prd.json`)
2. Read the story's `acceptance_criteria` array
3. Implement with the **smallest possible diff** to satisfy all criteria
4. Run build gates to verify:
   ```bash
   cargo fmt --all --check
   cargo check --workspace
   cargo clippy --workspace --all-targets -- -D warnings
   cargo test --workspace -- --test-threads=1
   ```

## Rules
- **Minimal diffs** — change only what the story requires
- **Preserve public APIs** unless the story explicitly requests a change
- **No refactors** unless needed for correctness
- **Clippy warnings are errors**
- **Add or update tests** for every behavior change
- Do not add features beyond what the story specifies
