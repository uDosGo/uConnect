# uDOS-shell Activation

Shell is active as a local, teachable operator surface.

## Active Entry Points

- `src/cli.ts` for the legacy TypeScript front door
- `cmd/ucode/main.go` for the active Go TUI front door
- `scripts/first-run-launch.sh` for one-command local launch
- `scripts/run-shell-checks.sh` for repo validation
- `examples/basic-ucode-session.md` for the smallest shell walkthrough

## Validation Contract

Run:

```bash
bash scripts/run-shell-checks.sh
```

This path builds and checks the active shell lanes and their tests.

## Boundary Rule

- parsing and presentation live here
- canonical semantics stay in `uDOS-core`
- managed network-backed execution stays outside Shell
