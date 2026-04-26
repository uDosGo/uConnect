# Logs, Feeds, and Spool Candidate

**Status:** not yet roadmapped  
**Owner candidate:** `uDOS-core` with `uDOS-thinui` surface follow-through

This is a forward-looking family candidate, not a stable public reference.

## Core Statement

uDOS stores truth in records, records execution in logs, carries change in feeds,
and retains and transforms those feeds locally through spools.

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

## Rule

Do not promote this into stable `docs/` or `wiki/` until it is explicitly roadmapped.
