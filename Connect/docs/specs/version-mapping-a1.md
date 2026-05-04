---
title: "Semver alpha mapping"
tags: [--public]
audience: public
slot: 5
---

# Semver alpha mapping (release alignment)

This file maps feature rounds to semantic versions while uDos remains in Alpha.

## Mapping table

| Milestone lane | Scope signal | Suggested semver |
| --- | --- | --- |
| Alpha baseline | CHASIS + 4 widget baseline + state server | `v0.1.0-alpha.1` |
| Alpha patch rounds | Bugfix-only stabilization in same lane | `v0.1.0-alpha.2`, `v0.1.0-alpha.3`, ... |
| Liquid lane | Template integration | `v0.2.0-alpha.1` |
| Static export lane | HTML export support | `v0.3.0-alpha.1` |
| React lane | Browser renderer + WebSocket bridge | `v0.4.0-alpha.1` |
| SKIN lane | Tailwind variable bridge | `v0.5.0-alpha.1` |
| LENS lane | Overlay/filter layer | `v0.6.0-alpha.1` |
| Beta hardening | Feature complete verification | `v0.7.0-beta.1` |
| Production | Stable contract | `v1.0.0` |

## Current package alignment

- `@udos/core` currently uses an internal VA1 package marker.
- Release-policy guidance for USXD lanes should use prerelease semver (`0.x.y-alpha.n`) until Beta/GA.

## Bump rules (A1)

- Patch-level prerelease increment (`v0.1.0-alpha.1` -> `v0.1.0-alpha.2`): bugfixes in the same feature lane.
- Minor increment (`v0.1.0-alpha.3` -> `v0.2.0-alpha.1`): new feature lane.
- Beta and GA are explicit transitions (`v0.7.0-beta.1` then `v1.0.0`).

## Notes

- This mapping governs release naming for alpha work.
- Feature-gating decisions remain controlled by roadmap and operator approval.
