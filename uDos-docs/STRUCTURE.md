# uDos / Connect — Project Structure

## Root Level

```
Connect/
├── binder/               # Python binder system (structured data)
├── config/               # Shared configuration (email, webhooks)
├── courses/              # Structured learning paths
├── docs/                 # Documentation corpus
├── scripts/              # Automation and utility scripts
├── src/                  # Rust source (MCP server, core)
├── stories/              # Interactive narratives (quests)
├── test/                 # Test suites
├── udo/                  # UDO runtime (bin, fonts, skills)
├── udoui/                # UI extensions
├── ui/                   # Web UI (Vite + React)
│
├── Cargo.toml            # Rust workspace
├── CONTRIBUTING.md       # Contribution guidelines
├── eslint.config.js      # ESLint configuration
├── LICENSE               # MIT License
├── package.json          # Node workspace
├── README.md             # Project overview (this is the entry point)
├── uDosGo.code-workspace # VS Code workspace file
├── udosui.command        # macOS double-click launcher
└── version               # Current version (v1.1.1)
```

## Key Components

### `binder/` — Python Binder System
The binder is a Python tool for working with structured data (snacks, spools, feeds). It provides CLI tools and a library for parsing, validating, and transforming data formats.

### `ui/` — Web UI
A Vite + React web application that provides a graphical interface for the uDos ecosystem.

### `src/` — Rust Core
Rust source code for the MCP server and core services. Currently a minimal scaffold.

### `scripts/` — Automation
Utility scripts for installation, testing, deployment, and maintenance.

### `docs/` — Documentation
All documentation including architecture, guides, specs, and learning resources.

### `courses/` — Learning Paths
Structured, step-by-step courses for learning uDos concepts and skills.

### `udo/` — UDO Runtime
Runtime assets including fonts, skills, and binaries.

### `udoui/` — UI Extensions
Extension manifests and catalog for the uDos UI.

### `stories/` — Interactive Quests
Narrative-driven interactive experiences for learning through play.

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
