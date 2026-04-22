# Migration intentional gaps — Round 4 closure (v1)

**Date:** 2026-04-15  
**Purpose:** Explain **filtered** `rsync -ani` differences between throwaway **upstream** clones ([uDosDev](https://github.com/fredporter/uDosDev), [uDosDocs](https://github.com/fredporter/uDosDocs)) and monorepo **`dev/`** / **`docs/`** without a 1:1 directory mirror.

**Method:** [`compare-upstream-migration-delta.sh`](compare-upstream-migration-delta.sh). When every row below is either **migrated elsewhere**, **archive**, or **explicitly not carried**, the remaining delta is **intentional** for this phase.

## Layout rule

**uDos** does **not** recreate upstream top-level folder names at `dev/` or `docs/` when content moved into **`migrated-roundN/`**, **`scripts/imported/`**, or **`~/Code/archive/`**.

---

## `uDosDev` → `dev/` (upstream-only top-level names)

| Upstream path | Disposition |
| --- | --- |
| `@dev` | Upstream symlink into archived v4 tree; monorepo uses `dev/workflow/` + `docs/contributor/` imports. |
| `Open-Terminal.command`, `QUICKSTART.md` | Optional operator helpers; not required inside monorepo `dev/` (use repo `README.md`, `dev/DEV.md`). |
| `VERSION` | Per-repo; monorepo uses root `package.json` / product crates. |
| `package.json` | uDosDev workspace metadata; **not** merged into `dev/`. |
| `automation/` | Family GitHub governance scripts; **Round 3** optional consolidation into root `.github/` / `scripts/` — not blocking A1. |
| `courses/` | Upstream stubs; family courses live under monorepo **`courses/`** (repo root). |
| `docs/` | Governance subset in `dev/workflow/migrated-round1/process/`; full tree remains on GitHub for history. |
| `scripts/` | Cherry-pick into root **`scripts/`** as needed; remainder upstream-only. |
| `vibe-plugin-udos-dev/` | **Template** remote; install per plugin README — not vendored under `dev/`. |
| `wiki/` | Deferred / archive lane; not duplicated 1:1. |
| `workspaces/` | Round-note style content; partial imports under `dev/workflow/` where listed in migration maps. |

Overlapping root files (`AGENTS.md`, `README.md`, `TASKS.md`, `.gitignore`) differ by design — monorepo **`dev/TASKS.md`** and templates supersede upstream copies.

---

## `uDosDocs` → `docs/` (upstream-only top-level names)

| Upstream path | Where it lives in uDos |
| --- | --- |
| `architecture/` | `docs/contributor/migrated-round1/architecture/` |
| `site/` | `docs/contributor/migrated-round2/site/` |
| `knowledge/` | Keep-now subset: `docs/contributor/migrated-round2/knowledge/`; archive-first topic trees: `~/Code/archive/v2-reference/uDosDocs/knowledge/bank/` |
| `examples/`, `tests/`, `wizard/` | `docs/contributor/migrated-round2/{examples,tests,wizard}/` |
| `scripts/` | `scripts/imported/2026-04-15-uDosDocs/` (+ dedupe with root `scripts/`) |
| `@dev`, `alpine/`, `config/`, `docs/`, `seed/`, `uhome/`, `wiki/` | Triage deferred, product-specific, or duplicate of monorepo trees — not mirrored at `docs/` root. |
| `CHANGELOG.md`, `TASKS.md`, `VERSION` | Monorepo uses root / `dev/TASKS.md` / `docs/` index — not duplicated at `docs/` root. |

---

## Verdict

Remaining **~852** / **~398** filtered rsync item lines are consistent with **nested migration + archive policy**, not unknown missing work. Further promotion is **continuous** (themed batches), not a blocking gate for A1.

**Related:** [`migration-progress-2026-04.md`](migration-progress-2026-04.md), [`2026-04-15-migration-phase-closure.md`](../decisions/2026-04-15-migration-phase-closure.md).
