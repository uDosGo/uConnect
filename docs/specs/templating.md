# Templating System Specification

## 🎯 Overview

**Status:** 🟡 PLANNED (v2.0.0)
**Last Updated:** 2025-04-20
**Target Version:** v2.0.0

The uDevFramework templating system enables **layered, versioned, flavour-aware** project generation. Projects are composed from reusable components called **layers**, customized by **flavours**, and rendered using a powerful templating engine.

## 🏗️ Core Concepts

### 1. Layers

**Layers** are reusable, versioned components that provide project structure and functionality.

```
Layer Types:
├── Base Layers (required)
│   ├── base-node
│   ├── base-go
│   ├── base-python
│   └── base-rust
└── Custom Layers (optional)
    ├── udos
    ├── mastra
    ├── chasis
    ├── wordpress
    └── github-actions
```

### 2. Flavours

**Flavours** customize layers for specific platforms, OS, or styles.

```
Flavour Families:
├── OS Flavours
│   ├── linux-ubuntu
│   ├── linux-mint
│   ├── mac-arm
│   └── mac-intel
├── UI Flavours
│   ├── classic
│   ├── modern
│   ├── minimal
│   └── retro
└── Runtime Flavours
    ├── node18
    ├── node20
    ├── py3.11
    └── go1.22
```

### 3. Versioning

All components use **semantic versioning** with range support:
- Exact: `base-node@2.1.0`
- Range: `base-node@^2.0.0`
- Latest: `mastra@latest`
- Branch: `udos@branch:develop`

## 📦 Layer Manifest Format

Each layer has a `layer.yaml` file:

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

## 🎨 Flavour Manifest Format

```yaml
# flavours/linux-mint.yaml
name: linux-mint
extends: linux-ubuntu

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

## 📁 Project Composition

### Example Command

```bash
udev init my-udos \
  --layers base-node@2.1.0,udos@1.0.0,mastra@0.5.0 \
  --flavour linux-mint \
  --flavour udos:classic
```

### Resolution Process

```
1. Load base-node@2.1.0 with node20 flavour
2. Load udos@1.0.0 with classic flavour
3. Load mastra@0.5.0 with deepseek flavour
4. Apply linux-mint flavour overrides
5. Merge all files (later layers override earlier)
6. Render templates with variables
7. Execute post-install scripts
8. Write .udev/manifest.yaml
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

## 🔧 Template Engine

### Syntax

```handlebars
# tsconfig.json.template
{
  "compilerOptions": {
    "target": "{{target | default('ES2020')}}",
    "module": "commonjs",
    "outDir": "./{{out_dir | default('dist')}}",
    "rootDir": "./{{root_dir | default('src')}}",
    "strict": {{strict | default('true')}}
  }
}

# After rendering with variables:
# target = "ESNext", out_dir = "build", strict = false
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "commonjs",
    "outDir": "./build",
    "rootDir": "./src",
    "strict": false
  }
}
```

### Available Filters

```
{{ variable | default('fallback') }}
{{ variable | uppercase }}
{{ variable | lowercase }}
{{ variable | trim }}
{{ variable | json }}
{{ variable | yaml }}
```

### Built-in Variables

```
Date/Time:
  {{ date }}          # 2025-04-20
  {{ timestamp }}     # 2025-04-20T10:00:00Z
  {{ year }}          # 2025
  {{ month }}         # 04
  {{ day }}           # 20

System:
  {{ user }}          # Current username
  {{ hostname }}      # Machine hostname
  {{ os }}            # linux, darwin, win32
  {{ arch }}          # x64, arm64

Project:
  {{ project.name }}
  {{ project.version }}
  {{ project.description }}

Layer:
  {{ layer.name }}
  {{ layer.version }}
  {{ layer.flavour }}

Flavour:
  {{ flavour.name }}
  {{ flavour.variables.KEY }}
```

## 🔄 File Merging Strategies

### Merge Rules

```
1. JSON/YAML files: Deep merge
   - Objects are merged recursively
   - Arrays are concatenated
   - Primitives are replaced

2. Template files (*.template): Render + Replace
   - Render template with variables
   - Replace target file

3. Static files: Replace
   - Later layer replaces earlier

4. Directory conflicts: Recursive merge
   - Merge directory contents
   - Apply file merge rules
```

### Conflict Resolution

```
Strategies:
1. Later layer wins (default)
2. User prompt (interactive)
3. Abort (fail fast)
4. Skip (keep existing)
```

## 📊 Implementation Status

| Component | Status | Target | Notes |
|-----------|--------|--------|-------|
| Layer loading | 🟡 Planned | v1.4.0 | Basic implementation |
| Template rendering | 🟡 Planned | v1.5.0 | Handlebar-style templates |
| Flavour system | 🟡 Planned | v1.6.0 | Variable substitution |
| File merging | 🟡 Planned | v1.7.0 | Deep merge, conflicts |
| Project init | 🟡 Planned | v1.8.0 | Full project generation |
| Project update | 🟡 Planned | v1.9.0 | Update existing projects |

## 🎯 Design Principles

1. **Composable**: Layers can be combined in any order
2. **Overrideable**: Later layers override earlier
3. **Customizable**: Flavours adapt to platforms
4. **Transparent**: Clear what comes from where
5. **Deterministic**: Same input → same output
6. **Extensible**: Easy to add new layer types
7. **Agent-friendly**: Specs that AI can follow
8. **Human-readable**: Clear documentation

## 🔮 Future Enhancements

### Registry System (v2.0.0)

```
https://registry.udev.sh/
├── v1/
│   ├── layers/
│   │   ├── base-node/
│   │   │   ├── 2.1.0/
│   │   │   ├── 2.0.0/
│   │   │   └── latest
│   │   └── udos/
│   └── flavours/
│       ├── linux-mint/
│       └── mac-arm/
└── v2/ (future)
```

### Advanced Features

```
Conditional layers: Only include if condition met
Layer dependencies: A requires B
Circular dependency detection
Layer version ranges: ^2.0.0
Layer aliases: @latest, @stable
Private layers: Team/organization scope
Layer signing: Cryptographic verification
```

## 📚 References

- [Universal Spine Specification](../architecture/universal-spine.md)
- [Agent Contract](../agents/agent-contract.md)
- [Implementation Status](../../status/IMPLEMENTATION_STATUS.md)

---

**Templating System Specification** — The engine that powers uDevFramework 🚀
