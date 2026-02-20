# Local Skills (Model-Agnostic)

This folder stores reusable project skills in a model-agnostic format.

## Goals

- Keep one source of truth for workflows and guardrails.
- Reuse the same skill content across Codex, Claude, and other agents.
- Version and review skills in-repo with code changes.

## Structure

Each skill lives in its own directory:

```text
skills/
  manifest.yaml
  <skill-name>/
    SKILL.md
```

## Skill Contract

Every `SKILL.md` should include:

1. `name`
2. `description`
3. `when-to-use`
4. `inputs`
5. `steps`
6. `verification`
7. `outputs`

Use relative paths and workspace commands where possible.

## Usage

- Codex/Codex-like agents: `AGENTS.md` references this folder.
- Claude-like agents: `CLAUDE.md` references this folder.
- Any other agent: read `skills/manifest.yaml`, then load the selected `SKILL.md`.
