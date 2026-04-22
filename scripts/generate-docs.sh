#!/bin/bash

# Documentation generation script for uDos
# This script generates comprehensive documentation for the project

echo "📚 Generating uDos documentation..."

set -e  # Exit on error

# Create docs directory if it doesn't exist
mkdir -p docs

# Generate API documentation
echo "Generating API documentation..."
npx typedoc --out docs/api src/index.ts 2>/dev/null || echo "⚠️  API documentation generation skipped (typedoc not available or no TypeScript source)"

# Generate markdown documentation from source code
echo "Generating markdown documentation..."

# Document core structure
cat > docs/STRUCTURE.md << 'EOF'
# uDos Project Structure

## Root Level
- `package.json`: Main package configuration
- `README.md`: Project overview
- `CONTRIBUTING.md`: Contribution guidelines
- `docs/`: Documentation directory
- `core/`: Core functionality
- `ui/`: User interface components
- `tools/`: Development tools
- `modules/`: Project modules
- `scripts/`: Utility scripts
- `templates/`: Project templates

## Key Components

### Core
The core directory contains the main business logic and functionality.

### UI
The UI directory contains Vue.js components and user interface code.

### Tools
Development tools including:
- `sonic-express`: Fast development server
- `usxd-express`: USXD processing tools

### Modules
Modular components that can be used independently or together.

## Development Workflow

1. **Installation**: `npm install`
2. **Building**: `npm run build`
3. **Testing**: `npm test`
4. **Linting**: `npm run lint`

## CI/CD Pipeline

The project uses GitHub Actions for continuous integration and deployment:
- Linting checks
- Unit tests
- Safety checks
- Documentation generation
- Production deployment
EOF

# Generate development guide
echo "Generating development guide..."
cat > docs/DEVELOPMENT_GUIDE.md << 'EOF'
# uDos Development Guide

## Getting Started

### Prerequisites
- Node.js >= 24
- npm >= 9
- Git

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/fredporter/uDos.git
   cd uDos
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install development tools:
   ```bash
   npm install --save-dev eslint eslint-plugin-vue @typescript-eslint/parser @typescript-eslint/eslint-plugin @eslint/js
   ```

## Development Scripts

- **Build**: `npm run build`
- **Test**: `npm run test`
- **Lint**: `npm run lint`
- **Lint (check only)**: `npm run lint:check`
- **Workspace validation**: `npm run workspace:drift`

## Pre-Commit Hooks

The project includes comprehensive pre-commit hooks that:
- Validate VibeCLI configuration
- Check for syntax errors
- Validate JSON/YAML files
- Run linting
- Check for large files
- Check for potential secrets

## CI/CD Workflow

The GitHub Actions workflow includes:
1. **Lint**: Code style checking
2. **Test**: Unit and integration tests
3. **Safety**: Security and boundary checks
4. **Documentation**: API and markdown documentation generation
5. **Deploy**: Production deployment (on main branch)

## Code Style

- Use ESLint for linting
- Follow Vue 3 style guide for components
- Use TypeScript for type safety
- Follow conventional commits format

## Commit Messages

Use conventional commits format:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test updates
- `chore`: Maintenance tasks

Example:
```bash
git commit -m "feat: Add user authentication module"
```

## Pull Requests

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Push to your fork
5. Open a pull request

## Issues

Report bugs and request features via GitHub Issues.
EOF

# Generate architecture documentation
echo "Generating architecture documentation..."
cat > docs/ARCHITECTURE.md << 'EOF'
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
EOF

echo "✅ Documentation generation completed!"
echo "📋 Generated documents:"
echo "   - docs/STRUCTURE.md"
echo "   - docs/DEVELOPMENT_GUIDE.md"
echo "   - docs/ARCHITECTURE.md"
echo "   - docs/api/ (API documentation)"

exit 0