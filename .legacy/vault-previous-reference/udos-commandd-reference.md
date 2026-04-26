# udos-commandd Reference

## Purpose

This document is the compact family reference for the `udos-commandd` contract
set.

Shared runtime replacement context:

- `docs/shared-runtime-resource-contract.md`

## Core Rule

Use one shared request and result envelope for:

- `udos-web`
- `udos-tuid`
- future internal service clients

## Contract Set

Machine-readable files live in `uDOS-host/contracts/udos-commandd/`.

Primary files:

- `api-envelope.schema.json`
- `operation-registry.v1.json`
- `minimum-operations.v1.json`

## Envelope Rule

Each request should include:

- `operation_id`
- `request_id`
- `session_id`
- `surface`
- `actor`

Each result should surface:

- status
- payload
- policy and budget state where relevant
- next action or error state where needed

## Registry Rule

Operation IDs should be:

- stable
- namespaced
- action-oriented
- shared across browser and TUI clients

Base runtime domains:

- runtime
- vault
- sync
- jobs
- network
- budget
- publish.local

Optional adapter domains:

- assist
- publish.remote
- mcp
- provider

## Minimum Operations Rule

The minimum contract set should cover:

- runtime health and service status
- host summary and local state
- vault browse, open, convert, publish
- sync queue inspection and retry
- schedule listing and execution
- beacon and portal status
- budget status and approval request
- local publish status

Lifecycle baseline (post-08 Docker replacement lane):

- `runtime.service.start`
- `runtime.service.stop`
- `runtime.service.restart`
- `runtime.service.status`

In lane-1 these are callable through `udos-commandd` with contract-preserving
stub semantics while supervisor wiring deepens in later implementation rounds.

## Drift Rule

When prose docs and machine-readable contract files disagree, update both in
the same pass.

Keep deeper implementation notes in the owning Ubuntu repo rather than
rebuilding multiple family-side drafts.

## Python CLI adapter

`uDOS-host/scripts/udos_commandd.py` provides a non-breaking Python wrapper
for `udos-commandd.sh` and mirrors these subcommands:

- `list-operations`
- `surface-summary`
- `policy-summary`
- `repo-op`
- `serve`
- `stub`
