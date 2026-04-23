# Decision: Submodule migration — phase closure (uDos)

- **Date:** 2026-04-15
- **Status:** locked
- **Scope:** T012 / T013 acceptance and Round 5 checklist for **this monorepo**

## Result

**Phase closure (v1) approved.** The **uDos** tree uses canonical **`dev/`** and **`docs/`** only. Root **`uDosDev/`** and **`uDosDocs/`** submodule directories are **not** used. Remaining differences vs upstream GitHub repositories are **documented** in [`dev/workflow/migration-intentional-gaps-v1.md`](../workflow/migration-intentional-gaps-v1.md).

## What this does **not** mean

- It does **not** delete or retire the **GitHub** repositories [fredporter/uDosDev](https://github.com/fredporter/uDosDev) or [fredporter/uDosDocs](https://github.com/fredporter/uDosDocs). They remain **family archives** for history, cherry-picks, and optional future batches.
- It does **not** require CI/automation from uDosDev to be copied verbatim; monorepo **`.github/`** and **`npm run build`** are authoritative for this repo.

## Approvals

- Operator / maintainer sign-off: **recorded in Git** (this file + TASKS.md update).

## Related

- Prior audit snapshot: [`2026-04-14-submodule-migration-audit.md`](2026-04-14-submodule-migration-audit.md) (superseded for “blocking” status by this closure).
- Checklist: [`2026-04-14-round5-deletion-readiness-checklist.md`](2026-04-14-round5-deletion-readiness-checklist.md).
