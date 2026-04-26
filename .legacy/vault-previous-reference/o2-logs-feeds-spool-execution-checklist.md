# O2 execution checklist — logs, feeds, spool

Post-08 optional round **O2** (pathways promotion). This is an **execution lane** checklist, not a numbered `v2.x` binder. Open a family plan only if scope crosses `docs/next-family-plan-gate.md`.

## Promotion record

- **Decision:** Promoted **2026-04-02** — pathway moves from “candidate only” to **binder-ready execution** tracking.
- **Pathway coordinator:** `uDOS-dev` (`@dev/pathways`, duplication index).
- **Contract owner:** `uDOS-core` — canonical semantics: **`uDOS-core/docs/feeds-and-spool.md`**.
- **Surface follow-through:** `uDOS-thinui` (feed/spool UI when implemented).

## Contract alignment (before implementation tranches)

- [ ] Re-read **`uDOS-core/docs/feeds-and-spool.md`**; no duplicate competing definitions in `uDOS-docs` hub prose.
- [ ] Candidate MCP names in `logs-feeds-and-spool-candidate.md` treated as **design stubs** until manifests exist in owning repos.

## Implementation tranches (unchecked = future work)

- [ ] Publish **`feed-item`** / **`event`** JSON Schemas under an owning repo (`uDOS-core` preferred) and reference from pathway doc.
- [ ] Add examples + parser tests for minimal feed item / event shapes.
- [ ] ThinUI or operator notes for feed browser / spool manager (surface-only; no Core vocabulary fork).

## Verification

From `uDOS-dev` repo root:

```bash
bash scripts/verify-pathway-o2-logs-feeds-spool.sh
```

With a family checkout (siblings), the script also asserts **`uDOS-core/docs/feeds-and-spool.md`** is present.
