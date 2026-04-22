# Dev flow and resume — uDos (beta governance, **alpha** product: A1 / A2)

**Companion:** [`dev-process-beta.md`](dev-process-beta.md)  
**A1 branch backlog (merge before alpha A1 closes):** [`dev/BACKLOG-A1-branch.md`](../../../BACKLOG-A1-branch.md)

**Alpha** = milestones **A1** and **A2**. **Beta** = historical program labels (v3–v5, imported snapshots). This doc is **beta**-era process text; execution targets **alpha**. **uDos only** (`dev/` + `docs/`).

---

## 1. Where work lives

| Location | Role |
| --- | --- |
| **`…/uDos/`** | Monorepo — `core/`, `core-rs/`, `tools/`, `modules/`, **`dev/`**, **`docs/`**, `courses/`, `scripts/`. **No submodules.** |
| **`dev/`** | Governance, tasks, workflow, imported snapshots. **[`dev/TASKS.md`](../../../TASKS.md)** is canonical. |
| **`docs/`** | Documentation corpus and specs. |

---

## 2. Default flow

1. **Intent** — Trace work in **[`dev/TASKS.md`](../../../TASKS.md)** and, while open, **[`dev/BACKLOG-A1-branch.md`](../../../BACKLOG-A1-branch.md)**.
2. **Implement** — Code and tests under **`uDos`**; cite spec paths under `docs/` or `dev/` in PR descriptions.
3. **Hygiene** — From repo root: `npm run build`, `npm test`, and any workspace scripts you touch.
4. **Slotted markdown** — If you edit frontmatter-driven docs under **`dev/`** or **`docs/`**, run **`./scripts/validate-doc-frontmatter.sh`** when present.
5. **Umbrella** — When changing courses or layout: **`./scripts/shakedown.sh`** (Round E / family checks in this repo).
6. **Teaching surface** — Student-facing material stays **uCode-first** where applicable; implementation languages follow existing package conventions.

---

## 3. Layout cues

| Topic | Where |
| --- | --- |
| **Repo** | Root [`README.md`](../../../../README.md), [`docs/family-workspace-layout.md`](../../../../docs/family-workspace-layout.md) |
| **CLI** | [`core/`](../../../../core/) |
| **Rust core** | [`core-rs/`](../../../../core-rs/) |
| **Imported program / roadmap snapshots** | [`dev/workflow/imported/`](../../imported/) |

---

## 4. Resume after a break

1. **`git pull`** in **uDos**. Do **not** run `git submodule update`.
2. Read **`dev/TASKS.md`** and **`dev/BACKLOG-A1-branch.md`**.
3. `npm ci` or `npm install`; `npm run build` when needed; **`npm run verify:a1`** for the A1 gate; **`./scripts/shakedown.sh`** when present.
4. Run **`./scripts/validate-doc-frontmatter.sh`** if you edited slotted docs.

---

## 5. Live testing and evidence

Use in-repo checklists under **`dev/workflow/imported/`** when they apply. Record operator outcomes in **`docs/dev-reports/`** or **`docs/status/`** with the templates you already use, plus **`dev/devlog/`** entries per [`dev/workflow/dev-summary-and-devlog.md`](../../dev-summary-and-devlog.md).

**Minimum gate:** **`npm run verify:a1`** and **`./scripts/shakedown.sh`**.

---

## 6. Related

- [`dev/workflow/dev-summary-and-devlog.md`](../../dev-summary-and-devlog.md)  
- [`dev/DOC-TODO.md`](../../../DOC-TODO.md) — deferred public documentation (do not parallel large `docs/public/` rewrites during implementation sprints).  
