# VibeCLI Modular Architecture

## Overview

This directory demonstrates the proposed modular architecture for VibeCLI. The structure follows the principles outlined in the [VibeCLI Modularization Plan](VIBECLI_MODULARIZATION_PLAN.md).

## Directory Structure

```
vibecli-modular/
├── core/                  # Core module - Content & data management
├── publishing/            # Publishing module - Static site generation
├── tui-go-react/          # TUI-Go-React module - Unified interfaces
│   ├── tui/              # Go terminal UI components
│   ├── react/            # React web UI components
│   └── shared/           # Shared logic and communication
├── grid-gui-surfaces/     # Grid/GUI module - Visual rendering
├── server/                # Server module - Backend services
├── utility/               # Utility module - System maintenance
├── dev/                   # Dev module - Development workflows
├── lib/
│   ├── shared-utils/    # Shared utilities and helpers
│   └── types/           # TypeScript type definitions
└── bin/                  # Entry point and CLI binaries
```

## Module Responsibilities

### 1. Core Module (`core/`)
**Responsibility**: Content and data management foundation

**Components**:
- Vault management
- Markdown processing
- Frontmatter handling
- Template system
- Tower of Knowledge
- Feeds management
- Maintenance (backup, restore, trash)

**Dependencies**: None (base module)

### 2. Publishing Module (`publishing/`)
**Responsibility**: Static site generation and deployment

**Components**:
- Static site builder
- Local preview server
- Deployment scripts (GitHub Pages, etc.)
- Font management

**Dependencies**: Core, GitHub module

### 3. TUI-Go-React Module (`tui-go-react/`)
**Responsibility**: Unified terminal and web interfaces

**Submodules**:
- `tui/`: Go-based terminal UI
  - Interactive menus
  - Keyboard navigation
  - Theme management
  - Widget system

- `react/`: React-based web UI
  - Reusable components
  - State management
  - Hot-reloading
  - Responsive design

- `shared/`: Shared logic
  - Communication layer (REST/WebSocket)
  - State synchronization
  - Type definitions
  - Utility functions

**Dependencies**: Core, Grid-GUI-Surfaces

### 4. Grid-GUI-Surfaces Module (`grid-gui-surfaces/`)
**Responsibility**: Visual rendering and surface management

**Components**:
- Grid rendering engine
- Surface creation/editing
- USXD support
- OBF UI blocks
- Theme management

**Dependencies**: Core, Core-Design

### 5. Server Module (`server/`)
**Responsibility**: Backend services and automation

**Components**:
- A2 server/bridge
- Workflow server
- Beacon scanning
- API endpoints

**Dependencies**: Core, Dev

### 6. Utility Module (`utility/`)
**Responsibility**: System maintenance and utilities

**Components**:
- Extended maintenance (logs, cache, cleanup)
- File commands (tidy, ping, health checks)
- System utilities

**Dependencies**: None

### 7. Dev Module (`dev/`)
**Responsibility**: Development workflows and automation

**Components**:
- GitHub integration (clone, pull, push, PR/issue management)
- Workflow automation (create, run, schedule)
- App (uos) and adaptor validation

**Dependencies**: Core, Server

## Shared Resources

### lib/shared-utils/
Common utilities used across multiple modules:
- File I/O helpers
- Logging system
- Error handling
- Validation functions
- Testing utilities

### lib/types/
TypeScript type definitions for:
- Module interfaces
- Shared data structures
- API contracts
- Configuration schemas

## Plugin System

### Dynamic Loading
Modules can be loaded dynamically based on:
- Command-line arguments
- Configuration settings
- Environment variables

### Dependency Injection
Modules receive dependencies through:
- Constructor injection
- Factory functions
- Service locator pattern

### Lazy Loading
Non-essential modules are loaded only when needed:
- Reduces startup time
- Lowers memory footprint
- Improves performance

## Communication Between Modules

### Core → TUI-Go-React
```
Core Module (Content API) → TUI-Go-React Module
  - Provides content access
  - Handles business logic
  - Manages state

TUI-Go-React Module → Core Module
  - Requests content
  - Triggers actions
  - Updates state
```

### TUI-Go-React Internal
```
Go TUI ↔ Shared Layer ↔ React Components
  - State synchronization
  - Event propagation
  - Data transformation
```

## Example Workflows

### 1. User Runs CLI Command
```
User → bin/vibe → Core Module → (Optional: TUI-Go-React)
  - Command parsing
  - Module loading
  - Execution
  - Output
```

### 2. User Opens Terminal UI
```
User → bin/vibe tui → TUI-Go-React Module → Go TUI
  - Initialize terminal
  - Load menus
  - Handle input
  - Render output
```

### 3. User Opens Web UI
```
User → bin/vibe react → TUI-Go-React Module → React Components
  - Start dev server
  - Load components
  - Connect to backend
  - Enable hot-reloading
```

## Development Guidelines

### Adding a New Module
1. Create module directory
2. Define module interface
3. Implement core functionality
4. Add to plugin system
5. Document API

### Module Interface Requirements
- Clear input/output contracts
- Error handling specification
- Performance guarantees
- Documentation

### Testing Requirements
- Unit tests (90% coverage)
- Integration tests
- End-to-end tests
- Performance benchmarks

## Migration Guide

### From Monolithic to Modular
1. Identify module boundaries
2. Extract module code
3. Define interfaces
4. Implement plugin loading
5. Test backward compatibility

### Backward Compatibility
- Command aliasing
- Deprecation warnings
- Migration scripts
- Documentation updates

## Performance Considerations

### Startup Time
- Core module: <200ms
- With TUI-Go-React: <500ms
- Full load: <1000ms

### Memory Usage
- Core only: <50MB
- With UI modules: <100MB
- Peak usage: <150MB

### Optimization Strategies
- Lazy loading
- Code splitting
- Caching
- Memory pooling

## Future Enhancements

### Planned Features
1. **Module Marketplace**: Discover and install community modules
2. **Remote Modules**: Load modules from network sources
3. **Sandboxing**: Isolate modules for security
4. **Hot Reloading**: Live module updates without restart

### Potential Extensions
1. **Browser Extension**: Chrome/Firefox integration
2. **Mobile App**: iOS/Android wrappers
3. **Cloud Sync**: Cross-device state synchronization
4. **AI Integration**: Smart suggestions and automation

## Getting Started

### For Developers
1. Clone repository
2. Install dependencies
3. Build core module
4. Run tests
5. Start developing

### For Users
1. Install VibeCLI
2. Explore commands
3. Try TUI mode
4. Launch web UI
5. Provide feedback

## Support

### Documentation
- Module API references
- Contribution guidelines
- Architecture decisions
- Migration guides

### Community
- GitHub issues
- Discussion forums
- Discord server
- Weekly office hours

## License

MIT License - See LICENSE file for details

---

*Generated by Mistral Vibe*  
*Co-Authored-By: Mistral Vibe <vibe@mistral.ai>*  
*Date: 2024-04-18*  
*Version: 1.0.0*