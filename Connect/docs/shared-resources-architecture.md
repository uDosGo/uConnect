# Shared resources architecture (family)

**Git checkouts:** **[`family-workspace-layout.md`](family-workspace-layout.md)** — optional coding root and paths (this file covers **`~/.udos`** only).

## Goal

Keep each repo independently runnable while enabling one shared resource lane to avoid duplicate Python environments and repeated dependency installs.

## Runtime modes

- **Standalone mode** (`UDOS_USE_SHARED_RESOURCES=0`)
  - Repo scripts use local `.venv` or host `python3`.
  - Works when a repo is cloned and used outside the family workspace.
- **Family shared mode** (`UDOS_USE_SHARED_RESOURCES=1`, default)
  - Repo scripts auto-detect family helper at `scripts/lib/family-python.sh` (from this repo’s **`scripts/`** root, or `../scripts/lib/family-python.sh` when run from a nested package).
  - Shared interpreter is provisioned at `~/.udos/envs/family-py311`.
  - Check scripts install each repo package into the shared interpreter as needed.

## Shared resource locations

- Python env root: `~/.udos/envs/family-py311`
- Shared Python binary: `~/.udos/envs/family-py311/bin/python`
- Managed base paths: `~/.udos/{bin,envs,tools,cache,state,logs,tmp,vault,publish,memory,library,sync}`
- Workspace pointer file: `<repo-root>/.udos-family-python` (gitignored; see `.udos-family-python.example`)

## Runtime path baseline

Use `~/.udos/` for runtime-owned material and keep repos clean.

- `~/.udos/envs/` for shared and product-specific environments
- `~/.udos/tools/` and `~/.udos/bin/` for installed tooling and launchers
- `~/.udos/state/` for long-lived runtime and service state
- `~/.udos/logs/` for service and installer logs
- `~/.udos/cache/` and `~/.udos/tmp/` for disposable runtime material
- `~/.udos/vault/` for local vault content and static-hosted vault views
- `~/.udos/publish/` for generated publish output and staging
- `~/.udos/memory/` for memory, session, and reasoning artifacts
- `~/.udos/library/` for downloaded libraries, mirrored sources, and media packs
- `~/.udos/sync/` for replication state, outgoing queues, and peer snapshots

The **uDos** repository root remains the **source checkout**, not the runtime data root.

## Canonical root scripts (this repo)

- `scripts/lib/udos-paths.sh` — canonical managed-root list; resolves paths under `~/.udos/`
- `scripts/lib/udos-registry.sh` — family registry locations for themes, plugins, and commands
- `scripts/bootstrap-family-python.sh` — prepares managed dirs; creates shared Python env
- `scripts/run-family-checks.sh` — multi-repo checks through shared Python
- `scripts/audit-family-env-overlap.sh` — scans for `.venv` overlap and drift

## Adoption contract for repo scripts

Repo scripts should:

1. Read `UDOS_SHARED_PYTHON_BIN` if already exported.
2. If missing and in family workspace, source `../scripts/lib/family-python.sh` and call `ensure_shared_python`.
3. Use shared Python when available.
4. Fall back to local `.venv`/host Python for standalone usage.
5. Source `scripts/lib/udos-paths.sh` when they need managed runtime paths.
6. Use `scripts/lib/udos-registry.sh` when they need a shared family registry path.

## v2 reference trees (partial archive)

Shared-mode-aware check scripts still exist under **`v2-reference/<module>/`** for historical modules when that tree is present locally.

Other illustrative paths (when present):

- `v2-reference/uDOS-core/scripts/...`
- `v2-reference/uDOS-thinui/scripts/...`
- `v2-reference/uDOS-host/scripts/...`

For **current** work, use **this repository’s** `scripts/` at the repo root and under packages (`core/`, `tools/`, …).

## Recommended workflow

1. `./scripts/bootstrap-family-python.sh`
2. `./scripts/audit-family-env-overlap.sh`
3. `./scripts/run-family-checks.sh`

For strict standalone verification:

`UDOS_USE_SHARED_RESOURCES=0 <repo-script>`
