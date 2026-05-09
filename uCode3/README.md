# uHomeNest

**uHomeNest v3.9** — product line **3.9.x** (see root [`VERSION`](VERSION)); Python package **`uhome-server`** follows `pyproject.toml`. **v4** plan: [`docs/ROADMAP-V4.md`](docs/ROADMAP-V4.md).

**uHomeNest** is the **monorepo** for the **uHOME** product line: household media, kiosk/thin UI, LAN server, Matter/Home Assistant bridges, and the lightweight client runtime.

## What uHOME is

**uHOME** is a **home media and living-room computer**: a **media player**, **controller-first** console/kiosk **TUI and thin-GUI**, and **decentralised LAN server** for the household. It targets a **dual-role machine** (often **Linux** for uHOME plus optional **Windows + Steam**), installed/refreshed through **`sonic-screwdriver`** (Ventoy/USB bootstrap), not Empire- or Wizard-centric flows. The stack includes a **curated on-disk library**, **Jellyfin**, and **home automation** via **Home Assistant**, surfaced through **kiosk-style thin UX** (with Matter bridge contracts under `matter/`).

**Non-goals:** generic USB installer product (Sonic), canonical uDOS-wide runtime semantics, macOS/iCloud-first sync as primary, or replacing a full desktop OS.

## Layout

| Directory | Former standalone repo | Role |
| --- | --- | --- |
| **`server/`** | was **`uHOME-server`** | LAN-first server, thin UI, services, docs, wiki |
| **`matter/`** | `uHOME-matter` | Matter / Home Assistant contracts and bridge assets |
| **`host/`** | `uHOME-client` | Lightweight client runtime and contract consumption (local network) |

Runtime and installer-adjacent code also live at repo roots such as `src/uhome_server/`, `apps/`, `services/`, `docs/`, `wiki/`, and `examples/`—see **`docs/base-runtime-boundary.md`** for boundaries vs Sonic and Matter.

## Clone

```bash
git clone https://github.com/fredporter/uHomeNest.git
cd uHomeNest
```

## Development

- **Universal dev (uHomeNest + USXD):** [`dev/UNIVERSAL-DEV.md`](dev/UNIVERSAL-DEV.md)
- **v4 roadmap (product line):** [`docs/ROADMAP-V4.md`](docs/ROADMAP-V4.md)
- **UDN / tasks:** [`DEV.md`](DEV.md), [`dev/WORKFLOW.md`](dev/WORKFLOW.md), [`dev/TASK_FORGE.md`](dev/TASK_FORGE.md), **[`TASKS.md`](TASKS.md)**
- **Python server:** `server/README.md`, `QUICKSTART.md`, `FIRST-TIME-INSTALL.md`, `docs/`
- **Matter:** `matter/README.md`
- **Client / host runtime:** `host/README.md`
- **Workspace:** open **`uHomeNest.code-workspace`** in Cursor/VS Code to include sibling **UniversalSurfaceXD** alongside this repo.

## Quick start (server)

```bash
bash scripts/run-uhome-server-checks.sh
~/.udos/venv/uhome-server/bin/python -m uvicorn uhome_server.app:app --host 127.0.0.1 --port 8000 --reload
```

Console/kiosk bootstrap: `bash scripts/first-run-launch.sh` (or `open ./scripts/first-run-launch.command` on macOS). Health: `curl http://localhost:8000/api/health`

Activation and validation: see `docs/activation.md` and `bash scripts/run-uhome-server-checks.sh`.

## Naming

- **uHomeNest** — this repository (**v3.9.x**); clone **`fredporter/uHomeNest`**.
- **uHOME** — product name (media + LAN + thin UX).
- **`uhome-server`** — Python package / CLI inside the monorepo (not the repo name).

See **`docs/MONOREPO.md`** for canonical names, migration from **`uHOME-family/`**, and old standalone repos.

## Family relation

Partners: **`sonic-screwdriver`** (bootstrap into uHOME), **`uHOME-matter`** (contracts; kiosk thin UX surfaces automation here), **`uHOME-client`** (remote clients). Household LAN policy ships in-repo (`src/uhome_server/contracts/`).
