# uDevFramework CLI Reference

## 📖 Command Overview

```
udev <command> [options] [args]
```

## 🚀 Commands

### `udev init <project-name>`

Create a new project from layers and flavours.

**Status:** 🟡 PLANNED (v2.0.0)

**Usage:**
```bash
udev init my-project \
  --layers base-node,udos,mastra \
  --flavour linux-mint
```

**Options:**
```
--layers <list>       Comma-separated list of layers
--flavour <flavour>   Flavour to apply
--output <dir>        Output directory (default: ./<project-name>)
--var KEY=VALUE       Set template variable
--dry-run             Show what would be created
--force               Overwrite existing directory
```

**Examples:**
```bash
# Basic project
udev init my-app --layers base-node

# Full uDos project
udev init my-udos \
  --layers base-node,udos,mastra,chasis \
  --flavour linux-mint \
  --flavour udos:classic

# WordPress project
udev init my-blog \
  --layers base-php,wordpress \
  --flavour wordpress:php8.3
```

---

### `udev update [path]`

Update existing project to latest framework version.

**Status:** 🟡 PLANNED (v2.0.0)

**Usage:**
```bash
udev update
udev update /path/to/project
```

**Options:**
```
--layers <list>       Update specific layers only
--flavour <flavour>   Change flavour
--dry-run             Show what would change
--force               Force update even with conflicts
```

**Examples:**
```bash
# Update current directory
udev update .

# Update specific project
udev update ~/code-vault/my-udos

# Update with new flavour
udev update . --flavour mac-arm
```

---

### `udev spec <spec-name>`

View a technical specification.

**Status:** ✅ WORKING (v1.1.0)

**Usage:**
```bash
udev spec architecture/universal-spine
udev spec agents/agent-contract
```

**Options:**
```
--list                 List all available specs
--search <text>        Search specs by name
--format <format>      Output format (md, json, text)
```

**Examples:**
```bash
# List all specs
udev spec --list

# View universal spine spec
udev spec architecture/universal-spine

# Search for agent specs
udev spec --search agent
```

**Available Specs:**
- `architecture/universal-spine` - Directory structure
- `agents/agent-contract` - Agent communication protocol
- `templating/TEMPLATING_SYSTEM_BRIEF` - Templating system design

---

### `udev rule <rule-name>`

View a rule or pattern document.

**Status:** ✅ WORKING (v1.1.0)

**Usage:**
```bash
udev rule codegen-rules
udev rule security-rules
```

**Options:**
```
--list                 List all available rules
--search <text>        Search rules by name
--format <format>      Output format (md, json, text)
```

**Examples:**
```bash
# List all rules
udev rule --list

# View codegen rules
udev rule codegen-rules

# Search for security rules
udev rule --search security
```

**Available Rules:**
- `codegen-rules` - Code generation guidelines
- `security-rules` - Security best practices

---

### `udev install`

Install udev CLI globally.

**Status:** ✅ WORKING (v1.1.0)

**Usage:**
```bash
udev install
```

**What it does:**
1. Makes `udev` executable
2. Creates symlink in `/usr/local/bin/`
3. Verifies installation

**Examples:**
```bash
# Install globally
./bin/udev install

# Verify installation
udev --help
```

---

### `udev layer <subcommand>`

Manage layers (future).

**Status:** 🟡 PLANNED (v2.0.0)

**Subcommands:**
```
udev layer add <layer>       Add layer to project
udev layer remove <layer>    Remove layer from project
udev layer update <layer>    Update layer version
udev layer list              List available layers
udev layer show <layer>      Show layer details
udev layer flavours <layer>  List flavours for layer
```

**Examples:**
```bash
# Add layer to project
udev layer add mastra --flavour deepseek

# Update layer version
udev layer update base-node@2.1.0

# List available layers
udev layer list
```

---

### `udev flavour <subcommand>`

Manage flavours (future).

**Status:** 🟡 PLANNED (v2.0.0)

**Subcommands:**
```
udev flavour list           List available flavours
udev flavour show <flavour> Show flavour details
udev flavour export <name>  Export current as new flavour
```

**Examples:**
```bash
# List flavours
udev flavour list

# Export custom flavour
udev flavour export my-custom-flavour
```

---

## 🎯 Status Legend

| Status | Emoji | Meaning |
|--------|-------|---------|
| ✅ Working | ✅ | Fully implemented and tested |
| 🟨 Partial | 🟨 | Some functionality working |
| 🟡 Planned | 🟡 | Designed, not implemented |
| ❌ Blocked | ❌ | Waiting on dependencies |

## 📊 Command Status Matrix

| Command | Status | Version | Notes |
|---------|--------|---------|-------|
| `udev --help` | ✅ Working | v1.1.0 | Basic help system |
| `udev spec` | ✅ Working | v1.1.0 | Specification viewer |
| `udev rule` | ✅ Working | v1.1.0 | Rule viewer |
| `udev install` | ✅ Working | v1.1.0 | Global installation |
| `udev init` | 🟡 Planned | v2.0.0 | Project initialization |
| `udev update` | 🟡 Planned | v2.0.0 | Project updating |
| `udev layer` | 🟡 Planned | v2.0.0 | Layer management |
| `udev flavour` | 🟡 Planned | v2.0.0 | Flavour management |

## 🔧 Configuration

### Environment Variables

```bash
# Framework paths
export UDEV_HOME="~/.udev"
export UDEV_CACHE="~/.udev/cache"
export UDEV_REGISTRY="https://registry.udev.sh"

# Logging
export UDEV_LOG_LEVEL="info"
export UDEV_LOG_FILE="~/.udev/udev.log"
```

### Configuration File (Future)

```yaml
# ~/.udev/config.yaml
layers:
  default: [base-node, udos]
  cache_dir: ~/.udev/cache

flavours:
  default: linux-mint

registry:
  url: https://registry.udev.sh
  token: ${UDEV_TOKEN}

logging:
  level: info
  file: ~/.udev/udev.log
```

## 📖 Examples

### Common Workflows

**1. View Documentation:**
```bash
# List all specifications
udev spec --list

# Read universal spine specification
udev spec architecture/universal-spine

# Read codegen rules
udev rule codegen-rules
```

**2. Install and Verify:**
```bash
# Install globally
./bin/udev install

# Verify installation
udev --help

# Check version
cat version
```

**3. Future: Create Project (v2.0.0+):**
```bash
# Initialize new uDos project
udev init my-udos \
  --layers base-node,udos,mastra,chasis \
  --flavour linux-mint \
  --flavour udos:classic

# Navigate to project
cd my-udos

# Install dependencies
npm install
```

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| `udev: command not found` | Run `./bin/udev install` or add to PATH |
| Spec not found | Check name with `udev spec --list` |
| Permission denied | Use `sudo` or check file permissions |
| Layer not found | Feature not yet implemented (v2.0.0+) |

## 🤝 Support

- **Issues:** [GitHub Issues](https://github.com/fredporter/uDevFramework/issues)
- **Discussions:** [GitHub Discussions](https://github.com/fredporter/uDevFramework/discussions)
- **Source:** [GitHub Repository](https://github.com/fredporter/uDevFramework)

---

**uDevFramework CLI Reference** — Complete command documentation 📖
