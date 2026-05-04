# 2026-04-16 — Continuous flow: `udo app` → uos

- Merged PR: dev README “Start dev flow” (`dev/README.md`).
- Implemented **`udo app list`** and **`udo app launch <app> [args…]`** (dry-run) delegating to [`modules/uos`](../../modules/uos/) via `go run ./cmd/uos`.
- Updated [`dev/TASKS.md`](../../TASKS.md) alpha row **T-ALPHA-UOS**.

Next round: `--execute` + real `docker`/`podman`, or next **T-ALPHA-*** row.
