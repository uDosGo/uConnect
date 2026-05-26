---
title: "Workflow, server, and network split (A1/A2)"
tags: [--public]
audience: public
slot: 5
---

# Workflow, always-on server, and network split

## Core split

- **A1**: local, offline-first wireframe behavior.
- **A2**: always-on server, distributed/network behavior.
- **Bridge**: A1 stubs call A2 when configured; otherwise they queue locally.

## A1 workflow

- Engine: TypeScript CLI commands.
- Storage: `~/.local/share/udos/workflow.db` (SQLite via Node `node:sqlite`).
- Triggers: manual (`udo workflow run`), schedule metadata, file-based/manual actions.
- Logging: `~/.local/share/udos/logs/workflow.log`.

Commands:

- `udo workflow list`
- `udo workflow create <name> --step 'action'`
- `udo workflow run <name>`
- `udo workflow schedule <name> --cron '0 2 * * *'`
- `udo workflow status <name>`
- `udo workflow logs <name>`

## A2 workflow and server stubs

- `udo workflow server start|status` (A2-oriented stubs)
- `udo workflow webhook add <name> --url <url>`
- `udo workflow webhook list`
- `udo workflow queue list`
- `udo server start|stop|status|logs`
- `udo server configure --port 8080`
- `udo a2 configure --url <url> [--api-key]`
- `udo a2 status`

## A1 → A2 bridge

- Config file: `~/.config/udos/a2.yaml`
- Bridge API helper: `core/src/lib/a2-bridge.ts`
- Sync behavior:
  - `udo sync pull/push` calls A2 when configured
  - otherwise queues operations into `workflow_queue`

## Network split

- **A1 local-only**: preview HTTP server, live reload WS, offline queueing.
- **A2 cloud-first**: HTTPS API, webhook receiver, distributed events, OAuth/webhooks integrations.

See local dev-only stub note: `dev/features/network-stubs.md`.
