# uDosGo/Connect Repository

This is the **repository folder** for the `udos` system. It is a **Git repository** and contains version-controlled project files.

## Purpose
- **Version Control**: All files in this folder are tracked by Git and synced with the remote repository.
- **Development**: Contains the main project codebase, documentation, and modules.
- **Collaboration**: Intended for team collaboration and contributions.

## Key Directories
- `Docs/`: Project documentation (synced to `~Vault/docs/uDosGo/Connect`).
- `Modules/`: Reusable modules for the `udos` system.
- `src/`: Source code for the project.
- `tests/`: Test files for the project.
- `uCode1/`: Python core — CLIs, grid parser, USXD, snack/relic/binder (Python)
- `uCode2/`: Rust + React — MCP server, TUI, ThinUI surfaces, spatial (Rust, JS)
- `uCode4/`: 3D spatial runtime (future)
- `.compost/`: Archived dev records

## Best Practices
- **Always work in this folder for development**: This ensures your changes are version-controlled and synced with the remote repository.
- **Sync `Docs/` to `Vault`**: The `Docs/` folder is synced to `~Vault/docs/uDosGo/Connect` for centralized documentation.
- **Use `git` for changes**: Pull, commit, and push changes to keep the repository up to date.

## Quick Start

```bash
# Python (uCode1) — unified CLI
cd uCode1 && python3 ucode --help

# Rust (uCode2) — build workspace
cd uCode2 && cargo build --workspace

# Tests
make -f Makefile.dev test
```

## Structure

| Directory | Purpose | Language | Status |
|-----------|---------|----------|--------|
| `uCode1/` | Python core — CLIs, grid parser, USXD, snack/relic/binder | Python | 🟢 Active |
| `uCode2/` | Rust + React — MCP server, TUI, ThinUI surfaces, spatial | Rust, JS | 🟡 Active |
| `uCode4/` | 3D spatial runtime (future) | — | ⚪ Planning |
| `.compost/` | Archived dev records | — | 📦 Archive |

## Docs

- [`docs/roadmap.md`](docs/roadmap.md) — Full development roadmap
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — Architecture overview
- [`docs/specs/`](docs/specs/) — Format specifications (USXD, UDX, progression)
- [`uCode4/docs/`](uCode4/docs/) — uCode3/4 planning docs

## Navigation
- To work on the **repository** (e.g., documentation, modules, code), stay in `uDosGo/Connect`.
- To manage **local configurations** or **user data**, navigate to `uDosGo` (the home folder).

## Example Commands
- Pull the latest changes:
  ```bash
  git pull
  ```
- Commit and push changes:
  ```bash
  git add .
  git commit -m "Your commit message"
  git push
  ```
- Sync `Docs/` to `Vault`:
  ```bash
  cp -r Docs/* ~/Vault/docs/uDosGo/Connect/
  ```

## Related
- For home folder documentation, see `uDosGo/README.md`.