# Upstream uDosDocs (GitHub) → `docs/` migration map (Round 0)

**Canonical in uDos:** **`docs/`** — not a root-level `uDosDocs/` folder. The **`uDosDocs/…`** prefixes below mean paths in the **[fredporter/uDosDocs](https://github.com/fredporter/uDosDocs)** repository when merging **into** this monorepo.

## Must-Keep (migrate into active tree)

- `uDosDocs/architecture/*` -> `docs/contributor/migrated-round1/architecture/`
- selected policy/process docs from `uDosDocs/docs/` -> `docs/contributor/migrated-round1/reference/`

## Review (triage before final placement)

- `uDosDocs/knowledge/`
- `uDosDocs/site/`
- `uDosDocs/examples/`
- `uDosDocs/tests/`
- `uDosDocs/wizard/`

## Archive-Only

- stale content that is duplicated by current canonical docs in `docs/`
- old release-only docs without current A1/A2 relevance

## Round 1 Batch (completed now)

- `uDosDocs/architecture/01_overview.md` -> `docs/contributor/migrated-round1/architecture/01_overview.md`
- `uDosDocs/architecture/02_public_boundary.md` -> `docs/contributor/migrated-round1/architecture/02_public_boundary.md`
- `uDosDocs/architecture/03_dependency_environment_policy.md` -> `docs/contributor/migrated-round1/architecture/03_dependency_environment_policy.md`

## Round 2 Batch (2026-04-15 — scripts import)

Copied from **`main`** at `uDosDocs` into `scripts/imported/2026-04-15-uDosDocs/` for review and dedupe with root `scripts/`:

- `scripts/run-docs-checks.sh`
- `scripts/README.md`

## Round 2 Batch (2026-04-15 — `site/` snapshot)

Copied from **`main`** at `uDosDocs` into `docs/contributor/migrated-round2/site/`:

- full `site/` tree (static GitHub Pages scaffold: `*.html`, `styles.css`, `app.js`, `data/*.json`)

Index: [`docs/contributor/migrated-round2/README.md`](../../docs/contributor/migrated-round2/README.md).

## Round 2C — archive-first knowledge topic trees

Copied from **`main`** at **`1208a02`** into **`~/Code/archive/v2-reference/uDosDocs/knowledge/bank/`** (local archive, outside the monorepo):

- `survival/`, `fire/`, `food/`, `water/`, `shelter/`, `medical/`, `wellbeing/`, `making/`

Pointer from active docs: [`docs/contributor/migrated-round2/knowledge/README.md`](../../docs/contributor/migrated-round2/knowledge/README.md). Triage: [`uDosDocs-round2b-knowledge-triage.md`](uDosDocs-round2b-knowledge-triage.md).

## Round 4 closure (2026-04-15)

Remaining upstream-vs-`docs/` top-level differences are **catalogued** in [`migration-intentional-gaps-v1.md`](migration-intentional-gaps-v1.md). Phase decision: [`../decisions/2026-04-15-migration-phase-closure.md`](../decisions/2026-04-15-migration-phase-closure.md).
