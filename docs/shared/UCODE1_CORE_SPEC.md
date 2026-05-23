# uCode1 Core Runtime Specification

**Unified standard for the uDos foundation layer — grid, cell, cube, teletext, BASIC, UDO, MCP**

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        uCode1 Core Runtime                          │
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌───────────────────────────┐  │
│  │  Grid/Cell   │  │  BBC BASIC  │  │  UDO Runtime              │  │
│  │  System      │  │  Interpreter│  │  (Skills, Tasks, Vars,    │  │
│  │  (coords,    │  │  (brandy,   │  │   Agents, Workflows,      │  │
│  │   layers,    │  │   evaluator,│  │   Publish, Checks)        │  │
│  │   cube, hex) │  │   vdu)      │  │                           │  │
│  └──────┬───────┘  └──────┬──────┘  └───────────┬───────────────┘  │
│         │                 │                      │                  │
│         └─────────────────┼──────────────────────┘                  │
│                           │                                         │
│                    ┌──────▼───────┐                                 │
│                    │  MCP Client  │                                 │
│                    │  (→ uCode2   │                                 │
│                    │   Gateway)   │                                 │
│                    └──────────────┘                                 │
│                           │                                         │
└───────────────────────────┼─────────────────────────────────────────┘
                            │
                    ┌───────▼────────┐
                    │  uCode2 MCP    │
                    │  Gateway       │
                    │  (ucode2.sock) │
                    └───────┬────────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                  │
   ┌──────▼──────┐  ┌──────▼──────┐  ┌───────▼───────┐
   │  uServer    │  │  uSystem    │  │  uPlace       │
   │  Hivemind   │  │  (Rust)     │  │  (Location)   │
   │  Snackbar   │  │  Monitoring │  │  Maps/Layers  │
   │  Feed Spool │  │             │  │               │
   └─────────────┘  └─────────────┘  └───────────────┘
```

## 1. Grid/Cell System

### Coordinate Systems

| System | Type | Description |
|--------|------|-------------|
| `CARTESIAN` | (x, y) | Standard 2D grid, y-down |
| `CARTESIAN_UP` | (x, y) | Standard 2D grid, y-up |
| `CUBE` | (x, y, z) | Hex grid cube coordinates (x + y + z = 0) |
| `AXIAL` | (q, r) | Hex grid axial coordinates |
| `OFFSET_EVEN` | (x, y) | Offset coordinates (even rows) |
| `OFFSET_ODD` | (x, y) | Offset coordinates (odd rows) |

### GridCell

```python
@dataclass
class GridCell:
    data: Optional[T]       # Arbitrary cell data
    x: int                  # Column
    y: int                  # Row
    fg_color: Optional[str] # Foreground color
    bg_color: Optional[str] # Background color
    char: Optional[str]     # Display character
    bold: bool              # Bold text
    underline: bool         # Underline text
    blink: bool             # Blinking text
    cell_type: Optional[str]# Semantic type
    tags: List[str]         # Classification tags
    metadata: Dict          # Additional metadata
```

### Grid

```python
@dataclass
class Grid:
    width: int              # Number of columns
    height: int             # Number of rows
    cells: List[List[GridCell]]  # 2D cell array
    metadata: Dict          # Grid-level metadata
```

### GridLayer (Maps Panel)

```python
@dataclass
class GridLayer:
    id: str                 # Unique identifier
    name: str               # Display name
    visible: bool           # Visibility toggle
    zIndex: int             # Stacking order
    color: str              # Layer color
```

### Cube (3D Grid)

```python
# From uCode2 grid_core
# Cube coordinates for spatial/3D operations
# x + y + z = 0 constraint for hex grids
```

## 2. Teletext / Ceefax (40×24)

### Grid Regions

| Region | Rows | Columns | Purpose |
|--------|------|---------|---------|
| Header | 1-2 | 1-40 | Title, branding |
| Nav | 3 | 1-40 | Navigation tabs |
| Sidebar | 4-20 | 1-12 | Menu, navigation |
| Main | 4-20 | 13-40 | Content area |
| Status | 21-22 | 1-40 | Status bar |
| Footer | 23-24 | 1-40 | Controls, info |

### Display Modes

| Mode | Background | Foreground | Use Case |
|------|-----------|------------|----------|
| `teletext` | #000000 | #FFFFFF | Classic Ceefax |
| `mono` | #000000 | #00FF00 | Terminal |
| `wireframe` | #FFFFFF | #000000 | Blueprint |

## 3. BBC BASIC Runtime

### Components

| Module | Purpose |
|--------|---------|
| `brandy.py` | Brandy BASIC interpreter bridge |
| `evaluator.py` | Expression evaluator |
| `interpreter.py` | Statement interpreter |
| `vdu.py` | VDU driver (screen output) |
| `memory.py` | Variable memory management |
| `skin.py` | UI skin/theming |
| `lens.py` | Lens system (AI integration) |
| `lens_rules.py` | Lens rule definitions |
| `lens_skin_mcp.py` | Lens MCP bridge |
| `mcp_bridge.py` | MCP communication bridge |
| `spool_bridge.py` | Feed spool bridge |

## 4. UDO Runtime

### Core Entities

| Entity | File | Purpose |
|--------|------|---------|
| `UDOSkill` | `udo-core.md` | Invocable capability |
| `UDOTask` | `udo-task.md` | Work item with state |
| `UDOVariable` | `udo-variable.md` | Configuration & secrets |
| `UDOAgent` | `udo-agent.md` | AI/automation definition |
| `UDOWorkflow` | `udo-workflow.md` | Multi-step process |
| `UDOPublishTarget` | `udo-publish.md` | Release destination |
| `MCPServerStatus` | `udo-core.md` | MCP server state |
| `CheckResult` | `udo-core.md` | Health check result |

### Runtime API

```python
class UDORuntime:
    # Skills
    list_skills() -> List[UDOSkill]
    enable_skill(skill_id) -> bool
    disable_skill(skill_id) -> bool
    run_skill(skill_id) -> Dict

    # Tasks
    list_tasks() -> List[UDOTask]
    create_task(type, priority) -> UDOTask
    cancel_task(task_id) -> bool
    retry_task(task_id) -> bool

    # Variables
    list_variables() -> List[UDOVariable]
    set_variable(key, value, scope, encrypted) -> bool
    delete_variable(key) -> bool

    # Agents
    list_agents() -> List[UDOAgent]
    start_agent(agent_id) -> bool
    stop_agent(agent_id) -> bool
    get_agent_health(agent_id) -> Dict

    # Workflows
    list_workflows() -> List[UDOWorkflow]
    run_workflow(workflow_id) -> bool
    disable_workflow(workflow_id) -> bool
    create_workflow(name, description) -> UDOWorkflow

    # Publish
    list_publish_targets() -> List[UDOPublishTarget]
    publish_to(target_id, content) -> Dict

    # Vault
    list_vault_entries(path) -> List[Dict]
    read_vault_file(path) -> Dict
    write_vault_file(path, content) -> bool

    # MCP
    get_mcp_status() -> List[MCPServerStatus]
    start_mcp_server(server_id) -> bool
    stop_mcp_server(server_id) -> bool
    call_mcp_tool(server_id, tool, args) -> Any

    # Checks
    list_checks() -> List[CheckResult]
    run_check(check_id) -> bool
    get_check_results(check_id) -> Optional[CheckResult]

    # Command
    execute_command(command) -> Dict
```

## 5. MCP Protocol

### Socket Layout

| Socket | Server | Protocol | Purpose |
|--------|--------|----------|---------|
| `~/.local/share/udos/ucode2.sock` | uCode2 Gateway | Length-prefixed JSON-RPC 2.0 | Single client entry point |
| `~/.local/share/udos/mcp/core.sock` | uCode3 Rust MCP | Newline-delimited JSON | Core vault/ok-seeker backend |
| `~/.local/share/udos/mcp/homenest.sock` | uCode3 Rust MCP | Newline-delimited JSON | Media/TV/automation backend |
| `/tmp/hivemind-mcp.sock` | uServer Hivemind | JSON-RPC | AI provider routing |

### Method Namespaces

| Prefix | Handler | Backend |
|--------|---------|---------|
| `vault.*` | Local Python | uCode2 VaultBridge |
| `feed.*` | Local Python | uCode2 FeedSpool |
| `spatial.*` | Local Python | uCode2 Spatial |
| `seek.*` | Local Python | uCode2 OkSeeker |
| `grid.*` | Local Python | uCode2 GridCore |
| `marked.*` | Local Python | uCode2 Marked |
| `core.*` | Routed to Rust | uCode3 core.sock |
| `homenest.*` | Routed to Rust | uCode3 homenest.sock |
| `ping`, `status`, `list_methods` | Built-in | Gateway itself |

## 6. Panel → Backend Wiring

| gridui Panel | Backend | MCP Method | Protocol |
|-------------|---------|------------|----------|
| Terminal | uScript | `core.terminal.execute` | uCode2 Gateway |
| Teledesk | uSystem | `core.system.status` | uCode2 Gateway |
| Dashboard | binder | `core.binder.tasks` | uCode2 Gateway |
| VaultDocs | uServer | `vault.*` | uCode2 Gateway (local) |
| MapsLayers | uPlace | `spatial.*` / `grid.*` | uCode2 Gateway (local) |

## 7. Skills / Snacks / Spices

### Skill (UDO Skill)
```yaml
# ~/Code/uCode1/snacks/ceetex/snack.yaml
id: snack-ceetex
name: Ceetex Teletext
description: Ceefax-style teletext viewer
trigger: manual
action: ceetex-viewer
```

### Snack (Snackbar Snack)
```json
// ~/Code/uServer/tinshed/snackbar/snacks/auto-label@devstudio/manifest.json
{
  "id": "auto-label@devstudio",
  "name": "Auto Label",
  "description": "Auto-label GitHub issues",
  "version": "1.0.0",
  "entry": "main.ts"
}
```

### Spice (Snackbar Spice)
```json
// ~/Code/uServer/tinshed/snackbar/spices/
{
  "id": "spice-name",
  "name": "Spice Name",
  "description": "Spice description",
  "version": "1.0.0"
}
```

## 8. USX Grid CSS Tokens

### Grid Layout Primitives (in `@usx/components/`)

| Class | Purpose |
|-------|---------|
| `.usx-grid` | 40×24 teletext grid container |
| `.usx-grid-cell` | Individual grid cell |
| `.usx-grid-row` | Grid row (display: contents) |
| `.usx-grid-header` | Header region (rows 1-2) |
| `.usx-grid-nav` | Navigation region (row 3) |
| `.usx-grid-sidebar` | Sidebar region (rows 4-20, cols 1-12) |
| `.usx-grid-main` | Main content (rows 4-20, cols 13-40) |
| `.usx-grid-status` | Status bar (rows 21-22) |
| `.usx-grid-footer` | Footer (rows 23-24) |
| `.usx-teletext-btn` | Teletext-style button |
| `.usx-teletext-panel` | Teletext-style panel |
| `.usx-teletext-input` | Teletext-style input |

### Grid Tokens

| Token | Default | Purpose |
|-------|---------|---------|
| `--usx-grid-cell-width` | 24px | Cell width |
| `--usx-grid-cell-height` | 24px | Cell height |
| `--usx-grid-gap` | 2px | Gap between cells |
| `--usx-grid-visible` | true | Grid visibility |

## 9. PyCharm Development Setup

### Project Structure
```
~/Code/uCode1/          # Python package (core_py/)
~/Code/uCode2/          # Python + Rust package
~/Code/uServer/         # Rust workspace (tinshed/)
~/Code/uSystem/         # Rust crate
~/Code/uPlace/          # Location configs
~/Code/uScript/         # Shell scripts
~/Code/uConnect/gridui/ # Vue frontend
```

### Run Configurations

| Name | Command | Working Dir |
|------|---------|-------------|
| uCode1 CLI | `python -m ucode1.cli --repl` | `~/Code/uCode1` |
| uCode2 Gateway | `python -m ucode2.mcp.gateway` | `~/Code/uCode2` |
| Hivemind | `cargo run --release -p hivemind` | `~/Code/uServer/tinshed` |
| Snackbar | `cargo run --release -p snackbar` | `~/Code/uServer/tinshed` |
| gridui | `npm run dev` | `~/Code/uConnect/gridui` |

### Makefile Targets
```makefile
run-cli:        # uCode1 REPL
run-gateway:    # uCode2 MCP Gateway
run-hivemind:   # uServer Hivemind
run-snackbar:   # uServer Snackbar
run-gridui:     # Vue dev server
run-all:        # Start all services
test:           # Run all tests
build:          # Build all Rust crates
```

---

*Version: 1.0.0*
*Last Updated: 2026-05-23*
