# ColBERT Zero-Shot Baseline

This document defines the first zero-shot ColBERT baseline path for Yaatal Engine.

## Target Model

- Baseline model: `LiquidAI/LFM2-ColBERT-350M`
- Reference notebook: `https://github.com/unslothai/notebooks/blob/main/nb/%F0%9F%92%A7_LFM2_ColBERT_350M_Inference.ipynb`

## Current Engine Scaffold

`yaatal-search` now exposes a retriever-evaluation interface:

- `Retriever` trait for backend integration
- `evaluate_zero_shot` benchmark function
- Metrics: `MRR@k`, `Recall@k`, `nDCG@k`

Code:

- `crates/yaatal-search/src/zero_shot.rs`

## Data Contract

Create labeled query sets in the `ZeroShotDataset` format:

- `documents`: `id`, `text`
- `queries`: `id`, `text`, `relevant_doc_ids`

This is enough for baseline retrieval benchmarking before fine-tuning.

## Integration Plan

1. Implement a concrete `Retriever` backend for ColBERT inference.
2. Run `evaluate_zero_shot(..., top_k=10)` for baseline metrics.
3. Log baseline by domain segment (app, language, topic) to identify weak slices.
4. Use the same dataset for post-finetune regression checks.

## Python Sidecar (Implemented)

Script:

- `scripts/colbert_sidecar.py`

Install and run:

```bash
pip install -U pylate
python scripts/colbert_sidecar.py --host 127.0.0.1 --port 8787
```

Endpoints:

- `GET /health`
- `POST /index`
- `POST /search`

## Minimal Usage Sketch

```rust
use yaatal_search::{
    evaluate_zero_shot, ColbertHttpRetriever, Retriever, SidecarIndexDocument, ZeroShotDataset,
};

fn run<R: Retriever>(retriever: &R, dataset: &ZeroShotDataset) {
    let metrics = evaluate_zero_shot(retriever, dataset, 10).expect("zero-shot eval failed");
    println!(
        "MRR@10={:.4} Recall@10={:.4} nDCG@10={:.4}",
        metrics.mrr_at_k, metrics.recall_at_k, metrics.ndcg_at_k
    );
}

fn run_sidecar(dataset: &ZeroShotDataset) {
    let retriever = ColbertHttpRetriever::new("http://127.0.0.1:8787").unwrap();
    retriever.health().unwrap();

    let docs: Vec<SidecarIndexDocument> = dataset
        .documents
        .iter()
        .map(|d| SidecarIndexDocument {
            id: d.id.clone(),
            text: d.text.clone(),
        })
        .collect();
    retriever.index_documents(&docs, true).unwrap();
    run(&retriever, dataset);
}
```

## Out of Scope For This Step

- Fine-tuning pipeline
- Model serving/hosting strategy
- Production index update scheduling
