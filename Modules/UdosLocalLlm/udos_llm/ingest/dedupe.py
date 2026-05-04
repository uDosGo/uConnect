"""Content-addressed deduplication."""

from __future__ import annotations

import hashlib

from udos_llm.paths import dedupe_path


def content_hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def seen_before(h: str) -> bool:
    p = dedupe_path()
    if not p.is_file():
        return False
    known = {line.strip() for line in p.read_text(encoding="utf-8").splitlines() if line.strip()}
    return h in known


def record_hash(h: str) -> None:
    p = dedupe_path()
    p.parent.mkdir(parents=True, exist_ok=True)
    with open(p, "a", encoding="utf-8") as f:
        f.write(h + "\n")
