#!/usr/bin/env python3
"""
Zero-shot retrieval iterations for English/French/Wolof + code-switch queries.

Source dataset (default):
- bilalfaye/english-wolof-french-translation

Documents are indexed from Wolof (`wo`) text.
Queries are evaluated in:
- english
- french
- wolof
- fr_en_wo_mix
"""

from __future__ import annotations

import argparse
import json
import math
import random
import re
import sys
import time
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import trackio
from datasets import load_dataset
from pylate import indexes, models, retrieve


def _utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _slug_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")


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


def _normalize_hits(hits: Any) -> list[dict[str, Any]]:
    normalized: list[dict[str, Any]] = []
    if hits is None:
        return normalized

    for hit in hits:
        doc_id: Any = None
        score: Any = None
        if isinstance(hit, dict):
            doc_id = (
                hit.get("doc_id")
                or hit.get("document_id")
                or hit.get("id")
                or hit.get("pid")
            )
            score = hit.get("score")
        elif isinstance(hit, (list, tuple)) and len(hit) >= 2:
            doc_id, score = hit[0], hit[1]

        if doc_id is None:
            continue

        try:
            score_value = float(score) if score is not None else 0.0
        except (TypeError, ValueError):
            score_value = 0.0
        normalized.append({"doc_id": str(doc_id), "score": score_value})

    return normalized


@dataclass
class Metrics:
    mrr_at_k: float
    recall_at_k: float
    ndcg_at_k: float
    evaluated_queries: int


def _evaluate_style(
    model: models.ColBERT,
    retriever: retrieve.ColBERT,
    queries: list[dict[str, Any]],
    top_k: int,
    encode_batch_size: int,
) -> Metrics:
    mrr_sum = 0.0
    recall_sum = 0.0
    ndcg_sum = 0.0
    evaluated = 0

    for query in queries:
        relevant = set(query["relevant_doc_ids"])
        if not relevant:
            continue

        query_embeddings = model.encode(
            [query["text"]],
            batch_size=encode_batch_size,
            is_query=True,
            show_progress_bar=False,
        )
        raw = retriever.retrieve(queries_embeddings=query_embeddings, k=top_k)
        hits = raw[0] if isinstance(raw, list) and raw else raw
        ranked = _normalize_hits(hits)[:top_k]

        first_relevant_rank = None
        relevant_hits = 0
        dcg = 0.0
        for idx, hit in enumerate(ranked):
            if hit["doc_id"] in relevant:
                if first_relevant_rank is None:
                    first_relevant_rank = idx + 1
                relevant_hits += 1
                dcg += 1.0 / math.log2(idx + 2)

        idcg_limit = min(len(relevant), top_k)
        idcg = 0.0
        for idx in range(idcg_limit):
            idcg += 1.0 / math.log2(idx + 2)

        reciprocal_rank = 0.0 if first_relevant_rank is None else 1.0 / first_relevant_rank
        recall = relevant_hits / len(relevant)
        ndcg = (dcg / idcg) if idcg > 0 else 0.0

        mrr_sum += reciprocal_rank
        recall_sum += recall
        ndcg_sum += ndcg
        evaluated += 1

    if evaluated == 0:
        raise RuntimeError("No evaluable queries.")

    return Metrics(
        mrr_at_k=mrr_sum / evaluated,
        recall_at_k=recall_sum / evaluated,
        ndcg_at_k=ndcg_sum / evaluated,
        evaluated_queries=evaluated,
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run FR/EN/WO zero-shot iterations with LFM2 ColBERT.")
    parser.add_argument("--dataset-id", default="bilalfaye/english-wolof-french-translation")
    parser.add_argument("--split", default="train")
    parser.add_argument("--model-id", default="LiquidAI/LFM2-ColBERT-350M")
    parser.add_argument("--sample-size", type=int, default=320)
    parser.add_argument("--eval-queries", type=int, default=120)
    parser.add_argument("--min-chars", type=int, default=12)
    parser.add_argument("--top-k", type=int, default=10)
    parser.add_argument("--encode-batch-size", type=int, default=16)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--output-root", default="artifacts/lfm_colbert_fr_en_wo")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    rng = random.Random(args.seed)

    run_dir = Path(args.output_root) / f"run-{_slug_now()}"
    run_dir.mkdir(parents=True, exist_ok=True)
    (run_dir / "indexes").mkdir(parents=True, exist_ok=True)

    issues: list[str] = []
    findings: list[str] = []

    print(f"[{_utc_now()}] loading dataset sample: {args.dataset_id}/{args.split}")
    stream = load_dataset(
        args.dataset_id,
        split=args.split,
        streaming=True,
        columns=["en", "fr", "wo"],
    )

    samples: list[dict[str, str]] = []
    scanned = 0
    for row in stream:
        scanned += 1
        en = _clean(str(row.get("en") or ""))
        fr = _clean(str(row.get("fr") or ""))
        wo = _clean(str(row.get("wo") or ""))
        if min(len(en), len(fr), len(wo)) < args.min_chars:
            continue
        samples.append({"en": en, "fr": fr, "wo": wo})
        if len(samples) >= args.sample_size:
            break

    if len(samples) < args.eval_queries:
        issues.append(
            f"Requested eval_queries={args.eval_queries}, collected={len(samples)} rows after scanning={scanned}."
        )
    if not samples:
        raise RuntimeError("No valid multilingual samples collected.")

    docs = [{"id": f"d{i}", "text": row["wo"]} for i, row in enumerate(samples)]
    query_limit = min(args.eval_queries, len(samples))
    style_queries = {
        "english": [
            {"id": f"en_q{i}", "text": _snippet(samples[i]["en"], rng), "relevant_doc_ids": [f"d{i}"]}
            for i in range(query_limit)
        ],
        "french": [
            {"id": f"fr_q{i}", "text": _snippet(samples[i]["fr"], rng), "relevant_doc_ids": [f"d{i}"]}
            for i in range(query_limit)
        ],
        "wolof": [
            {"id": f"wo_q{i}", "text": _snippet(samples[i]["wo"], rng), "relevant_doc_ids": [f"d{i}"]}
            for i in range(query_limit)
        ],
        "fr_en_wo_mix": [
            {
                "id": f"mix_q{i}",
                "text": _mix_fr_en_wo(samples[i]["fr"], samples[i]["en"], samples[i]["wo"], rng),
                "relevant_doc_ids": [f"d{i}"],
            }
            for i in range(query_limit)
        ],
    }

    print(f"[{_utc_now()}] loading model: {args.model_id}")
    model = models.ColBERT(model_name_or_path=args.model_id)

    print(f"[{_utc_now()}] indexing documents")
    index = indexes.PLAID(
        index_folder=str(run_dir / "indexes"),
        index_name="docs",
        override=True,
    )
    retriever = retrieve.ColBERT(index=index)

    doc_embeddings = model.encode(
        [d["text"] for d in docs],
        batch_size=args.encode_batch_size,
        is_query=False,
        show_progress_bar=False,
    )
    index.add_documents(
        documents_ids=[d["id"] for d in docs],
        documents_embeddings=doc_embeddings,
    )

    trackio_project = "yaatal-lfm2-colbert-trilingual-iterations"
    trackio_name = run_dir.name
    trackio.init(
        project=trackio_project,
        name=trackio_name,
        config={
            "dataset_id": args.dataset_id,
            "split": args.split,
            "model_id": args.model_id,
            "top_k": args.top_k,
            "sample_size": args.sample_size,
            "eval_queries": query_limit,
            "seed": args.seed,
        },
    )

    metrics_by_style: dict[str, Metrics] = {}
    runtime_by_style: dict[str, float] = {}
    for style_name, queries in style_queries.items():
        started = time.time()
        metrics = _evaluate_style(
            model=model,
            retriever=retriever,
            queries=queries,
            top_k=args.top_k,
            encode_batch_size=args.encode_batch_size,
        )
        elapsed = time.time() - started
        metrics_by_style[style_name] = metrics
        runtime_by_style[style_name] = elapsed
        trackio.log(
            {
                f"zeroshot/{style_name}/mrr_at_k": metrics.mrr_at_k,
                f"zeroshot/{style_name}/recall_at_k": metrics.recall_at_k,
                f"zeroshot/{style_name}/ndcg_at_k": metrics.ndcg_at_k,
                f"zeroshot/{style_name}/evaluated_queries": metrics.evaluated_queries,
                f"zeroshot/{style_name}/runtime_seconds": elapsed,
            }
        )
        findings.append(
            f"Zero-shot [{style_name}] MRR@{args.top_k}={metrics.mrr_at_k:.4f}, "
            f"Recall@{args.top_k}={metrics.recall_at_k:.4f}, nDCG@{args.top_k}={metrics.ndcg_at_k:.4f}"
        )

    trackio.finish()

    payload = {
        "timestamp_utc": _utc_now(),
        "dataset": {"id": args.dataset_id, "split": args.split},
        "model": {"id": args.model_id},
        "settings": {
            "top_k": args.top_k,
            "sample_size": args.sample_size,
            "eval_queries": query_limit,
            "min_chars": args.min_chars,
            "encode_batch_size": args.encode_batch_size,
            "seed": args.seed,
        },
        "dataset_snapshot": {"scanned": scanned, "sampled_rows": len(samples), "doc_count": len(docs)},
        "metrics_by_style": {k: asdict(v) for k, v in metrics_by_style.items()},
        "runtime_seconds_by_style": runtime_by_style,
        "query_examples": {k: v[:3] for k, v in style_queries.items()},
        "trackio": {"project": trackio_project, "run_name": trackio_name},
        "issues": issues,
        "findings": findings,
    }

    metrics_path = run_dir / "metrics.json"
    metrics_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    report_lines = [
        "# LFM2 ColBERT FR/EN/WO Iterations",
        "",
        f"- Run: `{run_dir.name}`",
        f"- Timestamp (UTC): `{payload['timestamp_utc']}`",
        f"- Dataset: `{args.dataset_id}` ({args.split})",
        f"- Model: `{args.model_id}`",
        "",
        "## Findings",
    ]
    for finding in findings:
        report_lines.append(f"- {finding}")

    report_lines.extend(["", "## Issues"])
    if issues:
        for issue in issues:
            report_lines.append(f"- {issue}")
    else:
        report_lines.append("- None")

    report_lines.extend(
        [
            "",
            "## Artifacts",
            f"- Metrics JSON: `{metrics_path}`",
            f"- Index folder: `{run_dir / 'indexes'}`",
        ]
    )
    (run_dir / "issues_findings.md").write_text("\n".join(report_lines) + "\n", encoding="utf-8")

    print(f"[{_utc_now()}] completed")
    print(f"metrics: {metrics_path}")
    print(f"report:  {run_dir / 'issues_findings.md'}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"fatal: {exc}", file=sys.stderr)
        raise SystemExit(1)
