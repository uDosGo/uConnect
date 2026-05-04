"""Ollama HTTP client — list models, chat, embed."""

from __future__ import annotations

from typing import Any

import httpx


class OllamaClient:
    def __init__(self, base_url: str) -> None:
        self.base = base_url.rstrip("/")

    def tags(self) -> dict[str, Any]:
        r = httpx.get(f"{self.base}/api/tags", timeout=30.0)
        r.raise_for_status()
        return r.json()

    def list_model_names(self) -> list[str]:
        try:
            data = self.tags()
        except Exception:
            return []
        out = []
        for m in data.get("models", []) or []:
            n = m.get("name")
            if n:
                out.append(str(n))
        return out

    def embed(self, model: str, text: str) -> list[float]:
        r = httpx.post(
            f"{self.base}/api/embeddings",
            json={"model": model, "prompt": text},
            timeout=120.0,
        )
        r.raise_for_status()
        data = r.json()
        emb = data.get("embedding")
        if not isinstance(emb, list):
            raise RuntimeError("invalid embedding response")
        return [float(x) for x in emb]

    def chat(self, model: str, messages: list[dict[str, str]]) -> str:
        r = httpx.post(
            f"{self.base}/api/chat",
            json={"model": model, "messages": messages, "stream": False},
            timeout=600.0,
        )
        r.raise_for_status()
        data = r.json()
        return str(data.get("message", {}).get("content", ""))


def detect_ollama(host: str) -> bool:
    try:
        r = httpx.get(f"{host.rstrip('/')}/api/tags", timeout=3.0)
        return r.status_code == 200
    except Exception:
        return False
