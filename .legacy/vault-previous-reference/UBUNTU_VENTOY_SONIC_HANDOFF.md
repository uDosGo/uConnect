# Ubuntu, Ventoy, And Sonic Handoff

## Purpose

This document makes the current public handoff between `uDOS-host`,
`sonic-ventoy`, and `sonic-screwdriver` explicit.

## Ownership Split

### `uDOS-host`

Ubuntu owns:

- OS image and package baseline
- first-run and workstation assumptions
- Sonic hook compatibility

Ubuntu does not own:

- boot menu generation
- media layout writes
- Sonic manifest application

### `sonic-ventoy`

Ventoy owns:

- boot menu and theme template inputs
- template-backed stick structure
- profile-facing boot presentation primitives

Ventoy does not own:

- Ubuntu profile metadata
- payload staging policy
- device apply execution

### `sonic-screwdriver`

Sonic owns:

- profile-to-manifest planning
- verified media layout application
- payload staging and apply workflow
- live/install/recovery operator path

Sonic does not own:

- Ubuntu runtime semantics
- Ventoy template authorship
- persistent runtime behavior after install

## Current Handoff Sequence

1. Ubuntu defines the installable payload direction.
2. Ventoy provides the boot structure and theme/menu templates.
3. Sonic initializes the stick workspace from Ventoy templates.
4. Sonic registers Ubuntu profile metadata and checksum assumptions.
5. Sonic updates themes/templates while preserving user images and device config.
6. Sonic applies the reviewed manifest to the target media/device.

## Evidence Surfaces

- `scripts/smoke/ubuntu-ventoy-integration-smoke.sh`
- `tests/test_sonic_stick_integration.py`
- `tests/test_ubuntu_ventoy_integration_smoke_script.py`
- `docs/LIVE_INSTALL_RECOVERY_PRODUCT.md`

## Boundary Rule

If the work is about OS payload content or workstation setup, Ubuntu owns it.

If the work is about boot templates and themed boot structure, Ventoy owns it.

If the work is about reviewed deployment media, apply path, rescue path, or
device staging, Sonic owns it.
