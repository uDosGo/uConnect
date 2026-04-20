# uDevFramework Documentation Index

## 📚 Documentation Structure

```
docs/
├── INDEX.md                    # This file
├── getting-started.md          # Quick start guide
├── architecture.md             # Overall architecture
├── cli-reference.md            # CLI command reference
├── patterns/                   # Reusable patterns
│   ├── python.md               # Python execution
│   ├── logging.md              # Feed-style logging
│   ├── workspace.md            # Dev folder structure
│   └── vibecli.md              # vibecli configuration
├── specs/                      # Technical specifications
│   ├── templating.md           # Templating system
│   ├── universal-spine.md      # Directory structure
│   └── agent-contract.md       # Agent communication
├── status/                     # Implementation tracking
│   ├── IMPLEMENTATION_STATUS.md # Master status tracker
│   └── ROADMAP.md              # Future plans
└── contributing.md             # How to contribute
```

## 🚀 Getting Started

1. **Install the CLI:**
   ```bash
   ./bin/udev install
   ```

2. **View available specs:**
   ```bash
   udev spec --list
   ```

3. **Read a specification:**
   ```bash
   udev spec architecture/universal-spine
   ```

## 📖 Documentation Guide

### For Users
- Start with [Getting Started](getting-started.md)
- Learn the [CLI Reference](cli-reference.md)
- Browse [Reusable Patterns](patterns/)

### For Developers
- Read [Architecture Overview](architecture.md)
- Check [Implementation Status](status/IMPLEMENTATION_STATUS.md)
- Review [Technical Specs](specs/)

### For Contributors
- See [Contributing Guide](contributing.md)
- Check [Roadmap](status/ROADMAP.md)
- Review [Open Issues](#)

## 🎯 Status Legend

| Icon | Status | Meaning |
|------|--------|---------|
| ✅ | Implemented | Working and tested |
| 🟨 | Partial | Some functionality |
| 🟡 | Planned | Designed, not built |
| ❌ | Blocked | Waiting on dependencies |

## 🔗 Quick Links

- [GitHub Repository](https://github.com/fredporter/uDevFramework)
- [Issue Tracker](https://github.com/fredporter/uDevFramework/issues)
- [Releases](https://github.com/fredporter/uDevFramework/releases)
