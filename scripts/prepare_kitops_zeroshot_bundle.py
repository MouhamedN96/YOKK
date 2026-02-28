#!/usr/bin/env python3
"""Prepare a reproducible KitOps bundle for the latest zero-shot runs."""

from __future__ import annotations

import argparse
import hashlib
import json
import shutil
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable


def _timestamp() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _latest_dir(path: Path, glob_pattern: str = "run-*") -> Path:
    candidates = sorted(p for p in path.glob(glob_pattern) if p.is_dir())
    if not candidates:
        raise FileNotFoundError(f"No run directories matching '{glob_pattern}' under: {path}")
    return candidates[-1]


def _latest_file(path: Path, patterns: list[str]) -> Path | None:
    for pattern in patterns:
        candidates = sorted(p for p in path.glob(pattern) if p.is_file())
        if candidates:
            return candidates[-1]
    return None


def _first_existing(candidates: Iterable[Path]) -> Path | None:
    for path in candidates:
        if path.exists():
            return path
    return None


def _detect_artifacts_root(repo_root: Path, override: Path | None) -> Path:
    candidates: list[Path] = []
    if override is not None:
        candidates.append(override.resolve())
    candidates.extend(
        [
            (repo_root / "artifacts").resolve(),
            (repo_root.parent / "artifacts").resolve(),
        ]
    )

    for candidate in candidates:
        if (candidate / "lfm_colbert_fr_en_wo").exists() and (candidate / "lfm_colbert_waxal").exists():
            return candidate

    first_existing = _first_existing(candidates)
    if first_existing is not None:
        return first_existing

    raise FileNotFoundError(
        "Unable to locate artifacts root. Tried:\n"
        + "\n".join(f"- {candidate}" for candidate in candidates)
    )


def _detect_dataset_root(repo_root: Path, override: Path | None) -> Path:
    candidates: list[Path] = []
    if override is not None:
        candidates.append(override.resolve())
    candidates.extend(
        [
            (repo_root / "data" / "corpus" / "codeswitch_baseline_v2").resolve(),
            (repo_root.parent / "data" / "corpus" / "codeswitch_baseline_v2").resolve(),
        ]
    )

    dataset_root = _first_existing(candidates)
    if dataset_root is None:
        raise FileNotFoundError(
            "Unable to locate codeswitch_baseline_v2 dataset directory. Tried:\n"
            + "\n".join(f"- {candidate}" for candidate in candidates)
        )
    return dataset_root


def _copy_file(src: Path, dst: Path, copied: list[Path]) -> None:
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dst)
    copied.append(dst)


def _copy_if_exists(src: Path, dst: Path, copied: list[Path]) -> bool:
    if not src.exists():
        return False
    _copy_file(src, dst, copied)
    return True


def _copy_required(src: Path, dst: Path, copied: list[Path]) -> None:
    if not src.exists():
        raise FileNotFoundError(f"Required file missing: {src}")
    _copy_file(src, dst, copied)


def _portable_path(path: Path, repo_root: Path) -> str:
    for base in (repo_root, repo_root.parent):
        try:
            return path.resolve().relative_to(base.resolve()).as_posix()
        except ValueError:
            continue
    return path.name


@dataclass(frozen=True)
class RunSnapshot:
    name: str
    source: Path
    dest: Path


def _write_summary_markdown(
    summary_path: Path,
    run_snapshots: list[RunSnapshot],
    copied_reports: list[Path],
    bundle_version: str,
    model_id: str,
    source_label_by_run: dict[str, str],
) -> None:
    lines: list[str] = []
    lines.append("# Zero-Shot Bundle Summary")
    lines.append("")
    lines.append(f"- Bundle version: `{bundle_version}`")
    lines.append(f"- Model: `{model_id}`")
    lines.append(f"- Generated (UTC): `{datetime.now(timezone.utc).isoformat()}`")
    lines.append("")
    lines.append("## Included Runs")
    lines.append("")

    for snapshot in run_snapshots:
        lines.append(f"### {snapshot.name}")
        lines.append(f"- Source: `{source_label_by_run[snapshot.name]}`")
        metrics_path = snapshot.dest / "metrics.json"
        if metrics_path.exists():
            lines.extend(_metric_lines(metrics_path))
        else:
            lines.append("- `metrics.json` not found")
        lines.append("")

    if copied_reports:
        lines.append("## Included Consolidated Reports")
        lines.append("")
        for report in copied_reports:
            lines.append(f"- `{report.as_posix()}`")
        lines.append("")

    summary_path.parent.mkdir(parents=True, exist_ok=True)
    summary_path.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")


def _metric_lines(metrics_path: Path) -> list[str]:
    try:
        payload = json.loads(metrics_path.read_text(encoding="utf-8"))
    except Exception:
        return [f"- Failed to parse `{metrics_path.name}`"]

    rows: list[str] = []

    def extract_triplet(blob: dict) -> tuple[float, float, float] | None:
        mrr = blob.get("mrr_at_10", blob.get("mrr_at_k"))
        recall = blob.get("recall_at_10", blob.get("recall_at_k"))
        ndcg = blob.get("ndcg_at_10", blob.get("ndcg_at_k"))
        if isinstance(mrr, (int, float)) and isinstance(recall, (int, float)) and isinstance(ndcg, (int, float)):
            return float(mrr), float(recall), float(ndcg)
        return None

    # Named style blocks (e.g. metrics_by_style, baseline_by_eval_style).
    for block_name in (
        "metrics_by_style",
        "baseline_by_eval_style",
        "finetuned_by_eval_style",
        "delta_by_eval_style",
    ):
        block = payload.get(block_name)
        if not isinstance(block, dict):
            continue
        for style, blob in block.items():
            if not isinstance(blob, dict):
                continue
            triplet = extract_triplet(blob)
            if triplet is None:
                continue
            mrr, recall, ndcg = triplet
            rows.append(f"- {style}: `MRR@10={mrr:.4f}`, `Recall@10={recall:.4f}`, `nDCG@10={ndcg:.4f}`")

    # Single metric blocks (e.g. baseline, finetuned, zero_shot).
    for block_name in ("baseline", "finetuned", "delta", "zero_shot"):
        block = payload.get(block_name)
        if not isinstance(block, dict):
            continue
        triplet = extract_triplet(block)
        if triplet is None:
            continue
        mrr, recall, ndcg = triplet
        rows.append(f"- {block_name}: `MRR@10={mrr:.4f}`, `Recall@10={recall:.4f}`, `nDCG@10={ndcg:.4f}`")

    if not rows:
        rows.append("- No retrieval metrics found in `metrics.json`")
    return rows


def _write_modelkit_yaml(
    path: Path,
    package_name: str,
    bundle_version: str,
    include_scenario: bool,
    report_filenames: list[str],
) -> None:
    lines = [
        "manifestVersion: v1.0.0",
        "package:",
        f"  name: {package_name}",
        f"  version: {bundle_version}",
        '  description: "Reproducible LFM2-ColBERT zero-shot artifacts for YAATAL."',
        "  authors:",
        "    - YAATAL LABS LLC",
        '  license: "Apache-2.0"',
        "code:",
        "  - path: code/scripts",
        '    description: "Scripts used to build and evaluate the zero-shot baselines."',
        "  - path: code/notebooks",
        '    description: "Research notebooks with runnable commands and outputs."',
        "datasets:",
        "  - path: runs/fr_en_wo",
        '    description: "Latest FR/EN/WO zero-shot run snapshot (metrics + findings)."',
        "  - path: runs/waxal",
        '    description: "Latest WAXAL zero-shot run snapshot (plain + code-switch)."',
    ]

    if include_scenario:
        lines.extend(
            [
                "  - path: runs/scenario_bargain",
                '    description: "Latest bargain scenario zero-shot run snapshot."',
            ]
        )

    lines.extend(
        [
            "  - path: datasets/codeswitch_baseline_v2",
            '    description: "Minimal FR/WO/EN + FUL/YO code-switch baseline dataset."',
            "docs:",
            "  - path: docs/bundle-summary.md",
            '    description: "Snapshot metadata and key metric highlights."',
        ]
    )

    for filename in report_filenames:
        lines.extend(
            [
                f"  - path: reports/{filename}",
                '    description: "Consolidated zero-shot metric report."',
            ]
        )

    path.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")


def _collect_copied_files(root: Path) -> Iterable[Path]:
    for path in sorted(root.rglob("*")):
        if path.is_file():
            yield path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--repo-root",
        type=Path,
        default=Path(__file__).resolve().parents[1],
        help="Repository root path (default: script parent repo root).",
    )
    parser.add_argument(
        "--output-root",
        type=Path,
        default=Path("artifacts/kitops"),
        help="Bundle output root relative to --repo-root.",
    )
    parser.add_argument(
        "--bundle-name",
        type=str,
        default="",
        help="Optional explicit bundle folder name (default: zeroshot-<utcstamp>).",
    )
    parser.add_argument(
        "--model-id",
        type=str,
        default="LiquidAI/LFM2-ColBERT-350M",
        help="Model identifier to include in metadata.",
    )
    parser.add_argument(
        "--package-name",
        type=str,
        default="yaatal-lfm2-colbert-zeroshot",
        help="KitOps package.name value in modelkit.yaml.",
    )
    parser.add_argument(
        "--artifacts-root",
        type=Path,
        default=None,
        help="Optional explicit artifacts root containing run folders and reports.",
    )
    parser.add_argument(
        "--dataset-root",
        type=Path,
        default=None,
        help="Optional explicit codeswitch_baseline_v2 dataset root.",
    )
    parser.add_argument(
        "--include-scenario",
        action="store_true",
        help="Require and include the latest bargain scenario run.",
    )
    parser.add_argument(
        "--allow-missing-required-files",
        action="store_true",
        help="Do not fail if required run/data/script files are missing.",
    )
    parser.add_argument(
        "--include-absolute-source-paths",
        action="store_true",
        help="Include absolute source paths in summary and manifest metadata.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    repo_root = args.repo_root.resolve()
    output_root = (repo_root / args.output_root).resolve()
    bundle_name = args.bundle_name or f"zeroshot-{_timestamp()}"
    bundle_dir = output_root / bundle_name
    bundle_version = bundle_name.replace("zeroshot-", "")

    if bundle_dir.exists():
        raise FileExistsError(f"Bundle directory already exists: {bundle_dir}")

    artifacts_root = _detect_artifacts_root(repo_root, args.artifacts_root)
    fr_root = artifacts_root / "lfm_colbert_fr_en_wo"
    waxal_root = artifacts_root / "lfm_colbert_waxal"
    scenario_root = artifacts_root / "lfm_colbert_scenarios" / "bargain"
    reports_root = artifacts_root / "reports"
    dataset_root = _detect_dataset_root(repo_root, args.dataset_root)
    strict_required = not args.allow_missing_required_files

    run_snapshots: list[RunSnapshot] = [
        RunSnapshot("fr_en_wo", _latest_dir(fr_root), bundle_dir / "runs" / "fr_en_wo"),
        RunSnapshot("waxal", _latest_dir(waxal_root), bundle_dir / "runs" / "waxal"),
    ]

    if args.include_scenario:
        run_snapshots.append(
            RunSnapshot(
                "scenario_bargain",
                _latest_dir(scenario_root),
                bundle_dir / "runs" / "scenario_bargain",
            )
        )

    copied_files: list[Path] = []
    for snapshot in run_snapshots:
        snapshot.dest.mkdir(parents=True, exist_ok=True)
        required_files = ("metrics.json",)
        optional_files = ("issues_findings.md", "dataset_snapshot.json")
        for filename in required_files:
            src = snapshot.source / filename
            dst = snapshot.dest / filename
            if strict_required:
                _copy_required(src, dst, copied_files)
            else:
                _copy_if_exists(src, dst, copied_files)
        for filename in optional_files:
            _copy_if_exists(snapshot.source / filename, snapshot.dest / filename, copied_files)

    # Dataset snapshot for reproducibility.
    dataset_dest = bundle_dir / "datasets" / "codeswitch_baseline_v2"
    dataset_dest.mkdir(parents=True, exist_ok=True)
    dataset_required_files = (
        "manifest.json",
        "documents.jsonl",
        "queries.jsonl",
        "pairs.jsonl",
        "pairs.parquet",
    )
    for filename in dataset_required_files:
        src = dataset_root / filename
        dst = dataset_dest / filename
        if strict_required:
            _copy_required(src, dst, copied_files)
        else:
            _copy_if_exists(src, dst, copied_files)

    # Scripts used in the run.
    scripts_dest = bundle_dir / "code" / "scripts"
    required_scripts = (
        "build_codeswitch_baseline_v2.py",
        "run_lfm_colbert_waxal.py",
        "run_lfm_colbert_fr_en_wo_iterations.py",
        "run_lfm_colbert_scenario_bargain.py",
        "prepare_kitops_zeroshot_bundle.py",
    )
    for script_name in required_scripts:
        src = repo_root / "scripts" / script_name
        dst = scripts_dest / script_name
        if strict_required:
            _copy_required(src, dst, copied_files)
        else:
            _copy_if_exists(src, dst, copied_files)

    # Research notebooks and generated plots.
    notebooks_dest = bundle_dir / "code" / "notebooks"
    required_notebooks = (
        "lfm2_colbert_zeroshot_report.ipynb",
        "lfm2_colbert_zeroshot_scripts.ipynb",
    )
    for notebook_name in required_notebooks:
        src = repo_root / "notebooks" / notebook_name
        dst = notebooks_dest / notebook_name
        if strict_required:
            _copy_required(src, dst, copied_files)
        else:
            _copy_if_exists(src, dst, copied_files)

    plot_src_dir = repo_root / "notebooks" / "assets" / "zeroshot_plots"
    plot_dest_dir = notebooks_dest / "assets" / "zeroshot_plots"
    if plot_src_dir.exists():
        for plot_file in sorted(plot_src_dir.glob("*")):
            if plot_file.is_file():
                _copy_file(plot_file, plot_dest_dir / plot_file.name, copied_files)

    # Supporting docs.
    docs_dest = bundle_dir / "docs"
    for doc_name in ("colbert-zero-shot.md", "codeswitch-baseline.md"):
        _copy_if_exists(repo_root / "docs" / doc_name, docs_dest / doc_name, copied_files)

    report_patterns = [
        "zeroshot-metrics-with-scenario-*.json",
        "zeroshot-metrics-*.json",
    ]
    report_patterns_md = [
        "zeroshot-metrics-with-scenario-*.md",
        "zeroshot-metrics-*.md",
    ]
    copied_reports: list[Path] = []
    report_files: list[str] = []

    latest_json = _latest_file(reports_root, report_patterns)
    latest_md = _latest_file(reports_root, report_patterns_md)
    latest_html = _latest_file(reports_root, ["lfm_colbert_summary.html"])
    reports_dest = bundle_dir / "reports"

    for source in (latest_json, latest_md, latest_html):
        if source is None:
            continue
        target = reports_dest / source.name
        _copy_file(source, target, copied_files)
        copied_reports.append(target.relative_to(bundle_dir))
        report_files.append(source.name)

    summary_doc = docs_dest / "bundle-summary.md"
    source_label_by_run = {}
    for snapshot in run_snapshots:
        if args.include_absolute_source_paths:
            source_label_by_run[snapshot.name] = str(snapshot.source)
        else:
            source_label_by_run[snapshot.name] = _portable_path(snapshot.source, repo_root)
    _write_summary_markdown(
        summary_doc,
        run_snapshots=run_snapshots,
        copied_reports=copied_reports,
        bundle_version=bundle_version,
        model_id=args.model_id,
        source_label_by_run=source_label_by_run,
    )
    copied_files.append(summary_doc)

    modelkit_path = bundle_dir / "modelkit.yaml"
    _write_modelkit_yaml(
        modelkit_path,
        package_name=args.package_name,
        bundle_version=bundle_version,
        include_scenario=args.include_scenario,
        report_filenames=report_files,
    )
    copied_files.append(modelkit_path)

    manifest_path = bundle_dir / "bundle_manifest.json"
    if args.include_absolute_source_paths:
        run_sources = {snapshot.name: str(snapshot.source) for snapshot in run_snapshots}
        dataset_source = str(dataset_root)
        source_roots = {
            "repo_root": str(repo_root),
            "artifacts_root": str(artifacts_root),
        }
    else:
        run_sources = {snapshot.name: _portable_path(snapshot.source, repo_root) for snapshot in run_snapshots}
        dataset_source = _portable_path(dataset_root, repo_root)
        source_roots = {
            "repo_root": repo_root.name,
            "artifacts_root": _portable_path(artifacts_root, repo_root),
        }

    manifest = {
        "bundle_name": bundle_name,
        "bundle_version": bundle_version,
        "created_at_utc": datetime.now(timezone.utc).isoformat(),
        "model_id": args.model_id,
        "source_roots": source_roots,
        "run_sources": run_sources,
        "dataset_source": dataset_source,
        "files": [
            {
                "path": file_path.relative_to(bundle_dir).as_posix(),
                "size_bytes": file_path.stat().st_size,
                "sha256": _sha256(file_path),
            }
            for file_path in _collect_copied_files(bundle_dir)
        ],
    }
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    print(f"Bundle created: {bundle_dir}")
    print(f"KitOps config: {modelkit_path}")
    print(
        "Pack command:\n"
        f"  kit pack {bundle_dir} -f {modelkit_path} -t "
        f"{args.package_name}:{bundle_version}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
