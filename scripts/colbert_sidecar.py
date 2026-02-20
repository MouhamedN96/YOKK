#!/usr/bin/env python3
"""
Minimal ColBERT sidecar service for zero-shot retrieval baselines.

Endpoints:
- GET  /health
- POST /index  { "documents": [{ "id": "...", "text": "..." }], "reset": false }
- POST /search { "query": "...", "top_k": 10 }
"""

from __future__ import annotations

import argparse
import json
import logging
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any

from pylate import indexes, models, retrieve


class ColbertState:
    def __init__(
        self,
        model_name: str,
        index_folder: str,
        index_name: str,
        batch_size: int,
    ) -> None:
        self.model_name = model_name
        self.index_folder = index_folder
        self.index_name = index_name
        self.batch_size = batch_size
        self._build_model_and_index(override=False)

    def _build_model_and_index(self, override: bool) -> None:
        self.model = models.ColBERT(model_name_or_path=self.model_name)
        self.model.tokenizer.pad_token = self.model.tokenizer.eos_token
        self.index = indexes.PLAID(
            index_folder=self.index_folder,
            index_name=self.index_name,
            override=override,
        )
        self.retriever = retrieve.ColBERT(index=self.index)

    def reset_index(self) -> None:
        self._build_model_and_index(override=True)

    def add_documents(self, documents: list[dict[str, str]]) -> int:
        if not documents:
            return 0

        doc_ids = [doc["id"] for doc in documents]
        doc_texts = [doc["text"] for doc in documents]

        embeddings = self.model.encode(
            doc_texts,
            batch_size=self.batch_size,
            is_query=False,
            show_progress_bar=False,
        )
        self.index.add_documents(
            documents_ids=doc_ids,
            documents_embeddings=embeddings,
        )
        return len(documents)

    def search(self, query: str, top_k: int) -> list[dict[str, Any]]:
        query_embeddings = self.model.encode(
            [query],
            batch_size=self.batch_size,
            is_query=True,
            show_progress_bar=False,
        )
        raw = self.retriever.retrieve(queries_embeddings=query_embeddings, k=top_k)
        hits = raw[0] if isinstance(raw, list) and raw else raw
        return _normalize_hits(hits)


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


def _parse_json(handler: BaseHTTPRequestHandler) -> dict[str, Any]:
    content_length = int(handler.headers.get("Content-Length", "0"))
    if content_length <= 0:
        return {}
    raw = handler.rfile.read(content_length)
    return json.loads(raw.decode("utf-8"))


def _write_json(handler: BaseHTTPRequestHandler, status: int, payload: dict[str, Any]) -> None:
    data = json.dumps(payload).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json")
    handler.send_header("Content-Length", str(len(data)))
    handler.end_headers()
    handler.wfile.write(data)


def _build_handler(state: ColbertState):
    class Handler(BaseHTTPRequestHandler):
        def do_GET(self) -> None:  # noqa: N802
            if self.path == "/health":
                _write_json(
                    self,
                    200,
                    {
                        "status": "ok",
                        "model_name": state.model_name,
                        "index_name": state.index_name,
                    },
                )
                return
            _write_json(self, 404, {"error": "not_found"})

        def do_POST(self) -> None:  # noqa: N802
            try:
                body = _parse_json(self)
            except json.JSONDecodeError as exc:
                _write_json(self, 400, {"error": f"invalid_json: {exc}"})
                return

            if self.path == "/index":
                documents = body.get("documents", [])
                reset = bool(body.get("reset", False))
                if not isinstance(documents, list):
                    _write_json(self, 400, {"error": "documents must be a list"})
                    return

                try:
                    if reset:
                        state.reset_index()
                    indexed = state.add_documents(documents)
                except Exception as exc:  # noqa: BLE001
                    _write_json(self, 500, {"error": f"index_failed: {exc}"})
                    return

                _write_json(self, 200, {"indexed": indexed, "reset": reset})
                return

            if self.path == "/search":
                query = body.get("query")
                top_k = body.get("top_k", 10)
                if not isinstance(query, str) or not query.strip():
                    _write_json(self, 400, {"error": "query must be a non-empty string"})
                    return
                if not isinstance(top_k, int) or top_k <= 0:
                    _write_json(self, 400, {"error": "top_k must be a positive integer"})
                    return

                try:
                    hits = state.search(query=query, top_k=top_k)
                except Exception as exc:  # noqa: BLE001
                    _write_json(self, 500, {"error": f"search_failed: {exc}"})
                    return

                _write_json(self, 200, {"hits": hits})
                return

            _write_json(self, 404, {"error": "not_found"})

        def log_message(self, format: str, *args: Any) -> None:
            logging.info("%s - %s", self.address_string(), format % args)

    return Handler


def main() -> None:
    parser = argparse.ArgumentParser(description="ColBERT sidecar service")
    parser.add_argument("--host", default="127.0.0.1", help="Bind host")
    parser.add_argument("--port", type=int, default=8787, help="Bind port")
    parser.add_argument(
        "--model-name",
        default="LiquidAI/LFM2-ColBERT-350M",
        help="Hugging Face model id",
    )
    parser.add_argument("--index-folder", default="pylate-index", help="Index folder")
    parser.add_argument("--index-name", default="index", help="Index name")
    parser.add_argument("--batch-size", type=int, default=32, help="Encoding batch size")
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    state = ColbertState(
        model_name=args.model_name,
        index_folder=args.index_folder,
        index_name=args.index_name,
        batch_size=args.batch_size,
    )

    server = ThreadingHTTPServer((args.host, args.port), _build_handler(state))
    logging.info("ColBERT sidecar started at http://%s:%d", args.host, args.port)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        logging.info("Shutting down")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
