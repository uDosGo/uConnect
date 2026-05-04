"""Fetch web page → markdown (best-effort)."""

from __future__ import annotations

import html2text
import httpx
from bs4 import BeautifulSoup


def fetch_page_markdown(url: str) -> str:
    r = httpx.get(url, timeout=60.0, follow_redirects=True, headers={"User-Agent": "udos-local-llm/0.1"})
    r.raise_for_status()
    html = r.text
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup(["script", "style", "noscript"]):
        tag.decompose()
    main = soup.find("main") or soup.find("article") or soup.body
    raw = str(main or soup)
    h = html2text.HTML2Text()
    h.ignore_links = False
    md = h.handle(raw)
    return f"# {url}\n\n{md.strip()}"
