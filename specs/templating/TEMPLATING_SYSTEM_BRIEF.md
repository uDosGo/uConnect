# uDevFramework Templating System

## The Problem

Every new project starts the same way: copy an old project, delete what you don't need, rename things, fix paths, update dependencies. This is slow, error-prone, and inconsistent.

**Solution:** A layered templating system where projects are assembled from reusable, versioned, flavour-aware components.

---

## Core Concepts

| Concept | Definition | Example |
|---------|------------|---------|
| **Base Layer** | Essential structure for a project type | `base-node`, `base-go`, `base-python` |
| **Custom Layer** | Optional feature or integration | `mastra-agents`, `chasis-containers`, `wordpress` |
| **Flavour** | Platform, OS, or style variant | `linux-mint`, `mac-arm`, `classic-ui`, `modern-ui` |
| **Version** | Semantic version of a layer | `v1.0.0`, `v2.1.0`, `^1.0.0` |

---

## How It Works

```
User command: udev init my-project --layers base-node,udos,mastra --flavour linux-mint

Step 1: Resolve layers and versions
Step 2: Fetch layer files from registry or local cache
Step 3: Merge files (later layers override earlier)
Step 4: Apply flavour customisations
Step 5: Render templates (replace {{variables}})
Step 6: Execute post-install scripts
Step 7: Write project manifest
```

---

## Layer Types

### Base Layers (Foundation)

| Layer | Content | Flavours |
|-------|---------|----------|
| **base-node** | package.json, tsconfig.json, ESLint, Prettier, Jest, GitHub Actions | `node18`, `node20`, `node22` |
| **base-go** | go.mod, Makefile, golangci-lint, GitHub Actions | `go1.21`, `go1.22`, `go1.23` |
| **base-python** | pyproject.toml, black, ruff, pytest, GitHub Actions | `py3.10`, `py3.11`, `py3.12` |
| **base-rust** | Cargo.toml, rustfmt, clippy, GitHub Actions | `stable`, `nightly` |

### Custom Layers (Features)

| Layer | Content | Flavours |
|-------|---------|----------|
| **udos** | CLI scaffold, vault integration, surface renderer | `full`, `lite`, `headless` |
| **sonic** | Sonic-screwdriver client, container helpers | `client`, `server` |
| **mastra** | AI agent setup (codegen, explain, refactor, test) | `openai`, `deepseek`, `local` |
| **chasis** | Container runtime, SKIN/LENS stubs | `docker`, `podman` |
| **wordpress** | WordPress scaffold, wp-cli, database config | `php8.1`, `php8.2`, `php8.3` |
| **hivemind** | General purpose agent stubs (deferred) | `home`, `family`, `vault` |
| **github-actions** | CI/CD workflows | `full`, `minimal`, `security` |
| **docs** | Documentation generator setup | `vitepress`, `docusaurus`, `mdbook` |

### Flavour Families

| Family | Examples | What It Changes |
|--------|----------|-----------------|
| **OS** | `linux-ubuntu`, `linux-mint`, `mac-arm`, `mac-intel` | Paths, package managers, system services |
| **UI** | `classic`, `modern`, `minimal`, `retro` | Themes, default surfaces, widget styles |
| **Runtime** | `node18`, `node20`, `py3.11`, `go1.22` | Language versions, dependency versions |
| **Deployment** | `docker`, `bare-metal`, `serverless` | Build targets, environment configs |

---

## Layer Manifest Format

Each layer has a `layer.yaml`:

```yaml
# layers/base-node/layer.yaml
name: base-node
version: 2.1.0
description: Node.js/TypeScript foundation
author: Sonic Family

dependencies: []

flavours:
  - name: node20
    variables:
      NODE_VERSION: 20.20.0
      NPM_VERSION: 10.8.1
    files:
      - .nvmrc
      - package.json
  - name: node22
    variables:
      NODE_VERSION: 22.0.0
      NPM_VERSION: 10.9.0
    files:
      - .nvmrc
      - package.json

files:
  - source: .eslintrc.json
    target: .eslintrc.json
    merge: replace
  - source: .prettierrc
    target: .prettierrc
  - source: tsconfig.json
    target: tsconfig.json
    template: true
  - source: Makefile
    target: Makefile

scripts:
  post_install: |
    npm install
    npm run build

compatibility:
  conflicts:
    - base-go
    - base-python
  requires:
    - name: node
      min_version: 18.0.0
```

---

## Flavour Manifest Format

```yaml
# flavours/linux-mint.yaml
name: linux-mint
extends: linux-ubuntu  # Inherit from ubuntu

variables:
  VAULT_PATH: "/home/wizard/vault"
  CODE_PATH: "/home/wizard/code-vault"
  STATE_PATH: "/home/wizard/.local/udos"
  SHELL: "/bin/bash"
  PACKAGE_MANAGER: "apt"

packages:
  - xclip
  - docker-ce
  - make
  - curl
  - git

services:
  - name: sonic-daemon
    command: "sonic daemon start"
    autostart: true
    logs: "~/.local/share/sonic/logs/"

files:
  - source: .bashrc.mint
    target: ~/.bashrc
    merge: append

post_install: |
  sudo usermod -aG docker $USER
  echo "Linux Mint flavour applied"
```

---

## Project Composition Example

### Command

```bash
udev init my-udos \
  --layers base-node@2.1.0,udos@1.0.0,mastra@0.5.0 \
  --flavour linux-mint \
  --flavour udos:classic \
  --output ~/code-vault/my-udos
```

### Resolution Process

```
1. Load base-node@2.1.0
   - Apply flavour node20 (default)
   - Copy .eslintrc.json, .prettierrc, tsconfig.json, Makefile

2. Load udos@1.0.0 (depends on base-node)
   - Apply flavour classic
   - Copy src/commands/, src/services/, dev/experiments/
   - Merge package.json dependencies

3. Load mastra@0.5.0 (depends on base-node)
   - Apply flavour deepseek (default)
   - Copy core/src/services/mastra-agent.ts
   - Merge package.json with @mastra/* dependencies

4. Apply linux-mint flavour
   - Set variables: VAULT_PATH, CODE_PATH, etc.
   - Add xclip, docker-ce to package list
   - Append .bashrc.mint to ~/.bashrc

5. Render templates ({{VAULT_PATH}} → /home/wizard/vault)

6. Execute post_install scripts (npm install, npm run build)

7. Write .udev/manifest.yaml
```

### Generated Manifest

```yaml
# my-udos/.udev/manifest.yaml
project:
  name: my-udos
  created: 2025-04-20T10:00:00Z
  udev_version: 1.0.0

layers:
  - name: base-node
    version: 2.1.0
    flavour: node20
  - name: udos
    version: 1.0.0
    flavour: classic
  - name: mastra
    version: 0.5.0
    flavour: deepseek

flavours:
  - linux-mint

variables:
  VAULT_PATH: /home/wizard/vault
  CODE_PATH: /home/wizard/code-vault
  STATE_PATH: /home/wizard/.local/udos
```

---

## Versioning Rules

| Version Type | Format | Example | When to Use |
|--------------|--------|---------|-------------|
| **Exact** | `x.y.z` | `base-node@2.1.0` | Production, CI/CD |
| **Minor range** | `^x.y.z` | `base-node@^2.0.0` | Compatible upgrades |
| **Latest** | `latest` | `mastra@latest` | Development, testing |
| **Branch** | `branch:name` | `udos@branch:develop` | Experimentation |

### Version Resolution Priority

1. Local cache (`.udev/cache/`)
2. Git tag in source repo
3. Registry API (future)
4. Fallback to `latest` with warning

---

## Layer Registry (Future A3/A4)

```
https://registry.udev.sh/
├── v1/
│   ├── layers/
│   │   ├── base-node/
│   │   │   ├── 2.1.0/
│   │   │   ├── 2.0.0/
│   │   │   └── latest -> 2.1.0
│   │   ├── udos/
│   │   └── mastra/
│   └── flavours/
│       ├── linux-mint/
│       ├── mac-arm/
│       └── classic/
```

```bash
# Publish layer
udev layer publish --name base-node --version 2.1.0

# Search registry
udev layer search "chasis"

# Install from registry (future)
udev layer install chasis@^1.0.0
```

---

## Template Syntax

Templates use `{{variable}}` with filters:

```handlebars
# tsconfig.json.template
{
  "compilerOptions": {
    "target": "{{target | default("ES2020")}}",
    "module": "commonjs",
    "outDir": "./{{out_dir | default("dist")}}",
    "rootDir": "./{{root_dir | default("src")}}",
    "strict": {{strict | default("true")}}
  }
}
```

Available variables:
- From layer manifest
- From flavour manifest
- From command line (`--var KEY=VALUE`)
- From environment (`UDEV_*`)
- Built-in: `date`, `timestamp`, `user`, `hostname`

---

## CLI Commands

```bash
# Create new project
udev init <name> --layers <list> --flavour <flavour> [--output <dir>]

# Add layer to existing project
udev layer add <layer>[@version] --flavour <flavour>

# Remove layer
udev layer remove <layer>

# Update layer to newer version
udev layer update <layer>[@version]

# List available layers
udev layer list [--remote] [--filter <text>]

# Show layer details
udev layer show <layer>[@version]

# List flavours for a layer
udev layer flavours <layer>

# Export project as new flavour
udev flavour export <name> --from <project-dir>

# Validate layer manifest
udev layer validate <layer-dir>

# Cache layer locally
udev layer cache <layer>[@version]
```

---

## Examples

### Example 1: Create WordPress Project

```bash
udev init my-blog \
  --layers base-php,wordpress \
  --flavour wordpress:php8.3 \
  --output ~/code-vault/my-blog
```

### Example 2: Create Mac ARM Native App

```bash
udev init mac-app \
  --layers base-go,udos,sonic \
  --flavour mac-arm \
  --flavour udos:full \
  --output ~/code-vault/mac-app
```

### Example 3: Create Classic Mint Flavoured uDos

```bash
udev init classic-udos \
  --layers base-node,udos,mastra,chasis \
  --flavour linux-mint \
  --flavour udos:classic \
  --output ~/code-vault/classic-udos
```

### Example 4: Add CHASIS to Existing Project

```bash
cd ~/code-vault/my-udos
udev layer add chasis --flavour docker
```

---

## Directory Structure After Init

```
my-project/
├── .udev/
│   ├── manifest.yaml          # What was built
│   ├── cache/                 # Cached layers
│   └── logs/                  # Build logs
├── .github/workflows/         # CI/CD (from layers)
├── src/                       # Source (from layers)
├── dev/experiments/           # Experimental (from udos layer)
├── tests/                     # Tests (from base layer)
├── docs/                      # Docs (from docs layer)
├── .eslintrc.json             # Config (from base-node)
├── .prettierrc                # Config (from base-node)
├── tsconfig.json              # Config (from base-node, templated)
├── package.json               # Dependencies (merged)
├── Makefile                   # Build (merged)
└── README.md                  # Generated from template
```

---

## Success Criteria

- [ ] `udev init` creates working project from layers
- [ ] Flavours correctly modify paths, packages, and configs
- [ ] Version resolution works (exact, ranges, latest)
- [ ] Layer composition merges files without conflicts
- [ ] Post-install scripts execute in correct order
- [ ] `udev layer add` adds layer to existing project
- [ ] `udev flavour export` creates reusable flavour
- [ ] Template variables render correctly

---

## Roadmap

| Phase | Version | Features |
|-------|---------|----------|
| **A1** | v1.0.0 | Local layers, basic composition, no registry |
| **A2** | v1.1.0 | Flavour inheritance, version ranges |
| **A3** | v2.0.0 | Remote registry, layer sharing |
| **A4** | v2.1.0 | UI for browsing layers, one-click init |

---

## The Big Picture

```
uDevFramework = Base Layers + Custom Layers + Flavours + Versions

Base Layers:     "Every TypeScript project needs these files"
Custom Layers:   "Add Mastra agents to any project"
Flavours:        "Make it work on Linux Mint with classic UI"
Versions:        "Base layer v2.1.0, Mastra v0.5.0"

Command: udev init my-project --layers base-node,udos,mastra --flavour linux-mint --flavour udos:classic

Result: A complete, working, flavour-appropriate project with all requested features.
```

**This is how you codify your unique development process. This is how every project inherits your hard-won lessons.**

**uDevFramework Templating System – Ready for implementation.**
