# Logs, Feeds, and Spool Candidate

Status: **Post-08 O2 promoted** — execution lane (checklist + verify); **2026-04-02**  
**Active owner:** `uDOS-dev` coordinates pathway promotion; **`uDOS-core`** owns canonical semantics (`docs/feeds-and-spool.md`). **`uDOS-thinui`** owns surface follow-through when built.

## O2 promotion decision

Post-08 optional round **O2** promotes this candidate from “not roadmapped” to **binder-ready execution** without opening a new `v2.x` plan. Stable public reference remains **`uDOS-core/docs/feeds-and-spool.md`**. Next-step tracking: **`o2-logs-feeds-spool-execution-checklist.md`**. Verify: `bash uDOS-dev/scripts/verify-pathway-o2-logs-feeds-spool.sh`.

This file remains the **pathway narrative**; it does not replace Core contract text.

## Core Statement

uDOS stores truth in records, records execution in logs, carries change in
feeds, and retains and transforms those feeds locally through spools.

## Purpose

Define a bounded family model for:

- logs as execution records
- feeds as meaningful change streams
- spools as local feed retention and transformation
- MCP as the event access surface

## Core Definitions

### Logs

Logs record execution, not memory.

They should be:

- structured
- bounded
- useful
- cleanable

### Feeds

Feeds carry meaningful change.

Feed types may include:

- source
- event
- content
- reduction
- private

### Spool

A spool stores and shapes feeds locally.

A spool may:

- store feed items
- deduplicate
- compact
- rotate
- merge
- export

## Key Rules

- logs must not become memory
- feeds must not be raw logs
- prefer refs over payload dumps
- logs must be reducible into summaries or feed items
- spool is local retention and transformation, not canonical memory

## Lifecycle

`ingest -> classify -> spool -> transform -> emit`

## Candidate Runtime Shape

```text
runtime/
  logs/
  feeds/
    spools/
    subscriptions/
    transforms/
  reducers/
  digests/
```

## Candidate MCP Surface

### Logs

- `logs.query`
- `logs.summary`

### Feeds

- `feeds.fetch`
- `feeds.emit`
- `feeds.create`
- `feeds.render`

### Spool

- `spool.list`
- `spool.read`
- `spool.write`
- `spool.compact`
- `spool.rotate`
- `spool.merge`

### Reduction

- `reduce.logs_to_feed`
- `reduce.notifications`

## Candidate Schemas

Promotable first schemas:

- `feed-item.schema.json`
- `event.schema.json`

Minimal feed item shape:

```json
{
  "type": "object",
  "required": ["id", "ts", "feed_type", "summary"]
}
```

Minimal event shape:

```json
{
  "type": "object",
  "required": ["id", "ts", "type", "summary"]
}
```

## Candidate UI Surfaces

ThinUI or MDC-style surfaces may later include:

- feed builder
- spool manager
- feed browser
- digest view

These belong in surface-oriented docs, not in Core semantics.

## Promotion Path

When roadmapped, promote in this order:

1. core concept docs
2. schemas and contracts
3. tests and examples
4. thinui surface notes

## Family index

Indexed in **`@dev/notes/reports/family-duplication-and-pathway-candidates-2026-04-01.md`**
(Workspace 08). Public contract reference: **`uDOS-core/docs/feeds-and-spool.md`**.

## Rule

Do not duplicate Core **`feeds-and-spool`** semantics in `uDOS-docs`. Pathway checklists and indexes live under **`uDOS-dev/@dev/pathways/`**.
