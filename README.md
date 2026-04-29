# uDosGo — Core uDos Ecosystem Monorepo

**Runtime evolution:** uCode1 (Python) → uCode2 (Rust+React) → uCode3 (Console/Tablet) → uCode4 (3D/VR)

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
