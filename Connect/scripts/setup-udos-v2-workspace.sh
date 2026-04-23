#!/usr/bin/env bash
set -eu

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOCAL_ROOT_TOKEN="<local-project-root>"

write_file() {
  local relpath="$1"
  mkdir -p "$(dirname "$ROOT_DIR/$relpath")"
  cat >"$ROOT_DIR/$relpath"
}

ensure_gitignore() {
  local repo="$1"
  local target="$ROOT_DIR/$repo/.gitignore"
  if [ -f "$target" ]; then
    return
  fi
  write_file "$repo/.gitignore" <<'EOF'
.DS_Store
.compost/
.pytest_cache/
__pycache__/
*.pyc
.venv/
venv/
node_modules/
dist/
build/
.coverage
coverage/
.idea/
.vscode/
DerivedData/
.gradle/
EOF
}

init_git_repo() {
  local repo="$1"
  if [ -d "$ROOT_DIR/$repo/.git" ]; then
    return
  fi
  git -C "$ROOT_DIR/$repo" init -b main >/dev/null
}

write_root_files() {
  write_file "README.md" <<'EOF'
# uDOS Family Workspace

This directory is the local project root for the `uDOS-family` collection.

The workspace is now organized for a Cursor-first handover and completion pass.
Use the numbered focused `.code-workspace` files to progress linearly through
the family.

## Local Root Policy

- Treat this directory as the local working base for public and private repos.
- Do not hardcode the machine-local root path in docs or scripts.
- Use `<local-project-root>` as the documentation placeholder when a root path must be shown.
- Keep managed environments outside repo trees under `~/.udos/`.

## `.compost` Policy

Use a single local-only archive at `.compost/` for superseded local workspace
material.

- `.compost/<date>/backups/<scope>/` for optional snapshots and manifests
- `.compost/<date>/trash/<timestamp>/<scope>/` for temporary files, caches, and
  cleanup spillover
- `.compost/<date>/archive/<timestamp>/<scope>/` for outdated dupes, retired
  local workspaces, and migrated local roots

Use root `.compost/` for workspace-wide cleanup. Keep git-tracked historical
docs inside repo-local `docs/.compost/` only when history belongs with the
repository.

## Core uDOS Working Set

- `uDOS-core`
- `uDOS-shell`
- `uDOS-plugin-index`
- `uDOS-wizard`
- `uDOS-gameplay`
- `uDOS-groovebox`
- `uDOS-grid`
- `uDOS-empire`
- `uDOS-dev`
- `uDOS-themes`
- `uDOS-thinui`
- `uDOS-workspace`
- `uDOS-docs`
- `uDOS-alpine`
- `uDOS-host`

## Adjacent Family Roots

- Sonic family: `/Users/fredbook/Code/sonic-family`
  - `sonic-screwdriver`
  - `sonic-ventoy`
- uHOME family: `/Users/fredbook/Code/uHOME-family`
  - `uHOME-server`
  - `uHOME-client`
  - `uHOME-matter`
  - `uHOME-app-android`
  - `uHOME-app-ios`

## Cursor Handover

- Primary handover plan: `CURSOR_HANDOVER_PLAN.md`
- Detailed focused-workspace spec: `uDOS-dev/docs/cursor-focused-workspaces.md`
- Cursor should open one numbered focused workspace at a time
- Legacy broad workspaces remain available for orientation only

## Focused Workspace Files

- `cursor-01-runtime-spine.code-workspace`
- `cursor-02-foundation-distribution.code-workspace`
- `cursor-03-uhome-stream.code-workspace`
- `cursor-04-groovebox-product.code-workspace`
- `cursor-05-gui-system.code-workspace`
- `cursor-06-themes-display-modes.code-workspace`
- `cursor-07-docs-wiki-courses.code-workspace`
- `cursor-08-family-convergence.code-workspace`

## Overview Workspace Files

- `uDOS-v2-public.code-workspace`

## Managed Paths

- `~/.udos/bin/`
- `~/.udos/envs/`
- `~/.udos/tools/`
- `~/.udos/cache/`
- `~/.udos/state/`
- `~/.udos/logs/`
- `~/.udos/tmp/`
- `~/.udos/vault/`
- `~/.udos/publish/`
- `~/.udos/memory/`
- `~/.udos/library/`
- `~/.udos/sync/`

## Runtime Direction

- `uDOS-host` is the target always-on runtime host
- `uDOS-wizard` should contract back to orchestration, setup, and autonomy controls
- `sonic-screwdriver` is the adjacent installer and standalone entry lane under `/Users/fredbook/Code/sonic-family`
- runtime state belongs under `~/.udos/`, not inside repo trees

## Local Maintenance

- `scripts/setup-udos-v2-workspace.sh`
- `scripts/bootstrap-managed-envs.sh`
- `scripts/bootstrap-family-python.sh`
- `scripts/run-family-checks.sh`
- `scripts/run-family-release-gates.sh`
- `scripts/run-family-ready.sh`
- `scripts/clean-family-local-runtime.sh`
- `scripts/run-udos-runtime-health.sh`
- `scripts/audit-family-env-overlap.sh`
- `scripts/compost-v2-workspace-debris.sh`
EOF

  write_file "START_HERE.md" <<'EOF'
# uDOS v2 Start Here

Use this directory as the private local root for the uDOS family workspace.

Adjacent family roots now live beside it:

- `/Users/fredbook/Code/sonic-family`
- `/Users/fredbook/Code/uHOME-family`

Cursor is now the primary IDE.

## Read First

1. Read `CURSOR_HANDOVER_PLAN.md`.
2. Read `uDOS-dev/docs/cursor-focused-workspaces.md`.
3. Open the next numbered `cursor-*.code-workspace` in Cursor.

## First Steps

1. Run `scripts/bootstrap-family-python.sh` to prepare managed paths and the shared Python environment.
2. Run `scripts/run-family-checks.sh` to validate the core uDOS repos plus any present adjacent-family lanes through one shared interpreter.
3. Run `scripts/audit-family-env-overlap.sh` to detect repo-local venv overlap and drift.
4. Run `scripts/run-udos-runtime-health.sh` to inspect `~/.udos/` storage, cleanup candidates, and workspace debris.
5. Open `cursor-01-runtime-spine.code-workspace` in Cursor and complete that lane before moving on.
6. Use `uDOS-v2-public.code-workspace` only as an optional broad family overview workspace.
7. Run `scripts/setup-udos-v2-workspace.sh` again whenever you want to re-apply the baseline scaffold.
8. Run `scripts/compost-v2-workspace-debris.sh` whenever you want to move old local debris into `.compost/` instead of deleting it.

## Focused Cursor Workspaces

1. `cursor-01-runtime-spine.code-workspace`
2. `cursor-02-foundation-distribution.code-workspace`
3. `cursor-03-uhome-stream.code-workspace`
4. `cursor-04-groovebox-product.code-workspace`
5. `cursor-05-gui-system.code-workspace`
6. `cursor-06-themes-display-modes.code-workspace`
7. `cursor-07-docs-wiki-courses.code-workspace`
8. `cursor-08-family-convergence.code-workspace`

## Path Rule

Docs and scripts should refer to the local root as `<local-project-root>` rather than a machine-specific absolute path.

## `.compost` Rule

Use the local root `.compost/` as the dated `backups / trash / archive`
location for temp files, retired local workspaces, and other non-canonical
workspace debris.
EOF

  write_file ".compost/README.md" <<'EOF'
# `.compost`

Local-only archive for the private uDOS v2 workspace root.

## Purpose

- retain superseded local workspace material without hard deletion
- hold cleanup spillover from temp files and caches
- archive outdated local workspaces and duplicate setup artifacts

## Structure

- `.compost/<date>/backups/<scope>/`
- `.compost/<date>/trash/<timestamp>/<scope>/`
- `.compost/<date>/archive/<timestamp>/<scope>/`

## Rules

- keep `.compost/` out of git and release artifacts
- use root `.compost/` for workspace-wide local cleanup
- use repo-local `docs/.compost/` only for git-tracked historical docs
- prefer move-first cleanup over deletion
EOF

  write_file ".compost/INDEX.md" <<'EOF'
# `.compost` Index

Use this index to describe dated cleanup tranches when you move material into
the local root compost archive.

## Tranches

- add a short note for each dated cleanup under the matching date folder
- keep manifests or move logs beside the archived material where practical
EOF

  write_file "PRIVATE_PRODUCT_BOUNDARY.md" <<'EOF'
# OMD Private Product Boundary

## Position

The OMD app family is commercially independent.

It can:
- work with uDOS contracts
- work with uHOME contracts
- operate standalone where appropriate

It should not:
- redefine public uDOS runtime semantics
- become the source of truth for the public family architecture
- be embedded into public repo trees

## Integration Stance

OMD apps may consume:
- uDOS command and runtime contracts
- uHOME service contracts
- optional Wizard networking and provider surfaces

The public family must not depend on OMD existence.
EOF

  write_file "uDOS-v2-public.code-workspace" <<'EOF'
{
  "folders": [
    { "path": "uDOS-core" },
    { "path": "uDOS-shell" },
    { "path": "../sonic-family/sonic-screwdriver" },
    { "path": "uDOS-plugin-index" },
    { "path": "uDOS-wizard" },
    { "path": "uDOS-gameplay" },
    { "path": "uDOS-groovebox" },
    { "path": "uDOS-grid" },
    { "path": "uDOS-empire" },
    { "path": "../uHOME-family/uHOME-matter" },
    { "path": "../uHOME-family/uHOME-app-android" },
    { "path": "../uHOME-family/uHOME-app-ios" },
    { "path": "uDOS-dev" },
    { "path": "uDOS-themes" },
    { "path": "uDOS-thinui" },
    { "path": "uDOS-docs" },
    { "path": "uDOS-alpine" },
    { "path": "uDOS-host" },
    { "path": "../sonic-family/sonic-ventoy" },
    { "path": "../uHOME-family/uHOME-client" },
    { "path": "../uHOME-family/uHOME-server" },
    { "path": "uDOS-workspace" }
  ],
  "settings": {
    "files.exclude": {
      ".compost": true,
      ".claude": true,
      ".tmp-render-test": true,
      "**/.DS_Store": true,
      "**/.venv": true,
      "**/__pycache__": true,
      "**/.pytest_cache": true,
      "**/node_modules": true
    },
    "editor.formatOnSave": true
  }
}
EOF

  write_file "cursor-01-runtime-spine.code-workspace" <<'EOF'
{
  "folders": [
    { "path": "uDOS-core" },
    { "path": "uDOS-host" },
    { "path": "../uHOME-family/uHOME-server" },
    { "path": "uDOS-wizard" },
    { "path": "uDOS-grid" },
    { "path": "uDOS-dev" },
    { "path": "uDOS-docs" }
  ],
  "settings": {
    "files.exclude": {
      ".compost": true,
      ".claude": true,
      ".tmp-render-test": true,
      "**/.DS_Store": true,
      "**/.venv": true,
      "**/__pycache__": true,
      "**/.pytest_cache": true,
      "**/node_modules": true,
      "**/dist": true,
      "**/build": true
    },
    "editor.formatOnSave": true
  }
}
EOF

  write_file "cursor-02-foundation-distribution.code-workspace" <<'EOF'
{
  "folders": [
    { "path": "../sonic-family/sonic-screwdriver" },
    { "path": "uDOS-host" },
    { "path": "../sonic-family/sonic-ventoy" },
    { "path": "uDOS-alpine" },
    { "path": "uDOS-plugin-index" },
    { "path": "uDOS-core" },
    { "path": "uDOS-dev" },
    { "path": "uDOS-docs" }
  ],
  "settings": {
    "files.exclude": {
      ".compost": true,
      ".claude": true,
      ".tmp-render-test": true,
      "**/.DS_Store": true,
      "**/.venv": true,
      "**/__pycache__": true,
      "**/.pytest_cache": true,
      "**/node_modules": true,
      "**/dist": true,
      "**/build": true
    },
    "editor.formatOnSave": true
  }
}
EOF

  write_file "cursor-03-uhome-stream.code-workspace" <<'EOF'
{
  "folders": [
    { "path": "../uHOME-family/uHOME-server" },
    { "path": "../uHOME-family/uHOME-client" },
    { "path": "../uHOME-family/uHOME-matter" },
    { "path": "../uHOME-family/uHOME-app-android" },
    { "path": "../uHOME-family/uHOME-app-ios" },
    { "path": "uDOS-empire" },
    { "path": "uDOS-dev" },
    { "path": "uDOS-docs" }
  ],
  "settings": {
    "files.exclude": {
      ".compost": true,
      ".claude": true,
      ".tmp-render-test": true,
      "**/.DS_Store": true,
      "**/.venv": true,
      "**/__pycache__": true,
      "**/.pytest_cache": true,
      "**/node_modules": true,
      "**/dist": true,
      "**/build": true,
      "**/DerivedData": true,
      "**/.gradle": true
    },
    "editor.formatOnSave": true
  }
}
EOF

  write_file "cursor-04-groovebox-product.code-workspace" <<'EOF'
{
  "folders": [
    { "path": "uDOS-groovebox" },
    { "path": "uDOS-core" },
    { "path": "uDOS-host" },
    { "path": "uDOS-dev" },
    { "path": "uDOS-docs" }
  ],
  "settings": {
    "files.exclude": {
      ".compost": true,
      ".claude": true,
      ".tmp-render-test": true,
      "**/.DS_Store": true,
      "**/.venv": true,
      "**/__pycache__": true,
      "**/.pytest_cache": true,
      "**/node_modules": true,
      "**/dist": true,
      "**/build": true
    },
    "editor.formatOnSave": true
  }
}
EOF

  write_file "cursor-05-gui-system.code-workspace" <<'EOF'
{
  "folders": [
    { "path": "uDOS-thinui" },
    { "path": "uDOS-workspace" },
    { "path": "uDOS-themes" },
    { "path": "uDOS-wizard" },
    { "path": "uDOS-core" },
    { "path": "uDOS-dev" },
    { "path": "uDOS-docs" }
  ],
  "settings": {
    "files.exclude": {
      ".compost": true,
      ".claude": true,
      ".tmp-render-test": true,
      "**/.DS_Store": true,
      "**/.venv": true,
      "**/__pycache__": true,
      "**/.pytest_cache": true,
      "**/node_modules": true,
      "**/dist": true,
      "**/build": true,
      "**/.svelte-kit": true
    },
    "editor.formatOnSave": true
  }
}
EOF

  write_file "cursor-06-themes-display-modes.code-workspace" <<'EOF'
{
  "folders": [
    { "path": "uDOS-themes" },
    { "path": "uDOS-thinui" },
    { "path": "uDOS-workspace" },
    { "path": "uDOS-shell" },
    { "path": "uDOS-docs" },
    { "path": "uDOS-dev" }
  ],
  "settings": {
    "files.exclude": {
      ".compost": true,
      ".claude": true,
      ".tmp-render-test": true,
      "**/.DS_Store": true,
      "**/.venv": true,
      "**/__pycache__": true,
      "**/.pytest_cache": true,
      "**/node_modules": true,
      "**/dist": true,
      "**/build": true,
      "**/.svelte-kit": true
    },
    "editor.formatOnSave": true
  }
}
EOF

  write_file "cursor-07-docs-wiki-courses.code-workspace" <<'EOF'
{
  "folders": [
    { "path": "uDOS-docs" },
    { "path": "uDOS-dev" },
    { "path": "sonic-screwdriver" },
    { "path": "uDOS-host" },
    { "path": "uDOS-workspace" }
  ],
  "settings": {
    "files.exclude": {
      ".compost": true,
      ".claude": true,
      ".tmp-render-test": true,
      "**/.DS_Store": true,
      "**/.venv": true,
      "**/__pycache__": true,
      "**/.pytest_cache": true,
      "**/node_modules": true,
      "**/dist": true,
      "**/build": true,
      "**/.svelte-kit": true
    },
    "editor.formatOnSave": true
  }
}
EOF

  write_file "cursor-08-family-convergence.code-workspace" <<'EOF'
{
  "folders": [
    { "path": "uDOS-dev" },
    { "path": "uDOS-core" },
    { "path": "uDOS-docs" },
    { "path": "sonic-screwdriver" },
    { "path": "uDOS-host" },
    { "path": "uDOS-wizard" },
    { "path": "uDOS-workspace" },
    { "path": "uDOS-plugin-index" }
  ],
  "settings": {
    "files.exclude": {
      ".compost": true,
      ".claude": true,
      ".tmp-render-test": true,
      "**/.DS_Store": true,
      "**/.venv": true,
      "**/__pycache__": true,
      "**/.pytest_cache": true,
      "**/node_modules": true,
      "**/dist": true,
      "**/build": true,
      "**/.svelte-kit": true
    },
    "editor.formatOnSave": true
  }
}
EOF
}

write_public_repos() {
  write_file "uDOS-core/README.md" <<'EOF'
# uDOS-core

## Purpose

Deterministic runtime contracts and execution semantics for the uDOS v2 family.

## Ownership

- uCODE command contracts
- action and workflow semantics
- binder and compile surfaces
- vault and memory contracts
- plugin capability contracts
- offline-first local execution rules

## Non-Goals

- provider or API ownership
- network transport or MCP bridging
- Wizard budgeting or autonomy policy
- repo-local runtime sprawl

## Spine

- `contracts/`
- `schemas/`
- `runtime/`
- `binder/`
- `compile/`
- `vault/`
- `plugins/`
- `tests/`
- `docs/`
- `config/`

## Local Development

Run work from the repo root and keep toolchains under `~/.udos/`.

## Family Relation

Core defines canonical semantics that Shell, Wizard, Sonic, and uHOME consume.
EOF

  write_file "uDOS-core/docs/architecture.md" <<'EOF'
# uDOS-core Architecture

uDOS-core is the semantic center of the public family.

## Main Areas

- `contracts/` defines public runtime contracts.
- `schemas/` holds stable machine-readable formats.
- `runtime/` contains deterministic execution rules.
- `binder/`, `compile/`, `vault/`, and `plugins/` separate major responsibilities.

## Design Rule

Core stays offline-first and deterministic. Network-facing features belong elsewhere.
EOF

  write_file "uDOS-core/docs/boundary.md" <<'EOF'
# uDOS-core Boundary

## Owns

- canonical parsing and action framing
- workflow and binder semantics
- compile and packaging semantics
- local-first fallback behavior

## Does Not Own

- provider clients
- API gateways
- MCP transport
- budgeting and autonomy policies
EOF

  write_file "uDOS-core/docs/getting-started.md" <<'EOF'
# uDOS-core Getting Started

1. Review `README.md` and `docs/boundary.md`.
2. Inspect `contracts/` and `schemas/` before changing runtime behavior.
3. Add tests in `tests/` for any contract or semantic change.
4. Keep machine-specific environments outside the repo tree.
EOF

  write_file "uDOS-core/docs/examples.md" <<'EOF'
# uDOS-core Examples

Use this repo for examples of:

- command parsing and normalization
- deterministic action framing
- binder compilation
- capability contract validation
EOF

  write_file "uDOS-shell/README.md" <<'EOF'
# uDOS-shell

## Purpose

Public interactive shell and operator-facing UI patterns for uDOS v2.

## Ownership

- uCODE interactive shell
- command palette
- workspace panels
- ThinGUI and browser handoff
- reusable shell interaction patterns

## Non-Goals

- canonical runtime semantics
- provider and network ownership
- API budgeting and autonomy policy

## Spine

- `src/ucode/`
- `src/palette/`
- `src/panels/`
- `src/thingui/`
- `src/tui/`
- `docs/`
- `tests/`
- `scripts/`
- `config/`
- `examples/`

## Local Development

Keep package installs explicit and avoid embedding runtime caches into the repo.

## Family Relation

Shell presents Core semantics to operators and hands network-backed work to Wizard.
EOF

  write_file "uDOS-shell/docs/architecture.md" <<'EOF'
# uDOS-shell Architecture

uDOS-shell provides the public interaction layer for uDOS v2.

## Main Areas

- `src/ucode/` holds command-surface integrations.
- `src/palette/` and `src/panels/` hold operator workflow surfaces.
- `src/thingui/` and `src/tui/` support alternate presentation layers.

## Design Rule

Shell should converge on Core contracts rather than invent parallel semantics.
EOF

  write_file "uDOS-shell/docs/boundary.md" <<'EOF'
# uDOS-shell Boundary

## Owns

- operator interaction patterns
- shell entry points
- command palette behavior
- panel and handoff UX

## Does Not Own

- canonical execution rules
- network provider bridges
- MCP transport policy
- persistent home-server services
EOF

  write_file "uDOS-shell/docs/getting-started.md" <<'EOF'
# uDOS-shell Getting Started

1. Review `README.md` and `docs/boundary.md`.
2. Start with `src/ucode/` for command handling.
3. Add UI-facing tests under `tests/`.
4. Keep examples in `examples/` small and teachable.
EOF

  write_file "uDOS-shell/docs/examples.md" <<'EOF'
# uDOS-shell Examples

Typical examples here should show:

- command palette flows
- panel state handoff
- TUI interaction loops
- browser handoff patterns
EOF

  write_file "uDOS-plugin-index/README.md" <<'EOF'
# uDOS-plugin-index

## Purpose

Public index for plugin manifests, package metadata, and capability declarations.

## Ownership

- plugin manifests
- adapter metadata
- capability contracts
- distribution compatibility notes

## Non-Goals

- runtime execution ownership
- provider bridge implementation
- package installation tooling

## Spine

- `contracts/`
- `schemas/`
- `docs/`
- `tests/`
- `scripts/`
- `config/`

## Local Development

Keep manifests source-first and easy to audit.

## Family Relation

This repo describes what can plug into the family; it does not execute those plugins.
EOF

  write_file "uDOS-plugin-index/docs/architecture.md" <<'EOF'
# uDOS-plugin-index Architecture

The plugin index is a registry surface, not a runtime.

## Main Areas

- `contracts/` captures public manifest expectations.
- `schemas/` holds machine-readable validation rules.
- `docs/` explains packaging, installation, and compatibility.
EOF

  write_file "uDOS-plugin-index/docs/boundary.md" <<'EOF'
# uDOS-plugin-index Boundary

## Owns

- plugin metadata definitions
- adapter and package manifest format
- compatibility and capability descriptors

## Does Not Own

- plugin runtime loading
- provider implementations
- package download execution
EOF

  write_file "uDOS-plugin-index/docs/getting-started.md" <<'EOF'
# uDOS-plugin-index Getting Started

1. Start with the manifest contracts in `contracts/`.
2. Align validation in `schemas/`.
3. Add examples only when they teach a stable contract.
4. Keep tests focused on schema and manifest integrity.
EOF

  write_file "uDOS-plugin-index/docs/examples.md" <<'EOF'
# uDOS-plugin-index Examples

Example content should cover:

- a minimal plugin manifest
- adapter metadata
- capability declaration samples
- container compatibility notes
EOF

  write_file "uDOS-wizard/README.md" <<'EOF'
# uDOS-wizard

## Purpose

Network-facing assist, provider, MCP, and bounded autonomy services for uDOS v2.

## Ownership

- API and transport services
- provider bridges
- MCP bridge
- budgeting and autonomy policy
- assist and generative workflows
- Beacon control-plane services

## Non-Goals

- canonical runtime semantics
- interactive shell ownership
- persistent home service ownership

## Spine

- `services/api/`
- `services/runtime/assist/`
- `services/runtime/budgeting/`
- `services/runtime/providers/`
- `services/runtime/beacon/`
- `mcp/`
- `docs/`
- `tests/`
- `scripts/`
- `config/`

## Local Development

Treat external providers as adapters behind stable public contracts.

## Family Relation

Wizard enriches and transports work but should converge on Core semantics.
EOF

  write_file "uDOS-wizard/docs/architecture.md" <<'EOF'
# uDOS-wizard Architecture

uDOS-wizard is the network and assistance layer for the public family.

## Main Areas

- `services/api/` exposes network entry points.
- `services/runtime/assist/` coordinates help and generative tasks.
- `services/runtime/budgeting/` tracks bounded autonomy policy.
- `services/runtime/providers/` isolates third-party bridges.
- `services/runtime/beacon/` holds control-plane surfaces.
- `mcp/` contains Model Context Protocol bridge work.
EOF

  write_file "uDOS-wizard/docs/boundary.md" <<'EOF'
# uDOS-wizard Boundary

## Owns

- provider and API transport
- assist routing
- MCP bridging
- budgeting and autonomy controls
- Beacon access services

## Does Not Own

- canonical parsing rules
- shell UI ownership
- always-on home runtime services
EOF

  write_file "uDOS-wizard/docs/getting-started.md" <<'EOF'
# uDOS-wizard Getting Started

1. Read `docs/boundary.md` before adding provider integrations.
2. Keep network adapters under `services/runtime/providers/`.
3. Route budget policy through `services/runtime/budgeting/`.
4. Add tests for every public adapter contract.
EOF

  write_file "uDOS-wizard/docs/examples.md" <<'EOF'
# uDOS-wizard Examples

Useful examples include:

- provider adapter skeletons
- MCP bridge request flow
- budget enforcement scenarios
- Beacon control-plane handoff
EOF

  write_file "uDOS-gameplay/README.md" <<'EOF'
# uDOS-gameplay

## Purpose

Gameplay and interactive simulation patterns built on canonical uDOS state.

## Ownership

- gameplay-facing modules
- interaction experiments
- educational samples around spatial or stateful flows

## Non-Goals

- canonical runtime ownership
- networking ownership
- general-purpose shell ownership

## Spine

- `src/`
- `docs/`
- `tests/`
- `scripts/`
- `config/`
- `examples/`

## Local Development

Keep experiments modular and grounded in stable public contracts.

## Family Relation

Gameplay should consume family contracts without redefining them.
EOF

  write_file "uDOS-gameplay/docs/architecture.md" <<'EOF'
# uDOS-gameplay Architecture

This repo is a modular sandbox for gameplay patterns on top of public uDOS semantics.

## Main Areas

- `src/` holds gameplay modules.
- `examples/` provides teachable interaction samples.
- `tests/` protects public behavior.
EOF

  write_file "uDOS-gameplay/docs/boundary.md" <<'EOF'
# uDOS-gameplay Boundary

## Owns

- gameplay-focused modules
- simulation examples
- public teaching artifacts for gameplay patterns

## Does Not Own

- runtime semantics
- home-server scheduling
- provider bridges
EOF

  write_file "uDOS-gameplay/docs/getting-started.md" <<'EOF'
# uDOS-gameplay Getting Started

1. Review `README.md` for ownership boundaries.
2. Start with a small example in `examples/`.
3. Keep modules in `src/` composable and testable.
4. Add tests for any shared mechanic or contract.
EOF

  write_file "uDOS-gameplay/docs/examples.md" <<'EOF'
# uDOS-gameplay Examples

Candidate examples:

- deterministic state transitions
- gameplay input routing
- simulation checkpointing
- shell-to-gameplay handoff
EOF

  write_file "uDOS-empire/README.md" <<'EOF'
# uDOS-empire

## Purpose

Optional public business, CRM, and publishing patterns repo for the uDOS family.

## Ownership

- public business workflow patterns
- CRM and publishing examples
- teachable operational modules

## Non-Goals

- private OMD product logic
- core runtime ownership
- provider control-plane ownership

## Spine

- `src/`
- `docs/`
- `tests/`
- `scripts/`
- `config/`
- `examples/`

## Local Development

Keep public patterns modular and reusable without coupling to private apps.

## Family Relation

Empire can reference public contracts but must remain separate from OMD-specific implementation.
EOF

  write_file "uDOS-empire/docs/architecture.md" <<'EOF'
# uDOS-empire Architecture

uDOS-empire provides optional public-facing operational patterns.

## Main Areas

- `src/` holds reusable modules.
- `examples/` demonstrates teachable workflows.
- `docs/` explains public boundaries and usage.
EOF

  write_file "uDOS-empire/docs/boundary.md" <<'EOF'
# uDOS-empire Boundary

## Owns

- public workflow modules
- public CRM and publishing examples
- contributor-facing teaching material

## Does Not Own

- OMD product internals
- canonical runtime semantics
- provider transport infrastructure
EOF

  write_file "uDOS-empire/docs/getting-started.md" <<'EOF'
# uDOS-empire Getting Started

1. Read `docs/boundary.md`.
2. Keep new modules public and source-first.
3. Put runnable demonstrations in `examples/`.
4. Add regression tests for any workflow contract.
EOF

  write_file "uDOS-empire/docs/examples.md" <<'EOF'
# uDOS-empire Examples

Useful examples:

- public CRM workflow modules
- publishing pipeline samples
- cross-repo contract consumption
- contributor onboarding walkthroughs
EOF

  write_file "uDOS-dev/README.md" <<'EOF'
# uDOS-dev

## Purpose

Shared public development culture, contributor intake, education, and maintenance workflows for the repo family.

## Ownership

- `@dev/` intake and pathway structure
- automation support
- courses and contributor learning
- shared maintenance notes and scripts

## Non-Goals

- canonical runtime ownership
- provider transport ownership
- private product ownership

## Spine

- `@dev/requests/`
- `@dev/submissions/`
- `@dev/pathways/`
- `@dev/notes/`
- `automation/`
- `courses/`
- `docs/`
- `scripts/`

## Local Development

Use this repo to coordinate work across the family without turning it into a monolith.

## Family Relation

uDOS-dev defines development practice, not runtime semantics.
EOF

  write_file "uDOS-dev/docs/architecture.md" <<'EOF'
# uDOS-dev Architecture

uDOS-dev is the shared development and education workspace for the public family.

## Main Areas

- `@dev/` is the intake and collaboration surface.
- `automation/` holds repeatable workflow support.
- `courses/` and `docs/` teach maintainers and contributors.
EOF

  write_file "uDOS-dev/docs/boundary.md" <<'EOF'
# uDOS-dev Boundary

## Owns

- contributor intake structure
- learning pathways
- maintenance workflows
- public development notes

## Does Not Own

- core runtime semantics
- shell UI behavior
- network provider bridges
EOF

  write_file "uDOS-dev/docs/getting-started.md" <<'EOF'
# uDOS-dev Getting Started

1. Sort new work into `@dev/requests/`, `@dev/submissions/`, `@dev/pathways/`, or `@dev/notes/`.
2. Document contributor flows in `docs/`.
3. Keep automation helpers in `automation/` and `scripts/`.
4. Treat education and maintenance as first-class outputs.
EOF

  write_file "uDOS-dev/docs/examples.md" <<'EOF'
# uDOS-dev Examples

Examples here should show:

- contributor intake flow
- roadmap note structure
- course scaffolding
- maintenance checklist templates
EOF

  write_file "uDOS-themes/README.md" <<'EOF'
# uDOS-themes

## Purpose

Public theme packs, token sets, and shell-facing visual assets for the uDOS family.

## Ownership

- themes and skins
- design tokens
- reusable shell presentation assets
- teachable styling examples

## Non-Goals

- runtime semantics
- provider transport
- private product branding ownership

## Spine

- `src/`
- `docs/`
- `tests/`
- `scripts/`
- `config/`
- `examples/`

## Local Development

Keep themes modular and portable across public repos.

## Family Relation

Themes provide presentation layers on top of Shell and related public surfaces.
EOF

  write_file "uDOS-themes/docs/architecture.md" <<'EOF'
# uDOS-themes Architecture

uDOS-themes holds presentation assets and theme contracts for the public family.

## Main Areas

- `src/` stores theme sources and token sets.
- `examples/` shows application patterns.
- `tests/` protects token integrity and packaging assumptions.
EOF

  write_file "uDOS-themes/docs/boundary.md" <<'EOF'
# uDOS-themes Boundary

## Owns

- public themes
- visual tokens
- reusable asset packs

## Does Not Own

- shell interaction behavior
- runtime contracts
- private product visual identity
EOF

  write_file "uDOS-themes/docs/getting-started.md" <<'EOF'
# uDOS-themes Getting Started

1. Define tokens or assets in `src/`.
2. Document usage patterns in `docs/`.
3. Add examples that show cross-repo reuse.
4. Keep branding boundaries explicit.
EOF

  write_file "uDOS-themes/docs/examples.md" <<'EOF'
# uDOS-themes Examples

Examples should include:

- shell theme packs
- token application samples
- asset naming conventions
- packaging-ready theme layouts
EOF

  write_file "uDOS-docs/README.md" <<'EOF'
# uDOS-docs

## Purpose

Canonical public documentation repo for the uDOS v2 and uHOME family.

## Ownership

- family-level architecture docs
- onboarding and learning paths
- public reference and explanatory material

## Non-Goals

- canonical runtime code ownership
- provider bridge implementation
- private OMD product documentation

## Spine

- `docs/`
- `architecture/`
- `wizard/`
- `alpine/`
- `uhome/`
- `tests/`
- `scripts/`
- `config/`

## Local Development

Prefer plain-language, source-first documentation that teaches the system.

## Family Relation

This repo explains the family but should not become the owner of implementation details that belong elsewhere.
EOF

  write_file "uDOS-docs/docs/architecture.md" <<'EOF'
# uDOS-docs Architecture

uDOS-docs is the family documentation surface.

## Main Areas

- `docs/` holds repo-level entry points.
- `architecture/`, `wizard/`, `alpine/`, and `uhome/` organize family topics.
- `tests/` can validate documentation conventions or generated outputs.
EOF

  write_file "uDOS-docs/docs/boundary.md" <<'EOF'
# uDOS-docs Boundary

## Owns

- explanatory docs
- onboarding material
- public reference maps

## Does Not Own

- implementation semantics that belong to code repos
- private product documentation
- provider runtime logic
EOF

  write_file "uDOS-docs/docs/getting-started.md" <<'EOF'
# uDOS-docs Getting Started

1. Start with repo READMEs and boundary docs across the family.
2. Keep naming aligned with code and public contracts.
3. Add examples only when they clarify a stable concept.
4. Use plain language before internal shorthand.
EOF

  write_file "uDOS-docs/docs/examples.md" <<'EOF'
# uDOS-docs Examples

Useful documentation examples:

- repo architecture maps
- boundary tables
- quickstart flows
- public family walkthroughs
EOF

  write_file "uDOS-alpine/README.md" <<'EOF'
# uDOS-alpine

## Purpose

Lean Alpine Linux deployment profile and packaging surface for uDOS v2.

## Ownership

- APK packaging
- lean deployment profiles
- diskless and live boot flows
- remaster and image support

## Non-Goals

- canonical runtime semantics
- provider bridge ownership
- general-purpose host support for every platform

## Spine

- `apkbuild/`
- `distribution/`
- `openrc/`
- `profiles/`
- `docs/`
- `scripts/`

## Local Development

Keep deployment profiles explicit, minimal, and packaging-aware.

## Family Relation

Alpine packages and deploys family components without becoming their semantic owner.
EOF

  write_file "uDOS-alpine/docs/architecture.md" <<'EOF'
# uDOS-alpine Architecture

uDOS-alpine packages a lean machine profile for the public family.

## Main Areas

- `apkbuild/` contains package definitions.
- `distribution/` and `profiles/` hold deployable layouts.
- `openrc/` defines service startup behavior.
EOF

  write_file "uDOS-alpine/docs/boundary.md" <<'EOF'
# uDOS-alpine Boundary

## Owns

- Alpine packaging
- profile layout
- live and diskless deployment support

## Does Not Own

- runtime semantics
- home-server service behavior
- provider transport logic
EOF

  write_file "uDOS-alpine/docs/getting-started.md" <<'EOF'
# uDOS-alpine Getting Started

1. Review `profiles/` and `distribution/`.
2. Keep package definitions in `apkbuild/`.
3. Document service assumptions in `openrc/`.
4. Add deployment examples only when they match supported profiles.
EOF

  write_file "uDOS-alpine/docs/examples.md" <<'EOF'
# uDOS-alpine Examples

Examples should cover:

- minimal machine profiles
- package set definitions
- live boot layout notes
- remaster workflow examples
EOF

  write_file "uHOME-client/README.md" <<'EOF'
# uHOME-client

## Purpose

Public client surfaces for local-network home and server interactions.

## Ownership

- client-facing UI and interaction modules
- controller, kiosk, and viewing surfaces
- teachable local-network examples

## Non-Goals

- persistent server runtime ownership
- canonical runtime semantics
- private OMD app ownership

## Spine

- `src/`
- `docs/`
- `tests/`
- `scripts/`
- `config/`
- `examples/`

## Local Development

Keep client flows modular and centered on public contracts.

## Family Relation

uHOME-client consumes uHOME-server and uDOS contracts without owning them.
EOF

  write_file "uHOME-client/docs/architecture.md" <<'EOF'
# uHOME-client Architecture

uHOME-client provides local-network client surfaces for the family.

## Main Areas

- `src/` stores client modules.
- `examples/` shows public interaction patterns.
- `docs/` explains how clients consume server contracts.
EOF

  write_file "uHOME-client/docs/boundary.md" <<'EOF'
# uHOME-client Boundary

## Owns

- client interaction surfaces
- local-network presentation modules
- public example flows for controllers and kiosks

## Does Not Own

- always-on server services
- canonical runtime semantics
- private commercial app logic
EOF

  write_file "uHOME-client/docs/getting-started.md" <<'EOF'
# uHOME-client Getting Started

1. Read `docs/boundary.md`.
2. Keep transport contracts explicit.
3. Add examples for public client flows in `examples/`.
4. Test any shared client-state behavior.
EOF

  write_file "uHOME-client/docs/examples.md" <<'EOF'
# uHOME-client Examples

Useful examples:

- kiosk control surfaces
- local-network controller flows
- status dashboards
- public contract consumption
EOF

  write_file "uHOME-server/README.md" <<'EOF'
# uHOME-server

## Purpose

Always-on local-network runtime for persistent services, scheduling, and home/server modules.

## Ownership

- local-network services
- persistent scheduling
- service modules
- home and server infrastructure surfaces

## Non-Goals

- canonical runtime semantics
- shell ownership
- provider bridge ownership

## Spine

- `services/`
- `scheduling/`
- `modules/`
- `docs/`
- `tests/`
- `scripts/`
- `config/`

## Local Development

Build service modules as explicit, testable units and keep managed state outside the repo.

## Family Relation

uHOME-server is a downstream uHOME service stream that sits behind the family runtime spine rather than owning the primary command centre.
EOF

  write_file "uHOME-server/docs/architecture.md" <<'EOF'
# uHOME-server Architecture

uHOME-server is the dedicated uHOME service stream for the family.

## Main Areas

- `services/` exposes uHOME service surfaces.
- `scheduling/` holds recurring execution logic.
- `modules/` organizes service modules and extensions.
- `config/` stores service configuration.
EOF

  write_file "uHOME-server/docs/boundary.md" <<'EOF'
# uHOME-server Boundary

## Owns

- always-on local services
- scheduling and persistence
- home/server infrastructure modules

## Does Not Own

- canonical parsing and execution rules
- operator shell UX
- provider bridge adapters
EOF

  write_file "uHOME-server/docs/getting-started.md" <<'EOF'
# uHOME-server Getting Started

1. Review `docs/boundary.md`.
2. Keep service code under `services/` and `modules/`.
3. Route scheduling behavior through `scheduling/`.
4. Add tests before extending persistent behavior.
EOF

  write_file "uHOME-server/docs/examples.md" <<'EOF'
# uHOME-server Examples

Useful examples:

- scheduled service jobs
- local-network service modules
- persistent state and recovery patterns
- public contract integration with Core and Wizard
EOF
}

write_private_repos() {
  write_file "omd-mac-osx-app/README.md" <<'EOF'
# omd-mac-osx-app

## Purpose

Private macOS desktop application for OMD product work.

## Ownership

- desktop app UX
- private commercial workflows
- platform-specific integrations

## Non-Goals

- public uDOS runtime ownership
- public family architecture ownership

## Spine

- `Sources/`
- `Tests/`
- `Docs/`
- `scripts/`
- `config/`

## Relation To Public Family

This app may consume public uDOS or uHOME contracts but must not become a dependency of the public family.
EOF

  write_file "omd-mac-osx-app/Docs/architecture.md" <<'EOF'
# omd-mac-osx-app Architecture

Keep private desktop implementation details here and public contracts in the public repos.
EOF

  write_file "omd-mac-osx-app/Docs/boundary.md" <<'EOF'
# omd-mac-osx-app Boundary

The macOS app may integrate with public contracts but does not own them.
EOF

  write_file "omd-android-app/README.md" <<'EOF'
# omd-android-app

## Purpose

Private Android application family for OMD mobile surfaces.

## Ownership

- Android app modules
- mobile UX flows
- platform integrations

## Non-Goals

- public uDOS runtime ownership
- public family architecture ownership

## Spine

- `app/`
- `feature-reader/`
- `feature-kiosk/`
- `feature-player/`
- `integrations/`
- `docs/`
- `scripts/`
- `config/`

## Relation To Public Family

This app may consume public uDOS or uHOME contracts but must not define them.
EOF

  write_file "omd-android-app/docs/architecture.md" <<'EOF'
# omd-android-app Architecture

Keep Android-specific implementation private and treat public uDOS and uHOME repos as external contract sources.
EOF

  write_file "omd-android-app/docs/boundary.md" <<'EOF'
# omd-android-app Boundary

The Android app integrates with public contracts where needed but does not own public architecture.
EOF

  write_file "omd-ios-app/README.md" <<'EOF'
# omd-ios-app

## Purpose

Private iOS application family for OMD mobile surfaces.

## Ownership

- iOS app modules
- mobile UX flows
- platform integrations

## Non-Goals

- public uDOS runtime ownership
- public family architecture ownership

## Spine

- `Sources/`
- `Tests/`
- `Docs/`
- `scripts/`
- `config/`

## Relation To Public Family

This app may consume public uDOS or uHOME contracts but must not define them.
EOF

  write_file "omd-ios-app/Docs/architecture.md" <<'EOF'
# omd-ios-app Architecture

Keep iOS-specific implementation private and treat public uDOS and uHOME repos as external contract sources.
EOF

  write_file "omd-ios-app/Docs/boundary.md" <<'EOF'
# omd-ios-app Boundary

The iOS app integrates with public contracts where needed but does not own public architecture.
EOF
}

normalize_local_root_refs() {
  local targets=(
    "$ROOT_DIR/README.md"
    "$ROOT_DIR/START_HERE.md"
    "$ROOT_DIR/PRIVATE_PRODUCT_BOUNDARY.md"
    "$ROOT_DIR/UDOS_V2_OVERARCHING_DEV_BRIEF.md"
    "$ROOT_DIR/scripts"
    "$ROOT_DIR/uDOS-core"
    "$ROOT_DIR/uDOS-shell"
    "$ROOT_DIR/sonic-screwdriver"
    "$ROOT_DIR/uDOS-plugin-index"
    "$ROOT_DIR/uDOS-wizard"
    "$ROOT_DIR/uDOS-gameplay"
    "$ROOT_DIR/uDOS-empire"
    "$ROOT_DIR/uDOS-dev"
    "$ROOT_DIR/uDOS-themes"
    "$ROOT_DIR/uDOS-docs"
    "$ROOT_DIR/uDOS-alpine"
    "$ROOT_DIR/uHOME-client"
    "$ROOT_DIR/uHOME-server"
    "$ROOT_DIR/uDOS-groovebox"
    "$ROOT_DIR/uDOS-grid"
    "$ROOT_DIR/uDOS-thinui"
    "$ROOT_DIR/uDOS-workspace"
    "$ROOT_DIR/uDOS-host"
    "$ROOT_DIR/sonic-ventoy"
    "$ROOT_DIR/uHOME-matter"
    "$ROOT_DIR/uHOME-app-android"
    "$ROOT_DIR/uHOME-app-ios"
  )

  find "${targets[@]}" \
    \( -name '*.md' -o -name '*.txt' -o -name '*.sh' -o -name '*.code-workspace' -o -name '*.json' -o -name '*.yml' -o -name '*.yaml' \) \
    -type f \
    ! -path '*/.git/*' \
    ! -path '*/.venv/*' \
    ! -path '*/node_modules/*' \
    ! -path '*/setup-udos-v2-workspace.sh' \
    -exec perl -0pi -e "s#\Q${ROOT_DIR}\E#${LOCAL_ROOT_TOKEN}#g; s#\Q~${ROOT_DIR#${HOME}}\E#${LOCAL_ROOT_TOKEN}#g" {} +
}

main() {
  write_root_files
  write_public_repos
  write_private_repos

  for repo in \
    uDOS-core \
    uDOS-shell \
    uDOS-plugin-index \
    uDOS-wizard \
    uDOS-gameplay \
    uDOS-empire \
    uDOS-dev \
    uDOS-themes \
    uDOS-docs \
    uDOS-alpine \
    uHOME-client \
    uHOME-server \
    uDOS-groovebox \
    uDOS-grid \
    uDOS-thinui \
    uDOS-workspace \
    uDOS-host \
    sonic-ventoy \
    uHOME-matter \
    uHOME-app-android \
    uHOME-app-ios
  do
    ensure_gitignore "$repo"
    init_git_repo "$repo"
  done

  normalize_local_root_refs
}

main "$@"
