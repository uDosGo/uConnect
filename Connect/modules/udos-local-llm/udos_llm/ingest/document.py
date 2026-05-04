"""Load markdown from disk; extract PDF text."""

from __future__ import annotations

from pathlib import Path

from pypdf import PdfReader


def read_markdown_file(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace")


def read_pdf(path: Path) -> str:
    reader = PdfReader(str(path))
    parts: list[str] = []
    for page in reader.pages:
        t = page.extract_text() or ""
        parts.append(t)
    return "\n\n".join(parts)


def load_path(path: Path) -> str | None:
    suf = path.suffix.lower()
    if suf in {".md", ".markdown", ".txt", ".ucode"}:
        return read_markdown_file(path)
    if suf == ".pdf":
        return read_pdf(path)
    return None


def glob_documents(pattern: str) -> list[Path]:
    from glob import glob

    return [Path(p) for p in sorted(glob(pattern, recursive=True))]
