#!/usr/bin/env bash
# Project-agnostic Rust build gates.
# Runs: fmt → check → clippy → test (in order, fail-fast).
# Usage: bash shared/scripts/rust-gates.sh [fmt|check|clippy|test|all]
set -euo pipefail

MODE="${1:-all}"

run_gate() {
  echo ""
  echo ">> $*"
  "$@"
}

case "$MODE" in
  fmt)     run_gate cargo fmt --all --check ;;
  check)   run_gate cargo check --workspace ;;
  clippy)  run_gate cargo clippy --workspace --all-targets -- -D warnings ;;
  test)    run_gate cargo test --workspace -- --test-threads=1 ;;
  all)
    run_gate cargo fmt --all --check
    run_gate cargo check --workspace
    run_gate cargo clippy --workspace --all-targets -- -D warnings
    run_gate cargo test --workspace -- --test-threads=1
    ;;
  *)
    echo "Usage: $0 [fmt|check|clippy|test|all]" >&2
    exit 1
    ;;
esac
