# Decision: Submodule Migration Audit (`uDosDev`, `uDosDocs`)

- Date: 2026-04-14
- Status: locked (historical snapshot)
- Scope: deletion readiness for `uDosDev` and `uDosDocs`

**Update 2026-04-15:** Phase closure for the **uDos** monorepo is recorded in [`2026-04-15-migration-phase-closure.md`](2026-04-15-migration-phase-closure.md) with intentional gaps in [`../workflow/migration-intentional-gaps-v1.md`](../workflow/migration-intentional-gaps-v1.md). The dry-run figures below remain a useful **baseline**; they are not an open blocker once that closure is merged.

## Result

Migration is **not complete**. Do **not** delete either submodule yet.

## Audit Summary

### `uDosDev` -> `dev`

- rsync dry-run delta:
  - `deleting=35`
  - `add_or_copy=854`
  - `file_changes=858`
- Missing top-level areas in `dev` compared to `uDosDev` include:
  - `.github`, `.cursor`, `.compost`
  - `automation`, `courses`, `docs`, `scripts`
  - `wiki`, `workspaces`, `vibe-plugin-udos-dev`
  - root files like `VERSION`, `package.json`, `Open-Terminal.command`, `QUICKSTART.md`

### `uDosDocs` -> `docs`

- rsync dry-run delta:
  - `deleting=58`
  - `add_or_copy=360`
  - `file_changes=361`
- Missing top-level areas in `docs` compared to `uDosDocs` include:
  - `.github`, `@dev`, `architecture`, `knowledge`, `site`, `tests`, `wizard`, `wiki`
  - root files like `CHANGELOG.md`, `TASKS.md`, `VERSION`, `.gitignore`

## Recommendation (2026-04-14 snapshot)

1. Keep `uDosDev` and `uDosDocs` as active submodules for now.
2. Run staged migration rounds with explicit copy maps.
3. Delete submodules only after:
   - zero critical delta in dry-run audit
   - docs/process links updated
   - CI and workspace references validated.

**2026-04-15:** **uDos** no longer uses those submodules; canonical trees are **`dev/`** / **`docs/`**. GitHub repos stay as archives. See [`2026-04-15-migration-phase-closure.md`](2026-04-15-migration-phase-closure.md).
