# Docs + governance migration — assessment (2026-04-15)

**Rolling status:** [`migration-progress-2026-04.md`](migration-progress-2026-04.md) (T012 / T013 checklist).

## Canonical locations (uDos monorepo)

All governance, workflow, dev-only material belongs under **`dev/`**.  
All product, public, student, and contributor documentation belongs under **`docs/`**.

The old **Git submodule paths** **`uDos/uDosDev/`** and **`uDos/uDosDocs/`** are **removed** — do not recreate those folder names at the repo root. Any straggler content should be **merged into `dev/` or `docs/`** (or dropped if obsolete), then the empty legacy paths stay deleted.

The historical **GitHub** repositories [fredporter/uDosDev](https://github.com/fredporter/uDosDev) and [fredporter/uDosDocs](https://github.com/fredporter/uDosDocs) are **upstream archives** only: use them to cherry-pick or diff when something is still missing from **`dev/`** / **`docs/`**. They are **not** second working trees you keep beside the monorepo as a permanent layout.

## Why this document exists

Migration work ran in parallel with A1 lanes. This file tracks **assessment** and **re-entry** so promotion batches stay coherent.

## Comparing against upstream (optional, throwaway)

If you need a full tree to diff or `rsync` dry-runs, clone upstream into a **throwaway** directory (for example under `/tmp/`), compare against **`./dev/`** and **`./docs/`** from the **uDos** repo root, then delete the temp clone. Do **not** keep permanent parallel checkouts that recreate the old **`uDosDev/`** / **`uDosDocs/`** submodule layout beside this monorepo.

Example dry-runs (from repo root, after cloning upstream to a temp path). **Always exclude** upstream **`.git/`** (and usually `.cursor/`, `.github/`, `.compost/`, `node_modules/`) or line counts are inflated:

- `dev/workflow/compare-upstream-migration-delta.sh` — prints **filtered** `rsync -ani` line counts vs `./dev/` and `./docs/` (optional env: `UDOS_UPSTREAM_DEV`, `UDOS_UPSTREAM_DOCS`)
- Manual: `rsync -ani --exclude='.git/' --exclude='.cursor/' --exclude='.github/' --exclude='.compost/' --exclude='node_modules/' /tmp/udos-upstream-dev/ ./dev/` (review only; add `--delete` only with extreme care)

Prefer **themed batches** per [`../roadmaps/2026-04-14-submodule-migration-round-plan.md`](../roadmaps/2026-04-14-submodule-migration-round-plan.md); never `rsync --delete` into the monorepo without review.

## In-repo snapshot (batch 2026-04-15)

Imported copies (pinned README + commit) from upstream **into `dev/`** for offline roadmap work:

| Lane | Location |
| --- | --- |
| Governance / roadmap snapshot | [`imported/2026-04-15-uDosDev-snapshot/`](imported/2026-04-15-uDosDev-snapshot/README.md) |
| Doc scripts (review) | [`../../scripts/imported/2026-04-15-uDosDocs/`](../../scripts/imported/2026-04-15-uDosDocs/README.md) |

## Delta and “old submodule” notes

Earlier work referenced nested **`uDosDev/`** / **`uDosDocs/`** **inside** this repo. Those directories are **retired**; **`dev/`** and **`docs/`** are the replacement.

| Lane | Note |
| --- | --- |
| `docs/` | Grow toward full coverage; promotion batches merge from upstream **into** `docs/`. |
| `dev/` | Grow toward full governance coverage; merge from upstream **into** `dev/`. |

## Canonical targets

- **Governance / process:** **`dev/`**
- **Product + public docs:** **`docs/`**
- **Retired snapshots:** `~/Code/archive/v2-reference` (or family archive policy), never silent delete.

## Re-entry protocol (continuous rounds)

1. Re-read **`dev/workflow/uDosDocs-migration-map.md`** and **`uDosDocs-round2-triage.md`** / **`uDosDocs-round2b-knowledge-triage.md`** — triage lists describe **upstream → `docs/`** mapping (not local `uDosDocs/` paths inside this repo).
2. Pick **one** promotion batch and merge from upstream (temp clone or GitHub) into **`docs/`** / **`dev/`** as appropriate.
3. Add or update an **index** under `docs/` (or `docs/contributor/migrated-roundN/`) so readers can find new material (see [`../../docs/README.md`](../../docs/README.md)).
4. Re-run **`rsync -ani`** (or diff) from a **throwaway** upstream clone → `docs/` / `dev/` and record the line count for delta burn-down (Round 4).
5. Repeat until only intentional archive-only gaps remain, then drive **Round 5** delete-readiness from **`dev/decisions/2026-04-14-round5-deletion-readiness-checklist.md`**.

## Immediate next batch (suggested)

1. Upstream **`scripts/`** (uDosDocs repo) → align with root **`scripts/`** (dedupe per `uDosDocs-migration-map.md`); partial import under **`scripts/imported/2026-04-15-uDosDocs/`** (already present — review / wire CI).
2. Upstream **`site/`** — migrated to **`docs/contributor/migrated-round2/site/`** (2026-04-15).
3. Upstream **`knowledge/`** — keep-now subset in **`docs/contributor/migrated-round2/knowledge/`**; archive-first topic trees in **`~/Code/archive/v2-reference/uDosDocs/knowledge/bank/`** (Round 2C, 2026-04-15).
4. **Round 4** — re-run `rsync -ani` from throwaway clones; latest spot counts in [`migration-progress-2026-04.md`](migration-progress-2026-04.md).

## Links

- Round order: [`../roadmaps/2026-04-14-submodule-migration-round-plan.md`](../roadmaps/2026-04-14-submodule-migration-round-plan.md)
- Tasks: [`../TASKS.md`](../TASKS.md) (T012, T013)
- Upstream→`dev/` map: [`uDosDev-migration-map.md`](uDosDev-migration-map.md)
- Upstream→`docs/` map: [`uDosDocs-migration-map.md`](uDosDocs-migration-map.md)
