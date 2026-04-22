# uDos database schema

Canonical DDL for all uDos database tiers. **Source of truth** until `fredporter/udos-db-schema` exists on GitHub; then this tree becomes a **git submodule** at the **same path** (`modules/udos-db-schema/`).

**Locked decision:** in-tree only; no broken submodule URLs. See [`MIGRATION.md`](MIGRATION.md).

## Structure

```
sqlite/           # T1: local SQLite (cell / voxel / uCube / uname)
  schema.sql      # CANONICAL — apply for new ~/.udos/cells.db
  migrations/
  triggers.sql
postgres/         # T2: AWS RDS (Space Cloud) — stubs
mysql/            # T3: WordPress — stubs
lmdb/             # T4: LMDB + CRDT docs
airgap/           # T5: offline transfer notes
```

## Canonical file

| Path | Role |
| --- | --- |
| [`sqlite/schema.sql`](sqlite/schema.sql) | **T1** — `voxels`, `ucubes`, `cells`, `blocks`, `name_registry` |

## Usage

```bash
# From uDosConnect repo root (recommended)
bash scripts/init-udos-sqlite.sh

# Or direct
sqlite3 ~/.udos/cells.db < sqlite/schema.sql
```

## Versioning

- **v1.0** — 2026-04-13 — initial locked DDL + tier stubs + migrations 001–003

## Submodule (future)

When the standalone repo exists:

```bash
git submodule add https://github.com/fredporter/udos-db-schema.git modules/udos-db-schema
```

Paths under `uDosConnect` stay identical.

## License

Align with uDos family (AGPL-3.0 where applicable for schema text).

## Specs

- [uDosDev — `UDOS_FIVE_TIER_DATABASE_STRATEGY_LOCKED_v1.md`](../../uDosDev/docs/specs/v4/UDOS_FIVE_TIER_DATABASE_STRATEGY_LOCKED_v1.md)
