---
title: "UOS external app launcher (alpha baseline)"
tags: [--public]
audience: public
slot: 5
status: "draft"
last_reviewed: "2026-04-16"
applies_to: "v0.3.0-alpha.1+ launcher patterns"
---

# UOS external app launcher (alpha baseline)

`uos` is the external app launcher surface for Open Box manifests (`.obx`) with container-runtime execution semantics.

## Operator command model

```bash
cd modules/uos
go run ./cmd/uos apps list
go run ./cmd/uos launch airpaint --dry-run -- /tmp/example.png
go run ./cmd/uos launch airpaint --execute --runtime podman -- /tmp/example.png
```

## Runtime contract

- `--runtime docker|podman` overrides manifest `container.type`
- `UOS_RUNTIME` can set runtime default when `--runtime` is omitted
- effective runtime must resolve to `docker` or `podman`
- dry-run must print effective runtime and final invocation

## GPU profile contract

- `--gpu-profile auto|off|all|nvidia|amd|intel`
- `auto` behavior:
  - if manifest `resources.gpu: true` -> `all`
  - else -> `off`
- profile mappings:
  - `all` -> `--gpus all`
  - `nvidia` -> `--gpus all -e NVIDIA_DRIVER_CAPABILITIES=all`
  - `amd|intel` -> `--device /dev/dri`
  - `off` -> no GPU flags

## Passthrough argument contract

- arguments after `--` are preserved and passed through
- `{file}` placeholders resolve to:
  - `/workspace/<relpath>` when path is inside cwd
  - `/workspace/.uos-outside` when path is outside cwd (with readonly bind)
- multi-argument passthrough is supported

## Validation gate

Use repository gate:

```bash
bash scripts/check-uos.sh
```

Gate verifies:

- `modules/uos` tests pass
- dry-run output includes:
  - effective runtime marker
  - selected GPU profile marker
  - expected GPU args
  - passthrough-expanded command marker

## Related

- [docker-integration.md](docker-integration.md)
- [open-box-format.md](open-box-format.md)

