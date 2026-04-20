# Getting Started with uDevFramework

## 🎯 What is uDevFramework?

uDevFramework is the **universal scaffold, specs, and settings** for the Sonic Family ecosystem. It provides:

- **Consistent project structure** across all repositories
- **Reusable patterns** for common development tasks
- **Agent-aware specifications** that AI can follow
- **One-command project initialization** with `udev init`
- **Self-updating framework** that propagates improvements

## 🚀 Installation

### Prerequisites
- Node.js v18+ (for CLI)
- Git
- Bash/zsh

### Install the CLI

```bash
# Clone the repository
git clone https://github.com/fredporter/uDevFramework.git
cd uDevFramework

# Install globally
./bin/udev install

# Verify installation
udev --help
```

Expected output:
```
uDevFramework CLI

Usage:
  udev init <project-name>    Create new project from scaffold
  udev update [path]          Update project to latest framework
  udev spec <spec-name>       View a specification
  udev rule <rule-name>       View a rule file
  udev install                Install udev globally
```

## 📚 Core Concepts

### 1. Universal Spine

Every project follows the same **universal spine** structure:

```
project/
├── src/                    # Source code
├── dev/                    # Experiments
├── tests/                  # Tests
├── docs/                   # Documentation
└── .github/workflows/      # CI/CD
```

### 2. Layered Templating

Projects are built from **layers**:
- **Base layers**: Language foundation (base-node, base-go)
- **Custom layers**: Features (udos, mastra, chasis)
- **Flavours**: Platform variants (linux-mint, mac-arm)

### 3. Agent Contract

All agents (Mastra, Hivemind, DSC2) follow a **common contract** for:
- Input/Output format
- Error handling
- Session management

## 🛠️ Basic Usage

### View Specifications

```bash
# List all specifications
udev spec --list

# Read a specific spec
udev spec architecture/universal-spine

# Read agent contract
udev spec agents/agent-contract
```

### View Rules

```bash
# List available rules
udev rule --list

# Read codegen rules
udev rule codegen-rules

# Read security rules
udev rule security-rules
```

### Create Project (Future)

```bash
# Initialize new project
udev init my-project \
  --layers base-node,udos,mastra \
  --flavour linux-mint

# Navigate to project
cd my-project

# Install dependencies
npm install
```

## 📖 Documentation Structure

```
docs/
├── getting-started.md      # You are here
├── architecture.md         # System overview
├── cli-reference.md        # Command reference
├── patterns/               # Reusable patterns
│   ├── python.md           # Python best practices
│   ├── logging.md           # Feed-style logging
│   ├── workspace.md         # Dev folder structure
│   └── vibecli.md           # vibecli configuration
├── specs/                  # Technical specs
│   ├── templating.md       # Templating system
│   ├── universal-spine.md  # Directory structure
│   └── agent-contract.md    # Agent communication
└── status/                 # Implementation tracking
    ├── IMPLEMENTATION_STATUS.md
    └── ROADMAP.md
```

## 🎯 Implementation Status

**Current Version:** v1.3.0

| Feature | Status | Notes |
|---------|--------|-------|
| CLI Core | ✅ Working | Help, spec, rule commands |
| Project Init | 🟡 Planned | v2.0.0 target |
| Layer System | 🟡 Planned | Design complete |
| Flavour System | 🟡 Planned | Not implemented |

See [IMPLEMENTATION_STATUS.md](status/IMPLEMENTATION_STATUS.md) for full details.

## 🤖 Agent Integration

uDevFramework is designed for **AI agent collaboration**:

### For Mastra Agents
- Follow [codegen rules](patterns/codegen-rules.md)
- Use [universal spine](specs/universal-spine.md) structure
- Generate [flavour-appropriate](specs/templating.md) code

### For Hivemind Agents
- Reference [agent contract](specs/agent-contract.md)
- Use structured logging format
- Follow exit code conventions

## 🔧 Configuration

### Environment Variables

```bash
# Required
export UDOS_VAULT="~/vault"
export UDOS_CODE="~/code-vault"

# Optional
export DEEPSEEK_API_KEY="sk-..."
export OPENAI_API_KEY="sk-..."
```

### .udev/config (Future)

```yaml
# Future configuration format
layers:
  default: [base-node, udos]
  cache_dir: ~/.udev/cache

flavours:
  default: linux-mint
  
registry:
  url: https://registry.udev.sh
  token: ${UDEV_TOKEN}
```

## 📚 Next Steps

1. **Read the architecture** → [Architecture Overview](architecture.md)
2. **Learn the CLI** → [CLI Reference](cli-reference.md)
3. **Browse patterns** → [Patterns](patterns/)
4. **Check implementation status** → [Status](status/IMPLEMENTATION_STATUS.md)

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| `udev: command not found` | Run `./bin/udev install` |
| Spec not found | Check spelling with `udev spec --list` |
| Permission denied | Run with `sudo` or check permissions |

## 🤝 Community

- **Issues**: [GitHub Issues](https://github.com/fredporter/uDevFramework/issues)
- **Discussions**: [GitHub Discussions](https://github.com/fredporter/uDevFramework/discussions)
- **Contributing**: [See CONTRIBUTING](contributing.md)

---

**Welcome to uDevFramework!** 🎉
The universal DNA for Sonic Family projects.
