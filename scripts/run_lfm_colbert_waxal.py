#!/usr/bin/env python3
"""
Run zero-shot and fine-tune experiments for LiquidAI LFM2 ColBERT on WaxalNLP.

This script:
1) Streams a small ASR subset from google/WaxalNLP.
2) Builds a retrieval benchmark dataset (query -> relevant doc IDs).
3) Runs zero-shot retrieval evaluation.
4) Optionally fine-tunes the ColBERT model with contrastive training.
5) Writes metrics/artifacts for zero-shot-only or fine-tune flows.
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
from pylate import indexes, losses, models, retrieve
from sentence_transformers import InputExample
from torch.utils.data import DataLoader


def _utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _slug_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")


def _clean_text(text: str) -> str:
    text = re.sub(r"\s+", " ", text or "").strip()
    return text


def _query_from_text(text: str, rng: random.Random) -> str:
    words = text.split()
    if len(words) <= 8:
        return text
    min_window = 5
    max_window = max(min_window, min(20, len(words) // 2))
    window = rng.randint(min_window, max_window)
    start_max = max(0, len(words) - window)
    start = rng.randint(0, start_max) if start_max > 0 else 0
    return " ".join(words[start : start + window])


SWITCH_DISCOURSE_MARKERS = [
    "Abeg",
    "Jowo",
    "E joo",
    "Se o ri",
    "O da",
]

SWITCH_TAGS = [
    "abi",
    "sha",
    "o da",
]

SWITCH_INTER_SENTENTIAL_CLAUSES = [
    "mo wa nibi",
    "ko si wahala",
    "e joo",
]

SWITCH_INSERT_TERMS = [
    "iranlowo",
    "owo",
    "iyara",
    "oro",
    "dara",
]


def _inject_terms(words: list[str], rng: random.Random, intensity: float) -> list[str]:
    if not words:
        return words

    ratio = max(0.05, min(0.8, intensity))
    replace_count = max(1, int(len(words) * ratio))
    replace_count = min(replace_count, len(words))
    replaced = list(words)
    replace_idx = rng.sample(range(len(replaced)), k=replace_count)
    for idx in replace_idx:
        replaced[idx] = rng.choice(SWITCH_INSERT_TERMS)
    return replaced


def _code_switch_query(text: str, rng: random.Random, intensity: float) -> str:
    base = _query_from_text(text, rng)
    words = base.split()
    if not words:
        return base

    pattern = rng.choice(["P1", "P2", "P3", "P4", "P5"])
    if pattern == "P1":
        return f"{rng.choice(SWITCH_DISCOURSE_MARKERS)}, {base}"
    if pattern == "P2":
        return f"{base}, {rng.choice(SWITCH_TAGS)}."
    if pattern == "P3":
        return " ".join(_inject_terms(words, rng, intensity))
    if pattern == "P4":
        switched = " ".join(_inject_terms(words, rng, intensity))
        return f"{switched}. {rng.choice(SWITCH_INTER_SENTENTIAL_CLAUSES)}."
    return f"{rng.choice(SWITCH_INTER_SENTENTIAL_CLAUSES)}. {base}"


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
            doc_id = hit[0]
            score = hit[1]

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


def _evaluate(
    model: models.ColBERT,
    docs: list[dict[str, str]],
    queries: list[dict[str, Any]],
    top_k: int,
    encode_batch_size: int,
    index_folder: Path,
    index_name: str,
    override_index: bool,
) -> Metrics:
    index = indexes.PLAID(
        index_folder=str(index_folder),
        index_name=index_name,
        override=override_index,
    )
    retriever = retrieve.ColBERT(index=index)

    doc_ids = [d["id"] for d in docs]
    doc_texts = [d["text"] for d in docs]
    doc_embeddings = model.encode(
        doc_texts,
        batch_size=encode_batch_size,
        is_query=False,
        show_progress_bar=False,
    )
    index.add_documents(documents_ids=doc_ids, documents_embeddings=doc_embeddings)

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
        raise RuntimeError("No evaluable queries found.")

    return Metrics(
        mrr_at_k=mrr_sum / evaluated,
        recall_at_k=recall_sum / evaluated,
        ndcg_at_k=ndcg_sum / evaluated,
        evaluated_queries=evaluated,
    )


def _collect_rows(
    dataset_id: str,
    config: str,
    split: str,
    count: int,
    min_chars: int,
    issues: list[str],
) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    stream = load_dataset(
        dataset_id,
        name=config,
        split=split,
        streaming=True,
        columns=["id", "transcription", "language"],
    )
    scanned = 0
    for sample in stream:
        scanned += 1
        sample_id = str(sample.get("id") or f"{split}_{scanned}")
        text = _clean_text(str(sample.get("transcription") or ""))
        if len(text) < min_chars:
            continue
        rows.append({"id": sample_id, "text": text, "language": str(sample.get("language") or "")})
        if len(rows) >= count:
            break

    if len(rows) < count:
        issues.append(
            f"{split}: requested {count} rows, collected {len(rows)} rows after scanning {scanned} samples."
        )
    return rows


def _build_training_examples(
    rows: list[dict[str, str]],
    rng: random.Random,
    train_pairs: int,
) -> list[InputExample]:
    examples: list[InputExample] = []
    for row in rows[:train_pairs]:
        query = _query_from_text(row["text"], rng)
        examples.append(InputExample(texts=[query, row["text"]]))
    return examples


def _build_eval_queries(
    rows: list[dict[str, str]],
    rng: random.Random,
    eval_queries: int,
    code_switch: bool,
    code_switch_intensity: float,
) -> list[dict[str, Any]]:
    queries: list[dict[str, Any]] = []
    for row in rows[:eval_queries]:
        if code_switch:
            query_text = _code_switch_query(row["text"], rng, code_switch_intensity)
        else:
            query_text = _query_from_text(row["text"], rng)
        queries.append(
            {
                "id": f"q_{row['id']}",
                "text": query_text,
                "relevant_doc_ids": [row["id"]],
            }
        )
    return queries


def _load_trainer_state(output_dir: Path) -> dict[str, Any] | None:
    candidates = list(output_dir.rglob("trainer_state.json"))
    if not candidates:
        return None
    latest = max(candidates, key=lambda p: p.stat().st_mtime)
    try:
        return json.loads(latest.read_text(encoding="utf-8"))
    except Exception:
        return None


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Zero-shot + fine-tune LFM2 ColBERT on WaxalNLP")
    parser.add_argument("--dataset-id", default="google/WaxalNLP")
    parser.add_argument("--config", default="ful_asr")
    parser.add_argument("--model-id", default="LiquidAI/LFM2-ColBERT-350M")
    parser.add_argument("--top-k", type=int, default=10)
    parser.add_argument("--train-docs", type=int, default=240)
    parser.add_argument("--eval-docs", type=int, default=120)
    parser.add_argument("--train-pairs", type=int, default=200)
    parser.add_argument("--eval-queries", type=int, default=100)
    parser.add_argument("--min-chars", type=int, default=30)
    parser.add_argument("--batch-size", type=int, default=4)
    parser.add_argument("--encode-batch-size", type=int, default=16)
    parser.add_argument("--epochs", type=int, default=1)
    parser.add_argument("--max-steps", type=int, default=20)
    parser.add_argument("--lr", type=float, default=2e-5)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument(
        "--eval-style",
        choices=["plain", "codeswitch", "both"],
        default="both",
        help="Evaluation query style(s) to run.",
    )
    parser.add_argument(
        "--code-switch-intensity",
        type=float,
        default=0.35,
        help="Approximate ratio of terms replaced in code-switched query synthesis.",
    )
    parser.add_argument(
        "--output-root",
        default="artifacts/lfm_colbert_waxal",
        help="Root folder for run artifacts.",
    )
    parser.add_argument(
        "--zero-shot-only",
        action="store_true",
        help="Skip fine-tuning and only run zero-shot evaluation.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    rng = random.Random(args.seed)

    run_dir = Path(args.output_root) / f"run-{_slug_now()}"
    run_dir.mkdir(parents=True, exist_ok=True)
    (run_dir / "logs").mkdir(parents=True, exist_ok=True)
    (run_dir / "indexes").mkdir(parents=True, exist_ok=True)

    issues: list[str] = []
    findings: list[str] = []

    print(f"[{_utc_now()}] loading dataset subset from {args.dataset_id} ({args.config})")
    train_rows = _collect_rows(
        dataset_id=args.dataset_id,
        config=args.config,
        split="train",
        count=args.train_docs,
        min_chars=args.min_chars,
        issues=issues,
    )
    eval_rows = _collect_rows(
        dataset_id=args.dataset_id,
        config=args.config,
        split="test",
        count=args.eval_docs,
        min_chars=args.min_chars,
        issues=issues,
    )

    if not train_rows or not eval_rows:
        raise RuntimeError("Insufficient rows from WaxalNLP for experiment.")

    # Corpus includes both train and eval docs so eval positives are retrievable.
    corpus = train_rows + eval_rows
    training_examples: list[InputExample] = []
    if not args.zero_shot_only:
        training_examples = _build_training_examples(train_rows, rng, args.train_pairs)
    eval_query_sets: dict[str, list[dict[str, Any]]] = {}
    if args.eval_style in ("plain", "both"):
        eval_query_sets["plain"] = _build_eval_queries(
            eval_rows,
            rng,
            args.eval_queries,
            code_switch=False,
            code_switch_intensity=args.code_switch_intensity,
        )
    if args.eval_style in ("codeswitch", "both"):
        eval_query_sets["codeswitch"] = _build_eval_queries(
            eval_rows,
            rng,
            args.eval_queries,
            code_switch=True,
            code_switch_intensity=args.code_switch_intensity,
        )

    if not args.zero_shot_only and not training_examples:
        raise RuntimeError("No training examples generated.")
    if not eval_query_sets:
        raise RuntimeError("No evaluation queries generated.")
    for style_name, style_queries in eval_query_sets.items():
        if not style_queries:
            raise RuntimeError(f"No evaluation queries generated for style: {style_name}")

    dataset_snapshot = {
        "train_rows": len(train_rows),
        "eval_rows": len(eval_rows),
        "corpus_docs": len(corpus),
        "training_pairs": len(training_examples),
        "eval_styles": list(eval_query_sets.keys()),
        "eval_queries_by_style": {k: len(v) for k, v in eval_query_sets.items()},
    }
    (run_dir / "dataset_snapshot.json").write_text(
        json.dumps(dataset_snapshot, indent=2),
        encoding="utf-8",
    )

    print(f"[{_utc_now()}] loading model {args.model_id}")
    model = models.ColBERT(model_name_or_path=args.model_id)
    original_tokenize = model.tokenize
    model.tokenize = lambda texts, **kwargs: original_tokenize(texts)

    trackio_project = "yaatal-lfm2-colbert-waxal"
    trackio_name = run_dir.name
    trackio.init(
        project=trackio_project,
        name=trackio_name,
        config={
            "dataset_id": args.dataset_id,
            "config": args.config,
            "model_id": args.model_id,
            "top_k": args.top_k,
            "epochs": args.epochs,
            "max_steps": args.max_steps,
            "batch_size": args.batch_size,
            "seed": args.seed,
            "eval_style": args.eval_style,
            "code_switch_intensity": args.code_switch_intensity,
            "zero_shot_only": bool(args.zero_shot_only),
        },
    )

    print(f"[{_utc_now()}] running zero-shot evaluation")
    baseline_by_style: dict[str, Metrics] = {}
    baseline_runtime_by_style: dict[str, float] = {}
    for style_name, style_queries in eval_query_sets.items():
        baseline_started = time.time()
        baseline_metrics = _evaluate(
            model=model,
            docs=corpus,
            queries=style_queries,
            top_k=args.top_k,
            encode_batch_size=args.encode_batch_size,
            index_folder=run_dir / "indexes",
            index_name=f"baseline_{style_name}",
            override_index=True,
        )
        baseline_runtime = time.time() - baseline_started
        baseline_by_style[style_name] = baseline_metrics
        baseline_runtime_by_style[style_name] = baseline_runtime

        trackio.log(
            {
                f"baseline/{style_name}/mrr_at_k": baseline_metrics.mrr_at_k,
                f"baseline/{style_name}/recall_at_k": baseline_metrics.recall_at_k,
                f"baseline/{style_name}/ndcg_at_k": baseline_metrics.ndcg_at_k,
                f"baseline/{style_name}/evaluated_queries": baseline_metrics.evaluated_queries,
                f"baseline/{style_name}/runtime_seconds": baseline_runtime,
            },
            step=0,
        )
        findings.append(
            f"Zero-shot [{style_name}] metrics on {args.config}: "
            f"MRR@{args.top_k}={baseline_metrics.mrr_at_k:.4f}, "
            f"Recall@{args.top_k}={baseline_metrics.recall_at_k:.4f}, "
            f"nDCG@{args.top_k}={baseline_metrics.ndcg_at_k:.4f}"
        )

    primary_style = "plain" if "plain" in baseline_by_style else next(iter(baseline_by_style))
    baseline_primary = baseline_by_style[primary_style]

    if args.zero_shot_only:
        trackio.finish()
        metrics_payload = {
            "timestamp_utc": _utc_now(),
            "dataset": {"id": args.dataset_id, "config": args.config},
            "model": {"base": args.model_id, "output_dir": None},
            "settings": {
                "top_k": args.top_k,
                "epochs": args.epochs,
                "max_steps": args.max_steps,
                "batch_size": args.batch_size,
                "encode_batch_size": args.encode_batch_size,
                "learning_rate": args.lr,
                "seed": args.seed,
                "eval_style": args.eval_style,
                "code_switch_intensity": args.code_switch_intensity,
                "primary_eval_style": primary_style,
                "zero_shot_only": True,
            },
            "dataset_snapshot": dataset_snapshot,
            "baseline": asdict(baseline_primary),
            "finetuned": None,
            "delta": None,
            "baseline_by_eval_style": {k: asdict(v) for k, v in baseline_by_style.items()},
            "finetuned_by_eval_style": {},
            "delta_by_eval_style": {},
            "runtime_seconds": {
                "baseline_eval": baseline_runtime_by_style.get(primary_style, 0.0),
                "train": 0.0,
                "finetuned_eval": 0.0,
                "baseline_eval_by_style": baseline_runtime_by_style,
                "finetuned_eval_by_style": {},
            },
            "trackio": {"project": trackio_project, "run_name": trackio_name},
            "issues": issues,
            "findings": findings,
            "trainer_state": None,
        }
        metrics_path = run_dir / "metrics.json"
        metrics_path.write_text(json.dumps(metrics_payload, indent=2), encoding="utf-8")

        report_lines = [
            "# LFM2-ColBERT Waxal Run Report",
            "",
            f"- Run: `{run_dir.name}`",
            f"- Timestamp (UTC): `{metrics_payload['timestamp_utc']}`",
            f"- Dataset: `{args.dataset_id}` / `{args.config}`",
            f"- Model: `{args.model_id}`",
            "- Mode: `zero-shot-only`",
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
                f"- Dataset snapshot: `{run_dir / 'dataset_snapshot.json'}`",
                f"- Index folder: `{run_dir / 'indexes'}`",
            ]
        )
        (run_dir / "issues_findings.md").write_text("\n".join(report_lines) + "\n", encoding="utf-8")

        print(f"[{_utc_now()}] completed")
        print(f"metrics: {metrics_path}")
        print(f"report:  {run_dir / 'issues_findings.md'}")
        return 0

    print(f"[{_utc_now()}] fine-tuning model")
    train_loader = DataLoader(training_examples, batch_size=args.batch_size, shuffle=True)
    train_loss = losses.Contrastive(model)
    total_steps = math.ceil(len(training_examples) / args.batch_size)
    steps_per_epoch = min(args.max_steps, total_steps)
    warmup_steps = max(1, steps_per_epoch // 10)

    model_output_dir = run_dir / "model"
    model_output_dir.mkdir(parents=True, exist_ok=True)

    train_started = time.time()
    model.fit(
        train_objectives=[(train_loader, train_loss)],
        epochs=args.epochs,
        steps_per_epoch=steps_per_epoch,
        warmup_steps=warmup_steps,
        optimizer_params={"lr": args.lr},
        output_path=str(model_output_dir),
        show_progress_bar=True,
    )
    train_seconds = time.time() - train_started

    trainer_state = _load_trainer_state(model_output_dir)
    if trainer_state is None:
        issues.append("No trainer_state.json found in model output; training logs may be partial.")

    print(f"[{_utc_now()}] running post-finetune evaluation")
    finetuned_by_style: dict[str, Metrics] = {}
    finetuned_runtime_by_style: dict[str, float] = {}
    delta_by_style: dict[str, dict[str, float]] = {}
    for style_name, style_queries in eval_query_sets.items():
        finetuned_started = time.time()
        finetuned_metrics = _evaluate(
            model=model,
            docs=corpus,
            queries=style_queries,
            top_k=args.top_k,
            encode_batch_size=args.encode_batch_size,
            index_folder=run_dir / "indexes",
            index_name=f"finetuned_{style_name}",
            override_index=True,
        )
        finetuned_runtime = time.time() - finetuned_started
        finetuned_by_style[style_name] = finetuned_metrics
        finetuned_runtime_by_style[style_name] = finetuned_runtime

        baseline_metrics = baseline_by_style[style_name]
        delta_metrics = {
            "mrr_at_k_delta": finetuned_metrics.mrr_at_k - baseline_metrics.mrr_at_k,
            "recall_at_k_delta": finetuned_metrics.recall_at_k - baseline_metrics.recall_at_k,
            "ndcg_at_k_delta": finetuned_metrics.ndcg_at_k - baseline_metrics.ndcg_at_k,
        }
        delta_by_style[style_name] = delta_metrics

        trackio.log(
            {
                f"finetuned/{style_name}/mrr_at_k": finetuned_metrics.mrr_at_k,
                f"finetuned/{style_name}/recall_at_k": finetuned_metrics.recall_at_k,
                f"finetuned/{style_name}/ndcg_at_k": finetuned_metrics.ndcg_at_k,
                f"finetuned/{style_name}/evaluated_queries": finetuned_metrics.evaluated_queries,
                f"finetuned/{style_name}/runtime_seconds": finetuned_runtime,
                f"delta/{style_name}/mrr_at_k": delta_metrics["mrr_at_k_delta"],
                f"delta/{style_name}/recall_at_k": delta_metrics["recall_at_k_delta"],
                f"delta/{style_name}/ndcg_at_k": delta_metrics["ndcg_at_k_delta"],
                "train/runtime_seconds": train_seconds,
                "train/steps_per_epoch": steps_per_epoch,
                "train/epochs": args.epochs,
            },
            step=1,
        )

        findings.append(
            f"Post-finetune [{style_name}] metrics: "
            f"MRR@{args.top_k}={finetuned_metrics.mrr_at_k:.4f}, "
            f"Recall@{args.top_k}={finetuned_metrics.recall_at_k:.4f}, "
            f"nDCG@{args.top_k}={finetuned_metrics.ndcg_at_k:.4f}"
        )
        findings.append(
            f"Delta [{style_name}]: "
            f"dMRR={delta_metrics['mrr_at_k_delta']:.4f}, "
            f"dRecall={delta_metrics['recall_at_k_delta']:.4f}, "
            f"dnDCG={delta_metrics['ndcg_at_k_delta']:.4f}"
        )
    trackio.finish()

    finetuned_primary = finetuned_by_style[primary_style]
    delta_primary = delta_by_style[primary_style]

    metrics_payload = {
        "timestamp_utc": _utc_now(),
        "dataset": {"id": args.dataset_id, "config": args.config},
        "model": {"base": args.model_id, "output_dir": str(model_output_dir)},
        "settings": {
            "top_k": args.top_k,
            "epochs": args.epochs,
            "max_steps": args.max_steps,
            "batch_size": args.batch_size,
            "encode_batch_size": args.encode_batch_size,
            "learning_rate": args.lr,
            "seed": args.seed,
            "eval_style": args.eval_style,
            "code_switch_intensity": args.code_switch_intensity,
            "primary_eval_style": primary_style,
            "zero_shot_only": False,
        },
        "dataset_snapshot": dataset_snapshot,
        "baseline": asdict(baseline_primary),
        "finetuned": asdict(finetuned_primary),
        "delta": delta_primary,
        "baseline_by_eval_style": {k: asdict(v) for k, v in baseline_by_style.items()},
        "finetuned_by_eval_style": {k: asdict(v) for k, v in finetuned_by_style.items()},
        "delta_by_eval_style": delta_by_style,
        "runtime_seconds": {
            "baseline_eval": baseline_runtime_by_style.get(primary_style, 0.0),
            "train": train_seconds,
            "finetuned_eval": finetuned_runtime_by_style.get(primary_style, 0.0),
            "baseline_eval_by_style": baseline_runtime_by_style,
            "finetuned_eval_by_style": finetuned_runtime_by_style,
        },
        "trackio": {"project": trackio_project, "run_name": trackio_name},
        "issues": issues,
        "findings": findings,
        "trainer_state": trainer_state,
    }

    metrics_path = run_dir / "metrics.json"
    metrics_path.write_text(json.dumps(metrics_payload, indent=2), encoding="utf-8")

    report_lines = [
        "# LFM2-ColBERT Waxal Run Report",
        "",
        f"- Run: `{run_dir.name}`",
        f"- Timestamp (UTC): `{metrics_payload['timestamp_utc']}`",
        f"- Dataset: `{args.dataset_id}` / `{args.config}`",
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
            f"- Dataset snapshot: `{run_dir / 'dataset_snapshot.json'}`",
            f"- Model output: `{model_output_dir}`",
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
