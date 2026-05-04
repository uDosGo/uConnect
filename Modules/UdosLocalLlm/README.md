# udos-local-llm (Round 8)

**Privacy-first** local RAG: ingest RSS/web/vault docs → **Chroma** vectors → **Ollama** chat/embeddings. No cloud APIs in the default path.

## Install

```bash
cd udos-local-llm
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
# Ollama: https://ollama.com — then:
ollama pull nomic-embed-text
ollama pull llama3.2
```

Data lives in **`UDOS_LLM_HOME`** (default `~/.udos-llm`): `vectors/` (Chroma), `cache/`, `sources.yaml`, `dedupe_hashes.txt`.

## Commands

```bash
udos-llm ingest add --source rss --url https://news.ycombinator.com/rss
udos-llm ingest run
udos-llm ingest status

udos-llm kb search "uDos grid" --top 5
udos-llm kb list
udos-llm kb delete --id 'rss:...::chunk0'
udos-llm kb wipe --yes
udos-llm kb export --out kb.json

udos-llm ask "What is in my knowledge base?" --personality bro
udos-llm ask "Question" --json   # machine-readable

udos-llm llm models list
udos-llm llm models pull llama3.2
udos-llm llm models set-default llama3.2
udos-llm llm train --from-vault --vault ~/vault
udos-llm llm train --status
udos-llm llm wipe --yes
```

## Config

Merge order: `vault/system/llm-sources.yaml` (if `UDOS_VAULT` set) + `~/.udos-llm/sources.yaml`. See `config/llm-sources.yaml.example`.

## uChatDown

In chat, **`/ask your question`** calls `python3 -m udos_llm ask …` (see `@udos/uchatdown-node` `local-llm.js`). Set **`UDOS_LLM_DISABLE=1`** to show a stub without Python.

## Tests

```bash
pytest tests/
```

## Limits (v0.1.0)

- EPUB/DOCX not implemented (PDF + markdown/text).
- LoRA training is **export + docs** only; run heavy jobs outside this package.
- Social ingestion uses **GitHub releases Atom** as RSS.
- Bandwidth / cloud: **no outbound** to model hosts except your **Ollama** URL.
