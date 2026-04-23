---
title: "Version ladder (semver alpha track)"
tags: [--public]
audience: public
slot: 5
---

# Version ladder

uDos release planning follows semantic versioning with prerelease tags while the product remains in Alpha.

## `v0.1.0-alpha.1` — Alpha baseline

- Core CHASIS + four Go widget targets
- Initial HTTP state endpoint + WebSocket lane
- Minimal Open Box USXD contract
- No Liquid/static/React/SKIN/LENS yet

## `v0.1.0-alpha.2` and `v0.1.0-alpha.3` — patch rounds

- Bug fixes only within baseline scope
- No new feature lanes
- Use patch-level prerelease increment for each stabilization round

## `v0.2.0-alpha.1` — Liquid integration

- Add liquid templating package and serializer fields
- Keep Alpha constraints (no production compatibility guarantees)

## `v0.3.0-alpha.1` — Static HTML export

- Static export pipeline for USXD surfaces
- Compatibility checks for baseline schema

## `v0.4.0-alpha.1` — React renderer bridge

- Browser renderer from USXD snapshots
- WebSocket bridge alignment between terminal and browser

## `v0.5.0-alpha.1` — SKIN (Tailwind variables)

- Tailwind/Tailwind Plus skin-token layer
- Browser surface parity for styling primitives

## `v0.6.0-alpha.1` — LENS overlays

- Gameplay/filter overlays
- Lens payload schema additions

## `v0.7.0-beta.1` — Beta hardening

- Feature complete validation
- Integration testing, migration docs, stability gates

## `v1.0.0` — Production

- Stable contract
- Migration guarantees across supported versions
