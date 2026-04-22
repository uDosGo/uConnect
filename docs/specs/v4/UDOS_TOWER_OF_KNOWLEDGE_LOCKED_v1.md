---
title: "Tower of Knowledge v1 (Locked)"
tags: [--public]
audience: public
slot: 5
---

# Tower of Knowledge v1

**Status:** Locked for v1.4 (Alpha)

## Overview

The **Tower of Knowledge** defines a **slot-based storage system** for uDos surfaces, cells, and cubes. Slots control **privacy**, **publication**, and **sync** rules.

## Slots

| Slot | Name | Privacy | Sync | Color |
|------|------|---------|------|-------|
| 0 | Private | Local only | Never | Black |
| 1 | Public Local | LAN | Opt-in | Green |
| 2 | Password Local | LAN + Password | Opt-in | Yellow |
| 3 | Group Local | LAN + Group | Opt-in | Orange |
| 4 | Unpublished Cloud | User only | Always | White |
| 5 | Published Public | Cloud | Always | Blue |
| 6 | Password Cloud | Cloud + Password | Always | Purple |
| 7 | Group Cloud | Cloud + Group | Always | Red |

## Directory Structure

```
~/vault/tower/
├── slot_0_private/
├── slot_1_public_local/
├── slot_2_password_local/
├── slot_3_group_local/
├── slot_4_unpublished_cloud/
├── slot_5_published_public/
├── slot_6_password_cloud/
├── slot_7_group_cloud/
```

## Commands

### uCode
```bash
# View tower
udo tower view

# Move a surface to slot 5 (publish)
udo tower move --from slot4 --to slot5

# List surfaces in slot 5
udo tower list slot5
```

### Localhost Surface
- **URL:** `http://localhost:3000/tower/slot5`
- **Global Knowledge Bank:** Slot 5 surfaces are public.

## Rules

1. **Slot 0:** Never syncs (local only).
2. **Slots 1–3:** LAN-only (opt-in sync).
3. **Slots 4–7:** Cloud-enabled (always sync).
4. **Slot 5:** Publicly accessible (Global Knowledge Bank).

## Examples

### Publish a Surface
```bash
# Create a surface
udo surface create my-surface

# Move to slot 5 (publish)
udo tower move my-surface --to slot5
```

### Access via Localhost
- **Private:** `http://localhost:3000/tower/slot0/my-surface`
- **Public:** `http://localhost:3000/tower/slot5/my-surface`

## See Also
- [UDOS_SPATIAL_ALGEBRA_LOCKED_v1.2.md](UDOS_SPATIAL_ALGEBRA_LOCKED_v1.2.md) — Spatial algebra.
- [UDOS_UCELL_VOXEL_MAPPING_v1.md](UDOS_UCELL_VOXEL_MAPPING_v1.md) — Economy mapping.
