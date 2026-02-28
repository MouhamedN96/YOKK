#!/usr/bin/env python3
"""
Run scenario-based zero-shot retrieval evaluation for a bargain intent slice.

The script reuses the locally built baseline corpus and synthesizes bargain-style
queries (plain + code-switch) anchored to document snippets so relevance labels
remain deterministic.
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
from pylate import indexes, models, retrieve


def _utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _slug_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")


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


PLAIN_BARGAIN_TEMPLATES = [
    "Can you reduce the price a little? {anchor}",
    "Please lower the price for this one. {anchor}",
    "I want to bargain a better price. {anchor}",
    "Could you make this cheaper? {anchor}",
]

CODE_SWITCH_BARGAIN_TEMPLATES = [
    "Wanil price bi tuuti, {anchor}",
    "Actually, wanil price bi, {anchor}",
    "Abeg, jowo, reduce price, {anchor}",
    "Price bi dafa bari, can you lower am? {anchor}",
]

FUL_YO_CODE_SWITCH_TEMPLATES = [
    "Abeg, jowo, owo yi po ju, {anchor}",
    "Mi yidi lower price, jowo, {anchor}",
    "E joo, owo yi ga ju, {anchor}",
]


def _read_jsonl(path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    with path.open("r", encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if line:
                rows.append(json.loads(line))
    return rows


def _normalize_hits(hits: Any) -> list[dict[str, Any]]:
    normalized: list[dict[str, Any]] = []
    if hits is None:
        return normalized

    for hit in hits:
        doc_id: Any = None
        score: Any = None
        if isinstance(hit, dict):
            doc_id = hit.get("doc_id") or hit.get("document_id") or hit.get("id") or hit.get("pid")
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
    parser = argparse.ArgumentParser(description="Run scenario-based zero-shot bargain evaluation.")
    parser.add_argument(
        "--pairs-jsonl",
        default="data/corpus/codeswitch_baseline_v2/pairs.jsonl",
        help="Path to pairs JSONL produced by build_codeswitch_baseline_v2.py",
    )
    parser.add_argument("--model-id", default="LiquidAI/LFM2-ColBERT-350M")
    parser.add_argument("--max-docs", type=int, default=120)
    parser.add_argument("--eval-queries", type=int, default=80)
    parser.add_argument("--top-k", type=int, default=10)
    parser.add_argument("--encode-batch-size", type=int, default=4)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--output-root", default="artifacts/lfm_colbert_scenarios/bargain")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    rng = random.Random(args.seed)

    pairs_path = Path(args.pairs_jsonl)
    if not pairs_path.exists():
        raise RuntimeError(f"pairs JSONL not found: {pairs_path}")

    run_dir = Path(args.output_root) / f"run-{_slug_now()}"
    run_dir.mkdir(parents=True, exist_ok=True)
    (run_dir / "indexes").mkdir(parents=True, exist_ok=True)

    rows = _read_jsonl(pairs_path)
    docs_by_id: dict[str, dict[str, Any]] = {}
    for row in rows:
        doc_id = _clean(str(row.get("doc_id") or ""))
        doc_text = _clean(str(row.get("doc_text") or ""))
        if not doc_id or not doc_text:
            continue
        if doc_id in docs_by_id:
            continue
        docs_by_id[doc_id] = {
            "id": doc_id,
            "text": doc_text,
            "doc_lang": _clean(str(row.get("doc_lang") or "")),
            "source_segment": _clean(str(row.get("source_segment") or "")),
        }

    docs = list(docs_by_id.values())
    rng.shuffle(docs)
    docs = docs[: args.max_docs]
    if not docs:
        raise RuntimeError("No usable documents extracted from pairs JSONL.")

    query_limit = min(args.eval_queries, len(docs))
    plain_queries: list[dict[str, Any]] = []
    codeswitch_queries: list[dict[str, Any]] = []

    for i in range(query_limit):
        doc = docs[i]
        anchor = _snippet(doc["text"], rng, 4, 12) or doc["text"]
        plain_text = rng.choice(PLAIN_BARGAIN_TEMPLATES).format(anchor=anchor)

        if doc["source_segment"] == "ful_yo_minimal":
            cs_template = rng.choice(FUL_YO_CODE_SWITCH_TEMPLATES)
        else:
            cs_template = rng.choice(CODE_SWITCH_BARGAIN_TEMPLATES)
        codeswitch_text = cs_template.format(anchor=anchor)

        plain_queries.append(
            {"id": f"plain_q{i}", "text": plain_text, "relevant_doc_ids": [doc["id"]]}
        )
        codeswitch_queries.append(
            {"id": f"cs_q{i}", "text": codeswitch_text, "relevant_doc_ids": [doc["id"]]}
        )

    print(f"[{_utc_now()}] loading model: {args.model_id}")
    model = models.ColBERT(model_name_or_path=args.model_id)

    print(f"[{_utc_now()}] indexing documents")
    index = indexes.PLAID(
        index_folder=str(run_dir / "indexes"),
        index_name="scenario_docs",
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

    trackio_project = "yaatal-lfm2-colbert-scenario-bargain"
    trackio_name = run_dir.name
    trackio.init(
        project=trackio_project,
        name=trackio_name,
        config={
            "pairs_jsonl": str(pairs_path),
            "model_id": args.model_id,
            "max_docs": args.max_docs,
            "eval_queries": query_limit,
            "top_k": args.top_k,
            "seed": args.seed,
            "scenario": "bargain",
        },
    )

    metrics_by_style: dict[str, Metrics] = {}
    runtime_by_style: dict[str, float] = {}
    style_map = {"plain": plain_queries, "codeswitch": codeswitch_queries}

    findings: list[str] = []
    for style_name, queries in style_map.items():
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
            f"Bargain [{style_name}] MRR@{args.top_k}={metrics.mrr_at_k:.4f}, "
            f"Recall@{args.top_k}={metrics.recall_at_k:.4f}, nDCG@{args.top_k}={metrics.ndcg_at_k:.4f}"
        )

    trackio.finish()

    payload = {
        "timestamp_utc": _utc_now(),
        "scenario": "bargain",
        "model": {"id": args.model_id},
        "dataset": {"pairs_jsonl": str(pairs_path)},
        "settings": {
            "max_docs": args.max_docs,
            "eval_queries": query_limit,
            "top_k": args.top_k,
            "encode_batch_size": args.encode_batch_size,
            "seed": args.seed,
        },
        "metrics_by_style": {k: asdict(v) for k, v in metrics_by_style.items()},
        "runtime_seconds_by_style": runtime_by_style,
        "query_examples": {
            "plain": plain_queries[:5],
            "codeswitch": codeswitch_queries[:5],
        },
        "trackio": {"project": trackio_project, "run_name": trackio_name},
        "findings": findings,
    }

    metrics_path = run_dir / "metrics.json"
    metrics_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    report_lines = [
        "# LFM2 ColBERT Scenario Run",
        "",
        f"- Run: `{run_dir.name}`",
        f"- Timestamp (UTC): `{payload['timestamp_utc']}`",
        "- Scenario: `bargain`",
        f"- Model: `{args.model_id}`",
        f"- Pairs source: `{pairs_path}`",
        "",
        "## Findings",
    ]
    for finding in findings:
        report_lines.append(f"- {finding}")
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
