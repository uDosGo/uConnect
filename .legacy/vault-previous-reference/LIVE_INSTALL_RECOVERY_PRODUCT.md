# Sonic Live, Install, And Recovery Product

## Purpose

This document defines the active `v2.3` Sonic product lane.

Round D is not only about starter integration. It turns Sonic into an explicit
product surface for three operator-visible outcomes:

- live media
- install media
- recovery media

## Product Lanes

### Live

The live lane is the bootable review and staging surface.

It should provide:

- boot into the prepared Sonic media
- visible profile and manifest identity
- hardware/bootstrap validation before apply
- access to launcher and recovery entrypoints

Current Sonic surfaces used by the live lane:

- `scripts/first-run-preflight.sh`
- `scripts/demo-thinui-launch.sh`
- `config/boot-selector.json`
- `vault/templates/device-profiles/*.profile.json`

### Install

The install lane is the reviewed apply path for writing the target device.

It should provide:

- reviewed profile selection
- manifest generation
- verification before writes
- partition layout application
- payload staging and apply
- post-apply verification

Current Sonic surfaces used by the install lane:

- `sonic plan`
- `scripts/sonic-stick.sh`
- `scripts/partition-layout.sh`
- `scripts/apply-payloads-v2.sh`
- `scripts/verify-usb-layout.sh`

### Recovery

The recovery lane is the bounded rescue and maintenance path.

It should provide:

- known-good rescue profile
- explicit dry-run first behavior
- payload-only or verification-only options
- deployment note capture for escalations and rollback-safe operator review

Current Sonic surfaces used by the recovery lane:

- `vault/templates/device-profiles/rescue-maintenance-stick.profile.json`
- `vault/manifests/reference-rescue-maintenance-dry-run.manifest.json`
- `vault/deployment-notes/recovery-escalation-example.md`
- `scripts/sonic-stick.sh --dry-run`
- `scripts/collect-logs.sh`

## Shared Product Flow

The Sonic product flow is:

1. select a reviewed device profile
2. generate or load a manifest
3. verify packaging and source assumptions
4. stage the stick/media layout
5. apply install or recovery actions
6. verify the resulting layout and preserve notes/logs

## Ubuntu, Ventoy, And Sonic Handoff

Sonic owns:

- media planning
- layout application
- payload staging
- launcher and deployment product flow

Ubuntu owns:

- installable OS payload and first-run/bootstrap assumptions
- browser-workstation setup direction

Ventoy owns:

- template-backed boot structure and theme/menu primitives

Sonic consumes Ubuntu and Ventoy as deployment dependencies without taking over
their ownership boundaries.

## Testable Evidence

The current Round D evidence path is:

- `scripts/run-sonic-checks.sh`
- `scripts/first-run-preflight.sh`
- `scripts/smoke/ubuntu-ventoy-integration-smoke.sh`
- `bash scripts/demo-live-install-recovery.sh`

Those surfaces keep the media layout, install path, and recovery path explicit
without pretending Sonic owns runtime semantics after deployment.
