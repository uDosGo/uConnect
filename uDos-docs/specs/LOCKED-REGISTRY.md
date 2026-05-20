---
title: "Locked registry"
tags: [--public]
audience: public
slot: 5
---

# Locked Registry

## Active Locks

| Lock ID | Scope | Rule | Precedence | Locked Date |
| --- | --- | --- | --- | --- |
| L001 | A1 cloud boundary | No cloud implementation in A1 main | 1 | 2026-04-14 |
| L002 | A1 GitHub native | GitHub features are allowed in A1 | 2 | 2026-04-14 |
| L003 | Exception whitelist | Listed exceptions only | 3 | 2026-04-14 |
| L004 | Version ladder | A1/A2 progression model is locked | 2 | 2026-04-14 |

## Superseded Locks

| Lock ID | Superseded By | Reason | Date |
| --- | --- | --- | --- |
| L000 | L001 | Initial cloud boundary clarified | 2026-04-14 |

## Exception Whitelist

| Path | Reason | Approved By | Date |
| --- | --- | --- | --- |
| `dev/features/network-stubs.md` | Stub documentation | Wizard | 2026-04-14 |
| `docs/specs/a1-a2-boundary.md` | Boundary documentation | Wizard | 2026-04-14 |
| `core/src/cloud-stubs/` | Stub contracts only | Wizard | 2026-04-14 |

## Enforcement

- CI checks for non-whitelisted cloud imports in A1.
- CI checks this registry exists and keeps lock IDs unique.
- CI blocks PRs that violate boundary rules.
