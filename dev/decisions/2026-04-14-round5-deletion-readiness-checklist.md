# Round 5 Deletion Readiness Checklist

- Date: 2026-04-14
- Status: **phase closed** for uDos monorepo (2026-04-15)
- Scope: upstream **`uDosDev`** / **`uDosDocs`** on GitHub (archives), not nested submodules in this repo

## Checklist

- [x] No critical docs/scripts unique to submodules — governance + workflow land in **`dev/`**; product docs in **`docs/`**; gaps catalogued in [`../workflow/migration-intentional-gaps-v1.md`](../workflow/migration-intentional-gaps-v1.md)
- [x] Migration map files exist
- [x] Archive destinations mapped for review/archive lanes (knowledge bank Round 2C → `~/Code/archive/v2-reference/uDosDocs/knowledge/bank/`; see [`../workflow/uDosDocs-round2b-knowledge-triage.md`](../workflow/uDosDocs-round2b-knowledge-triage.md))
- [x] CI/workflow parity for **this repo** — root **`.github/`**, **`npm run build`**; upstream `uDosDev/automation/` is family-wide optional merge (Round 3), not a monorepo blocker
- [x] Workspace + docs references use canonical **`dev/`** / **`docs/`** paths (see root **`AGENTS.md`**, **`docs/README.md`**, **`dev/workflow/`**)
- [x] Phase closure approved — [`2026-04-15-migration-phase-closure.md`](2026-04-15-migration-phase-closure.md)

## Current Verdict

- **uDos:** Do **not** reintroduce root **`uDosDev/`** or **`uDosDocs/`** folders; canonical trees are **`dev/`** and **`docs/`**.
- **GitHub:** Do **not** delete the **`uDosDev`** or **`uDosDocs`** **repositories** — they remain family archives and cherry-pick sources.

## Follow-up (non-blocking)

- Optional Round 3: merge selected `uDosDev/automation/` scripts into root **`.github/`** / **`scripts/`** when needed.
- Continuous promotion from upstream per themed batches in [`../workflow/migration-progress-2026-04.md`](../workflow/migration-progress-2026-04.md).
