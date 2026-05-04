# Migrate to standalone `fredporter/udos-db-schema`

**Trigger:** repository exists on GitHub.

## Steps

1. **Create repo contents** — copy this directory to the new repo, commit, push `main`.
2. **Remove in-tree copy** — `rm -rf modules/udos-db-schema` in `uDosConnect`, commit.
3. **Add submodule** — `git submodule add https://github.com/fredporter/udos-db-schema.git modules/udos-db-schema`
4. **Verify** — `bash scripts/init-udos-sqlite.sh` still resolves `sqlite/schema.sql`.

Paths **after** submodule: unchanged (`modules/udos-db-schema/sqlite/schema.sql`).

## Scripts to re-check

- `uDosConnect/scripts/init-udos-sqlite.sh`
- `distro/SonicScrewdriver/scripts/init-db.sh`
