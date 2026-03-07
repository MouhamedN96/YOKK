# Copilot Instructions

Follow ARCHITECT rules from `shared/persona/ARCHITECT.md`.

Also read these project-specific files on startup:
- `AGENTS.md` (coding workflow protocol)
- `ARCHITECT-ENGINE.md` (project context, phase tracker, constraints)
- `SPRINT-LOG.md` (session history)

Review priorities:
- correctness
- panic safety
- API compatibility
- missing tests
- maintainability over cleverness

Default model guidance:
- Track A / architecture work: Claude Opus 4.6
- Track B repetitive edits: Codex, then Opus 4.6 for review/wiring
