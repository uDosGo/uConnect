# Dev process — uDos (beta)

**Status:** Working governance for this monorepo (2026-04). Older docs used version labels (v3–v5); **this file treats that era as uDos beta** — same rules, no external repo required.

**Repo:** **uDos** only. Canonical workflow lives under **`dev/`**; public and contributor documentation under **`docs/`**. Do **not** recreate **`uDosDev/`** or **`uDosDocs/`** at the repository root — those trees are **absorbed** into **`dev/`** and **`docs/`**.

**Framework:** Proposals, decisions, and promotions follow the intent in **`dev/workflow/`** templates and [`CONTRIBUTING.md`](../../../../CONTRIBUTING.md) — product code stays in application directories (`core/`, `core-rs/`, `tools/`, …), not in governance-only stubs.

## Version label

Root **`package.json`** **version** `4.0.0` tracks the **governance / dev-standard** line for this repo.

### Naming in prose

Prefer **uDos** in **new and edited** docs and script comments; the capital **D** is intentional. Legacy **uDOS** in older text can remain until touched. Do **not** use “UDO” / “UDOs” as a family acronym.

## Structure (beta — framework zones in this monorepo)

| Zone | Role |
| --- | --- |
| **`dev/decisions/`** | Locked or in-progress decisions (`*.md`). |
| **`dev/roadmaps/`** | Planning and round notes. |
| **`dev/workflow/`** | Process, migration maps, imported snapshots, handover docs. |
| **`dev/templates/`** | Contributor templates where present. |
| **`docs/`** | Tagged documentation corpus (see [`docs/documentation-policy.md`](../../../../docs/documentation-policy.md)). |
| **`docs/dev-reports/`** | Contributor dev reports & audits (`--devonly`, slots **3–4**) when used. |
| **`docs/status/`** | Internal status updates when used. |
| **`.local/`** | Untracked scratch (gitignored). |
| **`.compost/`** | Untracked archive for superseded material (gitignored). |
| **`dev/TASKS.md`** | Canonical task table — **[`TASKS.md`](../../../TASKS.md)**. |
| **Legacy `@dev/`** | **Beta** — long-lived intake is closed; archive to **`.compost/`** instead of growing new `@dev/` trees. |

**Rule:** **Product code** lives only in **uDos** (`core/`, `core-rs/`, `tools/`, `modules/`, …).

**Flow:** intent in **`dev/TASKS.md`** → implement → tests → PR; use **`dev/BACKLOG-A1-branch.md`** for the **A1 branch** queue until it is merged into main A1 closure.

## Specs and program docs (beta)

Locked and draft specs live under **`docs/specs/`** and in **`dev/workflow/imported/`** snapshots where mirrored. **Resume-after-break** and contributor rhythm: **[`dev-beta-flow-and-resume.md`](dev-beta-flow-and-resume.md)**.

## Companion docs

- **Rolling summary + DEVLOG:** [`dev/workflow/dev-summary-and-devlog.md`](../../dev-summary-and-devlog.md) — `dev/summary/`, `dev/devlog/`, [`dev/DOC-TODO.md`](../../../DOC-TODO.md) for deferred public docs.
- **Checklist:** [dev-checklist-beta.md](dev-checklist-beta.md) *(beta-era governance checklist).*  
- **Flow + resume:** [dev-beta-flow-and-resume.md](dev-beta-flow-and-resume.md)  
- **A1 branch backlog:** [`dev/BACKLOG-A1-branch.md`](../../../BACKLOG-A1-branch.md)  
- **Disk layout:** [`docs/family-workspace-layout.md`](../../../../docs/family-workspace-layout.md)  

Operator task notes may also live in **`~/Code/Dev-tasks.md`** locally; committed truth is **`dev/TASKS.md`**.
