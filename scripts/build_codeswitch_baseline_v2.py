#!/usr/bin/env python3
"""
Build a minimal example-driven code-switch retrieval baseline.

This script creates a paired retrieval dataset with:
1) Local FR/WO/ENG aligned rows from data/corpus/fr_en_wo_v1
2) Minimal Fulani rows from WaxalNLP augmented with Yoruba inserts

Output files:
- documents.jsonl
- queries.jsonl
- pairs.jsonl
- pairs.parquet
- manifest.json
"""

from __future__ import annotations

import argparse
import json
import random
import re
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from datasets import Dataset, load_dataset


EN_DISCOURSE_MARKERS = [
    "Actually",
    "Okay",
    "Sorry",
    "Wait for me",
    "Check this",
]

EN_TAG_SWITCHES = [
    "you know",
    "okay",
    "sorry",
]

EN_INSERT_TERMS = [
    "help",
    "price",
    "confirm",
    "busy",
    "check",
]

YORUBA_MARKERS = [
    "abeg",
    "jowo",
    "e joo",
    "se o ri",
    "o da",
]

YORUBA_TAG_SWITCHES = [
    "abi",
    "sha",
    "o da",
]

YORUBA_INSERT_TERMS = [
    "iranlowo",
    "owo",
    "iyara",
    "oro",
    "dara",
]

SWITCH_PATTERNS = ["P1", "P2", "P3", "P4", "P5"]


def _utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _clean(text: str) -> str:
    return re.sub(r"\s+", " ", text or "").strip()


def _snippet(text: str, rng: random.Random, min_words: int = 4, max_words: int = 14) -> str:
    words = _clean(text).split()
    if not words:
        return ""
    if len(words) <= max_words:
        return " ".join(words)
    window = rng.randint(min_words, max_words)
    start = rng.randint(0, max(0, len(words) - window))
    return " ".join(words[start : start + window])


def _inject_terms(text: str, replacements: list[str], rng: random.Random, ratio: float = 0.2) -> str:
    words = _clean(text).split()
    if not words:
        return ""
    replace_count = max(1, int(len(words) * ratio))
    replace_count = min(replace_count, len(words))
    replaced = list(words)
    for idx in rng.sample(range(len(replaced)), k=replace_count):
        replaced[idx] = rng.choice(replacements)
    return " ".join(replaced)


def _read_jsonl(path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    with path.open("r", encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if not line:
                continue
            rows.append(json.loads(line))
    return rows


def _write_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    with path.open("w", encoding="utf-8") as handle:
        for row in rows:
            handle.write(json.dumps(row, ensure_ascii=False) + "\n")


def _load_local_fr_wo_eng_rows(documents_path: Path, queries_path: Path) -> list[dict[str, str]]:
    documents = _read_jsonl(documents_path)
    queries = _read_jsonl(queries_path)

    docs_by_id = {
        str(doc.get("doc_id")): doc
        for doc in documents
        if doc.get("doc_id") and _clean(str(doc.get("text") or ""))
    }
    styles_by_doc: dict[str, dict[str, str]] = {}
    for query in queries:
        doc_id = str(query.get("target_doc_id") or "")
        style = str(query.get("query_style") or "")
        text = _clean(str(query.get("text") or ""))
        if doc_id not in docs_by_id:
            continue
        if style not in ("english", "french", "wolof"):
            continue
        if not text:
            continue
        if doc_id not in styles_by_doc:
            styles_by_doc[doc_id] = {}
        styles_by_doc[doc_id].setdefault(style, text)

    eligible: list[dict[str, str]] = []
    for doc_id, styles in styles_by_doc.items():
        if not all(styles.get(k) for k in ("english", "french", "wolof")):
            continue
        doc = docs_by_id[doc_id]
        eligible.append(
            {
                "doc_id": doc_id,
                "doc_text": _clean(str(doc.get("text") or "")),
                "doc_lang": _clean(str(doc.get("lang") or "wo")) or "wo",
                "source_dataset": _clean(str(doc.get("source_dataset") or "bilalfaye/english-wolof-french-translation")),
                "source_split": _clean(str(doc.get("source_split") or "train")) or "train",
                "english": styles["english"],
                "french": styles["french"],
                "wolof": styles["wolof"],
            }
        )
    return eligible


def _collect_fulani_rows(
    dataset_id: str,
    config: str,
    split: str,
    count: int,
    min_chars: int,
) -> list[dict[str, str]]:
    if count <= 0:
        return []

    rows: list[dict[str, str]] = []
    stream = load_dataset(
        dataset_id,
        name=config,
        split=split,
        streaming=True,
        columns=["id", "transcription", "language"],
    )
    for sample in stream:
        sample_id = _clean(str(sample.get("id") or ""))
        text = _clean(str(sample.get("transcription") or ""))
        if not sample_id:
            continue
        if len(text) < min_chars:
            continue
        rows.append(
            {
                "doc_id": sample_id,
                "doc_text": text,
                "doc_lang": _clean(str(sample.get("language") or "ful")) or "ful",
                "source_dataset": dataset_id,
                "source_split": split,
            }
        )
        if len(rows) >= count:
            break
    return rows


def _generate_local_codeswitch(row: dict[str, str], rng: random.Random) -> tuple[str, str, str, list[str]]:
    pattern = rng.choice(SWITCH_PATTERNS)
    english = _snippet(row["english"], rng, 3, 10)
    french = _snippet(row["french"], rng, 3, 10)
    wolof = _snippet(row["wolof"], rng, 4, 14)
    if not wolof:
        wolof = _snippet(row["doc_text"], rng, 4, 14)

    if pattern == "P1":
        return (f"{english}. {wolof}.", pattern, "wo", ["en"])
    if pattern == "P2":
        return (f"{rng.choice(EN_DISCOURSE_MARKERS)}, {wolof}.", pattern, "wo", ["en"])
    if pattern == "P3":
        return (f"{wolof}, {rng.choice(EN_TAG_SWITCHES)}.", pattern, "wo", ["en"])
    if pattern == "P4":
        return (f"{french}. {wolof}.", pattern, "fr", ["wo"])
    switched = _inject_terms(wolof, EN_INSERT_TERMS, rng, ratio=0.22)
    return (f"{switched}.", pattern, "wo", ["en"])


def _generate_fulani_yoruba_codeswitch(text: str, rng: random.Random) -> tuple[str, str, str, list[str]]:
    pattern = rng.choice(SWITCH_PATTERNS)
    base = _snippet(text, rng, 4, 14)
    if not base:
        base = _clean(text)

    if pattern == "P1":
        return (f"{rng.choice(YORUBA_MARKERS)}, {base}.", pattern, "ful", ["yo"])
    if pattern == "P2":
        return (f"{base}, {rng.choice(YORUBA_TAG_SWITCHES)}.", pattern, "ful", ["yo"])
    if pattern == "P3":
        switched = _inject_terms(base, YORUBA_INSERT_TERMS, rng, ratio=0.2)
        return (f"{switched}.", pattern, "ful", ["yo"])
    if pattern == "P4":
        return (f"{base}. {rng.choice(YORUBA_MARKERS)}.", pattern, "ful", ["yo"])
    return (f"{rng.choice(YORUBA_MARKERS)} {base} {rng.choice(YORUBA_TAG_SWITCHES)}.", pattern, "ful", ["yo"])


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build a minimal example-driven code-switch baseline dataset.")
    parser.add_argument("--local-documents", default="data/corpus/fr_en_wo_v1/documents.jsonl")
    parser.add_argument("--local-queries", default="data/corpus/fr_en_wo_v1/queries.jsonl")
    parser.add_argument("--fr-wo-eng-docs", type=int, default=120)
    parser.add_argument("--ful-yo-docs", type=int, default=40)
    parser.add_argument("--waxal-dataset-id", default="google/WaxalNLP")
    parser.add_argument("--waxal-config", default="ful_asr")
    parser.add_argument("--waxal-split", default="train")
    parser.add_argument("--min-chars", type=int, default=20)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--output-dir", default="data/corpus/codeswitch_baseline_v2")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    rng = random.Random(args.seed)
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    local_rows = _load_local_fr_wo_eng_rows(Path(args.local_documents), Path(args.local_queries))
    if not local_rows:
        raise RuntimeError("No eligible local FR/WO/ENG rows were found.")

    rng.shuffle(local_rows)
    selected_local = local_rows[: args.fr_wo_eng_docs]
    if len(selected_local) < args.fr_wo_eng_docs:
        print(
            f"warning: requested fr_wo_eng_docs={args.fr_wo_eng_docs}, available={len(selected_local)}"
        )

    selected_ful = _collect_fulani_rows(
        dataset_id=args.waxal_dataset_id,
        config=args.waxal_config,
        split=args.waxal_split,
        count=args.ful_yo_docs,
        min_chars=args.min_chars,
    )
    if args.ful_yo_docs > 0 and len(selected_ful) < args.ful_yo_docs:
        print(f"warning: requested ful_yo_docs={args.ful_yo_docs}, available={len(selected_ful)}")

    documents: list[dict[str, Any]] = []
    queries: list[dict[str, Any]] = []
    pairs: list[dict[str, Any]] = []

    style_counts = Counter()
    segment_counts = Counter()
    pattern_counts = Counter()

    local_plain_cycle = ["french", "wolof", "english"]
    local_plain_matrix = {"french": "fr", "wolof": "wo", "english": "en"}

    for idx, row in enumerate(selected_local):
        doc_id = f"local_{row['doc_id']}"
        documents.append(
            {
                "doc_id": doc_id,
                "text": row["doc_text"],
                "lang": row["doc_lang"],
                "source_segment": "fr_wo_eng_local",
                "source_dataset": row["source_dataset"],
                "source_split": row["source_split"],
            }
        )

        plain_style = local_plain_cycle[idx % len(local_plain_cycle)]
        plain_text = _snippet(row[plain_style], rng, 3, 12) or row["doc_text"]
        plain_query_id = f"local_plain_q_{idx}"
        plain_query = {
            "query_id": plain_query_id,
            "text": plain_text,
            "query_style": "plain",
            "switch_pattern": "none",
            "matrix_lang": local_plain_matrix[plain_style],
            "embedded_langs": [],
            "source_segment": "fr_wo_eng_local",
            "target_doc_id": doc_id,
            "is_synthetic": False,
            "source_dataset": row["source_dataset"],
            "source_split": row["source_split"],
            "quality_notes": "plain query from aligned local multilingual pair",
        }
        queries.append(plain_query)

        cs_text, pattern, matrix_lang, embedded_langs = _generate_local_codeswitch(row, rng)
        cs_query_id = f"local_codeswitch_q_{idx}"
        cs_query = {
            "query_id": cs_query_id,
            "text": cs_text,
            "query_style": "codeswitch",
            "switch_pattern": pattern,
            "matrix_lang": matrix_lang,
            "embedded_langs": embedded_langs,
            "source_segment": "fr_wo_eng_local",
            "target_doc_id": doc_id,
            "is_synthetic": True,
            "source_dataset": row["source_dataset"],
            "source_split": row["source_split"],
            "quality_notes": "generated with example-inspired code-switch pattern",
        }
        queries.append(cs_query)

    for idx, row in enumerate(selected_ful):
        doc_id = f"ful_{row['doc_id']}"
        documents.append(
            {
                "doc_id": doc_id,
                "text": row["doc_text"],
                "lang": row["doc_lang"],
                "source_segment": "ful_yo_minimal",
                "source_dataset": row["source_dataset"],
                "source_split": row["source_split"],
            }
        )

        plain_text = _snippet(row["doc_text"], rng, 4, 14) or row["doc_text"]
        plain_query_id = f"ful_plain_q_{idx}"
        plain_query = {
            "query_id": plain_query_id,
            "text": plain_text,
            "query_style": "plain",
            "switch_pattern": "none",
            "matrix_lang": "ful",
            "embedded_langs": [],
            "source_segment": "ful_yo_minimal",
            "target_doc_id": doc_id,
            "is_synthetic": False,
            "source_dataset": row["source_dataset"],
            "source_split": row["source_split"],
            "quality_notes": "plain query from Fulani source text",
        }
        queries.append(plain_query)

        cs_text, pattern, matrix_lang, embedded_langs = _generate_fulani_yoruba_codeswitch(
            row["doc_text"], rng
        )
        cs_query_id = f"ful_codeswitch_q_{idx}"
        cs_query = {
            "query_id": cs_query_id,
            "text": cs_text,
            "query_style": "codeswitch",
            "switch_pattern": pattern,
            "matrix_lang": matrix_lang,
            "embedded_langs": embedded_langs,
            "source_segment": "ful_yo_minimal",
            "target_doc_id": doc_id,
            "is_synthetic": True,
            "source_dataset": row["source_dataset"],
            "source_split": row["source_split"],
            "quality_notes": "minimal Fulani+Yoruba code-switch variant",
        }
        queries.append(cs_query)

    docs_by_id = {doc["doc_id"]: doc for doc in documents}
    for query in queries:
        doc = docs_by_id[query["target_doc_id"]]
        style_counts[query["query_style"]] += 1
        segment_counts[query["source_segment"]] += 1
        pattern_counts[query["switch_pattern"]] += 1

        pairs.append(
            {
                "pair_id": f"{query['query_id']}__{query['target_doc_id']}",
                "query_id": query["query_id"],
                "query_text": query["text"],
                "query_style": query["query_style"],
                "switch_pattern": query["switch_pattern"],
                "matrix_lang": query["matrix_lang"],
                "embedded_langs": query["embedded_langs"],
                "source_segment": query["source_segment"],
                "target_doc_id": query["target_doc_id"],
                "doc_id": query["target_doc_id"],
                "doc_text": doc["text"],
                "doc_lang": doc["lang"],
                "is_synthetic": query["is_synthetic"],
                "source_dataset": query["source_dataset"],
                "source_split": query["source_split"],
                "quality_notes": query["quality_notes"],
                "label": 1,
            }
        )

    documents_path = output_dir / "documents.jsonl"
    queries_path = output_dir / "queries.jsonl"
    pairs_path = output_dir / "pairs.jsonl"
    pairs_parquet = output_dir / "pairs.parquet"
    manifest_path = output_dir / "manifest.json"

    _write_jsonl(documents_path, documents)
    _write_jsonl(queries_path, queries)
    _write_jsonl(pairs_path, pairs)
    Dataset.from_list(pairs).to_parquet(str(pairs_parquet))

    manifest = {
        "created_utc": _utc_now(),
        "params": {
            "seed": args.seed,
            "fr_wo_eng_docs": args.fr_wo_eng_docs,
            "ful_yo_docs": args.ful_yo_docs,
            "min_chars": args.min_chars,
            "waxal_dataset_id": args.waxal_dataset_id,
            "waxal_config": args.waxal_config,
            "waxal_split": args.waxal_split,
        },
        "counts": {
            "documents": len(documents),
            "queries": len(queries),
            "pairs": len(pairs),
            "style_counts": dict(style_counts),
            "segment_counts": dict(segment_counts),
            "pattern_counts": dict(pattern_counts),
        },
        "schema": {
            "pair_fields": [
                "pair_id",
                "query_id",
                "query_text",
                "query_style",
                "switch_pattern",
                "matrix_lang",
                "embedded_langs",
                "source_segment",
                "target_doc_id",
                "doc_id",
                "doc_text",
                "doc_lang",
                "is_synthetic",
                "source_dataset",
                "source_split",
                "quality_notes",
                "label",
            ]
        },
        "files": {
            "documents_jsonl": str(documents_path),
            "queries_jsonl": str(queries_path),
            "pairs_jsonl": str(pairs_path),
            "pairs_parquet": str(pairs_parquet),
        },
        "notes": {
            "inspiration": "pattern style inspired by docs/examples.md",
            "pattern_codes": SWITCH_PATTERNS,
        },
    }
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    print(f"created: {output_dir}")
    print(json.dumps(manifest["counts"], indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
