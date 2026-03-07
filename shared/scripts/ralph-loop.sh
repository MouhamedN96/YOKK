#!/usr/bin/env bash
# Project-agnostic Ralph-style fresh-context iteration loop.
# ANALYZER critiques → BUILDER fixes → build gates verify.
# Reads stories from shared/prd.json. Sources shared/config.env for project overrides.
#
# Backends (auto-detected in priority order):
#   1. claude CLI + codex CLI   (fully automated)
#   2. codex CLI only           (codex does both analyze + build)
#   3. copilot mode             (prints prompts for VS Code Copilot Chat)
#
# Usage: bash shared/scripts/ralph-loop.sh ["custom request text"]
# Env:   MAX_ITERS (default 5), LOG_DIR (default .ai), RALPH_BACKEND (auto|cli|copilot)
set -euo pipefail

MAX_ITERS="${MAX_ITERS:-5}"
REQ="${1:-Implement the current story from shared/prd.json with minimal diff.}"
LOG_DIR="${LOG_DIR:-.ai}"
RALPH_BACKEND="${RALPH_BACKEND:-auto}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SHARED_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

mkdir -p "$LOG_DIR"

# --- Backend detection ---
HAS_CLAUDE=false
HAS_CODEX=false
if command -v claude &>/dev/null; then HAS_CLAUDE=true; fi
if command -v codex &>/dev/null; then HAS_CODEX=true; fi

detect_backend() {
  if [ "$RALPH_BACKEND" != "auto" ]; then
    echo "$RALPH_BACKEND"
    return
  fi
  if $HAS_CLAUDE && $HAS_CODEX; then
    echo "cli-dual"
  elif $HAS_CODEX; then
    echo "cli-codex"
  else
    echo "copilot"
  fi
}

BACKEND="$(detect_backend)"

# Source project-specific overrides if present
EXTRA_CONTEXT_FILES=""
if [ -f "$SHARED_DIR/config.env" ]; then
  # shellcheck source=/dev/null
  source "$SHARED_DIR/config.env"
fi

# Build extra context block for prompts
extra_context_block() {
  local block=""
  if [ -n "$EXTRA_CONTEXT_FILES" ]; then
    block="

ADDITIONAL PROJECT CONTEXT FILES (read these before acting):
"
    for f in $EXTRA_CONTEXT_FILES; do
      if [ -f "$f" ]; then
        block="$block- $f
"
      fi
    done
  fi
  echo "$block"
}

# Detect python command (python3 or python)
PY="python3"
if ! command -v python3 &>/dev/null; then
  PY="python"
fi

next_story() {
  $PY - <<'PY'
import json, sys
try:
    with open("shared/prd.json") as f:
        data = json.load(f)
    for s in data.get("stories", []):
        if not s.get("passes", False):
            print(s["title"])
            sys.exit(0)
    print("(no pending stories)")
except FileNotFoundError:
    print("(shared/prd.json not found)")
PY
}

next_story_criteria() {
  $PY - <<'PY'
import json, sys
try:
    with open("shared/prd.json") as f:
        data = json.load(f)
    for s in data.get("stories", []):
        if not s.get("passes", False):
            for c in s.get("acceptance_criteria", []):
                print(f"  - {c}")
            sys.exit(0)
except FileNotFoundError:
    pass
PY
}

append_progress() {
  local msg="$1"
  {
    echo ""
    echo "----"
    echo "$(date '+%Y-%m-%d %H:%M:%S') $msg"
  } >> shared/progress.txt
}

# --- CLI backend: claude analyze ---
cli_claude_critique() {
  local out="$1"
  local diff
  diff="$(git diff || true)"

  claude <<EOF > "$out"
You are ANALYZER under ARCHITECT rules.

Read these files conceptually before reviewing:
- shared/persona/ARCHITECT.md
- shared/AGENTS.md
- shared/progress.txt
- shared/prd.json
$(extra_context_block)

STORY:
$(next_story)

REQUEST:
$REQ

CURRENT DIFF:
$diff

Review only. Do not modify files.

Return:
1) Blockers
2) Missing tests
3) Risks/tradeoffs
4) Suggested next fix
EOF
}

# --- CLI backend: codex build ---
cli_codex_fix() {
  local critique_file="$1"
  local diff
  diff="$(git diff || true)"

  codex exec "
You are BUILDER under ARCHITECT rules.

Read and follow:
- shared/persona/ARCHITECT.md
- shared/AGENTS.md
- shared/progress.txt
- shared/prd.json
$(extra_context_block)

STORY:
$(next_story)

REQUEST:
$REQ

CURRENT DIFF:
$diff

CRITIQUE TO ADDRESS:
$(cat "$critique_file")

Apply the smallest set of changes needed.
Keep the public API stable unless the story requires otherwise.
Make build gates pass: bash shared/scripts/rust-gates.sh
"
}

# --- CLI backend: codex as both analyzer + builder ---
cli_codex_analyze_and_fix() {
  local critique_file="$1"
  local diff
  diff="$(git diff || true)"

  # Step 1: analyze (write-only, no file changes)
  codex exec "
You are ANALYZER under ARCHITECT rules.

Read: shared/persona/ARCHITECT.md, shared/AGENTS.md, shared/prd.json
$(extra_context_block)

STORY: $(next_story)
REQUEST: $REQ
CURRENT DIFF:
$diff

Review only. Write your analysis to $critique_file.
Return: 1) Blockers 2) Missing tests 3) Risks 4) Suggested next fix
"

  # Step 2: build (apply fixes)
  cli_codex_fix "$critique_file"
}

# --- Copilot backend: print prompts for VS Code ---
copilot_prompt_iteration() {
  local iteration="$1"
  local critique_file="$LOG_DIR/critique_${iteration}.txt"

  echo ""
  echo "╔══════════════════════════════════════════════════════════════╗"
  echo "║  ITERATION $iteration — Copilot Mode (manual steps below)            ║"
  echo "╠══════════════════════════════════════════════════════════════╣"
  echo "║                                                              ║"
  echo "║  1. Open Copilot Chat in VS Code                            ║"
  echo "║  2. Select Claude Opus model                                 ║"
  echo "║  3. Type: /analyze                                           ║"
  echo "║     → Review the critique, save key points                   ║"
  echo "║                                                              ║"
  echo "║  4. Select Codex model (or keep Claude Opus)                 ║"
  echo "║  5. Type: /build                                             ║"
  echo "║     → Let it implement fixes                                 ║"
  echo "║                                                              ║"
  echo "║  6. Type: /gates                                             ║"
  echo "║     → Verify build gates pass                                ║"
  echo "║                                                              ║"
  echo "║  OR: Use /ralph for the full loop in one prompt              ║"
  echo "║                                                              ║"
  echo "╚══════════════════════════════════════════════════════════════╝"
  echo ""
  echo "Story: $(next_story)"
  echo "Acceptance criteria:"
  next_story_criteria
  echo ""
  echo "Press ENTER after you've completed the Copilot steps, or Ctrl+C to abort."
  read -r
}

mark_story_passed() {
  $PY - <<'PY'
import json
p = "shared/prd.json"
try:
    with open(p) as f:
        data = json.load(f)
    for s in data.get("stories", []):
        if not s.get("passes", False):
            s["passes"] = True
            break
    with open(p, "w") as f:
        json.dump(data, f, indent=2)
        f.write("\n")
except FileNotFoundError:
    pass
PY
}

# --- Main loop ---
echo "== Ralph-style fresh-context loop =="
echo "Backend: $BACKEND"
echo "Story: $(next_story)"
echo "Max iterations: $MAX_ITERS"

if [ "$BACKEND" = "copilot" ]; then
  echo ""
  echo "No claude/codex CLI detected. Using Copilot prompt mode."
  echo "Copilot prompts available: /analyze, /build, /gates, /ralph"
  echo "(Install at .github/prompts/*.prompt.md)"
fi
echo ""

for ((i=1; i<=MAX_ITERS; i++)); do
  critique="$LOG_DIR/critique_${i}.txt"
  append_progress "Iteration $i starting for story: $(next_story) [backend=$BACKEND]"

  case "$BACKEND" in
    cli-dual)
      echo "-> [$i/$MAX_ITERS] Claude critique (ANALYZER)"
      cli_claude_critique "$critique"
      echo "-> [$i/$MAX_ITERS] Codex fix (BUILDER)"
      cli_codex_fix "$critique"
      ;;
    cli-codex)
      echo "-> [$i/$MAX_ITERS] Codex analyze + fix"
      cli_codex_analyze_and_fix "$critique"
      ;;
    copilot)
      copilot_prompt_iteration "$i"
      ;;
    *)
      echo "Unknown backend: $BACKEND" >&2
      exit 1
      ;;
  esac

  echo "-> [$i/$MAX_ITERS] Build gates"
  if bash shared/scripts/rust-gates.sh; then
    append_progress "Iteration $i PASSED build gates. [backend=$BACKEND]"
    mark_story_passed
    echo ""
    echo "Converged on iteration $i"
    exit 0
  else
    append_progress "Iteration $i FAILED build gates. [backend=$BACKEND]"
  fi
done

echo ""
echo "Did not converge after $MAX_ITERS iterations."
exit 1
