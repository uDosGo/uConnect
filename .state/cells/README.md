# Cells Storage

This directory contains **Cell** storage units for the uDos Grid & Spatial Hierarchy system.

## Cell Structure

Each Cell is a 24×24 pixel unit (45KB storage) identified by a uCode coordinate:

```
L<level>-<gridXY>-<cellXY>-<layer>
```

Example: `L100-BB45-1010-2`

## Cell Content

Each Cell is stored as a JSON file with the following structure:

```json
{
  "qr_data": ["qr0_data", "qr1_data", ...],  // 3×3 QR grid
  "type": "email_store",
  "last_modified": "2026-04-26T10:00:00Z",
  "snack_id": "P100-U899"
}
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `ucode cell show L100-BB45-1010-2` | Display cell contents |
| `ucode cell write L100-BB45-1010-2 --data "..."` | Write data to cell |
| `ucode cell list --grid L100-BB45` | List all cells in a grid |

## Directory Structure

```
.state/cells/
├── L100/
│   ├── BB45/
│   │   ├── 1010-2.cell
│   │   └── ...
│   └── ...
└── README.md
```

## Notes

- Cells are used by **Snacks** as resources (read/write).
- Cells can be archived from the feed spool (9 replies per Cell).
- Cells are the atomic storage unit in the uDos spatial hierarchy.
