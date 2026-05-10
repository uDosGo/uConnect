# 🚀 uDosGo / Connect

**The front door to the uDos ecosystem.**  
*Learn, build, and create with vault-native tools.*

---

## 👋 Welcome

uDos is a **digital workshop** for knowledge management, creative productivity, and spatial computing. Whether you're a complete beginner or an experienced developer, this is where you start.

**New here?** You don't need to know anything about coding. Just bring curiosity.

- **[Quickstart Guide](docs/QUICKSTART.md)** — Up and running in 5 minutes
- **[Student Guide](docs/student/)** — Plain-language tutorials, no jargon
- **[Courses](courses/)** — Structured learning paths (start with `01-markdown-first`)
- **[Stories](stories/)** — Interactive quests to practice what you learn

---

## 🎯 Who Is This For?

### 👋 Beginners & Learners

> *"I want to learn, but I don't know where to start."*

You're in the right place. This repo is the **front door** to everything uDos. Start with the **[Quickstart Guide](docs/QUICKSTART.md)** — it'll walk you through everything step by step.

**All you need:** A terminal and curiosity.

### 🔧 Enthusiasts & Developers

> *"I want to build things with uDos."*

If you're comfortable with the command line, dive deeper:

- **[Architecture Overview](docs/ARCHITECTURE.md)** — How the pieces fit together
- **[Development Guide](docs/DEVELOPMENT_GUIDE.md)** — Set up your dev environment
- **[API Reference](docs/api/)** — Technical API documentation
- **[Contributing](CONTRIBUTING.md)** — How to contribute code or docs

---

## 🏗️ What's Inside

```
Connect/
├── binder/          # Python tools for structured data
├── config/          # Shared configuration
├── courses/         # Learning paths (start here!)
├── docs/            # All documentation
│   ├── QUICKSTART.md
│   ├── student/     # Beginner-friendly tutorials
│   └── ...
├── scripts/         # Helpful automation scripts
├── src/             # Rust core services
├── stories/         # Interactive quests
├── udo/             # UDO runtime (fonts, skills, binaries)
├── udoui/           # UI extensions
├── ui/              # Web-based user interface
├── package.json     # Node.js workspace
└── udosui.command   # macOS double-click launcher
```

### Key Directories

| Directory | What's Inside | Best For |
|-----------|--------------|----------|
| `courses/` | Step-by-step learning paths | **Beginners** |
| `docs/student/` | Plain-language tutorials | **New learners** |
| `stories/` | Interactive quests | **Practice** |
| `docs/` | Architecture, guides, specs | **Everyone** |
| `scripts/` | Automation and utilities | **Operators** |
| `src/` | Rust core services | **Developers** |
| `ui/` | Web interface | **Users** |

---

## 🚀 Quick Start

### 1. Get the Code

```bash
git clone https://github.com/uDosGo/Connect.git
cd Connect
```

### 2. Explore

```bash
# See what courses are available
ls courses/

# Read the quickstart guide
cat docs/QUICKSTART.md

# Try a story quest
ls stories/
```

### 3. Launch the Desktop App

| Platform | How to Launch |
|----------|--------------|
| **macOS** | Double-click `udosui.command` (right-click → Open on first run) |
| **Linux** | `bash scripts/udosui-launcher.sh --install` (one-time setup) |
| **Any** | `bash scripts/udosui-launcher.sh` |

### 4. Start Learning

```bash
# Begin with the first course
cat courses/01-markdown-first/README.md
```

---

## 📚 Learning Pathways

### 🟢 Beginner Path (No Experience Needed)

1. **[Quickstart Guide](docs/QUICKSTART.md)** — 5-minute setup
2. **[Course 01: Markdown First](courses/01-markdown-first/)** — Learn the basics
3. **[Student Tutorials](docs/student/)** — Friendly walkthroughs
4. **[Stories](stories/)** — Interactive quests to practice

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

## 📖 Documentation Hub

All documentation lives in the [`docs/`](docs/) directory:

| Document | What It Covers |
|----------|---------------|
| [Quickstart Guide](docs/QUICKSTART.md) | Fast setup for everyone |
| [Student Guide](docs/student/) | Plain-language tutorials |
| [Architecture](docs/ARCHITECTURE.md) | System design overview |
| [Development Guide](docs/DEVELOPMENT_GUIDE.md) | Dev environment setup |
| [User Manual](docs/ucode-user-manual.md) | All commands explained |
| [Lexicon](docs/lexicon.md) | What all the terms mean |
| [Contributing](CONTRIBUTING.md) | How to help |

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

---

*Built with ❤️ by the uDos community*
