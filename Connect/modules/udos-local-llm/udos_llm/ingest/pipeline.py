"""Chunk + embed + store."""

from __future__ import annotations

import time
from typing import Any

from udos_llm.config_loader import load_merged
from udos_llm.ingest.dedupe import content_hash, record_hash, seen_before
from udos_llm.ollama.client import OllamaClient
from udos_llm.vector import chroma_store


def chunk_text(text: str, max_chars: int = 1500) -> list[str]:
    paras = [p.strip() for p in text.split("\n\n") if p.strip()]
    chunks: list[str] = []
    buf = ""
    for p in paras:
        if len(buf) + len(p) + 2 <= max_chars:
            buf = f"{buf}\n\n{p}".strip() if buf else p
        else:
            if buf:
                chunks.append(buf)
            buf = p
    if buf:
        chunks.append(buf)
    if not chunks and text.strip():
        chunks = [text[:max_chars]]
    return chunks


def ingest_documents(
    docs: list[dict[str, Any]],
    tags: list[str] | None = None,
) -> int:
    """docs: {id, text, source, kind}"""
    cfg = load_merged()
    host = cfg.get("ollama", {}).get("host", "http://127.0.0.1:11434")
    embed_model = cfg.get("ollama", {}).get("embed_model", "nomic-embed-text")
    cli = OllamaClient(host)
    tags = tags or []
    ingested = 0
    now = int(time.time())
    for doc in docs:
        text = doc.get("text") or ""
        if not text.strip():
            continue
        h = content_hash(text)
        if seen_before(h):
            continue
        record_hash(h)
        base_id = str(doc.get("id", h))[:200]
        source = str(doc.get("source", ""))
        kind = str(doc.get("kind", "unknown"))
        for i, chunk in enumerate(chunk_text(text)):
            cid = f"{base_id}::chunk{i}"
            emb = cli.embed(embed_model, chunk)
            meta: dict[str, Any] = {
                "source": source,
                "kind": kind,
                "ingested_at": now,
                "tags": ",".join(tags),
            }
            chroma_store.add_chunks(
                ids=[cid],
                documents=[chunk],
                embeddings=[emb],
                metadatas=[meta],
            )
            ingested += 1
    return ingested


def github_release_feed(user: str, repo: str) -> str:
    return f"https://github.com/{user}/{repo}/releases.atom"
