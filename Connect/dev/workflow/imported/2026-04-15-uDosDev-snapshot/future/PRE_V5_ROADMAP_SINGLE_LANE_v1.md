---
title: "Pre-v5 single-lane round order (v1)"
tags: [--devonly]
audience: contributor
slot: 5
---

# Pre-v5 single-lane round order (v1)

**Canonical detail:** [`PRE_V5_ROADMAP_AND_EXECUTION_ROUNDS_v1.md`](./PRE_V5_ROADMAP_AND_EXECUTION_ROUNDS_v1.md) (version **1.7.3** as imported), especially **section 4** (exit criteria per round).

This file records the **one-lane execution order** **PRE5-R01 → PRE5-R07** for **uDos**; exit criteria stay aligned with section 4 of the execution-rounds doc in this import.

**Rule:** Rounds are **batches**, not strict releases; close a round when **exit criteria** in the execution-rounds doc pass.

**Note (uDos):** Execution applies to **this monorepo** only. See [`BACKLOG-A1-branch.md`](../../../../BACKLOG-A1-branch.md) for the **A1 branch** backlog (merge before A1 closes).

| Order | Round | Goal (short) | Primary surface *(uDos monorepo; beta program)* |
| --- | --- | --- | --- |
| 1 | **PRE5-R01** | Spec spine and roadmap parity — docs in-tree | `docs/`, `dev/` |
| 2 | **PRE5-R02** | Portal and two gates (when in scope for this repo) | `docs/`, `core/` |
| 3 | **PRE5-R03** | Spatial registry (voxel / cell / depth) | `core/`, `core-rs/` |
| 4 | **PRE5-R04** | Tower of Knowledge (slots 0–7) | `core/`, `core-rs/`, `docs/` |
| 5 | **PRE5-R05** | Cloud lane and Global Knowledge Bank | `docs/`, `tools/` |
| 6 | **PRE5-R06** | User lane and sync | `core/`, `core-rs/` |
| 7 | **PRE5-R07** | Integrations and verification | repo-wide |

**Relationship to v5:** Pre-v5 rounds must **not** depend on v5 preview themes; see section 5 of the execution-rounds doc.
