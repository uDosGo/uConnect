"""Data directories — local-only, under UDOS_LLM_HOME or ~/.udos-llm."""

from __future__ import annotations

import os
from pathlib import Path


def home() -> Path:
    p = os.environ.get("UDOS_LLM_HOME", "").strip()
    if p:
        return Path(p).expanduser().resolve()
    return Path.home() / ".udos-llm"


def vectors_dir() -> Path:
    d = home() / "vectors"
    d.mkdir(parents=True, exist_ok=True)
    return d


def cache_dir() -> Path:
    d = home() / "cache"
    d.mkdir(parents=True, exist_ok=True)
    return d


def models_dir() -> Path:
    d = home() / "models"
    d.mkdir(parents=True, exist_ok=True)
    return d


def config_path() -> Path:
    return home() / "sources.yaml"


def dedupe_path() -> Path:
    return home() / "dedupe_hashes.txt"
