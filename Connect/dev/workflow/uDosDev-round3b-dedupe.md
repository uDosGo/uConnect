# Round 3B De-dup Check — `uDosDev` consolidation

Date: 2026-04-14  
Mode: continuous

## Scope

- `uDosDev/automation/*`
- `uDosDev/.github/workflows/*`
- `uDosDev/scripts/*`

## Findings

### Migrated automation vs root scripts

Checked `scripts/migrated-round3/automation/*.sh` against:

- `scripts/`
- `uDosDev/scripts/`

Result:

- No filename duplicates found in root `scripts/`.
- No filename matches with `uDosDev/scripts/` for the migrated automation set.

### Workflow files

`uDosDev/.github/workflows/` contains:

- `family-policy-check.yml`
- `promote.yml`
- `release.yml`
- `validate.yml`

Root `.github/workflows/` currently contains:

- `core-ci.yml`
- `lock-boundary.yml`
- `validate-courses.yml`

Result:

- No filename collisions.
- Potential policy overlap exists by intent (not by filename); requires semantic diff in next pass before promotion.

## Next step

- Round 3C: semantic merge plan for workflow intent overlap and script ownership targets.
