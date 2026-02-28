# Dev Workflow Status

Date: 2026-02-27

## Summary

- Workspace test setup baseline is implemented with shared local scripts and CI parity.
- `yaatal-search` crate tests run successfully through the new script entrypoint.
- Full workspace gates are still blocked in this shell by native toolchain/environment issues and pre-existing formatting drift.

## Current Standard Commands

| Command | Purpose |
|---|---|
| `pwsh -File .\scripts\run-rust-gates.ps1 -Mode fmt` | Formatting gate |
| `pwsh -File .\scripts\run-rust-gates.ps1 -Mode check` | Compile gate |
| `pwsh -File .\scripts\run-rust-gates.ps1 -Mode clippy` | Lint gate |
| `pwsh -File .\scripts\run-rust-gates.ps1 -Mode test` | Workspace test gate |
| `pwsh -File .\scripts\run-rust-gates.ps1 -Mode all` | Full gate sequence |
| `pwsh -File .\scripts\run-rust-tests.ps1 -Scope yaatal-search` | Crate-scoped test run |

## Verification Snapshot (Latest Session)

| Command | Status | Notes |
|---|---|---|
| `pwsh -File .\scripts\run-rust-tests.ps1 -Scope yaatal-search` | PASS | `3 passed, 0 failed` |
| `pwsh -File .\scripts\run-rust-gates.ps1 -Mode fmt` | FAIL | Pre-existing formatting/trailing-whitespace drift in repo |
| `pwsh -File .\scripts\run-rust-gates.ps1 -Mode check` | BLOCKED | Native build/toolchain issue in current shell (`libsql-sqlite3-parser`) |

## Windows Caveats

1. OneDrive-backed repo paths can break cargo build outputs.
2. Native dependency builds are sensitive to:
   - `cl.exe` availability and shell/toolchain setup
   - `cp.exe` availability for certain build scripts
3. Parallel cargo invocations against the same target directory increase lock/permission risk.

## Recommended Local Setup (Windows)

Use the shared setup script before running gates:

```powershell
pwsh -File .\scripts\setup-rust-test-env.ps1
```

Expected prerequisites:

1. Visual Studio Build Tools with C++ workload (`cl.exe` in PATH)
2. Git for Windows utilities (`cp.exe` in PATH)
3. Workspace gates run from a single shell/session (avoid concurrent runs on same target dir)
