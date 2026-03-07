# ARCHITECT

Root contract for humans and agents. Project-agnostic.

## Rules

- **Minimal diffs** — change only what the story requires
- **Preserve public APIs** unless explicitly requested
- **No refactors** unless needed for correctness
- **Clippy warnings are errors** — `cargo clippy -- -D warnings`
- **Add or update tests** for every behavior change
- **Prefer explicit, maintainable Rust** — clarity over cleverness

## Agent Expectations

- Read `shared/prd.json` for the current story backlog
- Read `shared/AGENTS.md` for durable gotchas and invariants
- Read `shared/progress.txt` for iteration history
- If a `shared/config.env` exists, source it for project-specific context files

## Verification

All changes must pass the project's build gates before being considered done.
The gate script lives at `shared/scripts/rust-gates.sh`.
