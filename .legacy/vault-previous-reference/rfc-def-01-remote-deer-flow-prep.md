# RFC-DEF-01 prep — remote Deer Flow clusters

**Status:** design prep only — **no product or cluster implementation**  
**Parent stub:** `docs/deferred-product-rfc-stubs.md` § RFC-DEF-01  
**Updated:** 2026-04-05

## Decision record (provisional)

| Topic | Proposed direction | Revisit when |
| --- | --- | --- |
| Default execution | **Local controlled** execution remains the default; remote is **opt-in** per job or policy. | First remote pilot |
| Broker | **`uDOS-wizard`** owns adapter/broker semantics; **Core** owns any **new** contract fields if artifacts cross the host boundary. | Contract change |
| Workspace UX | **`uDOS-workspace`** shows **pin / mode** (preview vs controlled) and **runner locality** (local vs remote) in the same vocabulary as `v2.5`. | UI mock |
| Identity | Each remote runner has a **stable `runner_id`** issued by the operator’s trust domain (not anonymous pools). | Auth design |
| Approval | **Explicit network approval** step before first use of a remote runner class (similar in spirit to controlled execution pins). | Policy pack |

## Sequence (textual)

1. Operator requests execution with **locality=remote** (or policy routes it).
2. Shell / workspace sends intent to **Wizard** with **budgets, secrets handle, artifact refs** (no secret material in logs).
3. Wizard selects a **registered remote adapter** (Deer Flow or equivalent), returns **delegation envelope** + **correlation id**.
4. Remote runner executes; **artifacts and status** return through Wizard; workspace ingests like today’s execution lane.

## Non-goals (unchanged)

- Shipping Kubernetes or a specific cloud product as part of this prep.
- Changing “preview is safe default” semantics.

## Open questions (narrowed)

1. **Quota:** per-operator vs per-runner-class caps — document in Wizard policy JSON (placeholder key names only until implemented).
2. **Egress:** which artifact classes may leave the LAN — table in a future Core appendix.
3. **Failure:** when remote is unreachable, fall back to **local preview** or **hard fail** — policy bit on the request.

## Related

- `@dev/notes/roadmap/v2.5-rounds.md` (controlled execution)
- `uDOS-wizard` orchestration and Deer Flow adapter docs
- `docs/next-family-plan-gate.md`
- `docs/deferred-product-rfc-stubs.md` § RFC-DEF-01
