# Family workspace layout (planning spine)

**Canonical “where on disk” doc** for **uDos** — other pages should **link here** instead of repeating path prose.

---

## Coding root (optional)

**uDos does not require a specific folder.** Clone anywhere; tools use paths **inside** the repo.

A single parent folder for local clones (e.g. **`~/Code/`**) is a common convention; the name is your choice.

| Idea | macOS | Linux | Windows (typical) |
| --- | --- | --- | --- |
| Coding root (examples) | `/Users/you/Code/` | `/home/you/Code/` | `C:\Users\you\Code\` |
| This monorepo | `…/Code/uDos/` | `…/Code/uDos/` | `…\Code\uDos\` |
| Optional archive / retired trees | `…/Code/archive/` | `…/Code/archive/` | `…\Code\archive\` |

On **Windows**, **Git Bash** and many tools expand `~/`; use a consistent logical tree even if the drive path differs.

---

## Single active uDos repo

**Primary checkout (illustrated):** **`~/Code/uDos/`** — **`udo`** CLI in **`core/`**, **`tools/`**, **`modules/`**, **`dev/`**, **`templates/`**, **`seed/`**, **`docs/`**, **`courses/`**, **`scripts/`** — **monorepo** (no Git submodules).

- **`…/uDos/dev/`** — contributor workflow, tasks, imported snapshots  
- **`…/uDos/docs/`** — tagged documentation corpus  
- **`…/uDos/scripts/`** — automation and checks  

**Do not** recreate old **`uDosDev/`** or **`uDosDocs/`** folder names at the root. Governance and documentation are **only** under **`dev/`** and **`docs/`**. Active backlog for the A1 milestone: [`dev/BACKLOG-A1-branch.md`](../dev/BACKLOG-A1-branch.md).

**Retired trees** may live under **`~/Code/archive/`** on your machine if you keep one. Optional read-only **v2** material may sit there; it is not part of the default dev loop.

---

## Diagram

```text
~/Code/                    ← optional coding root
  uDos/             ← this monorepo
    core/
    dev/
    docs/
    scripts/
  archive/                 ← optional retired trees
```

---

## Related

- [`shared-resources-architecture.md`](shared-resources-architecture.md) — `~/.udos` runtime layout (separate from Git checkouts).  
- **Beta roadmap index (imported snapshots):** [`dev/workflow/family-pre-v5-index.md`](../dev/workflow/family-pre-v5-index.md). Short public summary: [`docs/roadmap/pre-v5-family-notes.md`](roadmap/pre-v5-family-notes.md).  
- Root [`README.md`](../README.md).
