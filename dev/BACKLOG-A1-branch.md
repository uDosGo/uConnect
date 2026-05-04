# A1 branch backlog — alpha reconciliation (was beta-era queue)

**Audience:** `--devonly`  
**Status:** **Reconciled** — A1 operator + automated checks passed; **active forward work** is tracked in [`TASKS.md`](TASKS.md) under **“Alpha roadmap tracked”** (semver lanes, Story, `usxd-go`, `uos`, Ventoy, GUI service).

**Return here for:** beta-era import pointers, execution-round references, and merge archaeology. **Do not** treat this file as the live day-to-day queue unless you are closing a beta reconciliation thread.

**Alpha vs beta:** **A1** and **A2** are **alpha** milestones (product line). This file listed **beta**-program work (historical v3–v5 / “pre-v5” tracks, imported checklists). **This reconciliation task folds that beta backlog into alpha execution** under one monorepo; remaining rows here are what still ships before A1 closes.

---

## Branch metaphor

This backlog is an **A1 side branch**: work listed here ships **before** A1 is fully closed. **Merge the branch** when the table is done (or items are promoted into `dev/TASKS.md`): record date + git SHA in `dev/devlog/` and the active period summary in `dev/summary/` per [`dev/workflow/dev-summary-and-devlog.md`](workflow/dev-summary-and-devlog.md), then replace this file with a short “merged at …” stub or archive the path.

**FYI handover:** [`dev/devlog/2026-04-15-fyi-agent-rules-architecture-alpha-beta-reconciliation.md`](devlog/2026-04-15-fyi-agent-rules-architecture-alpha-beta-reconciliation.md).

---

## Sync (uDosConnect only)

- **`git pull`** in **`uDosConnect`**. There are no submodules.

---

## Ordered work (implementation-first; beta-era sources)

| Priority | Track (beta) | What | Where in repo |
| --- | --- | --- | --- |
| P0 | Round E / umbrella | Courses valid, `dev/TASKS.md` present, governance snapshot path | `./scripts/shakedown.sh`; [`dev/workflow/migrated-round1/process/dev-process-beta.md`](workflow/migrated-round1/process/dev-process-beta.md) |
| P0 | Core / CLI | Vault, USXD, grid, uCode, MCP, server, orchestration — **alpha A1** milestone | `core-rs/`, `core/`; task rows T001–T021 in [`TASKS.md`](TASKS.md) |
| P1 | Automation (optional) | Merge selected automation into `.github/` / `scripts/` when needed | [`dev/workflow/migration-progress-2026-04.md`](workflow/migration-progress-2026-04.md) |
| P1 | Implementation checklist | Wizard / submission workflow (**§B4** in imported checklist) | [`dev/workflow/imported/2026-04-15-uDosDev-snapshot/future/UDOS_V46_CURSOR_IMPLEMENTATION_CHECKLIST_v1.md`](workflow/imported/2026-04-15-uDosDev-snapshot/future/UDOS_V46_CURSOR_IMPLEMENTATION_CHECKLIST_v1.md) |
| P1 | Games / tower (checklist **§B1–B3**) | Port or implement under monorepo packages / `tools/` when scheduled | Same file §B1–B3 |
| P2 | Next checklist patch | Name generator, renderer integrations, etc. | Same file §C |
| P2 | Legacy `@dev/` intake | Do **not** expand; archive to **`.compost/`** | [`dev-process-beta.md`](workflow/migrated-round1/process/dev-process-beta.md) |
| — | Deferred major | Large deferrals (3D, multiplayer, …) in checklist §D | Same file §D |

**Execution rounds (beta program order)** — detail and exit checks: [`dev/workflow/imported/2026-04-15-uDosDev-snapshot/future/PRE_V5_ROADMAP_AND_EXECUTION_ROUNDS_v1.md`](workflow/imported/2026-04-15-uDosDev-snapshot/future/PRE_V5_ROADMAP_AND_EXECUTION_ROUNDS_v1.md) §4; one-page order table: [`PRE_V5_ROADMAP_SINGLE_LANE_v1.md`](workflow/imported/2026-04-15-uDosDev-snapshot/future/PRE_V5_ROADMAP_SINGLE_LANE_v1.md). Public summary: [`docs/roadmap/pre-v5-family-notes.md`](../docs/roadmap/pre-v5-family-notes.md) *(historical “pre-v5” filename; content = **beta** roadmap pointers).*

---

## Gate — close **alpha A1** (after this branch merges)

1. **`npm run verify:a1`** — [`OPERATOR-LIVE-TEST-A1.md`](OPERATOR-LIVE-TEST-A1.md).  
2. **Operator manual smoke** — same doc.  
3. **Handover** — DEVLOG + period summary; slotted docs → `./scripts/validate-doc-frontmatter.sh` when present.

### Latest operator run (record)

- Timestamp: `2026-04-15 16:48 AEST`
- Git SHA: `12a3a59`
- Result: `npm run verify:a1` **pass** + manual smoke **pass**

---

## **Alpha A2** (after A1 accepted)

- [`docs/specs/workflow-network-a1-a2.md`](../docs/specs/workflow-network-a1-a2.md)  
- [`docs/specs/version-ladder-a1-a2.md`](../docs/specs/version-ladder-a1-a2.md) *(semver alpha ladder; filename is historical)*  
- [`docs/specs/a1-a2-boundary.md`](../docs/specs/a1-a2-boundary.md)  

---

## Next execution (live backlog)

Use **[`TASKS.md`](TASKS.md) → Alpha roadmap tracked** for ordered implementation (Markdownify, `udo run`, Docker, widgets, adaptors, Story, `uos`, Ventoy, Tailwind SKIN lane, etc.).

---

## Related

- [`workflow/migrated-round1/process/dev-beta-flow-and-resume.md`](workflow/migrated-round1/process/dev-beta-flow-and-resume.md) — sync + resume  
- [`dev/workflow/COMPOST-SUPERSEDED-BETA-TO-ALPHA.md`](workflow/COMPOST-SUPERSEDED-BETA-TO-ALPHA.md) — retired filenames  
- [`TASKS.md`](TASKS.md) — authoritative task IDs  
