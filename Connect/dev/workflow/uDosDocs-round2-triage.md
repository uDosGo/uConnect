# Round 2 Triage — `uDosDocs` -> `docs`

Date: 2026-04-14  
Mode: continuous

**Restart 2026-04-15:** migration assessment resumed — **canonical** public/docs work lands in **`uDos/docs/`**; the triage paths below refer to **upstream** [uDosDocs](https://github.com/fredporter/uDosDocs) folder names when cherry-picking into `docs/`. Nested **`uDosDocs/`** at the root of this repo is **retired**. Snapshot: [`2026-04-15-docs-migration-restart.md`](2026-04-15-docs-migration-restart.md).

## Scope

- `uDosDocs/knowledge/`
- `uDosDocs/site/`
- `uDosDocs/examples/`
- `uDosDocs/tests/`
- `uDosDocs/wizard/`

## Classification

### Promote now (first batch)

- `examples/README.md` -> `docs/contributor/migrated-round2/examples/README.md`
- `tests/README.md` -> `docs/contributor/migrated-round2/tests/README.md`
- `wizard/05_wizard_and_beacon.md` -> `docs/contributor/migrated-round2/wizard/05_wizard_and_beacon.md`
- `knowledge/bank/README.md` -> `docs/contributor/migrated-round2/knowledge/bank-README.md`

### Review before promote

- `knowledge/bank/**` topical content (large volume)
- `site/**` static site assets/pages
- `examples/basic-docs-update.md`

### Archive-only candidates

- stale/generated site artifacts once equivalent canonical docs exist in `docs/`
- duplicated knowledge entries superseded by current A1 docs/specs

## Next step

- Round 2B: knowledge-bank topic sweep + archive map into `/archive/v2-reference`.
- **2026-04-15:** **`site/`** migrated to [`docs/contributor/migrated-round2/site/`](../../docs/contributor/migrated-round2/site/) (full static tree); index [`docs/contributor/migrated-round2/README.md`](../../docs/contributor/migrated-round2/README.md).
