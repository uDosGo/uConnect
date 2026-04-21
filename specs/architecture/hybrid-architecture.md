# 🧬 Hybrid Architecture: Base Instructions vs Domain-Specific Layers

**Status:** Proposed
**Last Updated:** 2025-04-22
**Author:** @fredporter

## Overview

This specification defines a **hybrid architecture** that separates **base instructions** (universal framework) from **domain-specific layers** (product implementations). This approach enables lightweight, maintainable products while providing a powerful shared foundation.

## Core Separation Principle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         uDevFramework (Universal Base)                       │
│  • Agent contracts (VibeCLI, DSC2, Swarm, Orchestrator)                     │
│  • Universal Spine structure                                                │
│  • Code generation rules                                                    │
│  • Templating system                                                        │
│  • MCP protocol definitions                                                 │
│  • Feed/Spool formats                                                       │
│  • Security rules (auth, rate limiting, secrets)                            │
│                                                                              │
│  ✅ NO domain-specific logic (uDos, uHome, Swift, etc.)                     │
│  ✅ NO business logic                                                       │
│  ✅ NO external API keys (those go in Sonic)                                │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ extends / imports
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Domain Layers (Specific to Product)                  │
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  uDosConnect │  │  uHomeNest   │  │  Swift App   │  │  Python CLI  │    │
│  │  Layer       │  │  Layer       │  │  Layer       │  │  Layer       │    │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤  ├──────────────┤    │
│  │ Swarm logic  │  │ Matter/HA    │  │ iOS UI       │  │ Data science │    │
│  │ Agent tasks  │  │ Device mgmt  │  │ App Store    │  │ ML models    │    │
│  │ Hivemind     │  │ Scene ctrl   │  │ SwiftUI      │  │ Notebooks    │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                                              │
│  Each domain layer:                                                          │
│  • Implements base contracts from uDevFramework                             │
│  • Adds domain-specific logic                                                │
│  • Can be developed independently                                            │
│  • Can be swapped/upgraded without affecting base                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

## What Belongs in uDevFramework (Base Instructions)

### ✅ Base Components

| Category | Contents | Examples |
|----------|----------|----------|
| **Agent Contracts** | VibeCLI spec, DSC2 spec, Swarm spec, Orchestrator spec | Input/output formats, error handling, session mgmt |
| **Universal Spine** | Directory structure standards | `src/`, `dev/`, `tests/`, `docs/`, `.github/` |
| **Codegen Rules** | How agents should generate code | Naming, structure, comments, error handling |
| **Templating System** | Template engine and layer composition | Mustache/handlebars, variable substitution |
| **MCP Protocol** | Model Context Protocol definitions | Tool schemas, transport standards, auth flows |
| **Feed/Spool** | Reply feed and spool formats | JSON schemas, versioning, storage patterns |
| **Security Base** | Auth, rate limiting, secrets management patterns | JWT structure, Redis keys, encryption patterns |
| **CLI Base** | `udev` command structure | `udev init`, `udev update`, `udev layer` |

### ❌ What Does NOT Belong in uDevFramework

| Category | Reason | Where it goes |
|----------|--------|---------------|
| **API Keys** | Domain-specific, security-sensitive | Sonic-Screwdriver (API Central Hub) |
| **Business Logic** | Domain-specific | Domain layers (uDosConnect, etc.) |
| **UI Components** | Domain-specific | Domain layers |
| **Database Schemas** | Domain-specific | Domain layers |
| **Device Drivers** | Domain-specific | Domain layers |
| **External Service Logic** | Domain-specific | Domain layers or Sonic proxy |

## Benefits of This Architecture

### 1. Lightweight Products
- Each product contains only domain-specific logic
- Base functionality is inherited from uDevFramework
- Reduced duplication across products
- Faster loading and deployment

### 2. Consistent Foundation
- All products use the same agent contracts
- Uniform directory structure
- Standardized code generation
- Predictable behavior across products

### 3. Independent Development
- Domain layers can be developed separately
- Base updates don't break domain logic
- Products can evolve at different paces
- Easier to experiment with new features

### 4. Rapid Product Creation
- New products inherit all base capabilities
- Focus development on unique value
- Reuse proven patterns and contracts
- Faster time-to-market

## Implementation Example: uDosConnect

### Before (Monolithic)
```
uDosConnect/ (~500MB)
├── core/ (TypeScript CLI, MCP client, swarm, agents)
├── core-rs/ (Rust MCP server, vector DB, feed engine)
├── tools/ (vibe-mcp, dsc2-mcp, sonic-express)
├── dev/ (dev workflows, tasks, agents configs)
├── agents/ (Mastra, Hivemind, DSC2 implementations)
└── cloud-stubs/ (WordPress, etc.)
```

### After (Hybrid)
```
uDosConnect/ (~50-100MB)
├── .udev/
│   └── manifest.yaml      # References base layers
├── src/                   # uDos-specific business logic only
│   ├── swarm/             # Swarm orchestration (implements base contract)
│   ├── tasks/             # Task definitions
│   └── hivemind/          # Hivemind logic
├── domain/                # Domain models
│   ├── agent/             # Agent definitions
│   ├── workflow/          # Workflow definitions
│   └── vault/             # Vault integration
└── tests/                 # Tests only
```

**What moved to uDevFramework:**
- VibeCLI base implementation
- DSC2 base agent
- MCP protocol definitions
- Universal Spine structure
- Codegen rules
- Templating engine

**What stayed in uDosConnect:**
- Swarm orchestration logic (implements base contract)
- Hivemind task management
- Domain-specific agent behaviors
- Vault integration logic

## Sonic-Screwdriver as API Central Hub

Sonic should own **all external communication and secrets**:

### Already in Sonic (or planned):
- ✅ API keys (OpenRouter, DeepSeek, Gemini, GitHub)
- ✅ API proxy with rate limiting
- ✅ Node registration and authentication
- ✅ Secret store (encrypted)

### Should Move to Sonic:

| Component | Current Location | Benefit of Moving |
|-----------|------------------|------------------|
| **MCP Server** | uDosConnect/core-rs/ | Centralized MCP endpoint, one port |
| **Feed Engine** | uDosConnect/core-rs/ | Shared feed across all products |
| **Vector DB** | uDosConnect/core-rs/ | Single vector store for all agents |
| **WebSocket Server** | uDosConnect/core-rs/ | One real-time connection hub |
| **Audit Log** | uDosConnect/core-rs/ | Central security audit |

### Resulting Architecture

```
Sonic-Screwdriver (API Central Hub)
├── MCP Server (unified endpoint)
├── Feed Engine (shared reply storage)
├── Vector DB (shared semantic search)
├── WebSocket Server (real-time)
├── Secret Store (encrypted keys)
├── Audit Log (security)
├── Rate Limiting (Redis)
└── Node Registry (authentication)

uDosConnect (Domain Logic - Lightweight)
├── Swarm Orchestrator (implements base contract)
├── Hivemind Task Manager
├── Agent Behaviors (domain-specific)
└── Vault Integration

uHomeNest (Domain Logic - Lightweight)
├── Matter/HA Integration
├── Device Control
└── Scene Automation
```

## Creating New Products

With this separation, creating new server-type products becomes straightforward:

### Example: Swift App Backend Server

```yaml
# .udev/manifest.yaml for swift-backend
layers:
  base: uDevFramework/layers/base-node@^2.0
  mcp: uDevFramework/layers/mcp-server@^1.0
  feed: uDevFramework/layers/feed-engine@^1.0
  auth: uDevFramework/layers/auth@^1.0
  domain: swift-backend/  # local domain logic
```

**Result:** Swift backend gets MCP, feed, auth for free – just add domain logic.

### Example: Python Data Science Server

```yaml
layers:
  base: uDevFramework/layers/base-python@^1.0
  mcp: uDevFramework/layers/mcp-server@^1.0
  vector: uDevFramework/layers/vector-db@^1.0
  domain: ml-server/  # local ML models
```

### Example: Lightweight IoT Gateway

```yaml
layers:
  base: uDevFramework/layers/base-go@^1.0
  mcp: uDevFramework/layers/mcp-client@^1.0  # client only, not server
  domain: iot-gateway/
```

## Implementation Roadmap

### Phase 1: Extract Base to uDevFramework (2 weeks)
- [ ] Move VibeCLI, DSC2, Swarm base contracts
- [ ] Move MCP protocol definitions
- [ ] Move Feed/Spool schemas
- [ ] Move Universal Spine structure
- [ ] Create layer composition system
- [ ] Add manifest.yaml support to udev CLI

### Phase 2: Move Shared Services to Sonic (2 weeks)
- [ ] Move MCP server from uDosConnect to Sonic
- [ ] Move Feed Engine to Sonic
- [ ] Move Vector DB to Sonic
- [ ] Move WebSocket server to Sonic
- [ ] Update Sonic API documentation
- [ ] Add health checks for all services

### Phase 3: Update uDosConnect to Use Remote Services (1 week)
- [ ] Change imports to call Sonic's MCP/Feed endpoints
- [ ] Remove local implementations
- [ ] Update configuration to point to Sonic
- [ ] Test end-to-end functionality
- [ ] Update uDosConnect documentation
- [ ] Create migration guide

### Phase 4: Create New Product Template (1 week)
- [ ] Add `udev init` template for new servers
- [ ] Create base layer templates (Node, Python, Go)
- [ ] Add layer validation to udev CLI
- [ ] Document layer composition system
- [ ] Create example products
- [ ] Update framework documentation

## Success Metrics

| Metric | Target | Current |
|--------|--------|---------|
| uDosConnect size | <100MB | ~500MB |
| New server setup time | <5 minutes | ~30 minutes |
| Cross-product feed queries | <100ms | N/A |
| Shared MCP uptime | 99.9% | N/A |
| Number of products using base | 3+ by Q3 | 1 |
| Framework adoption rate | 100% of new products | 0% |

## Governance Model

### Layer Versioning
- Base layers use semantic versioning
- Domain layers can use their own versioning
- Manifest specifies compatible versions

### Update Strategy
- Base layers can be updated independently
- Domain layers specify version ranges
- Breaking changes require major version bumps

### Dependency Management
- `udev update` checks for layer updates
- `udev layer list` shows current layers
- `udev layer update` updates to latest compatible versions

## Migration Path for Existing Products

### For uDosConnect:
1. Extract base components to uDevFramework
2. Create manifest.yaml referencing base layers
3. Remove duplicated base code
4. Test with remote Sonic services
5. Update documentation

### For uHomeNest:
1. Identify base components already in uDevFramework
2. Create manifest.yaml
3. Remove duplicates
4. Test integration
5. Update documentation

### For New Products:
1. Use `udev init` with appropriate template
2. Add domain-specific logic
3. Test and deploy

## Risks and Mitigations

### Risk: Tight Coupling
**Mitigation:** Clear contract boundaries, versioned layers, independent testing

### Risk: Performance Overhead
**Mitigation:** Local caching, optimized RPC, connection pooling

### Risk: Complex Debugging
**Mitigation:** Unified logging, distributed tracing, health endpoints

### Risk: Update Conflicts
**Mitigation:** Semantic versioning, compatibility testing, staged rollouts

## Conclusion

This hybrid architecture provides the best of both worlds:
- **Lightweight products** with only domain-specific logic
- **Powerful shared foundation** with proven patterns
- **Rapid development** of new products
- **Consistent behavior** across the ecosystem

By separating base instructions from domain-specific layers, we enable:
- Faster development cycles
- Easier maintenance
- Better scalability
- Improved code reuse
- Clearer separation of concerns

**Recommendation:** Proceed with Phase 1 implementation to validate the architecture with uDosConnect as the pilot product.
