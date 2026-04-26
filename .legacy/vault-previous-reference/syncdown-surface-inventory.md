# Syncdown v4 Surface Inventory (USXD)

Status: locked companion file for `syncdown_v_4_universal_surface_xd_integration.md`

## Figma source lanes

- `syncdown-mdcv3-app` — MDC v3 app Figma lane (legacy reference, migration parity)
- `syncdown-mdcv4-app` — MDC v4 / Syncdown app Figma lane (primary rich browser source)

## Canonical surface inventory

| Surface ID | Kind | Primary Regions | Browser Adapter | ThinUI | Notes |
| --- | --- | --- | --- | --- | --- |
| `syncdown-shell` | `panel` | `header`, `nav`, `controls`, `primary`, `inspector`, `status` | `material3-surface-syncdown` | Partial | App chrome and route host |
| `syncdown-records-table` | `table` | `header`, `controls`, `primary`, `inspector`, `status` | `material3-surface-syncdown` | Optional | Operational records/table lane |
| `syncdown-inbox-list` | `list` | `header`, `controls`, `primary`, `status` | `material3-surface-syncdown` | Optional | Triage and queue lane |
| `syncdown-board` | `board` | `header`, `controls`, `primary`, `inspector`, `status` | `material3-surface-syncdown` | No | Stage/status grouping lane |
| `syncdown-timeline` | `timeline` | `header`, `controls`, `primary`, `inspector`, `status` | `material3-surface-syncdown` | Optional | Temporal lane |
| `syncdown-rules` | `workflow` | `header`, `controls`, `primary`, `inspector`, `status` | `material3-surface-syncdown` | Limited | Rule editor/runtime lane |
| `syncdown-activity-feed` | `feed` | `header`, `controls`, `primary`, `inspector`, `status` | `material3-surface-syncdown` | Yes | Feed/digest/spool-aware activity lane |
| `syncdown-connect-source` | `step-form` | `header`, `primary`, `secondary`, `status` | `material3-surface-syncdown` | Yes | Multi-step source connect + auth |
| `syncdown-handoff` | `handoff` | `header`, `primary`, `status` | `material3-surface-syncdown` | Yes | Recovery + open browser action |

## Colour/style-system lock for adapter

All Syncdown USXD browser adapter implementations must use semantic tokens from the v4 colour system:

- surfaces: `color.background|surface|surface-variant|surface-raised|surface-panel`
- text: `color.text.primary|secondary|muted|inverse`
- interaction: `color.primary*`, `color.secondary*`
- state/flags: `color.state.*`, `color.flag.*`

Mode rule: keep palette identity, flip tone usage by mode.
