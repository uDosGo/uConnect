# uDosGo Workspace Setup Guide

## Overview

This document explains the uDosGo workspace structure and how to set up the development environment.

## Workspace Structure

The workspace is organized into multiple directories, each serving a specific purpose:

### Core Directories

- **uDosGo** (current directory): Main project containing:
  - `uCode1/`: Pure Python core components
  - `uCode2/`: Rust + React core components
  - `core/`: Core components and MCP gateway
  - `docs/`: Documentation
  - `scripts/`: Utility scripts

- **DevStudio**: Development environment and tools
- **OkAgentDigital**: Related project
- **Projects**: Other projects
- **Sandbox**: Experimental code
- **Toybox**: Utilities and helpers
- **Vendor**: Third-party dependencies
- **Apps**: Application-specific code
- **Vault**: Secure storage

## Development Environment Setup

### Prerequisites

- macOS with zsh shell
- Python 3.9+
- Rust 2024 edition
- Node.js (for React surfaces in uCode2)

### Building the Project

1. **Build uCode2 Rust workspace:**
   ```bash
   cd uCode2
   cargo build --workspace
   ```

2. **Run Python tests:**
   ```bash
   cd uCode1
   python3 -m pytest tests/ test_*.py
   ```

### Starting the MCP Server

1. In one terminal:
   ```bash
   cd uCode2
   cargo run --package ucode2-mcp
   ```

2. In another terminal, test the connection:
   ```bash
   cd uCode1
   python3 -m pytest test_mcp_connection.py
   ```

## Workspace Configuration

The VS Code workspace is configured in `uDosGo.code-workspace` with absolute paths to all directories. The workspace includes settings to:

- Show `.git` directories (for better version control visibility)
- Exclude `node_modules` and `.DS_Store` files
- Disable Makefile configuration on open

## Architecture Overview

uDosGo follows a tiered architecture with clear separation of concerns:

- **uCode1**: Pure Python, zero Rust dependencies
- **uCode2**: Rust core + React/Vue rich UI surfaces
- **uCode3**: Extended Rust components (optional)

For more details, see `ARCHITECTURE_README.md` and `UCODE1_UCODE2_BOUNDARIES.md`.

## Launching the System

Use the `uDosGoStart.sh` script to install dependencies and launch the system:

```bash
./uDosGoStart.sh
```

This script:
1. Installs Rust if not present
2. Installs dependencies
3. Runs self-heal checks
4. Builds uCode2
5. Launches the ucode1 CLI in Rust TUI mode

## Troubleshooting

- If paths don't resolve correctly, verify the workspace file paths
- Check `uDosGo_install.log` for build and installation details
- Run individual components manually for debugging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests to ensure nothing is broken
5. Commit your changes with descriptive messages
6. Push to your fork and submit a pull request