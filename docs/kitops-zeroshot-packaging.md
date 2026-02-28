# KitOps Packaging for Zero-Shot Runs

This workflow creates a reproducible KitOps-ready bundle from the latest
LFM2-ColBERT zero-shot artifacts in this repository.

## What Gets Bundled

- Latest `artifacts/lfm_colbert_fr_en_wo/run-*` snapshot
- Latest `artifacts/lfm_colbert_waxal/run-*` snapshot
- Optional latest `artifacts/lfm_colbert_scenarios/bargain/run-*` snapshot
- `data/corpus/codeswitch_baseline_v2` dataset files
- Zero-shot scripts + notebooks + generated plots
- Latest consolidated report files from `artifacts/reports`

Each bundle contains:

- `modelkit.yaml` (KitOps package spec)
- `bundle_manifest.json` (checksums and source pointers)
- `docs/bundle-summary.md` (plain-language metrics summary)

## Quick Start

Prepare bundle and pack (if `kit` is installed):

```powershell
pwsh -File .\scripts\pack_zeroshot_kitops.ps1
```

Prepare bundle only:

```powershell
python .\scripts\prepare_kitops_zeroshot_bundle.py --include-scenario
```

Notes:

- Required run/data/script/notebook files are validated by default (fail-fast).
- Absolute local paths are omitted from metadata by default.
- Use `--allow-missing-required-files` or `--include-absolute-source-paths` only when needed.

The bundle is written under:

- `artifacts/kitops/zeroshot-<UTC_TIMESTAMP>/`

If `kit` is available, pack manually with:

```powershell
kit pack <bundle_dir> -f <bundle_dir>\modelkit.yaml -t yaatal-lfm2-colbert-zeroshot:<version>
```

## Install KitOps CLI

Local installer script (Windows PowerShell):

```powershell
pwsh -File .\scripts\install-kitops-cli.ps1
```

Install a specific tag:

```powershell
pwsh -File .\scripts\install-kitops-cli.ps1 -Version <tag>
```

If you prefer manual install instructions:

- https://kitops.org/docs/installation/
