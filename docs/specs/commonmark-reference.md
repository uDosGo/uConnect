---
title: "CommonMark reference (uDos)"
tags: [--public]
audience: public
slot: 5
---

# CommonMark reference (uDos)

**Purpose:** Single landing page for **CommonMark**-compatible markdown semantics used by uDos vaults, publish pipelines, and future **`udo run`** / literate flows.

## Canonical spec (external)

- **CommonMark specification:** [https://spec.commonmark.org/](https://spec.commonmark.org/)
- **CommonMark discussion / reference implementation:** see project links from the spec site.

## In this repo

- **VA1 markdown tooling:** `udo md format|lint|toc` — [public/ucode-commands.md](../public/ucode-commands.md).
- **Remark pipeline (bridge):** `core-rs` / workspace `modules/remark-pipeline` (see dev decisions and `udo md doctor` where configured).
- **Executable markdown experiments:** [docker-integration.md](docker-integration.md) (containers), vault **`@toybox/experiments/markdown-runtime/`** (rnmd, marki — clone per [`dev/toybox-experiments/README.md`](../../dev/toybox-experiments/README.md)).

## Notes for `udo run` (A2)

Block execution and fence semantics should align with CommonMark **code fences** and any uDos extensions documented in [open-box-format.md](open-box-format.md) where they overlap with prose markdown.

Current alpha behavior in `core-rs`:

- Executes fenced `ucode` blocks in source order for markdown inputs.
- Accepts attribute-style fence info (for example ` ```ucode {linenos=true}`).
- Preserves shared runtime state across multiple `ucode` fences in one document.
