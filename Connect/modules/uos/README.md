# uos (scaffold)

Experimental uDos external-app launcher CLI.

This module is intentionally small: it validates `.obx` manifests and prints the intended container invocation for operator review.

## Run

```bash
cd modules/uos
go run ./cmd/uos apps list
go run ./cmd/uos launch airpaint --dry-run -- /tmp/example.png
go run ./cmd/uos launch airpaint --dry-run --gpu-profile nvidia -- /tmp/example.png
go run ./cmd/uos launch airpaint --dry-run --runtime podman -- --new-document --theme dark
```

## Runtime options

- `--runtime docker|podman` overrides manifest `container.type` (or `UOS_RUNTIME`).
- `--gpu-profile auto|off|all|nvidia|amd|intel` controls GPU runtime flags.
- Passthrough arguments support multiple values after `--` and are preserved in command expansion.

## Manifests

Example manifests live in `modules/uos/apps/`.

## Repo verification gate

```bash
cd ../../
bash scripts/check-uos.sh
```

Operator contract is documented in `docs/specs/uos-launcher.md`.
