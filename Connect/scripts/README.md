# Root `scripts/` (uDos)

Shared bash helpers for Python env bootstrap, multi-repo checks, and `~/.udos` path conventions used across the family workspace.

Details: **[`../docs/shared-resources-architecture.md`](../docs/shared-resources-architecture.md)**.

Run from the **repository root** (parent of this folder), for example:

```bash
./scripts/bootstrap-family-python.sh
```

**Courses:** `./scripts/validate-courses.sh` — ensures each `courses/[0-9][0-9]-*/` folder has a `README.md`.

**Workspace drift guard:** `./scripts/check-workspace-drift.sh` — verifies npm workspace resolution and validates `uDos.code-workspace` required folders and path sanity (no machine-specific absolute paths).

**Markdownify runtime bootstrap:** `./scripts/bootstrap-markdownify-runtime.sh` — creates `vendor/markdownify-mcp/.venv` with a pinned upstream MarkItDown build (`Python >=3.10`, prefers `python3.11`) and verifies CLI availability.

**MCP stdio smoke:** `./scripts/check-mcp-stdio.sh` — starts local `udo mcp start`, runs framed MCP handshake (`initialize`, `tools/list`, `tools/call markdownify.status`), and fails fast if protocol wiring is broken.

**USXD-GO scaffold gate:** `./scripts/check-usxd-go-scaffold.sh` — runs `modules/usxd-go` tests, boots `usxd-server`, and verifies `/healthz` + `/api/usxd/state` payload shape.

**USXD Story gate:** `./scripts/check-usxd-story.sh` — runs `modules/usxd-go/story` tests, executes `examples/story-onboarding`, and validates serialized `application/vnd.usxd.story` envelope/version.

**UOS launcher gate:** `./scripts/check-uos.sh` — runs `modules/uos` tests and validates `uos launch ... --dry-run` output markers for runtime selection, GPU profile wiring, and passthrough expansion.

**Shakedown (Round E / Round F):** `./scripts/shakedown.sh` — `dev/TASKS.md`, v4 spec index, course validation, `check-tasks-md.sh` (sparse clones skip absent sibling repos). Optional: `UDOS_SHAKEDOWN_FULL=1` runs `v4-dev/family-health-check.sh` (USXD surfaces when present).

**A1 verify (operator):** `npm run verify:a1` at repo root — same as `npm test` + shakedown + `cargo test` in `core-rs/`. Runbook: [`dev/OPERATOR-LIVE-TEST-A1.md`](../dev/OPERATOR-LIVE-TEST-A1.md).

**Imported (uDosDocs, for review):** [`imported/2026-04-15-uDosDocs/`](imported/2026-04-15-uDosDocs/README.md) — upstream `run-docs-checks.sh`; merge or wire cautiously (paths assume a full uDosDocs tree).
