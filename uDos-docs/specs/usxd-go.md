---
title: "USXD-GO technical specification"
tags: [--public]
audience: public
slot: 5
status: "draft"
last_reviewed: "2026-04-15"
applies_to: "Alpha planning and implementation gating"
---

# USXD-GO technical specification

Version: `v0.1.0-alpha.1`  
Status: Draft for Alpha implementation planning

## 0) Versioning policy (authoritative)

uDos stays in Alpha until the format is proven. USXD-GO uses semantic versioning with prerelease labels:

- Current target: `v0.1.0-alpha.1` (Alpha 1 scope)
- Bugfixes in current round: `v0.1.0-alpha.N` patch-level prerelease progression
- New feature rounds: `v0.X.0-alpha.1` minor progression

Planned roadmap:

| Phase | Version | Milestone |
| --- | --- | --- |
| Current | `v0.1.0-alpha.1` | CHASIS baseline + four Go widgets + state server |
| Next | `v0.1.0-alpha.2` | Bugfix patch round (no new feature lane) |
| Next | `v0.1.0-alpha.3` | Bugfix patch round (no new feature lane) |
| Next | `v0.2.0-alpha.1` | Liquid template integration + Story surface baseline (`application/vnd.usxd.story`) |
| Next | `v0.3.0-alpha.1` | Static HTML export |
| Next | `v0.4.0-alpha.1` | React renderer + WebSocket bridge |
| Next | `v0.5.0-alpha.1` | SKIN layer (Tailwind CSS variables) |
| Next | `v0.6.0-alpha.1` | LENS gameplay/filter overlay |
| Beta | `v0.7.0-beta.1` | Feature-complete hardening |
| Production | `v1.0.0` | Stable release |

## 1) Four-layer IO model

USXD-GO aligns to:

- **CHASIS**: core layout/runtime and serialization
- **WIDGET**: reusable UI components
- **SKIN**: visual styling and tokens
- **LENS**: future gameplay/filter overlays

This model is architectural planning across alpha rounds.

## 2) Open Box compatible USXD JSON

USXD blocks should be self-describing, portable, and schema-addressable.
For `v0.1.0-alpha.1`, the minimal payload is:

- `open_box` metadata
- explicit `usxd_version`
- structured `chassis` and `widgets`
- no `liquid`, `static_export`, `skin`, or `lens` sections yet

The draft contract supplied in operator notes is the canonical working proposal for this phase.

## 3) Initial component targets

- Login form
- Data table
- Tabbed interface
- Async loader

Each component should serialize to an Open Box-compatible USXD block.

## 4) Tailwind / skin bridge

For browser rendering (scheduled for `v0.5.0-alpha.1`):

- tokenized uDos colors/typography/spacing
- component classes matching USXD primitives
- dark-first defaults with accessibility guardrails

## 5) React renderer bridge

A renderer can consume USXD JSON snapshots (poll or WebSocket stream) and map to UI components while keeping terminal/browser semantics aligned. This lane is scheduled for `v0.4.0-alpha.1`.

## 6) Alpha 1 implementation checklist (`v0.1.0-alpha.1`)

Scope for this release:

- Go module with Bubble Tea
- CHASIS layout engine baseline
- Four widgets (Login, Table, Tabs, Async) as Go structs
- JSON serialization for `v0.1.0-alpha.1` schema
- HTTP state endpoint (`/api/usxd/state`)
- WebSocket live updates (`/ws/usxd`)

Out of scope for this release:

- Liquid templating (`v0.2.0-alpha.1`)
- Static export (`v0.3.0-alpha.1`)
- React renderer (`v0.4.0-alpha.1`)
- Tailwind SKIN (`v0.5.0-alpha.1`)
- LENS (`v0.6.0-alpha.1`)

## 7) Story surface baseline (`v0.2.0-alpha.1`)

Story remains a surface pattern on top of shared GTX semantics:

- linear step navigation
- `Enter` to continue contract
- visible progress (`step x/y` or equivalent)
- theme abstraction (`typeform`, `marp`, `teletext`, `thinui`)
- USXD story envelope: `application/vnd.usxd.story`

Canonical Story spec:

- [`usxd-story-format.md`](usxd-story-format.md)
