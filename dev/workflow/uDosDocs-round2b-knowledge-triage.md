# Round 2B Knowledge Triage — `uDosDocs/knowledge/bank`

Date: 2026-04-14  
Mode: continuous

**Restart 2026-04-15:** treat keep-now / keep-later / archive-first lists as **candidates** until spot-checked against the submodule; see [`2026-04-15-docs-migration-restart.md`](2026-04-15-docs-migration-restart.md).

## Objective

Classify knowledge-bank content into:

- keep-now (migrate into active docs lanes),
- keep-later (review queue),
- archive-first (move to `/archive/v2-reference` once mapped).

## Keep-Now (copied)

Copied to `docs/contributor/migrated-round2/knowledge/`:

- `GEOGRAPHY-KNOWLEDGE-SPEC.md`
- `KNOWLEDGE-SYSTEM.md`
- `_index.json`
- `structure.txt`
- `version.json`

## Keep-Later (review queue)

- `reference/`
- `tech/`
- `navigation/`
- `tools/`
- `communication/`

Rationale: likely reusable in contributor/reference surfaces after relevance tagging.

## Archive-First candidates

- `survival/`, `fire/`, `food/`, `water/`, `shelter/`, `medical/`, `wellbeing/`, `making/`
- `local/` and heavily tactical topic sets not tied to active A1 docs roadmap

Rationale: substantial volume, mixed relevance, and likely better as archive knowledge pools unless promoted by explicit roadmap task.

## Archive Mapping Target

- Target root: **`~/Code/archive/v2-reference/uDosDocs/knowledge/bank/`**
- **Round 2C (2026-04-15):** archive-first dirs **`survival/`**, **`fire/`**, **`food/`**, **`water/`**, **`shelter/`**, **`medical/`**, **`wellbeing/`**, **`making/`** copied from upstream `main` at **`1208a02`** (~155 files). README: `~/Code/archive/v2-reference/uDosDocs/knowledge/bank/README.md`. Monorepo pointer: [`docs/contributor/migrated-round2/knowledge/README.md`](../../docs/contributor/migrated-round2/knowledge/README.md).
