# Submodule migration — progress note (2026-04)

**Purpose:** Rolling status for **T012** (`uDosDev` → `dev/`) and **T013** (`uDosDocs` → `docs/`). Full procedure: [`2026-04-15-docs-migration-restart.md`](2026-04-15-docs-migration-restart.md), round order: [`../roadmaps/2026-04-14-submodule-migration-round-plan.md`](../roadmaps/2026-04-14-submodule-migration-round-plan.md).

## Done in-tree

| Item | Location / note |
| --- | --- |
| Round plan + continuous mode | [`../roadmaps/2026-04-14-submodule-migration-round-plan.md`](../roadmaps/2026-04-14-submodule-migration-round-plan.md) |
| Maps | [`uDosDev-migration-map.md`](uDosDev-migration-map.md), [`uDosDocs-migration-map.md`](uDosDocs-migration-map.md) |
| uDosDev roadmap snapshot | [`imported/2026-04-15-uDosDev-snapshot/`](imported/2026-04-15-uDosDev-snapshot/README.md) |
| uDosDocs scripts import | [`../../scripts/imported/2026-04-15-uDosDocs/`](../../scripts/imported/2026-04-15-uDosDocs/README.md) |
| Process docs link hygiene | [`migrated-round1/process/dev-beta-flow-and-resume.md`](migrated-round1/process/dev-beta-flow-and-resume.md) — pointers use imported snapshots *(beta)* |
| Family / pre-v5 index | [`family-pre-v5-index.md`](family-pre-v5-index.md), [`../../docs/roadmap/pre-v5-family-notes.md`](../../docs/roadmap/pre-v5-family-notes.md) |
| **`site/`** static snapshot | [`../../docs/contributor/migrated-round2/site/`](../../docs/contributor/migrated-round2/site/) — upstream `uDosDocs/site/` (2026-04-15) |
| Round 2 knowledge keep-now | [`../../docs/contributor/migrated-round2/knowledge/`](../../docs/contributor/migrated-round2/knowledge/) — bank subset per [`uDosDocs-round2b-knowledge-triage.md`](uDosDocs-round2b-knowledge-triage.md) |

## Phase closure (2026-04-15)

**T012 / T013** are **done** for this phase — [`../decisions/2026-04-15-migration-phase-closure.md`](../decisions/2026-04-15-migration-phase-closure.md). Remaining `rsync` differences vs upstream are **explained** in [`migration-intentional-gaps-v1.md`](migration-intentional-gaps-v1.md), not treated as unknown debt.

## Follow-up (optional, non-blocking)

| Item | Action |
| --- | --- |
| Scripts / shakedown | **`./scripts/shakedown.sh`** updated for canonical **`dev/`** + **`docs/`** (no submodule paths). **`check-tasks-md.sh`** now requires **`dev/TASKS.md`**. Imported `run-docs-checks.sh` stays reference-only — see [`scripts/imported/2026-04-15-uDosDocs/README.md`](../../scripts/imported/2026-04-15-uDosDocs/README.md). |
| Round 3 | Merge selected `uDosDev/automation/` into root `.github/` / `scripts/` when needed. |
| Filtered delta tool | [`compare-upstream-migration-delta.sh`](compare-upstream-migration-delta.sh) — **~852** / **~398** lines spot check 2026-04-15. |

## Last updated

2026-04-15 — progress note created; gates above unchanged until upstream batches land.

2026-04-15 — **`site/`** copied into `docs/contributor/migrated-round2/site/`; Round 2 index [`docs/contributor/migrated-round2/README.md`](../../docs/contributor/migrated-round2/README.md).

2026-04-15 — Added [`compare-upstream-migration-delta.sh`](compare-upstream-migration-delta.sh); **filtered** spot counts **~852** / **~398** (dev/docs).

2026-04-15 — Phase closure: [`migration-intentional-gaps-v1.md`](migration-intentional-gaps-v1.md), [`../decisions/2026-04-15-migration-phase-closure.md`](../decisions/2026-04-15-migration-phase-closure.md).
