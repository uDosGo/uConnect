"""RAG: retrieve + generate."""

from __future__ import annotations

import json
from typing import Any

from udos_llm.config_loader import load_merged
from udos_llm.ollama.client import OllamaClient
from udos_llm.vector import chroma_store
from udos_llm.vector.embeddings import embed_text


def retrieve(query: str, top_k: int = 5) -> list[dict[str, Any]]:
    emb = embed_text(query)
    res = chroma_store.query_vectors(emb, n_results=top_k)
    out: list[dict[str, Any]] = []
    ids = (res.get("ids") or [[]])[0]
    docs = (res.get("documents") or [[]])[0]
    metas = (res.get("metadatas") or [[]])[0]
    dists = (res.get("distances") or [[]])[0]
    for i, doc_id in enumerate(ids):
        out.append(
            {
                "id": doc_id,
                "content": docs[i] if i < len(docs) else "",
                "metadata": metas[i] if i < len(metas) else {},
                "distance": dists[i] if i < len(dists) else None,
            }
        )
    return out


def build_prompt(
    query: str,
    chunks: list[dict[str, Any]],
    personality: str | None = None,
) -> list[dict[str, str]]:
    ctx_parts = []
    for c in chunks:
        src = ""
        if isinstance(c.get("metadata"), dict):
            src = str(c["metadata"].get("source", ""))
        body = c.get("content", "")
        ctx_parts.append(f"Source: {src}\n{body}")
    context = "\n\n---\n\n".join(ctx_parts)
    system = (
        "You are a helpful assistant. Answer using ONLY the provided sources when possible. "
        "If sources are insufficient, say so briefly."
    )
    if personality:
        system = f"You speak in the tone of personality «{personality}». {system}"
    return [
        {"role": "system", "content": system},
        {
            "role": "user",
            "content": f"Sources:\n{context}\n\nQuestion: {query}",
        },
    ]


def ask(
    query: str,
    personality: str | None = None,
    top_k: int = 5,
) -> dict[str, Any]:
    cfg = load_merged()
    host = cfg.get("ollama", {}).get("host", "http://127.0.0.1:11434")
    chat_model = cfg.get("ollama", {}).get("chat_model", "llama3.2")
    chunks = retrieve(query, top_k=top_k)
    messages = build_prompt(query, chunks, personality=personality)
    cli = OllamaClient(host)
    answer = cli.chat(chat_model, messages)
    sources = []
    for c in chunks:
        md = c.get("metadata") if isinstance(c.get("metadata"), dict) else {}
        sources.append(md.get("source", c.get("id", "")))
    return {
        "answer": answer,
        "sources": sources,
        "chunks_used": len(chunks),
    }


def ask_json(query: str, personality: str | None = None, top_k: int = 5) -> str:
    return json.dumps(ask(query, personality=personality, top_k=top_k), ensure_ascii=False)
