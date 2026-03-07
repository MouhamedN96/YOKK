---
mode: 'agent'
tools: ['terminal']
description: 'Run Rust build gates: fmt → check → clippy → test'
---

# Run Build Gates

Execute the 4-step Rust build gate sequence in order. Stop on first failure.

```bash
cargo fmt --all --check
cargo check --workspace
cargo clippy --workspace --all-targets -- -D warnings
cargo test --workspace -- --test-threads=1
```

Or via script: `bash shared/scripts/rust-gates.sh`

Report which gate passed/failed and the first error if any.
