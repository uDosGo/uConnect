# Dev summary + DEVLOG (rolling handover)

**Audience:** `--devonly` · **Purpose:** replace long ad-hoc “dev summary” essays with a **small, repeatable** loop: periodic summary doc → links to **DEVLOG** entries → machine-friendly handover → **no** parallel public-doc rewrites during implementation (use **`dev/DOC-TODO.md`** instead).

---

## 1. Three layers (don’t duplicate)

| Layer | Role | Where |
| --- | --- | --- |
| **Backlog / done (task IDs)** | Authoritative **status** for work items | **`dev/TASKS.md`** (table + optional **Task Details**) |
| **DEVLOG** | Short, **dated** notes: what changed, commit/ref, risk, test evidence | **`dev/devlog/`** (one file per entry — see [`dev/devlog/README.md`](../devlog/README.md)) |
| **Period summary** | **Roll-up** for humans & assistants: what this period covered, what rolls forward, links to DEVLOG | **`dev/summary/`** using [`TEMPLATE_DEV_SUMMARY.md`](../TEMPLATE_DEV_SUMMARY.md) |

**Roadmaps** (`dev/roadmaps/` template policy) stay **strategic** and thin. Do **not** copy full task detail into roadmaps as you implement — link **`TASKS.md`** and the active **summary** instead.

---

## 2. When you open a **new** summary doc

1. **Open** the previous summary in **`dev/summary/`** (newest dated file).
2. **Assess:** mark completed, move **incomplete** and **watch** items forward.
3. **Create** the new file from [`TEMPLATE_DEV_SUMMARY.md`](../TEMPLATE_DEV_SUMMARY.md); set **`previous:`** frontmatter to the old file.
4. **Link** every material change to **DEVLOG** entries (paths under `dev/devlog/`), not pasted prose.
5. **Archive verbosity:** if the old summary was long, **do not** preserve narrative — only **rolled-forward bullets** and **links**.

---

## 3. DEVLOG entries (what goes in)

- **Title line:** date + topic (`YYYY-MM-DD-*.md`).
- **Body:** bullets only — PR/commit SHA optional, test command, pass/fail, follow-ups.
- **No** full design docs here; those are **decisions** (`dev/decisions/`) or specs (`docs/specs/`).

Index and naming: [`dev/devlog/README.md`](../devlog/README.md).

---

## 4. Completed work — is there a feed / MCP?

**In this repo today:**

- **Completed items** are recorded in **`dev/TASKS.md`** (`Status` = `done`) and in **git history**.
- There is **no** separate automated feed, MCP server, or external “done queue” wired in-tree.

**Practical pattern:**

- Treat **`TASKS.md`** as the **canonical completed list** for task IDs.
- Add **`## Completed (this period)`** in the **period summary** with links to **`Txxx`** rows (anchor or line reference) plus any **DEVLOG** paths for evidence.
- If you later add automation (CI, MCP, Notion), **ingest from TASKS + devlog filenames** — don’t create a third source of truth.

---

## 5. Public / user docs (**not** in parallel)

- During implementation and test rounds, **do not** split focus into large **`docs/public/`** rewrites.
- Capture “later doc work” only in **`dev/DOC-TODO.md`** (single backlog; promote in a **dedicated doc round**).
- **`docs/DOCUMENTATION-MAINTENANCE.md`** remains the PR/style gate when you **do** touch public docs.

---

## 6. Formatting consistency

- **Summary:** use [`TEMPLATE_DEV_SUMMARY.md`](../TEMPLATE_DEV_SUMMARY.md) frontmatter keys (`period`, `previous`, `devlog`).
- **DEVLOG:** `YYYY-MM-DD-slug.md`, top `# Title`, then bullets.
- **TASKS:** keep IDs stable (`Txxx`); move status in one place.

---

## Related

- [`dev-process-beta.md`](migrated-round1/process/dev-process-beta.md) — framework zones, `.local/` / `.compost/` (uDos **beta** label for older version-era docs).
- [`dev/BACKLOG-A1-branch.md`](../BACKLOG-A1-branch.md) — A1 side branch backlog; merge before A1 closes; **uDos** only.
- [`dev-beta-flow-and-resume.md`](migrated-round1/process/dev-beta-flow-and-resume.md) — sync, resume, live-testing evidence in `docs/dev-reports/` when using slotted templates under `docs/` / `dev/`.
- [`dev/TASKS.md`](../TASKS.md) — backlog.
- [`dev/DOC-TODO.md`](../DOC-TODO.md) — deferred public-doc items.
- [`dev/workflow/COMPOST-SUPERSEDED-BETA-TO-ALPHA.md`](COMPOST-SUPERSEDED-BETA-TO-ALPHA.md) — retired **beta** filenames → **alpha** workflow.
- [`dev/devlog/2026-04-15-fyi-agent-rules-architecture-alpha-beta-reconciliation.md`](../devlog/2026-04-15-fyi-agent-rules-architecture-alpha-beta-reconciliation.md) — FYI handover (alpha vs beta).
