---
title: "uCode User Manual (v1.4)"
tags: [--public]
audience: public
slot: 5
---

# uCode User Manual (v1.4)

**Status:** Active for v1.4 (Alpha)

## Overview

uCode is the command-line interface for uDos. It provides commands for vault management, spatial surfaces, and publishing.

## Installation

```bash
npm install -g @udos/core
```

## Commands

### Vault

| Command | Description |
|---------|-------------|
| `udo init` | Initialize vault |
| `udo vault init [path]` | Initialize vault at path |
| `udo list` | List vault contents |
| `udo open <file>` | Open file in editor |
| `udo edit <file>` | Edit file in terminal |
| `udo delete <file>` | Move to compost |
| `udo restore <id>` | Restore from compost |
| `udo search <query>` | Search vault |

### Markdown

| Command | Description |
|---------|-------------|
| `udo md format <file>` | Format markdown |
| `udo md lint <file>` | Check syntax |
| `udo md toc <file>` | Generate table of contents |

### Frontmatter

| Command | Description |
|---------|-------------|
| `udo fm add <file> --tag <tag>` | Add frontmatter tag |
| `udo fm list <file>` | List frontmatter fields |
| `udo fm edit <file>` | Edit frontmatter |

### Templates

| Command | Description |
|---------|-------------|
| `udo template list` | List templates |
| `udo template apply <name>` | Apply template |
| `udo template show <name>` | Show template |

### Feeds

| Command | Description |
|---------|-------------|
| `udo feed list` | List feeds |
| `udo feed view <name>` | View feed |
| `udo feed show <name>` | Show feed |
| `udo feed enable <name>` | Enable feed |
| `udo feed disable <name>` | Disable feed |
| `udo feed test <name> --dry-run` | Test feed |
| `udo feed export <name>` | Export feed |

### Spools

| Command | Description |
|---------|-------------|
| `udo spool list` | List spools |
| `udo spool info <name>` | Show spool info |
| `udo spool show <name>` | Show spool |
| `udo spool run <name> [--dry-run]` | Run spool |
| `udo spool run --all [--dry-run]` | Run all spools |
| `udo spool status` | Show status |
| `udo spool extract <name>` | Extract spool |

### Publishing

| Command | Description |
|---------|-------------|
| `udo publish build` | Build static site |
| `udo publish preview` | Preview locally |
| `udo publish status` | Show status |
| `udo publish deploy` | Deploy to GitHub Pages |

### GitHub

| Command | Description |
|---------|-------------|
| `udo github clone <repo>` | Clone repo |
| `udo github pull` | Pull from origin |
| `udo github push` | Push to origin |
| `udo github status` | Show status |
| `udo github sync` | Pull then push |
| `udo github fork [repo]` | Fork repo |
| `udo github release <tag>` | Create release |
| `udo github configure` | Configure GitHub |

### Sync

| Command | Description |
|---------|-------------|
| `udo sync status` | Show sync status |
| `udo sync pull` | Pull from cloud |
| `udo sync push` | Push to cloud |

### Workflow

| Command | Description |
|---------|-------------|
| `udo workflow list` | List workflows |
| `udo workflow create <name> --step <action>` | Create workflow |
| `udo workflow run <name>` | Run workflow |
| `udo workflow schedule <name> --cron <cron>` | Schedule workflow |
| `udo workflow status <name>` | Show status |
| `udo workflow logs <name>` | Show logs |

### A2 Server

| Command | Description |
|---------|-------------|
| `udo a2 configure --url <url> [--api-key]` | Configure A2 |
| `udo a2 status` | Show A2 status |
| `udo a2 server start|stop|status|logs` | Manage A2 server |
| `udo a2 server configure --port <port>` | Configure A2 server |

### USXD

| Command | Description |
|---------|-------------|
| `udo usxd list` | List USXD themes |
| `udo usxd apply <name>` | Apply USXD theme |
| `udo usxd show` | Show active USXD theme |
| `udo usxd serve [--file|--dir] [--port]` | Serve USXD |
| `udo usxd export [--file|--dir] -o <dir> [--format html|svg]` | Export USXD |
| `udo usxd render <file> [--mode]` | Render USXD |
| `udo usxd edit [file]` | Edit USXD |
| `udo usxd validate <file>` | Validate USXD |

### GUI

| Command | Description |
|---------|-------------|
| `udo gui` | Start GUI |
| `udo gui start` | Start GUI |
| `udo gui index` | Open GUI index |
| `udo gui demos` | Start GUI demos |
| `udo gui status` | Show GUI status |
| `udo gui logs` | Show GUI logs |
| `udo gui open` | Open GUI |
| `udo gui stop` | Stop GUI |

### Grid

| Command | Description |
|---------|-------------|
| `udo grid render <file> [--mode]` | Render grid |
| `udo grid export <file> --format ascii|obf|…` | Export grid |
| `udo grid validate <file>` | Validate grid |
| `udo grid edit <file>` | Edit grid |
| `udo grid resize <file> --size WxH` | Resize grid |
| `udo grid rotate <file> --degrees 90|180|270` | Rotate grid |
| `udo grid flip <file> [--horizontal|--vertical]` | Flip grid |
| `udo grid layer add <file> --name <name>` | Add layer |
| `udo grid layer list <file>` | List layers |
| `udo grid layer show <file> --layer <index>` | Show layer |
| `udo grid layer merge <file> --layers 0,1,2` | Merge layers |

### Spatial Algebra (v1.4)

| Command | Description |
|---------|-------------|
| `udo cell <x> <y> <z>` | Navigate to voxel cell |
| `udo cube <x> <y>` | Render depth cube |
| `udo surface create <id>` | Create surface |
| `udo surface list` | List surfaces |
| `udo surface show <id>` | Show surface |

### Tower of Knowledge (v1.4)

| Command | Description |
|---------|-------------|
| `udo tower view` | View all slots |
| `udo tower list <slot>` | List surfaces in slot |
| `udo tower move <surface> --to <slot>` | Move surface to slot |
| `udo tower publish <surface>` | Publish to slot 5 |

### Font

| Command | Description |
|---------|-------------|
| `udo font install [retro]` | Install font |
| `udo font list` | List fonts |
| `udo font activate <name>` | Activate font |
| `udo font preview <name>` | Preview font |

### Trash

| Command | Description |
|---------|-------------|
| `udo trash move <file>` | Move to trash |
| `udo trash restore <idOrPath> [--to <path>]` | Restore from trash |
| `udo trash list` | List trash |
| `udo trash search <query>` | Search trash |
| `udo trash clean [--older-than 30d] [--priority-binary] [--dry-run]` | Clean trash |

### Utility

| Command | Description |
|---------|-------------|
| `udo status` | Show status |
| `udo doctor` | Health check |
| `udo cleanup` | Clean cache |
| `udo clean [--logs] [--dry-run]` | Clean logs |
| `udo tidy` | Tidy vault |
| `udo ping` | Ping |
| `udo pong` | Pong |
| `udo health [--quick]` | Health report |
| `udo version` | Show version |
| `udo tour` | Tour |
| `udo update` | Update |
| `udo uninstall` | Uninstall |
| `udo help` | Show help |

## Examples

### Spatial Algebra

```bash
# Navigate to a cell
udo cell 1 2 0

# Render a cube (with uGridComposer)
udo cube 1 2

# Create a surface
udo surface create my-surface --cubes 1,2,3,4

# List surfaces
udo surface list

# Show surface with cube preview
udo surface show my-surface
```

### Tower of Knowledge

```bash
# View tower
udo tower view

# List surfaces in slot 5
udo tower list slot5

# Publish a surface
udo tower publish my-surface
```

### Localhost Surfaces

- **Private:** `http://localhost:3000/tower/slot0/my-surface`
- **Public:** `http://localhost:3000/tower/slot5/my-surface`

## See Also

- [docs/specs/v4/UDOS_SPATIAL_ALGEBRA_LOCKED_v1.2.md](docs/specs/v4/UDOS_SPATIAL_ALGEBRA_LOCKED_v1.2.md)
- [docs/specs/v4/UDOS_TOWER_OF_KNOWLEDGE_LOCKED_v1.md](docs/specs/v4/UDOS_TOWER_OF_KNOWLEDGE_LOCKED_v1.md)
- [docs/specs/v4/UDOS_UCELL_VOXEL_MAPPING_v1.md](docs/specs/v4/UDOS_UCELL_VOXEL_MAPPING_v1.md)
- [modules/ugridcomposer/README.md](../../modules/ugridcomposer/README.md) — uGridComposer module
