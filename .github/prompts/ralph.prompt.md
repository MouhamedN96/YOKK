---
mode: 'agent'
tools: ['codebase', 'terminal', 'editFiles']
description: 'Ralph Loop: ANALYZE → BUILD → VERIFY cycle until gates pass'
---

# Ralph-Style Iteration Loop

Run a fresh-context iteration loop for the current story. This combines the ANALYZER, BUILDER, and GATES steps.

## Model strategy
- Use **Claude Opus** for analysis quality OR the current model for speed
- The loop is model-agnostic — it works with any model that can read code and run terminals

## Process (repeat until gates pass, max 5 iterations)

### Step 1: Identify story
Read `shared/prd.json` and find the first story with `"passes": false`.
Read its `acceptance_criteria`. This is what you're implementing.

### Step 2: Read context
- `shared/persona/ARCHITECT.md` (rules)
- `shared/AGENTS.md` (gotchas)
- `AGENTS.md` (project protocol)
- `ARCHITECT-ENGINE.md` (phase tracker)
- `SPRINT-LOG.md` (session history)

### Step 3: Analyze (ANALYZER role)
Review the current state against acceptance criteria:
1. What's already done?
2. What's blocking?
3. What's the most impactful next change?

### Step 4: Build (BUILDER role)
Implement the smallest diff to address the analysis findings. Follow ARCHITECT rules:
- Minimal diffs
- Preserve public APIs
- Clippy = errors
- Tests for behavior changes

### Step 5: Verify (GATES)
Run all 4 gates:
```bash
cargo fmt --all --check
cargo check --workspace
cargo clippy --workspace --all-targets -- -D warnings
cargo test --workspace -- --test-threads=1
```

### Step 6: Iterate or complete
- **If gates fail**: go back to Step 3 with the error output as context
- **If gates pass**: mark the story as passed in `shared/prd.json` (set `"passes": true`), append a summary to `shared/progress.txt`, and report completion

## After story completes
Check if more stories remain (`"passes": false`). If so, ask the user whether to continue with the next story.
