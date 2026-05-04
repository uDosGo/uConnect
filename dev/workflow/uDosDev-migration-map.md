# Upstream uDosDev (GitHub) → `dev/` migration map (Round 0)

**Canonical in uDos:** **`dev/`** — not a root-level `uDosDev/` folder. The **`uDosDev/…`** prefixes below mean paths in the **[fredporter/uDosDev](https://github.com/fredporter/uDosDev)** repository when merging **into** this monorepo.

## Must-Keep (migrate into active tree)

- `uDosDev/docs/process/*` -> `dev/workflow/migrated-round1/process/`
- `uDosDev/docs/family-*` and `uDosDev/docs/roadmap*` -> `dev/roadmaps/migrated-round1/`
- `uDosDev/scripts/*` (selected reusable) -> `scripts/` or `dev/workflow/migrated-round1/scripts/`

## Review (triage before final placement)

- `uDosDev/wiki/`
- `uDosDev/workspaces/`
- `uDosDev/automation/`
- `uDosDev/vibe-plugin-udos-dev/`

## Archive-Only

- superseded historical docs with newer canonical equivalents in `dev/` and `docs/`
- stale one-off operational artifacts after triage

## Round 1 Batch (completed now)

- `uDosDev/docs/process/dev-process-v4.md` -> `dev/workflow/migrated-round1/process/dev-process-beta.md` *(renamed in monorepo)*
- `uDosDev/docs/process/dev-checklist-v4.md` -> `dev/workflow/migrated-round1/process/dev-checklist-beta.md` *(renamed in monorepo)*
- `uDosDev/docs/process/v4-5-plus-dev-flow-and-resume.md` -> `dev/workflow/migrated-round1/process/dev-beta-flow-and-resume.md` *(renamed in monorepo)*

## Round 2 Batch (2026-04-15 — snapshot import, post-submodule)

Promoted from **`main`** at `uDosDev` Git (shallow clone) into `dev/workflow/imported/2026-04-15-uDosDev-snapshot/`:

- `docs/future/PRE_V5_ROADMAP_AND_EXECUTION_ROUNDS_v1.md`
- `docs/future/UDOS_V46_CURSOR_IMPLEMENTATION_CHECKLIST_v1.md`
- `docs/roadmap-v4-family.md`

**Derived in uDos (not a separate upstream pull):** [`future/PRE_V5_ROADMAP_SINGLE_LANE_v1.md`](imported/2026-04-15-uDosDev-snapshot/future/PRE_V5_ROADMAP_SINGLE_LANE_v1.md) — single-lane **PRE5-R01–R07** table aligned with **§4** of the execution-rounds doc. Index: [`family-pre-v5-index.md`](family-pre-v5-index.md); public summary: [`docs/roadmap/pre-v5-family-notes.md`](../../docs/roadmap/pre-v5-family-notes.md).

## Round 4 closure (2026-04-15)

Remaining upstream-vs-`dev/` differences are **catalogued** in [`migration-intentional-gaps-v1.md`](migration-intentional-gaps-v1.md). Phase decision: [`../decisions/2026-04-15-migration-phase-closure.md`](../decisions/2026-04-15-migration-phase-closure.md).
