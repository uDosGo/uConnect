# Vector + WordPress Experiment Brief

**Status:** Active scaffold (alpha lane)  
**Owner lane:** `T-ALPHA-VECTOR`  
**Goal:** turn research into an implementation-ready shortlist for WordPress-related semantic retrieval.

---

## Scope

- Build a repeatable benchmark shape for WordPress-like content:
  - posts/pages/comments
  - chunking and metadata assumptions
- Compare 2-3 realistic backends:
  - `pgvector` (Postgres)
  - OpenSearch k-NN
  - managed vector store (candidate documented in findings)
- Record operational constraints:
  - cost ceiling
  - latency target
  - hosting region / data residency

---

## Deliverables

1. Filled `findings-template.md` with evidence-backed notes
2. Backend shortlist with rationale
3. Initial sync contract assumptions for ingest/update/delete

---

## Commands

Use CLI scaffolds to start each round:

- `udo vector status`
- `udo vector plan`
- `udo vector benchmark --dataset <id> --backend <name>`

