"""Typer CLI: `udos-llm` (ingest, kb, ask, llm)."""

from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Any

import typer
import yaml

from udos_llm.config_loader import load_merged, save_user_sources
from udos_llm.ingest.document import glob_documents, load_path
from udos_llm.ingest.pipeline import github_release_feed, ingest_documents
from udos_llm.ingest.rss import entries_as_documents
from udos_llm.ingest.scraper import fetch_page_markdown
from udos_llm.ollama.client import OllamaClient, detect_ollama
from udos_llm.paths import cache_dir, config_path, dedupe_path, home, models_dir, vectors_dir
from udos_llm.rag.query import ask as rag_ask
from udos_llm.rag.query import ask_json
from udos_llm.training.lora import prepare_vault_qa_stub
from udos_llm.vector.chroma_store import delete_all, get_collection, purge_stale

app = typer.Typer(no_args_is_help=True, help="uDos local LLM + knowledge (Round 8)")
ingest_app = typer.Typer(help="Content ingestion")
kb_app = typer.Typer(help="Knowledge library")
llm_app = typer.Typer(help="Models & training")


@app.callback()
def main() -> None:
    """Local-only RAG + Ollama. Set OLLAMA_HOST, UDOS_LLM_HOME, UDOS_VAULT."""


@ingest_app.command("add")
def ingest_add(
    source: str = typer.Option(..., "--source", help="rss | web | doc | github"),
    url: str | None = typer.Option(None, "--url"),
    path: str | None = typer.Option(None, "--path"),
    user: str | None = typer.Option(None, "--user"),
    repo: str | None = typer.Option(None, "--repo"),
) -> None:
    """Append a source to ~/.udos-llm/sources.yaml."""
    cfg = load_merged()
    src = source.lower().strip()
    if src == "rss" and url:
        cfg["sources"]["rss_feeds"].append({"url": url, "refresh": "daily", "tags": []})
    elif src == "web" and url:
        cfg["sources"]["web_pages"].append({"url": url, "depth": 1, "refresh": "weekly", "tags": []})
    elif src == "doc" and path:
        cfg["sources"]["documents"].append({"path": path, "watch": False, "tags": []})
    elif src == "github" and user and repo:
        cfg["sources"]["social"].append(
            {"platform": "github", "user": user, "repo": repo, "refresh": "daily", "tags": []}
        )
    else:
        typer.echo("Invalid combination. Examples:\n  --source rss --url URL\n  --source github --user u --repo r", err=True)
        raise typer.Exit(1)
    save_user_sources(cfg)
    typer.echo(f"Updated {config_path()}")


@ingest_app.command("run")
def ingest_run() -> None:
    """Process all configured sources now."""
    cfg = load_merged()
    total = 0
    for feed in cfg.get("sources", {}).get("rss_feeds", []) or []:
        u = feed.get("url")
        if not u:
            continue
        tags = feed.get("tags") or []
        docs = entries_as_documents(str(u))
        total += ingest_documents(docs, tags=[str(t) for t in tags])
    for page in cfg.get("sources", {}).get("web_pages", []) or []:
        u = page.get("url")
        if not u:
            continue
        tags = page.get("tags") or []
        try:
            md = fetch_page_markdown(str(u))
            total += ingest_documents(
                [{"id": f"web:{u}", "text": md, "source": str(u), "kind": "web"}],
                tags=[str(t) for t in tags],
            )
        except Exception as e:
            typer.echo(f"[warn] web {u}: {e}", err=True)
    for doc in cfg.get("sources", {}).get("documents", []) or []:
        pattern = doc.get("path")
        if not pattern:
            continue
        tags = doc.get("tags") or []
        for p in glob_documents(str(pattern)):
            text = load_path(p)
            if not text:
                continue
            total += ingest_documents(
                [{"id": f"doc:{p}", "text": text, "source": str(p), "kind": "vault" if "vault" in str(p) else "doc"}],
                tags=[str(t) for t in tags],
            )
    for soc in cfg.get("sources", {}).get("social", []) or []:
        if soc.get("platform") == "github":
            u = soc.get("user")
            r = soc.get("repo")
            if u and r:
                feed_url = github_release_feed(str(u), str(r))
                tags = soc.get("tags") or []
                docs = entries_as_documents(feed_url)
                total += ingest_documents(docs, tags=[str(t) for t in tags])
    typer.echo(f"Ingested chunk embeddings: {total}")


@ingest_app.command("status")
def ingest_status() -> None:
    """Show merged config paths and Ollama reachability."""
    cfg = load_merged()
    host = cfg.get("ollama", {}).get("host", "http://127.0.0.1:11434")
    typer.echo(yaml.safe_dump(cfg, allow_unicode=True))
    typer.echo(f"ollama_detected={detect_ollama(host)} home={home()}")


@kb_app.command("search")
def kb_search(q: str, top: int = typer.Option(5, "--top")) -> None:
    """Semantic search (vector)."""
    from udos_llm.rag.query import retrieve

    rows = retrieve(q, top_k=top)
    typer.echo(json.dumps(rows, indent=2, ensure_ascii=False))


@kb_app.command("list")
def kb_list() -> None:
    """Count indexed chunks."""
    col = get_collection()
    n = col.count()
    typer.echo(f"chunks={n} store={vectors_dir()}")


@kb_app.command("delete")
def kb_delete(doc_id: str = typer.Option(..., "--id")) -> None:
    col = get_collection()
    col.delete(ids=[doc_id])
    typer.echo("deleted")


@kb_app.command("wipe")
def kb_wipe(
    yes: bool = typer.Option(False, "--yes", help="Confirm destructive wipe"),
) -> None:
    if not yes:
        typer.echo("Refusing to wipe without --yes", err=True)
        raise typer.Exit(1)
    delete_all()
    if dedupe_path().is_file():
        dedupe_path().unlink()
    for p in cache_dir().glob("*"):
        if p.is_file():
            p.unlink()
    typer.echo("Knowledge store wiped (vectors + dedupe + cache files).")


@kb_app.command("export")
def kb_export(path: Path = typer.Option(Path("kb-export.json"), "--out")) -> None:
    col = get_collection()
    data = col.get(include=["documents", "metadatas"])
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    typer.echo(f"Wrote {path}")


@app.command("ask")
def ask_cmd(
    question: str = typer.Argument(..., metavar="QUESTION"),
    personality: str | None = typer.Option(None, "--personality"),
    top: int = typer.Option(5, "--top"),
    as_json: bool = typer.Option(False, "--json"),
) -> None:
    """Query local RAG + Ollama."""
    q = question.strip()
    if not q:
        raise typer.Exit(1)
    if os.environ.get("UDOS_LLM_DRY") == "1":
        out = {"answer": "[dry-run] Local LLM disabled.", "sources": [], "chunks_used": 0}
        typer.echo(json.dumps(out, ensure_ascii=False))
        return
    if as_json:
        typer.echo(ask_json(q, personality=personality, top_k=top))
        return
    res = rag_ask(q, personality=personality, top_k=top)
    typer.echo(res["answer"])
    typer.echo("\nSources: " + ", ".join(str(s) for s in res["sources"] if s))


@llm_app.command("models")
def models_cmd(
    action: str = typer.Argument("list", help="list | pull | set-default"),
    name: str | None = typer.Argument(None),
) -> None:
    cfg = load_merged()
    host = cfg.get("ollama", {}).get("host", "http://127.0.0.1:11434")
    if action == "list":
        cli = OllamaClient(host)
        for m in cli.list_model_names():
            typer.echo(m)
        return
    if action == "pull" and name:
        exe = shutil.which("ollama")
        if not exe:
            typer.echo("ollama CLI not on PATH", err=True)
            raise typer.Exit(1)
        subprocess.run([exe, "pull", name], check=False)
        return
    if action == "set-default" and name:
        cfg.setdefault("ollama", {})["chat_model"] = name
        save_user_sources(cfg)
        typer.echo(f"default chat_model={name}")
        return
    typer.echo("usage: models list | models pull <name> | models set-default <name>", err=True)


@llm_app.command("train")
def train_cmd(
    from_vault: bool = typer.Option(False, "--from-vault"),
    vault: Path | None = typer.Option(None, "--vault"),
    status_only: bool = typer.Option(False, "--status"),
) -> None:
    if status_only:
        typer.echo(
            "Training: use `udos-llm train --from-vault` to export Q&A JSONL; "
            "run Ollama Modelfile or llama.cpp LoRA offline. See udos_llm/training/lora.py."
        )
        return
    if from_vault:
        root = vault or Path(os.environ.get("UDOS_VAULT", "")).expanduser()
        if not root.is_dir():
            typer.echo("Set --vault or UDOS_VAULT", err=True)
            raise typer.Exit(1)
        out = models_dir() / "vault-qa.jsonl"
        n = prepare_vault_qa_stub(root, out)
        typer.echo(f"Wrote {n} lines to {out}")
        return
    typer.echo("No action. Try --status or --from-vault", err=True)


@llm_app.command("wipe")
def llm_wipe(yes: bool = typer.Option(False, "--yes")) -> None:
    """Remove vectors, cache, optional training exports."""
    if not yes:
        typer.echo("Refusing without --yes", err=True)
        raise typer.Exit(1)
    kb_wipe(yes=True)
    shutil.rmtree(models_dir(), ignore_errors=True)
    models_dir().mkdir(parents=True, exist_ok=True)
    typer.echo("Full UDOS LLM data wiped under " + str(home()))


app.add_typer(ingest_app, name="ingest")
app.add_typer(kb_app, name="kb")
app.add_typer(llm_app, name="llm")


def run() -> None:
    """Setuptools / pip console_script entrypoint."""
    app()


if __name__ == "__main__":
    run()
