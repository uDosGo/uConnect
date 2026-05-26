---
title: "Docker integration patterns (uDos)"
tags: [--public]
audience: public
slot: 5
status: "draft"
last_reviewed: "2026-04-15"
applies_to: "A2/A3 — patterns documented in A1; CLI baseline active in alpha"
---

# Docker integration patterns (uDos)

**Purpose:** Clarify what “Docker use” means for uDos so A2/A3 work does not scope-creep into full container platforms.

## Patterns uDos may use

| Pattern | Description | Example |
| --- | --- | --- |
| **CLI invocation** | uDos shells out to the `docker` CLI | `udo docker run --rm -it ubuntu echo hello` *(target surface)* |
| **Compose stacks** | uDos drives multi-container workflows | `udo docker compose -f stack.yaml up` *(target)* |
| **SDK integration** | Programmatic lifecycle from uDos core (TS/Go) | Start/stop containers from runtime *(A2+)* |
| **Output embedding** | Capture stdout/stderr for USXD / widgets | `docker logs --follow` piped into a uDos attach command *(target)* |

## What uDos does **not** need (by default)

- Docker Desktop as a **product dependency** (operators may still use it locally).
- Docker Hub **product** integration (marketplace, org sync) — possible **A3+** optional lane.
- Multi-host **orchestration** (Kubernetes/Swarm) beyond **single-host** compose for dev and small deployments.

## Alpha baseline (implemented)

- `udo docker status` reports runtime inventory and selected runtime.
- `udo docker run -- <args...>` pass-through with guardrails for missing args.
- `udo docker compose -- <args...>` pass-through.
- Runtime override supported via `UDO_DOCKER_RUNTIME` (or `UOS_RUNTIME`) with accepted values: `auto`, `docker`, `podman`.

## A2/A3 implementation notes

- Prefer **explicit** stack files checked into vault or repo (`stack.yaml`) over implicit magic.
- Document required env vars (`DOCKER_HOST`, credentials) in operator docs when commands land.
- Sample compose snippets may live under vault **`@toybox/experiments/docker/test-stacks/`** after `udo vault init` (see seed `toybox/`).

## Related

- [markdownify-integration.md](markdownify-integration.md) — document conversion path (complementary to containers).
- [workflow-network-a1-a2.md](workflow-network-a1-a2.md) — A1/A2 boundary.
