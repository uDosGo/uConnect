# uDos Documentation

Welcome to the uDos documentation hub. Here you'll find comprehensive guides, API references, and architectural information.

## Getting Started

- **[Development Guide](DEVELOPMENT_GUIDE.md)**: Everything you need to start developing with uDos
- **[Project Structure](STRUCTURE.md)**: Overview of the project organization
- **[Architecture](ARCHITECTURE.md)**: Technical architecture and design principles

## API Documentation

- **[API Reference](api/)**: Auto-generated API documentation

## Additional Resources

- **[Contributing](../CONTRIBUTING.md)**: How to contribute to uDos
- **[Templates](../../templates/)**: Project templates and examples
- **[Scripts](../../scripts/)**: Utility scripts for development

## Documentation Source of Truth

**Important:** This repository contains a **read-only mirror** of the documentation. The **source of truth** for all uDos documentation is located in `~/Vault/documentation/`.

### Workflow

1. **Edit Documentation**: All changes must be made in `~/Vault/documentation/`.
2. **Sync to Repositories**: Run the sync script to push updates to all repositories:
   ```bash
   ~/Vault/documentation/sync-to-upstream.sh
   ```
3. **Compile View**: Generate the compiled view for local browsing:
   ```bash
   ~/Code/Docs/compile.sh
   ```

### Rules

- **Never edit documentation directly in this repository.**
- **Never commit documentation changes directly to GitHub.**
- Always edit the source in `~/Vault/documentation/` and sync.

## Ecosystem Structure

The uDos ecosystem is organized into two main GitHub organizations:

1. **AgentDigitalOK**: Core infrastructure and open-source projects.
   - [Docs](https://github.com/AgentDigitalOK/Docs)
   - [Framework](https://github.com/AgentDigitalOK/Framework)
   - [Hivemind](https://github.com/AgentDigitalOK/Hivemind)
   - [Re3ngine](https://github.com/AgentDigitalOK/Re3ngine)
   - [PublishLane](https://github.com/AgentDigitalOK/PublishLane)

2. **uDosGo**: Consumer-facing applications and tools.
   - [Connect](https://github.com/uDosGo/Connect)
   - [GrooveBox](https://github.com/uDosGo/GrooveBox)
   - [Home](https://github.com/uDosGo/Home)
   - [SonicScrewdriver](https://github.com/uDosGo/SonicScrewdriver)
   - [3dWorld](https://github.com/uDosGo/3dWorld)

For more information, see the [Ecosystem Structure](ecosystem-structure.md) document.

## Generated Documentation

This documentation is automatically generated and updated as part of the CI/CD pipeline.

### Documentation Structure

```
docs/
├── README.md                # This file
├── DEVELOPMENT_GUIDE.md     # Development guide
├── STRUCTURE.md             # Project structure
├── ARCHITECTURE.md          # Architecture overview
├── api/                     # API documentation
└── (other generated docs)
```

### Updating Documentation

To regenerate documentation:

```bash
# Generate all documentation
bash scripts/generate-docs.sh

# Update the documentation index
bash scripts/update-docs-index.sh
```

### Documentation Standards

- Use Markdown format
- Follow consistent heading structure
- Include code examples where applicable
- Keep documentation up-to-date with code changes

## Support

For issues or questions about the documentation:
- Open an issue on GitHub
- Check the contributing guidelines
- Review existing documentation for similar topics

## uDos Go – Home Repository

This repository contains **all uDos components as submodules**. Use it to clone the entire ecosystem.

### Quick Start

```bash
git clone --recursive git@github.com:uDosGo/home-repo.git ~/Code/uDosGo
cd ~/Code/uDosGo
make doctor          # verify environment
make build           # compile everything
make dev             # start core + ThinUI + Re3Chat
```

### Directory Structure

- `uCode1/` – Core CLI, MCP server, feed spool (production)
- `uCode2/` – Web publishing (future)
- `ThinUI/` – Graphical dashboard (Tauri + Blitz)
- `SonicExpress/` – Packaging & installer (new)
- `DevStudio/` – Internal dev tooling (private submodule)
- `Registry/` – Promoted plugins/themes
- `Sandbox/` – Local experiments (ignored)
- `docs/` – Shared documentation

### Updating

```bash
make update
```

### Development Mode

Use `--dev` flag with any `udos` command to isolate logs and state:

```bash
udos --dev note create test.md
```

Dev logs go to `~/.local/dev/` and are never synced remotely.

### Logging

Every command execution is recorded in the feed spool (`replies.jsonl`). Agents can query:

```bash
udos feed search --tag event,command
```

See `docs/logging.md` for schema.

### License

MIT (unless otherwise noted in submodules)