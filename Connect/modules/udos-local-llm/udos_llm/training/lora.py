"""LoRA / fine-tuning (Round 8 placeholder).

Production options (all local):
- Ollama Modelfile + `FROM` base + `ADAPTER` when upstream supports adapters
- llama.cpp / unsloth offline pipelines on your GPU machine
- Export Q&A JSON from vault edits via `udos-llm train --prepare-vault`

This package does not run heavy training in-process; use `train --status` for notes.
"""

from __future__ import annotations

import json
from pathlib import Path


def prepare_vault_qa_stub(vault_root: Path, out_path: Path) -> int:
    """Collect markdown headings as pseudo Q&A pairs (demo)."""
    n = 0
    lines_out: list[str] = []
    for md in vault_root.rglob("*.md"):
        text = md.read_text(encoding="utf-8", errors="replace")
        for line in text.splitlines():
            if line.startswith("# "):
                q = line[2:].strip()
                lines_out.append(json_line({"q": q, "a": f"(see {md})", "path": str(md)}))
                n += 1
    out_path.write_text("\n".join(lines_out) + "\n", encoding="utf-8")
    return n


def json_line(obj: dict) -> str:
    return json.dumps(obj, ensure_ascii=False)
