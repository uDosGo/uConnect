---
title: "uDos Feeds and Spool"
tags: [--public]
audience: public
slot: 5
status: "draft"
last_reviewed: "2026-04-15"
applies_to: "A1 foundation (config + commands, where implemented); A2 (watchers, async, AI)"
---

# uDos Feeds and Spool

**Purpose:** Define the feed and spool system for uDos — local event monitoring and batch processing for **text-only** compression, deduplication, and summarization. Feeds watch for events; spools process text; compost holds history.

**VA1 today:** `udo feed list|view|export` operates on **`vault/feeds/*.jsonl`** (see [public/ucode-commands.md](../public/ucode-commands.md)). The **`.local/feeds.yaml`** / **`.local/spools.yaml`** model and processors in this document are the **target** evolution; implement incrementally and update this spec as commands land.

---

## Core model

```
File system events (A2: real watchers)
        │
        ▼
    FEED (watcher)
        │
        ├── triggers immediate actions (e.g. version backup)
        │
        └── queues for batch processing
                │
                ▼
            SPOOL (batch processor)
                │
                ├── condense text
                ├── deduplicate sections
                ├── summarize content
                └── deduplicate list items
                │
                ▼
            OUTPUT (same file or new location)
```

---

## Part 1: Feed

### Definition

A **feed** is a monitoring configuration that watches vault paths and triggers actions based on events (full watchers in A2).

### What feed watches (roadmap)

| Watch type | Examples | A1 | A2 |
| --- | --- | --- | --- |
| File changes | `on_create`, `on_modify`, `on_close` | Stub / config only | Yes |
| Size thresholds | `size > 1GB` | Stub | Yes |
| Age thresholds | `age > 30d` | Stub | Yes |
| Compost events | `compost_size > 5GB` | Stub | Yes |
| Network (RSS, webhook) | — | No | A3+ |

### Feed actions (roadmap)

| Action | Description | A1 | A2 |
| --- | --- | --- | --- |
| `compost version {file}` | Auto-version on close | Stub | Yes |
| `compost clean --older-than 30d` | Clean old compost | Stub / manual | Yes |
| `import {file} --auto` | Auto-import | No | Yes |
| `spool run {name}` | Trigger spool | Stub / manual `udo spool run` | Yes |

### Feed configuration (`.local/feeds.yaml`)

```yaml
# A1: foundation only — full event monitoring in A2
feeds:
  - name: "sandbox-versioning"
    watch: "@sandbox/**/*.md"
    event: "on_close"
    action: "compost version {file}"
    enabled: true
    a2_ready: true

  - name: "compost-cleanup"
    watch: "**/.compost/"
    event: "size > 1GB"
    action: "compost clean --older-than 30d --priority-binary"
    enabled: true
    a2_ready: true
```

### Feed commands (target)

```bash
udo feed list                    # Show configured feeds (today: vault/feeds/*.jsonl names)
udo feed show <name>             # Show feed details (align with list/view)
udo feed enable <name>           # A2: start watching
udo feed disable <name>          # A2: stop watching
udo feed test <name> --dry-run   # Test what feed would do
```

**A1 stubs:** `enable` / `disable` / `test` may print A2 upgrade guidance until wired.

---

## Part 2: Spool

### Definition

A **spool** is a batch processor for **text-only** pipelines (markdown, JSON lines, etc.).

### What spool does not process

- Images, audio, PDF, DOCX, or other binary formats (use Markdownify / import path first).

### Spool configuration (`.local/spools.yaml`)

```yaml
spools:
  - name: "condense-sandbox"
    source: "@sandbox/**/*.md"
    processor: "condense"
    output: "same"
    schedule: "weekly"
    options:
      target_ratio: 0.7
      preserve_code_blocks: true
      preserve_links: true

  - name: "dedupe-sections"
    source: "@sandbox/**/*.md"
    processor: "dedupe-sections"
    output: "same"
    schedule: "weekly"
    options:
      min_block_length: 50
      leave_links: true

  - name: "summarize-private"
    source: "@private/**/*.md"
    processor: "summarize"
    output: "@sandbox/summaries/"
    schedule: "monthly"
    options:
      summary_ratio: 0.2

  - name: "feed-dedupe"
    source: "@user/feeds/*.json"
    processor: "dedupe-list-items"
    output: "same"
    schedule: "daily"
    options:
      dedupe_key: "url"
```

### Spool commands (target)

```bash
udo spool list                   # Today: list spool metadata under vault
udo spool show <name>            # Show spool details
udo spool run <name>             # Run processor now (basic sync)
udo spool run --all              # Run all enabled spools
udo spool status                 # Last run status
```

---

## Part 3: Compost relationship

### Feed → compost

Feeds may watch compost size and trigger cleanup policies.

### Spool → compost

Spools may process `**/.compost/**/*.md` for dedupe (advanced).

### Clean priority (binary first)

When cleaning compost, prefer deleting large binaries first, then large text, then aged version backups.

```bash
udo compost clean --older-than 30d --priority-binary
```

(Target command; wire with [vault-workspaces.md](vault-workspaces.md) compost rules.)

---

## Part 4: Text compression processors (A1 target)

| Processor | Behaviour | A1 target |
| --- | --- | --- |
| **condense** | Rule-based shorter prose | Basic rules |
| **dedupe-sections** | Hash paragraphs / blocks, keep first | Hash-based |
| **summarize** | Extractive (e.g. first sentence per paragraph) | No LLM |
| **dedupe-list-items** | Dedupe by key (`url`, `id`) | JSON/array |

A2 may add LLM-backed abstractive summarization and async queues.

---

## Part 5: Implementation roadmap

| Component | In VA1 wireframe today | Target |
| --- | --- | --- |
| Feed config `.local/feeds.yaml` | Open | Parse + validate |
| `udo feed list/show` + stubs | Partial (`list`/`view` on `feeds/*.jsonl`) | Align with YAML |
| Spool config `.local/spools.yaml` | Open | Parse + validate |
| `udo spool list/show/run/status` | Partial (existing list/info/extract) | Match spec |
| Processors | Open | Sync, rule-based |
| Compost `index.db` + `udo trash` | Open | See A1 completion checklist |

---

## Part 6: Relationship to other systems

| System | Role |
| --- | --- |
| **Logs** | Execution trace |
| **Feeds** | Meaningful change / intent |
| **Compost** | History, versions, imports |
| **Vault** | Canonical storage; feeds/spools run inside vault + `.local/` |

---

## Part 7: Commands summary (target)

```bash
udo feed list
udo feed show <name>
udo feed enable <name>
udo feed disable <name>
udo feed test <name> --dry-run

udo spool list
udo spool show <name>
udo spool run <name>
udo spool run --all
udo spool status

udo compost clean --older-than 30d --priority-binary
```

---

## Part 8: Changelog

| Date | Change |
| --- | --- |
| 2026-04-15 | Initial refined spec — text-only spool scope, compost relationship, A2 stubs |

---

## Related

- [vault-workspaces.md](vault-workspaces.md) — workspaces, `.local/`, compost versioning
- [workflow-network-a1-a2.md](workflow-network-a1-a2.md) — A1/A2 split
- [markdownify-integration.md](markdownify-integration.md) — binary → markdown path
