# FYI — agent rules, architecture, alpha vs beta (reconciliation complete)

**Date:** 2026-04-15  
**Tone:** informational handover for the next agent or human operator — not a spec change request.

## Alpha (current)

- **A1** and **A2** are **alpha** milestones for **uDos**: A1 = local-first wireframe core and CLI; A2 = always-on / network / universe lane (see `docs/specs/workflow-network-a1-a2.md`, `docs/specs/version-ladder-a1-a2.md`).
- Canonical task surface: **`dev/TASKS.md`**. Operator gate: **`npm run verify:a1`**, **`dev/OPERATOR-LIVE-TEST-A1.md`**.
- The **A1 branch backlog** (**`dev/BACKLOG-A1-branch.md`**) is the reconciled queue of **beta**-era items that must still land **before** A1 is fully accepted; when done, **merge** per `dev/workflow/dev-summary-and-devlog.md` (DEVLOG + period summary), then trim or archive that backlog file.

## Beta (historical / imported)

- Program labels **v3 / v4 / v4.5 / v5 / “pre-v5”** and imported folders such as **`dev/workflow/imported/2026-04-15-uDosDev-snapshot/`** are **beta**-era material — planning spine, checklists, execution-round tables. They remain **in-tree** for reference; do not treat them as parallel repositories or mandatory external checkouts.
- Process files live under **`dev/workflow/migrated-round1/process/`**: **`dev-process-beta.md`**, **`dev-beta-flow-and-resume.md`**, **`dev-checklist-beta.md`** (renamed from `*-v4` filenames).

## Architecture rules (uDos only)

- **Governance:** **`dev/`** only. **Documentation corpus:** **`docs/`** only. No root **`uDosDev/`** / **`uDosDocs/`** folders.
- **Sync:** `git pull` in **uDos**; no submodules. **Checks:** `scripts/v4-dev/check-tasks-md.sh` validates task files in this repo only; **`scripts/shakedown.sh`** for umbrella validation.

## Compost / cleanup

- Superseded filename map: **`dev/workflow/COMPOST-SUPERSEDED-BETA-TO-ALPHA.md`**.
- **`.compost/`** at repo root is for **TIDY/CLEAN** debris (see **`.compost/README.md`**); gitignored except its README.
- Empty **`dev/local/`** was removed; contributors recreate per **`dev/README.md`** (`mkdir -p dev/local/...`) — contents stay gitignored.

## Reconciliation statement

This task **completes the reconciliation** of the **beta** backlog narrative into **alpha** execution: single monorepo, A1/A2 as the product line, beta material labeled and compartmentalized under **`dev/workflow/`** imports and renamed process files.
