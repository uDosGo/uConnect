# Shared runtime/resource contract (post-08)

## Purpose

Define the minimum family capability that replaces Docker-style responsibilities
with a uDOS-native host/runtime model.

This is the baseline contract for the **aggressive Docker replacement** track in
`@dev/notes/roadmap/v2-family-roadmap.md` and `docs/post-08-backlog-snapshot.md`.

## Scope

The shared capability must cover five responsibilities:

1. service lifecycle
2. health/status probing
3. dependency and isolation policy
4. config/secret binding
5. logs/feeds/spool integration

## Minimum contract surface

### 1) Service lifecycle

- Start/stop/restart/status for runtime services through a single family shape
  (`udos-commandd` operation IDs and/or sibling CLI wrapper).
- Support idempotent boot and bounded retries.
- Expose machine-readable status for each service.
- Minimum lifecycle operation set is declared in
  `@dev/fixtures/shared-runtime-resource.v1.json` and validated against
  `uDOS-host/contracts/udos-commandd/operation-registry.v1.json`.

### 2) Health/status probes

- Every managed service exposes `GET /health.json` and `GET /v1/status`
  semantics (directly or via adapter) with consistent fields:
  - `service`
  - `status`
  - `ts`
  - `details` (bounded map)
- Health checks aggregate through existing family scripts and Ubuntu host tools.

### 3) Dependency and isolation policy

- Isolation is policy-driven (user/systemd units, process boundaries, file and
  port boundaries), not container-required.
- Services declare required deps and startup order in checked-in docs/contracts.
- No Tier-1 feature may require Docker as a hard prerequisite.

### 4) Config and secret binding

- Config lives in repo templates + `~/.udos/` state overlays per host rules.
- Secret surfaces are explicit and non-write-by-default in public routes.
- Runtime state never drifts into repo trees.

### 5) Logs/feeds/spool integration

- Runtime execution logs remain reducible to feed/spool surfaces.
- Binder lifecycle and feed/spool updates remain semantically aligned with
  `uDOS-core/docs/feeds-and-spool.md`.

## Migration policy

- Docker/Compose is **transitional compatibility** only for third-party stacks.
- Every Docker-backed lane must carry:
  - reason it still needs Docker
  - migration target to this shared contract
  - expected removal/review checkpoint

## First migration candidates

1. **Low-risk Tier-1 service wrappers** in `uDOS-host` (health + lifecycle
   unification through commandd operations).
2. **Groovebox/Songscribe compose lane**: keep functional now, add explicit
   transition notes and health alignment.
3. **Family CLI unification**: Python `udos-commandd` wrapper and shared status
   commands used by checks.

## Phase-2 (Post-08 O3 tranche)

- **Lifecycle matrix** `shared-runtime-service-lifecycle.v1.json` now registers
  **`ubuntu-wordpress-publish-stack`** (`docker-fallback`) alongside Groovebox
  Songscribe compatibility entries.
- **`uDOS-host/docs/docker-compose-compatibility.md`** owns WordPress Compose
  posture; **`scripts/verify-docker-compose-compatibility-doc.sh`** is wired into
  **`run-ubuntu-checks.sh`** (no Docker invoked).
- **`uDOS-dev/scripts/verify-o3-docker-compat-siblings.sh`** asserts sibling
  `uDOS-host` / `uDOS-groovebox` document paths when those repos sit next to
  `uDOS-dev` (skipped entries are absent locally only).

## Phase-1 implementation (started)

- `uDOS-dev/scripts/run-shared-runtime-resource-check.sh` executes the Ubuntu
  daemon verification as the family-level shared runtime/resource conformance
  proof.
- Machine-readable baseline manifest:
  `@dev/fixtures/shared-runtime-resource.v1.json` (required services, endpoint
  semantics, adapter verify path).
- Service lifecycle matrix:
  `@dev/fixtures/shared-runtime-service-lifecycle.v1.json` (target services and
  expected lane-1 lifecycle responses, plus optional compatibility services for
  transitional external/docker lanes).
- `uDOS-dev/scripts/run-dev-checks.sh` now includes this check, so the decision
  is enforced in everyday dev validation.

## Related

- `docs/foundation-distribution.md`
- `docs/udos-commandd-reference.md`
- `docs/runtime-health-and-compost-policy.md`
- `uDOS-core/docs/feeds-and-spool.md`
