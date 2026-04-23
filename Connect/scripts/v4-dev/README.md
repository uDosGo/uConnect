# v4 `~/Code/` dev scripts

Small helpers for the **sibling-repo** layout opened by **uDosGo** [`uDosGo.code-workspace`](https://github.com/fredporter/uDosGo/blob/main/uDosGo.code-workspace) or [`workspaces/`](https://github.com/fredporter/uDosGo/tree/main/workspaces) focused variants (clone as `~/Code/uDosGo`).

| Script | Purpose |
| --- | --- |
| [`update-all-repos.sh`](update-all-repos.sh) | `git pull --ff-only` for each known repo when present |
| [`check-tasks-md.sh`](check-tasks-md.sh) | Fail if `TASKS.md` is missing in required repos, plus **`uDos/dev/TASKS.md`** (canonical monorepo backlog) |

Override clone root: `UDOS_CODE_ROOT=/path/to/Code`.
