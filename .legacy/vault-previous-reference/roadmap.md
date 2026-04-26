# uDevFramework Roadmap

## 🗺️ Overview

This roadmap outlines the development plan for uDevFramework, the universal scaffolding system for Sonic Family projects.

## 🎯 Vision

**uDevFramework will be the DNA of all Sonic Family projects** — providing consistent structure, reusable components, and agent-aware specifications that enable both human and AI developers to build better software faster.

## 📅 Release Plan

### ✅ Phase 1: Foundation (v1.0 - v1.3) - COMPLETE

**Goal:** Establish core framework and documentation

| Version | Date | Features | Status |
|---------|------|----------|--------|
| v1.0.0 | 2025-04-20 | Initial repository structure | ✅ Done |
| v1.1.0 | 2025-04-20 | Core specifications & CLI | ✅ Done |
| v1.2.0 | 2025-04-20 | Templating system spec | ✅ Done |
| v1.3.0 | 2025-04-20 | Implementation tracking | ✅ Done |

**Deliverables:**
- ✅ Repository structure
- ✅ Core specifications (universal spine, agent contract)
- ✅ CLI tool (help, spec, rule commands)
- ✅ Implementation status tracking
- ✅ Documentation framework

### 🟨 Phase 2: Basic Templating (v1.4 - v1.9) - CURRENT

**Goal:** Implement local layer composition without registry

| Version | Target Date | Features | Status |
|---------|-------------|----------|--------|
| v1.4.0 | 2025-05-01 | Local layer loading | 🟡 Planned |
| v1.5.0 | 2025-05-15 | Basic template rendering | 🟡 Planned |
| v1.6.0 | 2025-06-01 | Simple flavour support | 🟡 Planned |
| v1.7.0 | 2025-06-15 | Layer validation | 🟡 Planned |
| v1.8.0 | 2025-07-01 | Project initialization | 🟡 Planned |
| v1.9.0 | 2025-07-15 | Project updating | 🟡 Planned |

**Deliverables:**
- 🟡 Local layer composition engine
- 🟡 Template rendering with variables
- 🟡 Basic flavour system
- 🟡 Layer validation
- 🟡 `udev init` command
- 🟡 `udev update` command

### 🟡 Phase 3: Advanced Features (v2.0 - v2.3)

**Goal:** Production-ready framework with registry

| Version | Target Date | Features | Status |
|---------|-------------|----------|--------|
| v2.0.0 | 2025-08-01 | Remote layer registry | 🟡 Planned |
| v2.1.0 | 2025-09-01 | Version range resolution | 🟡 Planned |
| v2.2.0 | 2025-10-01 | Layer dependencies | 🟡 Planned |
| v2.3.0 | 2025-11-01 | Conflict detection | 🟡 Planned |

**Deliverables:**
- 🟡 Remote registry API
- 🟡 Layer publishing workflow
- 🟡 Version range resolution (^, ~, etc.)
- 🟡 Dependency graph resolution
- 🟡 Conflict detection and resolution

### ❌ Phase 4: Ecosystem (v2.4 - v3.0)

**Goal:** Complete ecosystem with UI and integrations

| Version | Target Date | Features | Status |
|---------|-------------|----------|--------|
| v2.4.0 | 2025-12-01 | Web UI for browsing layers | ❌ Blocked |
| v2.5.0 | 2026-01-01 | IDE integration (VSCode) | ❌ Blocked |
| v2.6.0 | 2026-02-01 | CI/CD integration | ❌ Blocked |
| v3.0.0 | 2026-03-01 | Agent automation | ❌ Blocked |

**Deliverables:**
- ❌ Web interface for layer browsing
- ❌ VSCode extension
- ❌ GitHub Actions integration
- ❌ Agent-driven project generation

## 📊 Feature Roadmap

### Core Framework

| Feature | Priority | Target Version | Status |
|---------|----------|----------------|--------|
| Local layer loading | High | v1.4.0 | 🟡 Planned |
| Template rendering | High | v1.5.0 | 🟡 Planned |
| Basic flavours | High | v1.6.0 | 🟡 Planned |
| Layer validation | Medium | v1.7.0 | 🟡 Planned |
| Project init | High | v1.8.0 | 🟡 Planned |
| Project update | Medium | v1.9.0 | 🟡 Planned |

### Layer Registry

| Feature | Priority | Target Version | Status |
|---------|----------|----------------|--------|
| Registry API | High | v2.0.0 | 🟡 Planned |
| Layer publishing | High | v2.0.0 | 🟡 Planned |
| Version ranges | Medium | v2.1.0 | 🟡 Planned |
| Dependencies | Medium | v2.2.0 | 🟡 Planned |
| Conflict detection | Low | v2.3.0 | 🟡 Planned |

### Agent Integration

| Feature | Priority | Target Version | Status |
|---------|----------|----------------|--------|
| Mastra integration | High | v1.8.0 | 🟡 Planned |
| Hivemind tasks | Medium | v2.0.0 | 🟡 Planned |
| DSC2 validation | Low | v2.1.0 | 🟡 Planned |
| Agent-driven init | Low | v3.0.0 | ❌ Blocked |

### Tooling & UI

| Feature | Priority | Target Version | Status |
|---------|----------|----------------|--------|
| Web UI | Low | v2.4.0 | ❌ Blocked |
| VSCode extension | Low | v2.5.0 | ❌ Blocked |
| CI/CD integration | Medium | v2.6.0 | ❌ Blocked |

## 🎯 Milestones

### Q2 2025: Foundation Complete ✅
- Repository structure
- Core specifications
- Basic CLI
- Documentation framework

### Q3 2025: Basic Templating 🟨
- Local layer composition
- Template rendering
- Simple flavours
- Project initialization

### Q4 2025: Advanced Features 🟡
- Remote registry
- Version resolution
- Dependency management
- Conflict detection

### Q1 2026: Ecosystem ❌
- Web UI
- IDE integration
- CI/CD pipelines
- Agent automation

## 📈 Progress Tracking

### Q2 2025 Progress

```
✅ Repository created
✅ Core specs written
✅ CLI implemented (basic)
✅ Documentation framework
✅ Implementation tracking
```

**Status:** 100% Complete

### Q3 2025 Progress

```
🟡 Local layer loading
🟡 Template rendering
🟡 Basic flavours
🟡 Layer validation
🟡 Project initialization
```

**Status:** 0% Complete

### Q4 2025 Progress

```
🟡 Remote registry
🟡 Version resolution
🟡 Dependency management
🟡 Conflict detection
```

**Status:** 0% Complete

## 🤖 Agent Integration Plan

### Mastra Integration

**Goal:** Enable Mastra agents to generate uDevFramework-compliant projects

**Steps:**
1. ✅ Define codegen rules (v1.3.0)
2. 🟡 Create layer manifest schema (v1.4.0)
3. 🟡 Implement agent API (v1.8.0)
4. 🟡 Test with real projects (v2.0.0)

### Hivemind Integration

**Goal:** Enable Hivemind agents to manage uDevFramework tasks

**Steps:**
1. ✅ Define agent contract (v1.1.0)
2. 🟡 Create task manifest format (v1.6.0)
3. 🟡 Implement task tracking (v2.0.0)
4. 🟡 Integrate with project workflow (v2.1.0)

### DSC2 Integration

**Goal:** Enable DSC2 to validate uDevFramework specifications

**Steps:**
1. ✅ Define universal spine (v1.1.0)
2. 🟡 Create validation rules (v1.7.0)
3. 🟡 Implement validation API (v2.1.0)
4. 🟡 Integrate with CI/CD (v2.2.0)

## 📋 Backlog

### High Priority

| Item | Priority | Target | Status |
|------|----------|--------|--------|
| Local layer loading | High | v1.4.0 | 🟡 Planned |
| Template rendering | High | v1.5.0 | 🟡 Planned |
| Project init | High | v1.8.0 | 🟡 Planned |

### Medium Priority

| Item | Priority | Target | Status |
|------|----------|--------|--------|
| Basic flavours | Medium | v1.6.0 | 🟡 Planned |
| Layer validation | Medium | v1.7.0 | 🟡 Planned |
| Project update | Medium | v1.9.0 | 🟡 Planned |

### Low Priority

| Item | Priority | Target | Status |
|------|----------|--------|--------|
| Web UI | Low | v2.4.0 | ❌ Blocked |
| VSCode extension | Low | v2.5.0 | ❌ Blocked |
| CI/CD integration | Low | v2.6.0 | ❌ Blocked |

## 🎯 Success Metrics

### v1.4.0 - Local Layers
- ✅ Can load local layer files
- ✅ Basic file merging works
- ✅ Template variable substitution

### v1.8.0 - Project Init
- ✅ `udev init` creates working project
- ✅ Layer composition works
- ✅ Flavour customization applied
- ✅ Post-install scripts execute

### v2.0.0 - Registry
- ✅ Remote layer registry operational
- ✅ Layer publishing workflow
- ✅ Version resolution working
- ✅ Dependency management

### v3.0.0 - Ecosystem
- ✅ Web UI for browsing layers
- ✅ VSCode extension published
- ✅ CI/CD integration complete
- ✅ Agent automation working

## 🔗 References

- [Implementation Status](IMPLEMENTATION_STATUS.md)
- [Universal Spine Specification](../../specs/architecture/universal-spine.md)
- [Agent Contract](../../specs/agents/agent-contract.md)
- [Templating System](../../specs/templating/TEMPLATING_SYSTEM_BRIEF.md)

---

**uDevFramework Roadmap** — The path to universal project DNA 🧬
