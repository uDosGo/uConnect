"""Load and merge YAML sources (vault path + ~/.udos-llm/sources.yaml)."""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any

import yaml

from udos_llm.paths import config_path, home


def default_sources() -> dict[str, Any]:
    return {
        "sources": {
            "rss_feeds": [],
            "web_pages": [],
            "documents": [],
            "social": [],
        },
        "ollama": {
            "host": os.environ.get("OLLAMA_HOST", "http://127.0.0.1:11434"),
            "embed_model": os.environ.get("UDOS_EMBED_MODEL", "nomic-embed-text"),
            "chat_model": os.environ.get("UDOS_CHAT_MODEL", "llama3.2"),
        },
    }


def load_merged() -> dict[str, Any]:
    base = default_sources()
    vault = os.environ.get("UDOS_VAULT", "").strip()
    paths: list[Path] = [config_path()]
    if vault:
        p = Path(vault) / "system" / "llm-sources.yaml"
        if p.is_file():
            paths.insert(0, p)
    for p in paths:
        if not p.is_file():
            continue
        with open(p, encoding="utf-8") as f:
            data = yaml.safe_load(f) or {}
        base = _deep_merge(base, data)
    return base


def _deep_merge(a: dict[str, Any], b: dict[str, Any]) -> dict[str, Any]:
    out = dict(a)
    for k, v in b.items():
        if k in out and isinstance(out[k], dict) and isinstance(v, dict):
            out[k] = _deep_merge(out[k], v)
        else:
            out[k] = v
    return out


def save_user_sources(data: dict[str, Any]) -> None:
    home().mkdir(parents=True, exist_ok=True)
    with open(config_path(), "w", encoding="utf-8") as f:
        yaml.safe_dump(data, f, default_flow_style=False, allow_unicode=True)
