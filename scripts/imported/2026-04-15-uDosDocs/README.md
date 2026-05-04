# Imported scripts (from upstream uDosDocs GitHub)

- Source: https://github.com/fredporter/uDosDocs
- Commit: 1208a02
- Date: 2026-04-15
- **Canonical doc corpus in this monorepo:** **`docs/`** — do not add a root **`uDosDocs/`** folder.
- **`run-docs-checks.sh` is not runnable as-is** in uDos: it expects the old uDosDocs tree (`docs/architecture.md`, `site/`, `examples/` at repo root, `generate-site-data.mjs`, etc.). Keep this file as a **reference** for a future monorepo-native docs check. **`./scripts/shakedown.sh`** validates canonical `dev/` + `docs/` entrypoints instead.

| File | Role |
| --- | --- |
| `run-docs-checks.sh` | Docs QA (from upstream) |
| `README.md` | Upstream script notes |
