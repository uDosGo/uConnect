# 🚀 uDosGo / Connect

**The shared-infrastructure hub for the uDos ecosystem.**  
*Version: v1.1.1 · Status: Active Development*

---

## What is uDos?

uDos is a **modular, vault-native development platform** for knowledge management, spatial computing, and creative productivity. Think of it as a digital workshop where you can:

- **Organise knowledge** in a vault (like a personal wiki on steroids)
- **Build spatial surfaces** using a grid/layer system (ASCII → SVG → 3D)
- **Publish content** across multiple channels (public, student, dev)
- **Automate workflows** with feeds, spools, and MCP tools
- **Learn and grow** through structured courses and quests

The ecosystem spans **7 repos** across the [uDosGo](https://github.com/uDosGo) GitHub organisation, each handling a different layer of the stack.

---

## 🎯 Who Is This For?

### 👋 Beginners & Learners ("I want to learn")

**New here?** You're in the right place. This repo is the **front door** to the uDos ecosystem.

**Start here (no experience needed):**
- **[Quickstart Guide](docs/QUICKSTART.md)** — Up and running in 5 minutes
- **[Student Guide](docs/student/)** — Plain-language tutorials, no jargon
- **[Courses](courses/)** — Structured learning paths (start with `01-markdown-first`)
- **[User Manual](docs/ucode-user-manual.md)** — All the `udo` commands explained
- **[Lexicon](docs/lexicon.md)** — What all the terms mean (Vault, Spool, Surface, etc.)

**Just need a terminal and curiosity.**

### 🔧 Enthusiasts & Developers ("I want to build")

If you're comfortable with the command line and want to dive deeper:

- **[Architecture Overview](docs/ARCHITECTURE.md)** — How the pieces fit together
- **[Development Guide](docs/DEVELOPMENT_GUIDE.md)** — Set up your dev environment
- **[API Reference](docs/api/)** — Technical API documentation
- **[Specifications](docs/specs/)** — Format specs (USXD, OBF, Spatial Algebra)
- **[Contributing](CONTRIBUTING.md)** — How to contribute code or docs

---

## 🏗️ Repository Structure

```
Connect/                  ← You are here (shared infra hub)
├── binder/               # Python binder system (structured data)
├── config/               # Shared configuration (email, webhooks)
├── courses/              # Structured learning paths
├── docs/                 # Documentation corpus
│   ├── QUICKSTART.md     # 5-minute setup guide
│   ├── student/          # Beginner-friendly tutorials
│   └── ...               # Architecture, guides, specs
├── scripts/              # Automation and utility scripts
│   ├── udosui-launcher.sh  # Linux/macOS UI launcher
│   └── ...
├── src/                  # Rust source (MCP server, core)
├── stories/              # Interactive narratives (quests)
├── test/                 # Test suites
├── udo/                  # UDO runtime (bin, fonts, skills)
├── udoui/                # UI extensions
├── ui/                   # Web UI (Vite + React)
├── Cargo.toml            # Rust workspace
├── package.json          # Node workspace
└── udosui.command        # macOS double-click launcher
```

### Key Directories Explained

| Directory | What's Inside | For Whom |
|-----------|--------------|----------|
| `binder/` | Python binder — structured data parsing, CLI tools | Developers |
| `courses/` | Step-by-step learning paths (markdown-first) | Learners |
| `docs/` | All documentation — architecture, guides, specs | Everyone |
| `scripts/` | Automation scripts — install, test, deploy | Operators |
| `src/` | Rust source — MCP server, core services | Developers |
| `stories/` | Interactive quests and narratives | Learners |
| `udo/` | UDO runtime — fonts, skills, binaries | Users |
| `ui/` | Web-based user interface | Users |

---

## 🧩 The uDos Ecosystem

uDos is organised into **layers**, each building on the one before:

| Layer | Repo | What It Does | Tech |
|-------|------|-------------|------|
| **uCode1** | [uCode1](https://github.com/uDosGo/uCode1) | Text/ASCII — vault, CLI, MCP server | Python |
| **uCode2** | [uCode2](https://github.com/uDosGo/uCode2) | Sprite/BOB — terminal graphics, retro UI | AMOS / Python |
| **uCode3** | [uCode3](https://github.com/uDosGo/uCode3) | Vector/SVG — home automation, smart surfaces | Rust |
| **uCode4** | [uCode4](https://github.com/uDosGo/uCode4) | Spatial/3D — spatial computing, voxel mapping | Rust / WebGPU |
| **Groovebox** | [Groovebox](https://github.com/uDosGo/Groovebox) | Audio — music production, sound design | Python |
| **SonicScrewdriver** | [SonicScrewdriver](https://github.com/uDosGo/SonicScrewdriver) | TARDIS Console — API hub, secrets, containers | Rust / Python |
| **Connect** | **← You are here** | Shared infra — binder, docs, courses, scripts | Multi-language |

### The Layer Architecture

```
uCode4 (Spatial/3D)     ← Voxels, cubes, spatial algebra
uCode3 (Vector/SVG)     ← Home automation, smart surfaces
uCode2 (Sprite/BOB)     ← Terminal graphics, retro UI
uCode1 (Text/ASCII)     ← Vault, CLI, MCP server (foundation)
```

Each layer is **independent** but **composable** — you can use uCode1 alone, or stack them all.

---

## 🚀 Quick Start

### Prerequisites

- **Git** — version control
- **Node.js** v18+ — for JavaScript/TypeScript tooling
- **Python** 3.10+ — for binder and utility scripts
- **Rust** (optional) — for compiling native components

### 1. Clone the Repo

```bash
git clone https://github.com/uDosGo/Connect.git
cd Connect
```

### 2. Explore

```bash
# See what's here
ls docs/          # Documentation
ls courses/       # Learning paths
ls scripts/       # Automation tools

# Read the quickstart
cat docs/QUICKSTART.md
```

### 3. Run a Course

```bash
# Start with the first course
cat courses/01-markdown-first/README.md
```

### 4. Try the CLI

```bash
# If you have the udo CLI installed
udo help
udo doctor       # Health check
udo tour         # Interactive tour
```

### 5. Launch the Web UI

```bash
cd ui && npm install && npm run dev
```

Or use the desktop launcher for your platform:

| Platform | Command |
|----------|---------|
| **macOS** | Double-click `udosui.command` (after `chmod +x`) |
| **Linux** | `bash scripts/udosui-launcher.sh --install` (one-time setup) |
| **Any** | `bash scripts/udosui-launcher.sh` |

---

## 📚 Learning Pathways

### 🟢 Beginner Path (Start Here)

1. **[Quickstart Guide](docs/QUICKSTART.md)** — 5-minute setup
2. **[Course 01: Markdown First](courses/01-markdown-first/)** — Learn the basics
3. **[User Manual](docs/ucode-user-manual.md)** — All commands explained
4. **[Lexicon](docs/lexicon.md)** — Understand the terminology
5. **[Stories](stories/)** — Interactive quests to practice

### 🔵 Enthusiast Path

1. **[Architecture](docs/ARCHITECTURE.md)** — System design overview
2. **[Development Guide](docs/DEVELOPMENT_GUIDE.md)** — Set up your environment
3. **[Specifications](docs/specs/)** — Deep dive into formats
4. **[Contributing](CONTRIBUTING.md)** — Join the community

### ⚫ Developer Path

1. **[Core Architecture](docs/CORE_ARCHITECTURE.md)** — Python/Rust boundaries
2. **[API Reference](docs/api/)** — Technical API docs
3. **[GitHub Workflow](docs/GITHUB_WORKFLOW.md)** — CI/CD and collaboration

---

## 🛠️ Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm test                 # Run tests
npm run lint             # Lint code

# Validation
npm run verify:a1        # Run A1 milestone checks
bash scripts/shakedown.sh  # Full system health check

# Documentation
bash scripts/generate-docs.sh    # Regenerate docs
bash scripts/update-docs-index.sh # Update doc index
```

---

## 📖 Documentation

All documentation lives in the [`docs/`](docs/) directory:

| Document | What It Covers |
|----------|---------------|
| [README.md](docs/README.md) | Documentation hub and index |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture overview |
| [CORE_ARCHITECTURE.md](docs/CORE_ARCHITECTURE.md) | Python/Rust version boundaries |
| [QUICKSTART.md](docs/QUICKSTART.md) | Fast setup guide |
| [DEVELOPMENT_GUIDE.md](docs/DEVELOPMENT_GUIDE.md) | Dev environment setup |
| [GITHUB_WORKFLOW.md](docs/GITHUB_WORKFLOW.md) | CI/CD and collaboration |
| [STRUCTURE.md](docs/STRUCTURE.md) | Project structure reference |
| [lexicon.md](docs/lexicon.md) | Terminology across all lanes |
| [ucode-user-manual.md](docs/ucode-user-manual.md) | Complete command reference |
| [DEVLOG.md](docs/DEVLOG.md) | Development history and changelog |

---

## 🤝 Contributing

We welcome contributions from everyone — whether you're fixing a typo, writing a course, or adding a new feature.

See **[CONTRIBUTING.md](CONTRIBUTING.md)** for the full guide.

**Quick summary:**
1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Open a pull request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🌐 Related Links

- **GitHub Organisation**: [github.com/uDosGo](https://github.com/uDosGo)
- **Connect Repo**: [github.com/uDosGo/Connect](https://github.com/uDosGo/Connect)
- **Discussions**: [github.com/uDosGo/Connect/discussions](https://github.com/uDosGo/Connect/discussions)
- **Kanban Board**: [github.com/orgs/uDosGo/projects/1](https://github.com/orgs/uDosGo/projects/1)

---

*Built with ❤️ by the uDos community*
