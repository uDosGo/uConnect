---
title: "Markdownify MCP integration"
tags: [--public]
audience: public
slot: 5
---

# Markdownify MCP integration

**Status:** Alpha MCP lane active and wired in `core-rs`; runtime + smoke-test workflow available.

## Purpose

Convert heterogeneous documents (PDF, Office, images, audio, web pages) into **Markdown** for ingestion into uDos vaults and publishing pipelines. The reference stack is Microsoft’s **MarkItDown** ecosystem, exposed via an MCP server process that uDos can orchestrate alongside other tools.

## Requirements (operator machine)

- **Python** 3.10+ recommended for MarkItDown.
- **`uv`** (recommended) or `pip` for Python environments.
- **`markitdown[all]`** (or equivalent extras) for broad format support — see upstream MarkItDown install docs.

Recommended bootstrap (repo root):

```bash
bash scripts/bootstrap-markdownify-runtime.sh
```

## Configuration

Copy [`dev/tools/markdownify-config.yaml.example`](../../dev/tools/markdownify-config.yaml.example) to a machine- or vault-scoped path such as **`.local/markdownify-config.yaml`** and adjust:

- **`server_path`** — MCP server entry (JS/TS `dist/index.js` or project-specific).
- **`uv_path`** — optional explicit `uv` binary if not on `PATH`.

### Implementation progress (alpha)

- `core-rs` now exposes `udo import` and `udo import-status` routed through the MCP registry tools `markdownify.import` and `markdownify.status`.
- Status output resolves config/capabilities and checks MarkItDown install presence under `vendor/markdownify-mcp/.venv`.
- MCP stdio transport now handles framed `initialize`, `tools/list`, and `tools/call`.
- Runtime bootstrap is pinned to upstream MarkItDown commit `604bba13da2f43b756b49122cb65bdedb85b1dff` for deterministic installs.
- Round-start smoke gate: `scripts/check-mcp-stdio.sh`.
- Conversion smoke path is validated with `udo import` and Rust integration tests in `core-rs/tests/markdownify_tests.rs`.

## Usage (target)

- MCP clients attach to the configured server; tools expose conversion capabilities listed under `capabilities:` in the YAML template.
- **A2:** expand tool schema strictness and add long-running job progress surfaces for import workloads.

## References

- Upstream **MarkItDown**: see current Microsoft documentation and repository.
- Vendor slot: [`vendor/markdownify-mcp/README.md`](../../vendor/markdownify-mcp/README.md).
