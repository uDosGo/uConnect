# Hybrid Architecture Quick Reference

## Core Concept

**Separate base instructions from domain-specific layers** to create lightweight, maintainable products with a powerful shared foundation.

## Architecture Diagram

```
Universal Base (uDevFramework)
│
└─┬─────────────────────────────────────────────────────────────────────────┐
  │                                                                         │
Domain Layers (Products)                                                  Domain Layers (Products)
  │                                                                         │
uDosConnect          uHomeNest           Swift App          Python CLI
```

## What Goes Where

### ✅ uDevFramework (Base)
- Agent contracts (VibeCLI, DSC2, Swarm, Orchestrator)
- Universal Spine structure
- Code generation rules
- Templating system
- MCP protocol definitions
- Feed/Spool formats
- Security rules (auth, rate limiting, secrets)
- CLI base (`udev` commands)

### ❌ NOT in uDevFramework
- API keys → Sonic-Screwdriver
- Business logic → Domain layers
- UI components → Domain layers
- Database schemas → Domain layers
- Device drivers → Domain layers
- External service logic → Domain layers or Sonic

### 🏠 Sonic-Screwdriver (API Central Hub)
- MCP Server (unified endpoint)
- Feed Engine (shared reply storage)
- Vector DB (shared semantic search)
- WebSocket Server (real-time)
- Secret Store (encrypted keys)
- Audit Log (security)
- Rate Limiting (Redis)
- Node Registry (authentication)

### 📦 Domain Layers (Products)
- **uDosConnect**: Swarm logic, Hivemind, Agent tasks
- **uHomeNest**: Matter/HA, Device management, Scene control
- **Swift App**: iOS UI, App Store integration, SwiftUI
- **Python CLI**: Data science, ML models, Notebooks

## Benefits

### 1. Lightweight Products
- uDosConnect: ~50-100MB (from ~500MB)
- Only domain-specific logic in each product
- Base functionality inherited from uDevFramework

### 2. Consistent Foundation
- All products use same agent contracts
- Uniform directory structure
- Standardized code generation
- Predictable behavior

### 3. Independent Development
- Domain layers developed separately
- Base updates don't break domain logic
- Products evolve at different paces

### 4. Rapid Product Creation
- New products inherit all base capabilities
- Focus on unique value
- Reuse proven patterns

## Implementation Example

### Before (Monolithic uDosConnect)
```
uDosConnect/ (~500MB)
├── core/ (TypeScript CLI, MCP client, swarm, agents)
├── core-rs/ (Rust MCP server, vector DB, feed engine)
├── tools/ (vibe-mcp, dsc2-mcp, sonic-express)
├── dev/ (dev workflows, tasks, agents configs)
├── agents/ (Mastra, Hivemind, DSC2 implementations)
└── cloud-stubs/ (WordPress, etc.)
```

### After (Hybrid Architecture)
```
uDosConnect/ (~50-100MB)
├── .udev/
│   └── manifest.yaml      # References base layers
├── src/                   # Domain-specific logic only
│   ├── swarm/             # Implements base contract
│   ├── tasks/             # Task definitions
│   └── hivemind/          # Hivemind logic
├── domain/                # Domain models
│   ├── agent/             # Agent definitions
│   ├── workflow/          # Workflow definitions
│   └── vault/             # Vault integration
└── tests/                 # Tests only
```

## Creating New Products

### Swift App Backend Server
```yaml
# .udev/manifest.yaml
layers:
  base: uDevFramework/layers/base-node@^2.0
  mcp: uDevFramework/layers/mcp-server@^1.0
  feed: uDevFramework/layers/feed-engine@^1.0
  auth: uDevFramework/layers/auth@^1.0
  domain: swift-backend/  # local domain logic
```

### Python Data Science Server
```yaml
layers:
  base: uDevFramework/layers/base-python@^1.0
  mcp: uDevFramework/layers/mcp-server@^1.0
  vector: uDevFramework/layers/vector-db@^1.0
  domain: ml-server/  # local ML models
```

## Implementation Roadmap

### Phase 1: Extract Base (2 weeks)
- Move VibeCLI, DSC2, Swarm base contracts
- Move MCP protocol definitions
- Move Feed/Spool schemas
- Move Universal Spine structure
- Create layer composition system
- Add manifest.yaml support to udev CLI

### Phase 2: Move Services to Sonic (2 weeks)
- Move MCP server from uDosConnect to Sonic
- Move Feed Engine to Sonic
- Move Vector DB to Sonic
- Move WebSocket server to Sonic
- Update Sonic API documentation
- Add health checks

### Phase 3: Update uDosConnect (1 week)
- Change imports to call Sonic endpoints
- Remove local implementations
- Update configuration
- Test end-to-end
- Update documentation
- Create migration guide

### Phase 4: New Product Template (1 week)
- Add `udev init` template
- Create base layer templates
- Add layer validation
- Document composition system
- Create examples
- Update framework docs

## Success Metrics

| Metric | Target |
|--------|--------|
| uDosConnect size | <100MB |
| New server setup time | <5 minutes |
| Cross-product feed queries | <100ms |
| Shared MCP uptime | 99.9% |
| Products using base | 3+ by Q3 |

## Quick Commands

```bash
# Create new product
udev init my-new-server --type swift-backend

# List current layers
udev layer list

# Update layers
udev layer update

# Validate manifest
udev layer validate

# Show layer info
udev layer info base-node
```

## Best Practices

1. **Keep base layers minimal** - Only universal patterns and contracts
2. **Version layers properly** - Use semantic versioning
3. **Document contracts clearly** - Clear input/output specifications
4. **Test layers independently** - Unit tests for each layer
5. **Use manifest.yaml** - Always declare dependencies
6. **Avoid circular dependencies** - Base shouldn't depend on domain
7. **Cache aggressively** - Minimize cross-layer calls
8. **Monitor performance** - Track layer interaction latency

## See Also

- Full specification: `specs/architecture/hybrid-architecture.md`
- Universal Spine: `specs/architecture/universal-spine.md`
- Layer composition: `specs/architecture/layer-system.md` (planned)
- uDevFramework CLI: `docs/tools/vibecli.md`
