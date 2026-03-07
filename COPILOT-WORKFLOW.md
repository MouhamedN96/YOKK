# Copilot Parallel Workflow Scaffold

This branch provides a reusable, production-grade Copilot workflow for distributed agent development, supporting parallel tracks and multi-agent orchestration.

## Features
- **Copilot-native**: Uses `.github/prompts/*.prompt.md` for slash commands in Copilot Chat
- **Parallel execution**: Split into Track A (architecture) and Track B (implementations) for faster, distributed work
- **Automated iteration**: Ralph loop orchestrates analyze → build → verify cycles, with build gates and progress logging
- **Minimal-diff, protocol-driven**: Enforces project-agnostic, minimal-diff, and protocol compliance via `ARCHITECT.md` and `AGENTS.md`
- **All config and stories in `shared/`**: Easy to adapt to any Rust repo or project

## Quick Start
1. **Checkout this branch**: `git checkout copilot-workflow-parallel`
2. **Reload VS Code window** to activate Copilot prompt files
3. **Open Copilot Chat**
4. **Choose a track**:
   - Track A: `/ralph-a` (Claude Opus recommended)
   - Track B: `/ralph-b` (Codex for repetitive, Claude Opus for complex)
   - Or use `/ralph` for single-track mode
5. **Follow the prompts** — each track reads its own `shared/prd-track-*.json` and logs progress

## File Structure
```
.github/
  prompts/
    analyze.prompt.md
    build.prompt.md
    gates.prompt.md
    ralph.prompt.md
    ralph-a.prompt.md
    ralph-b.prompt.md
  copilot-instructions.md
shared/
  persona/ARCHITECT.md
  AGENTS.md
  progress.txt
  prd.json
  prd-track-a.json
  prd-track-b.json
  config.env
  scripts/
    ralph-loop.sh
    rust-gates.sh
  prompts/
    claude_analyzer.md
    codex_builder.md
```

## Tracks
- **Track A**: Architecture — types, traits, executor, exports, full verification
- **Track B**: Implementations — update 12 concrete impls for new trait signatures

## How it works
- Each `/ralph-*` prompt reads its own PRD file and only advances when dependencies are met
- Progress is logged to `shared/progress.txt`
- All rules and gotchas are enforced via `ARCHITECT.md` and `AGENTS.md`

## Reuse
- Copy `.github/prompts/`, `shared/`, and `.github/copilot-instructions.md` to any Rust repo
- Edit `shared/prd-track-a.json` and `shared/prd-track-b.json` for your own stories
- Adjust `ARCHITECT.md` for your project’s rules

## License
MIT or project default
