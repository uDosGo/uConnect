# uDos Documentation

Welcome to the uDos documentation hub. Here you'll find comprehensive guides, API references, and architectural information.

## Getting Started

- **[Quickstart Guide](QUICKSTART.md)**: Up and running in 5 minutes
- **[Student Guide](student/)**: Plain-language tutorials for beginners
- **[Development Guide](DEVELOPMENT_GUIDE.md)**: Everything you need to start developing with uDos
- **[Project Structure](STRUCTURE.md)**: Overview of the project organization
- **[Architecture](CORE_ARCHITECTURE.md)**: Technical architecture and design principles
- **[Development Roadmap](ROADMAP.md)**: Consolidated development roadmap (single source of truth)
- **[Legacy Docs](legacy/)**: Superseded/outdated documentation (ARCHITECTURE.md, GITHUB_WORKFLOW.md, DEVLOG.md, roadmap/)
- **[Docs Under Review](review/)**: Iffy/uncertain/WIP docs needing triage (LOCKED specs, v4/)

## API Documentation

- **[API Reference](api/)**: Auto-generated API documentation

## Additional Resources

- **[Contributing](../CONTRIBUTING.md)**: How to contribute to uDos
- **[Courses](../courses/)**: Structured learning paths
- **[Scripts](../scripts/)**: Utility scripts for development

## Cross-Repo Documentation Index

A complete index of all documentation across the uDos ecosystem is available at:

👉 **[`../docs/shared/DOC_INDEX.md`](../docs/shared/DOC_INDEX.md)**

This index maps docs by topic across uConnect, uCode1, uCode2, uCode3, and uCode4.

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

The uDos ecosystem is organized into layers, each building on the one before:

| Layer | Repo | What It Does | Tech |
|-------|------|-------------|------|
| **uCode1** | [uCode1](https://github.com/uDosGo/uCode1) | Text/ASCII — vault, CLI, MCP server | Python |
| **uCode2** | [uCode2](https://github.com/uDosGo/uCode2) | Sprite/BOB — terminal graphics, retro UI | AMOS / Python |
| **uCode3** | [uCode3](https://github.com/uDosGo/uCode3) | Vector/SVG — home automation, smart surfaces | Rust |
| **uCode4** | [uCode4](https://github.com/uDosGo/uCode4) | Spatial/3D — spatial computing, voxel mapping | Rust / WebGPU |
| **Groovebox** | [Groovebox](https://github.com/uDosGo/Groovebox) | Audio — music production, sound design | Python |
| **SonicScrewdriver** | [SonicScrewdriver](https://github.com/uDosGo/SonicScrewdriver) | API hub, secrets, containers | Rust / Python |
| **Connect** | **← You are here** | Shared infra — binder, docs, courses, scripts | Multi-language |

## Generated Documentation

This documentation is automatically generated and updated as part of the CI/CD pipeline.

### Documentation Structure

```
docs/
├── README.md                # This file
├── QUICKSTART.md            # 5-minute setup guide
├── DEVELOPMENT_GUIDE.md     # Development guide
├── STRUCTURE.md             # Project structure
├── ARCHITECTURE.md          # Architecture overview
├── student/                 # Beginner-friendly tutorials
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
