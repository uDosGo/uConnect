# uDos Architecture Overview

## Vision

uDos is a **unified development operating system** that integrates code, content, and collaboration into a single coherent workflow. It provides a modern alternative to traditional IDEs and development environments.

## Core Principles

1. **Unified Workflow**: Everything from code editing to deployment in one system
2. **Extensible**: Plugin architecture for customization
3. **Portable**: Works across platforms with consistent experience
4. **Open**: Built on open standards and protocols

## 4-Edition Roadmap

### Edition 1: Foundation (Current)
- Core CLI (`uCode1`)
- Vault-based storage system
- Basic plugin system
- ThinUI dashboard
- MCP server for inter-process communication

### Edition 2: Web & Collaboration
- Web publishing framework (`uCode2`)
- Real-time collaboration
- Cloud sync for vaults
- Plugin marketplace

### Edition 3: AI Integration
- Advanced OK agent capabilities
- Intent-based development
- Context-aware assistance
- Automated documentation

### Edition 4: Enterprise
- Team management
- Access control
- Audit logging
- Enterprise plugins

## Component Architecture

### 1. uCode1 - Core CLI

**Responsibilities:**
- Command processing
- Vault management
- Plugin loading
- MCP server
- Feed spool management

**Key Features:**
- Modular command system
- Unix domain socket IPC
- SQLite-based state management
- Rust implementation for performance

### 2. ThinUI - Dashboard

**Responsibilities:**
- Graphical interface
- Plugin management UI
- System monitoring
- Configuration

**Technology Stack:**
- Tauri for native desktop
- React for UI components
- TypeScript for logic
- CSS modules for styling

### 3. DevStudio - Developer Tools

**Responsibilities:**
- Plugin scaffolding
- Promotion workflow
- Health monitoring
- Build automation

**Key Features:**
- 4-stage promotion pipeline
- Automated health checks
- Compost cleanup
- Script generation

### 4. MCP Feed Spool

**Purpose:** Inter-process communication and event logging

**Features:**
- Unix domain socket server
- JSON-RPC protocol
- Event logging to `replies.jsonl`
- Queryable feed system

**Methods:**
- `ListNotes`, `ReadNote`, `SearchNotes`
- `ClassifyIntent`
- `Status`, `Ping`
- `Shutdown`

## Directory Structure

```
~/Code/uDosGo/
├── uCode1/          # Core CLI
├── ThinUI/          # Dashboard
├── DevStudio/       # Dev tools
├── Registry/        # Plugin registry
├── Sandbox/         # Testing area
├── docs/            # Documentation
├── scripts/         # Utility scripts
├── .compost/        # Deleted files (30d TTL)
├── .state/          # Working files
└── Vendor/          # External dependencies
```

## Plugin System

### Plugin Types

1. **Command Plugins**: Add new CLI commands
2. **UI Plugins**: Extend ThinUI interface
3. **Renderer Plugins**: Custom grid renderers
4. **Font Plugins**: Additional font providers
5. **Theme Plugins**: Visual themes

### Promotion Workflow

```
Toybox (Experimental) → Sandbox (Testing) → Launch (RC) → Deploy (Production)
```

### Plugin Requirements by Stage

| Stage | Requirements |
|-------|--------------|
| Toybox | None |
| Sandbox | Manifest, Tests |
| Launch | Signed, Documented |
| Deploy | Backward compatible |

## State Management

### State Database (`~/.udos/state.db`)

**Tables:**
- `plugins`: Plugin metadata and stage
- `hidden_folders`: Compost/state/legacy tracking
- `promotion_history`: Audit trail

### Vault System (`~/Code/Vault`)

**Structure:**
- `notes/`: Markdown notes
- `.uds/`: System state
- `plugins/`: Installed plugins
- `themes/`: UI themes

## Logging & Monitoring

### Feed Spool

**Location:** `~/Code/Vault/.uds/state/feed_spool/replies.jsonl`

**Format:** JSON Lines with timestamp, method, parameters, result

**Query:**
```bash
udos feed search --tag event,command
```

### Health Monitoring

**Scripts:**
- `health-check.sh`: Validate system state
- `clean-compost.sh`: Cleanup old files
- `promote-plugin.sh`: Stage promotion

**Schedule:**
- Daily health checks
- Weekly compost cleanup

## Development Mode

### Isolation

When `--dev` flag is used:
- Logs go to `~/.uds/dev/`
- State isolated from production
- Safe for experimentation

### Environment Variables

```bash
UDOS_DEV_MODE=1 udos note create test.md
```

## Integration Points

### ThinUI ↔ uCode1
- ThinUI loads plugins from uCode1 registry
- uCode1 provides MCP server for ThinUI
- Shared vault system

### DevStudio ↔ uCode1
- DevStudio uses uCode1 for plugin management
- Promotion workflow updates uCode1 state
- Health checks validate uCode1 components

### SonicScrewdriver ↔ All
- Automated health monitoring
- Feed spool analysis
- System alerts

## Future Architecture

### Copernicus Integration
- Spatial character mapping
- Grid-based UI system
- Retro computing support

### Spark Integration
- Web publishing framework
- Content management
- Static site generation

## Performance Considerations

- **Rust core**: High-performance CLI
- **SQLite**: Efficient state management
- **Tauri**: Lightweight desktop apps
- **Unix sockets**: Low-latency IPC

## Security Model

- **Sandboxing**: Plugins run in isolated contexts
- **Signing**: Production plugins must be signed
- **Audit**: All promotions logged
- **Permissions**: Fine-grained access control

## Documentation Standards

- **Format**: Markdown
- **Location**: Centralized `docs/` directory
- **Versioning**: Semantic versioning
- **Publishing**: GitHub Pages via SonicExpress

## License

MIT License for core components
Apache 2.0 for some plugins
Check individual components for specifics