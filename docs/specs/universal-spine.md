# Universal Spine Specification

## 🎯 Overview

**Status:** 🟨 PARTIAL (v1.3.0)
**Last Updated:** 2025-04-20
**Target Version:** v1.3.0

The **Universal Spine** defines the consistent directory structure and conventions that all Sonic Family projects follow. This ensures predictability, easier navigation, and better tooling integration across the ecosystem.

## 📁 Root Directory Structure

```
project-root/
├── src/                    # Source code
│   ├── core/               # Essential logic
│   ├── commands/           # CLI commands
│   ├── services/           # External services
│   └── types/              # TypeScript/Go types
├── dev/                    # Development experiments
│   ├── experiments/        # Long-lived experiments
│   └── scratch/            # Temporary throwaway code
├── tests/                  # Unit and integration tests
├── docs/                   # Documentation
├── scripts/                # Automation scripts
├── .github/workflows/      # CI/CD pipelines
├── package.json (or go.mod) # Dependency management
├── Makefile                # Build automation
└── README.md               # Project overview
```

## 🌐 Environment Variables

All projects use these standard environment variables:

| Variable | Purpose | Default | Required |
|----------|---------|---------|----------|
| `UDOS_VAULT` | Document vault path | `~/vault` | ✅ Yes |
| `UDOS_CODE` | Source code path | `~/code-vault` | ✅ Yes |
| `UDOS_STATE` | Runtime state | `~/.local/udos` | ✅ Yes |
| `SONIC_SOCKET` | Sonic daemon socket | `/run/user/1000/sonic.sock` | ❌ No |

**Example `.env` file:**
```bash
# Required
export UDOS_VAULT="~/vault"
export UDOS_CODE="~/code-vault"
export UDOS_STATE="~/.local/udos"

# Optional
export SONIC_SOCKET="/run/user/1000/sonic.sock"
```

## ❌ Exit Codes

Standard exit codes for consistency:

| Code | Name | Meaning |
|------|------|---------|
| 0 | SUCCESS | Operation completed successfully |
| 1 | ERROR | General error occurred |
| 2 | MISSING_DEP | Missing dependency |
| 3 | PERMISSION | Permission denied |
| 4 | TIMEOUT | Operation timed out |
| 5 | NOT_FOUND | Resource not found |
| 6 | INVALID_INPUT | Invalid input provided |
| 7 | CONFIG_ERROR | Configuration error |

**Usage in code:**
```typescript
// Good
if (!fileExists(path)) {
  console.error('File not found');
  process.exit(5); // NOT_FOUND
}

// Bad
if (!fileExists(path)) {
  console.error('File not found');
  process.exit(1); // Generic error
}
```

## 📝 Logging

### Format

All projects use **structured JSON logging**:

```json
{
  "level": "info",
  "time": "2025-04-20T10:00:00Z",
  "msg": "Operation completed",
  "context": {
    "file": "service.ts",
    "function": "processData",
    "durationMs": 150
  }
}
```

### Levels

```
TRACE - Very detailed debugging
DEBUG - Debugging information
INFO - Normal operation messages
WARN - Potential issues
ERROR - Errors that don't stop execution
FATAL - Errors that stop execution
```

### Implementation

**Node.js (TypeScript):**
```typescript
import { createLogger, transports, format } from 'winston';

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/app.log' })
  ]
});

logger.info('Service started', { context: { module: 'main' } });
```

**Go:**
```go
import "github.com/sirupsen/logrus"

func init() {
  logrus.SetFormatter(&logrus.JSONFormatter{})
  logrus.SetOutput(os.Stdout)
  
  if level := os.Getenv("LOG_LEVEL"); level != "" {
    if l, err := logrus.ParseLevel(level); err == nil {
      logrus.SetLevel(l)
    }
  }
}

logrus.WithFields(logrus.Fields{
  "context": map[string]interface{}{
    "module": "main",
    "function": "init",
  },
}).Info("Service started")
```

### Log Rotation

```
Location: ~/.local/share/<project>/logs/
Rotation: 10MB per file
Retention: 7 days
Format: app-YYYY-MM-DD.log
```

## 📦 Dependency Management

### Node.js

```json
{
  "name": "@udos/core",
  "version": "1.0.0-va1",
  "private": true,
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "lint": "eslint ."
  },
  "dependencies": {
    "chalk": "^5.4.1",
    "commander": "^12.1.0"
  },
  "devDependencies": {
    "typescript": "^5.7.3",
    "eslint": "^10.2.1"
  }
}
```

### Go

```go
module github.com/udos/core

go 1.22

require (
	github.com/spf13/cobra v1.8.0
	github.com/sirupsen/logrus v1.9.3
)
```

## 🚀 CI/CD Pipeline

### GitHub Actions Structure

```
.github/workflows/
├── ci.yml              # Continuous Integration
├── release.yml         # Release process
└── nightly.yml         # Nightly builds
```

### Standard CI Pipeline

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npm run build
      - run: npm test
```

### Standard Release Pipeline

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npm run build
      - run: npm test
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## 📝 Documentation

### README.md Structure

```markdown
# Project Name

## Badges

[![Build](https://img.shields.io/github/actions/workflow/status/...)]()
[![Version](https://img.shields.io/npm/v/...)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()

## Description

Short description of the project.

## Installation

```bash
npm install @udos/core
```

## Usage

```typescript
import { udo } from '@udos/core';
udo('command');
```

## Features

- Feature 1
- Feature 2
- Feature 3

## Configuration

Environment variables and config files.

## Development

```bash
npm install
npm run dev
```

## Testing

```bash
npm test
```

## License

MIT
```

### CHANGELOG.md Structure

```markdown
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- New feature 1
- New feature 2

### Changed
- Updated dependency X
- Improved performance of Y

### Fixed
- Fixed bug in Z

## [1.0.0] - 2025-04-20

### Added
- Initial release
```

## 🎯 Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| Directory structure | ✅ Complete | All projects follow spine |
| Environment variables | ✅ Complete | Standard variables defined |
| Exit codes | ✅ Complete | Documented and used |
| Logging format | ✅ Complete | JSON format standardized |
| CI/CD pipelines | 🟨 Partial | Basic pipelines in place |
| Documentation templates | 🟡 Planned | Need to create templates |

## 📚 References

- [Agent Contract](../agents/agent-contract.md)
- [Codegen Rules](../../rules/codegen-rules.md)
- [Implementation Status](../../status/IMPLEMENTATION_STATUS.md)

---

**Universal Spine Specification** — The backbone of all Sonic Family projects 🦴
