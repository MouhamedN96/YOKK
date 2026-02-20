# Dev Workflow Status

Date: 2026-02-19

## Summary

- Local skills validators are passing.
- Formatting is clean across the workspace.
- Rust workspace gates pass (`check`, `clippy`, `test`) when using Windows-safe local environment settings.

## Commands Run

| Command | Status | Notes |
|---|---|---|
| `powershell -ExecutionPolicy Bypass -File .\scripts\validate-skills-manifest.ps1` | PASS | Manifest paths valid |
| `powershell -ExecutionPolicy Bypass -File .\scripts\validate-skill-docs.ps1` | PASS | Required frontmatter and sections present |
| `cargo fmt --all` | PASS | Applied formatting updates |
| `cargo fmt --all --check` | PASS | No formatting diffs remaining |
| `cargo check --workspace` | PASS | Verified under VS dev shell + temp dirs |
| `cargo clippy --workspace --all-targets -- -D warnings` | PASS | Fixed constant-assertion lint in `design/tokens.rs` |
| `cargo test --workspace` | PASS | 37 tests passed (`29 core + 8 voice`) |

## Windows Caveats

Observed issues during setup:

1. OneDrive-backed repo paths can break cargo build outputs (`output path is not a writable directory`).
2. `libsql-ffi` build script calls `cp`, which is not always present on Windows PATH.

## Recommended Local Setup (Windows)

On Windows, ensure native build tools are available in PATH:

1. Visual Studio Build Tools with C++ workload (MSVC + Windows SDK)
2. A `cp` command in PATH (e.g. from Git for Windows), or an equivalent local shim for dev runs
3. Build/cache directories outside OneDrive for reliable writes

```powershell
New-Item -ItemType Directory -Force -Path "$env:TEMP\yaatal-cargo-home" | Out-Null
New-Item -ItemType Directory -Force -Path "$env:TEMP\yaatal-target" | Out-Null
$env:CARGO_HOME = "$env:TEMP\yaatal-cargo-home"
$env:CARGO_TARGET_DIR = "$env:TEMP\yaatal-target"
```
