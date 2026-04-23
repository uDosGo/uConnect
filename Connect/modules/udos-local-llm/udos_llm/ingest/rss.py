"""RSS/Atom ingestion."""

from __future__ import annotations

from typing import Any

import feedparser
import httpx


def fetch_feed(url: str) -> feedparser.FeedParserDict:
    r = httpx.get(url, timeout=60.0, follow_redirects=True)
    r.raise_for_status()
    return feedparser.parse(r.text)


def entries_as_documents(feed_url: str, max_items: int = 50) -> list[dict[str, Any]]:
    d = fetch_feed(feed_url)
    out: list[dict[str, Any]] = []
    for ent in (d.entries or [])[:max_items]:
        title = getattr(ent, "title", "") or ""
        summary = getattr(ent, "summary", "") or getattr(ent, "description", "") or ""
        link = getattr(ent, "link", "") or ""
        text = f"# {title}\n\n{summary}\n\nSource: {link}\nFeed: {feed_url}"
        uid = getattr(ent, "id", None) or link or title
        out.append(
            {
                "id": f"rss:{feed_url}:{uid}",
                "text": text,
                "source": link or feed_url,
                "kind": "rss",
            }
        )
    return out
