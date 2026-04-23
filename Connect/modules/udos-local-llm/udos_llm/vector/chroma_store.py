"""Chroma persistent store + metadata for attribution and expiry."""

from __future__ import annotations

import time
from typing import Any

import chromadb
from chromadb.config import Settings

from udos_llm.paths import vectors_dir


def get_collection(name: str = "udos_kb"):
    path = str(vectors_dir())
    client = chromadb.PersistentClient(
        path=path,
        settings=Settings(anonymized_telemetry=False),
    )
    return client.get_or_create_collection(
        name=name,
        metadata={"hnsw:space": "cosine"},
    )


def add_chunks(
    ids: list[str],
    documents: list[str],
    embeddings: list[list[float]],
    metadatas: list[dict[str, Any]],
) -> None:
    col = get_collection()
    col.add(ids=ids, documents=documents, embeddings=embeddings, metadatas=metadatas)


def query_vectors(
    embedding: list[float],
    n_results: int = 5,
    where: dict[str, Any] | None = None,
) -> dict[str, Any]:
    col = get_collection()
    return col.query(
        query_embeddings=[embedding],
        n_results=n_results,
        where=where,
        include=["documents", "metadatas", "distances"],
    )


def delete_all() -> None:
    path = str(vectors_dir())
    client = chromadb.PersistentClient(
        path=path,
        settings=Settings(anonymized_telemetry=False),
    )
    for n in client.list_collections():
        client.delete_collection(n.name)


def purge_stale(max_age_seconds: int) -> int:
    """Remove chunks whose metadata 'ingested_at' is older than max_age_seconds."""
    col = get_collection()
    now = int(time.time())
    data = col.get(include=["metadatas"])
    ids = data.get("ids") or []
    metas = data.get("metadatas") or []
    to_delete: list[str] = []
    for i, mid in enumerate(ids):
        meta = metas[i] if i < len(metas) else {}
        ts = 0
        if isinstance(meta, dict):
            ts = int(meta.get("ingested_at") or 0)
        if ts and now - ts > max_age_seconds:
            to_delete.append(mid)
    if to_delete:
        col.delete(ids=to_delete)
    return len(to_delete)
