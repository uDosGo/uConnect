# RFC-DEF-02 prep — graph editing (read-first)

**Status:** design prep only — **no graph editor implementation**  
**Parent stub:** `docs/deferred-product-rfc-stubs.md` § RFC-DEF-02  
**Updated:** 2026-04-05

## Working hypothesis (single owner for v1)

- **Read-only graph** derived from **existing** sources: binders, grid **PlaceRef**, workflow steps, and workspace operator snapshots.
- **Primary surface:** **`uDOS-workspace`** (browser) for first interactive graph; **`uDOS-grid`** remains authoritative for spatial identity; **ThinUI** may mirror **read-only** later.
- **Core** gains **first-class graph contracts** only if operators need portable interchange; until then, graph JSON is a **projection** of current contracts.

## Minimal data shape (illustrative)

```json
{
  "graph_id": "workspace-session-…",
  "nodes": [
    {"id": "binder:shell-activation", "kind": "binder", "label": "shell-activation"},
    {"id": "place:desk", "kind": "place", "label": "desk"}
  ],
  "edges": [
    {"from": "binder:shell-activation", "to": "place:desk", "relation": "located_at"}
  ]
}
```

Edges and kinds are **examples**; real enums would be locked in Core or workspace docs when the theme reopens.

## Non-goals (unchanged)

- Real-time collaborative editing.
- Replacing markdown-first authoring.

## Open questions (narrowed)

1. **Authoritative writes:** server-authoritative graph mutations vs CRDT — **defer** until a write use case is mandatory.
2. **Editing UX:** if **editing** reopens the theme, default to **workspace** modal / inspector, not ThinUI-first.

## Related

- `uDOS-workspace` binder spine / operator state (`docs/workspace-binder-spine.md` in that repo)
- `uDOS-core` grid / PlaceRef contracts
- `docs/deferred-product-rfc-stubs.md` § RFC-DEF-02
