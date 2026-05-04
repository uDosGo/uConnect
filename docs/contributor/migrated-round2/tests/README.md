# Tests

Upstream **`uDosDocs/tests/`** notes (migrated snapshot). In **uDos**, docs validation is **not** the legacy `scripts/run-docs-checks.sh` from uDosDocs (that script targets the old repo layout; see [`scripts/imported/2026-04-15-uDosDocs/README.md`](../../../../scripts/imported/2026-04-15-uDosDocs/README.md)).

**This monorepo:** run **`./scripts/shakedown.sh`** from the repo root — it checks canonical **`dev/TASKS.md`**, **`docs/README.md`**, courses, and related v4 task hygiene.

Historical ideas preserved from upstream:

- repo docs should stay free of hardcoded private local-root paths
- keep documentation validation lightweight and source-first
