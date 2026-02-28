# Code-Switch Baseline (v2)

This baseline uses `docs/examples.md` as style inspiration for realistic code-switch pattern shapes.

## Scope

- Local segment: `fr_wo_eng_local` from `data/corpus/fr_en_wo_v1`
- Minimal segment: `ful_yo_minimal` from `google/WaxalNLP` (`ful_asr`) with Yoruba insertions
- Query styles:
  - `plain`
  - `codeswitch`

## Builder Script

Path:

- `scripts/build_codeswitch_baseline_v2.py`

Example:

```bash
python scripts/build_codeswitch_baseline_v2.py \
  --fr-wo-eng-docs 120 \
  --ful-yo-docs 40 \
  --output-dir data/corpus/codeswitch_baseline_v2
```

Offline/local-only example:

```bash
python scripts/build_codeswitch_baseline_v2.py \
  --fr-wo-eng-docs 120 \
  --ful-yo-docs 0 \
  --output-dir data/corpus/codeswitch_baseline_v2
```

## Output Files

- `documents.jsonl`
- `queries.jsonl`
- `pairs.jsonl`
- `pairs.parquet`
- `manifest.json`

## Pair Schema

Each row in `pairs.jsonl` / `pairs.parquet` includes:

- `pair_id`
- `query_id`
- `query_text`
- `query_style` (`plain` | `codeswitch`)
- `switch_pattern` (`none` | `P1`..`P5`)
- `matrix_lang`
- `embedded_langs`
- `source_segment`
- `target_doc_id`
- `doc_id`
- `doc_text`
- `doc_lang`
- `is_synthetic`
- `source_dataset`
- `source_split`
- `quality_notes`
- `label`

## Zero-Shot Evaluation

`scripts/run_lfm_colbert_waxal.py` now supports:

- `--eval-style both`
- `--zero-shot-only` (skip fine-tune, baseline-only metrics)

Example:

```bash
python scripts/run_lfm_colbert_waxal.py \
  --model-id "LiquidAI/LFM2-ColBERT-350M" \
  --eval-style both \
  --zero-shot-only
```
