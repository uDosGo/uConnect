# uDos Architecture

## Overview

uDos is a modular, vault-native development platform designed for knowledge management and productivity.

## Core Components

### Vault-Native Architecture
- **Vault Structure**: Follows Obsidian-like vault structure
- **Templates**: Reusable templates for content creation
- **Modules**: Independent functional units

### Development Stack
- **Frontend**: Vue.js 3
- **Backend**: Node.js with TypeScript
- **Build**: npm workspaces
- **Testing**: Jest, ESLint
- **CI/CD**: GitHub Actions

## Key Features

### Modular Design
- Independent modules can be developed and deployed separately
- Core functionality remains stable while modules evolve

### Template System
- USXD templates for consistent content structure
- Theme support for customization
- Seed templates for quick project startup

### Development Tools
- **Sonic Express**: Fast development server
- **USXD Express**: USXD processing pipeline
- **Vault Manager**: Vault operations and management

## Development Workflow

1. **Local Development**: Use `npm run dev` for local development
2. **Testing**: Run `npm test` for unit tests
3. **Building**: `npm run build` for production builds
4. **Deployment**: Automated via GitHub Actions

## Integration Points

- **VibeCLI**: Configuration validation
- **uDos Feed**: Notification system
- **Webhooks**: External integrations

## Future Directions

- Enhanced modularization
- Improved template system
- Better CI/CD integration
- Expanded testing coverage
