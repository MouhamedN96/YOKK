#!/usr/bin/env python3
"""
Build FR/EN/WO retrieval corpus from Hugging Face trilingual data + synthetic variants.

Outputs:
- documents.jsonl
- queries.jsonl
- pairs.parquet
- manifest.json
"""

from __future__ import annotations

import argparse
import json
import random
import re
from datetime import datetime, timezone
from pathlib import Path

from datasets import Dataset, load_dataset


def _utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _clean(text: str) -> str:
    return re.sub(r"\s+", " ", text or "").strip()


def _snippet(text: str, rng: random.Random, min_words: int = 4, max_words: int = 14) -> str:
    words = _clean(text).split()
    if len(words) <= max_words:
        return " ".join(words)
    window = rng.randint(min_words, max_words)
    start = rng.randint(0, max(0, len(words) - window))
    return " ".join(words[start : start + window])


def _mix_fr_en_wo(fr: str, en: str, wo: str, rng: random.Random) -> str:
    fr_words = _snippet(fr, rng, 2, 5).split()
    en_words = _snippet(en, rng, 2, 5).split()
    wo_words = _snippet(wo, rng, 3, 7).split()
    mixed = fr_words + en_words + wo_words
    rng.shuffle(mixed)
    return " ".join(mixed)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build FR/EN/WO synthetic retrieval corpus.")
    parser.add_argument("--dataset-id", default="bilalfaye/english-wolof-french-translation")
    parser.add_argument("--split", default="train")
    parser.add_argument("--max-rows", type=int, default=5000)
    parser.add_argument("--min-chars", type=int, default=12)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--output-dir", default="Yaatal-Engine/data/corpus/fr_en_wo_v1")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    rng = random.Random(args.seed)
    out_dir = Path(args.output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    stream = load_dataset(
        args.dataset_id,
        split=args.split,
        streaming=True,
        columns=["en", "fr", "wo"],
    )

    documents: list[dict[str, str]] = []
    queries: list[dict[str, str | bool]] = []
    pairs: list[dict[str, str | bool]] = []

    scanned = 0
    kept = 0
    for row in stream:
        scanned += 1
        en = _clean(str(row.get("en") or ""))
        fr = _clean(str(row.get("fr") or ""))
        wo = _clean(str(row.get("wo") or ""))
        if min(len(en), len(fr), len(wo)) < args.min_chars:
            continue

        doc_id = f"wo_doc_{kept}"
        documents.append(
            {
                "doc_id": doc_id,
                "text": wo,
                "lang": "wo",
                "source_dataset": args.dataset_id,
                "source_split": args.split,
            }
        )

        query_variants = [
            ("wolof", _snippet(wo, rng), False),
            ("english", _snippet(en, rng), False),
            ("french", _snippet(fr, rng), False),
            ("fr_en_wo_mix", _mix_fr_en_wo(fr, en, wo, rng), True),
        ]

        for style, query_text, synthetic in query_variants:
            query_id = f"{style}_q_{kept}"
            query_row = {
                "query_id": query_id,
                "text": query_text,
                "query_style": style,
                "is_synthetic": bool(synthetic),
                "target_doc_id": doc_id,
                "source_dataset": args.dataset_id,
                "source_split": args.split,
            }
            queries.append(query_row)
            pairs.append(
                {
                    "pair_id": f"{query_id}__{doc_id}",
                    "query_id": query_id,
                    "query_text": query_text,
                    "query_style": style,
                    "is_synthetic": bool(synthetic),
                    "doc_id": doc_id,
                    "doc_text": wo,
                }
            )

        kept += 1
        if kept >= args.max_rows:
            break

    docs_path = out_dir / "documents.jsonl"
    queries_path = out_dir / "queries.jsonl"
    pairs_parquet = out_dir / "pairs.parquet"
    manifest_path = out_dir / "manifest.json"

    with docs_path.open("w", encoding="utf-8") as f:
        for row in documents:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")

    with queries_path.open("w", encoding="utf-8") as f:
        for row in queries:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")

    Dataset.from_list(pairs).to_parquet(str(pairs_parquet))

    manifest = {
        "created_utc": _utc_now(),
        "dataset": {"id": args.dataset_id, "split": args.split},
        "params": {
            "max_rows": args.max_rows,
            "min_chars": args.min_chars,
            "seed": args.seed,
        },
        "counts": {
            "scanned_rows": scanned,
            "kept_rows": kept,
            "documents": len(documents),
            "queries": len(queries),
            "pairs": len(pairs),
            "synthetic_queries": sum(1 for q in queries if q["is_synthetic"]),
        },
        "files": {
            "documents_jsonl": str(docs_path),
            "queries_jsonl": str(queries_path),
            "pairs_parquet": str(pairs_parquet),
        },
    }
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    print(f"created: {out_dir}")
    print(json.dumps(manifest["counts"], indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
