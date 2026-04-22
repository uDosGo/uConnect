"""Embedding helper — Ollama embeddings API."""

from __future__ import annotations

from udos_llm.config_loader import load_merged
from udos_llm.ollama.client import OllamaClient


def embed_text(text: str) -> list[float]:
    cfg = load_merged()
    host = cfg.get("ollama", {}).get("host", "http://127.0.0.1:11434")
    model = cfg.get("ollama", {}).get("embed_model", "nomic-embed-text")
    cli = OllamaClient(host)
    return cli.embed(model, text)
