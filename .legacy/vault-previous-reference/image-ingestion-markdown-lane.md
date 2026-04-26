# Image ingestion → markdown lane

Status: **active lane** (Post-08 optional **O2** promotion)  
Owner: **`uDOS-docs`** (documentation and hub alignment); **`uDOS-core`** owns markdown/MDC intake contracts when implementation lands.

## Purpose

Define the **docs-side** lane for turning **image inboxes** (photos and similar assets) into **markdown-first** artefacts: captions, sidecar `.md`, or MDC-style blocks — without duplicating Core’s document model.

## Boundaries

- **Not** the General Knowledge Bank text corpus alone; treat images as a **separate ingestion round** with explicit vault/instance policy.
- **Private or sensitive** assets stay out of public repos per vault policy; this doc describes the lane, not a specific host path.
- **Canonical markdown intake** semantics live in **`uDOS-core`** (for example the MDC conversion engine note **`uDOS-core/docs/v2.4-mdc-conversion-engine.md`**). Hub and courses **link** here; they do not fork Core vocabulary.

## Intended workflow (documentation target)

1. Normalize incoming assets in a **private or instance-scoped** inbox.
2. Produce **markdown-first** outputs (figure references, alt text, optional sidecar metadata).
3. Route through the same **review and publish** patterns as other docs (`docs/publishing-architecture.md`, `docs/course-hooks-and-onboarding.md` where relevant).

## Execution checklist

Operator and implementer steps live in **`@dev/pathways/o2-image-ingestion-md-execution-checklist.md`** (same repo).

## Pathway index

- Candidate (historical scope): `@dev/pathways/image-ingestion-md-candidate.md`
- Family duplication index: **`uDOS-dev`** `@dev/notes/reports/family-duplication-and-pathway-candidates-2026-04-01.md`

## Verification

```bash
bash scripts/verify-o2-image-ingestion-lane.sh
```
