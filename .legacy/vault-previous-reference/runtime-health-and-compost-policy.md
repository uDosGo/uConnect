# Runtime Health And Compost Policy

This document defines cleanup and monitoring policy for the `uDOS-family`
workspace and the managed runtime under `~/.udos/`.

**Family context:** library **prefetch**, **disk budget**, **Sonic partitions**,
and **Wizard** as a health **dashboard** are described in
`docs/udos-host-platform-posture.md` § **System health, disk budget, and
retention** and `docs/family-first-run-operator-flow.md` principle **10**. This
file stays the **policy** for **where** compost and runtime cleanup live; the
posture doc ties that to **offline-first** and **LAN library** behaviour.

## Scope

There are two separate cleanup domains:

### 1. Workspace Compost

Local workspace cleanup belongs under:

- `<local-project-root>/.compost/`

Use this for:

- superseded docs
- retired workspace files
- root-level debris
- local-only cleanup manifests and reports

### 2. Managed Runtime

Managed runtime state belongs under:

- `~/.udos/`

Use this for:

- runtime state
- vault content
- sync queues
- logs
- caches
- temp workdirs

Do not move active runtime state into `.compost/` automatically.

## Cleanup Rule

`.compost` should archive:

- outdated local workspace files
- stale tracked-doc history when intentionally retired
- local debris removed from the repo root or repo trees

`.compost` should not automatically archive:

- active `~/.udos/state/`
- active `~/.udos/vault/`
- active `~/.udos/sync/`
- active `~/.udos/publish/`

Those locations must be monitored and cleaned intentionally, not blindly moved.

## Health Checks

The runtime health pass should monitor:

- required `~/.udos/` roots
- filesystem usage
- largest runtime directories
- stale files in `cache`, `tmp`, and `logs`
- workspace debris such as `.DS_Store`, `__pycache__`, and `.pytest_cache`
- `.compost` growth

Primary script:

- `scripts/run-udos-runtime-health.sh`

## Compost Awareness Rule

The compost script should be aware of `~/.udos/` and record cleanup candidates,
but it should not mutate runtime-owned state by default.

It may:

- write reports about stale runtime caches/logs/tmp files
- record storage pressure and cleanup candidates
- suggest follow-up cleanup work

It should not:

- move live vault data
- move live sync queues
- move active service state

## Required Runtime Roots

Health checks should expect these roots:

- `~/.udos/bin/`
- `~/.udos/envs/`
- `~/.udos/state/`
- `~/.udos/vault/`
- `~/.udos/publish/`
- `~/.udos/sync/`
- `~/.udos/memory/`
- `~/.udos/library/`
- `~/.udos/logs/`
- `~/.udos/cache/`
- `~/.udos/tmp/`

## Operator Workflow

Recommended maintenance sequence:

1. run `scripts/run-udos-runtime-health.sh`
2. review `scripts/report-udos-footprint.sh`
3. run `scripts/compost-v2-workspace-debris.sh` for workspace debris
4. run targeted runtime cleanup only after reviewing the health output

## Handover Rule

Cursor handover should assume:

- repo roots stay clean
- runtime state stays under `~/.udos/`
- cleanup and health checks are part of normal operation, not an afterthought
