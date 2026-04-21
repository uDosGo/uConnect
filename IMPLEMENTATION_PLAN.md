# uDevFramework Hybrid Architecture Implementation Plan

**Status:** Draft
**Date:** 2025-04-22
**Owner:** @fredporter

## Overview

This plan outlines the implementation of the hybrid architecture to make uDos lighter by separating base instructions from domain-specific layers.

## Goals

1. **Reduce uDosConnect size** from ~500MB to <100MB
2. **Enable rapid new product creation** (<5 minutes setup)
3. **Centralize shared services** in Sonic-Screwdriver
4. **Establish clear separation** between base and domain layers
5. **Improve maintainability** through reduced duplication

## Phase 1: Extract Base Components to uDevFramework (2 weeks)

### Week 1: Prepare uDevFramework

**Task 1.1: Create layer system structure**
```bash
cd ~/code-vault/uDevFramework
mkdir -p layers/base-node layers/mcp-server layers/feed-engine layers/auth
```

**Task 1.2: Move VibeCLI base contract**
- Copy VibeCLI spec from uDosConnect to `layers/base-node/vibecli/`
- Remove uDosConnect-specific implementations
- Keep only the contract interface

**Task 1.3: Move DSC2 base agent**
- Copy DSC2 core from uDosConnect to `layers/base-node/dsc2/`
- Extract domain-specific logic
- Document the contract

**Task 1.4: Move MCP protocol definitions**
- Copy MCP schemas from uDosConnect to `layers/mcp-server/`
- Standardize transport definitions
- Document protocol versions

**Deliverables:**
- [ ] Layer directory structure created
- [ ] VibeCLI base contract in place
- [ ] DSC2 base agent extracted
- [ ] MCP protocol definitions standardized
- [ ] Initial layer documentation

### Week 2: Complete Base Extraction

**Task 1.5: Move Feed/Spool schemas**
- Copy feed formats from uDosConnect to `layers/feed-engine/`
- Standardize JSON schemas
- Document versioning strategy

**Task 1.6: Move Universal Spine structure**
- Ensure `specs/architecture/universal-spine.md` is complete
- Create validation script for spine compliance
- Update udev CLI to check spine compliance

**Task 1.7: Create layer composition system**
- Design manifest.yaml format
- Implement layer loading in udev CLI
- Add `udev layer` commands

**Task 1.8: Add manifest support to udev CLI**
```bash
# Add to bin/udev
commands.layer = {
  list: () => { /* list layers */ },
  add: (layer) => { /* add layer */ },
  remove: (layer) => { /* remove layer */ },
  update: () => { /* update layers */ }
}
```

**Deliverables:**
- [ ] Feed/Spool schemas standardized
- [ ] Universal Spine validation script
- [ ] Layer composition system implemented
- [ ] `udev layer` commands working
- [ ] Updated uDevFramework documentation

## Phase 2: Move Shared Services to Sonic (2 weeks)

### Week 3: Prepare Sonic-Screwdriver

**Task 2.1: Set up MCP Server in Sonic**
```bash
cd ~/code-vault/sonic-screwdriver
mkdir -p services/mcp-server
cp ~/code-vault/uDosConnect/core-rs/mcp-server/* services/mcp-server/
```

**Task 2.2: Move Feed Engine to Sonic**
- Copy feed engine from uDosConnect to Sonic
- Set up shared storage backend
- Implement multi-tenant feed access

**Task 2.3: Set up Vector DB in Sonic**
- Move vector DB implementation
- Configure shared access
- Set up indexing pipelines

**Deliverables:**
- [ ] MCP Server running in Sonic
- [ ] Feed Engine integrated
- [ ] Vector DB operational
- [ ] Basic health checks working

### Week 4: Complete Sonic Integration

**Task 2.4: Move WebSocket Server to Sonic**
- Copy WebSocket implementation
- Set up connection pooling
- Implement message routing

**Task 2.5: Update Sonic API documentation**
- Document new endpoints
- Add authentication requirements
- Create usage examples

**Task 2.6: Add health checks**
```bash
# Add to sonic-screwdriver/services/health
const checks = {
  mcp: () => checkMCPServer(),
  feed: () => checkFeedEngine(),
  vector: () => checkVectorDB(),
  ws: () => checkWebSocketServer()
}
```

**Deliverables:**
- [ ] WebSocket Server integrated
- [ ] Complete API documentation
- [ ] Health checks for all services
- [ ] Sonic configuration updated
- [ ] Initial performance benchmarks

## Phase 3: Update uDosConnect (1 week)

### Week 5: Refactor uDosConnect

**Task 3.1: Create manifest.yaml**
```yaml
# uDosConnect/.udev/manifest.yaml
layers:
  base: uDevFramework/layers/base-node@^1.0
  mcp: uDevFramework/layers/mcp-server@^1.0
  feed: uDevFramework/layers/feed-engine@^1.0
  auth: uDevFramework/layers/auth@^1.0
  domain: ./
```

**Task 3.2: Change imports to Sonic endpoints**
```javascript
// Before
import { MCPClient } from './core-rs/mcp-client'

// After
import { MCPClient } from 'sonic-screwdriver/mcp-client'
```

**Task 3.3: Remove local implementations**
```bash
# Remove now-redundant code
rm -rf uDosConnect/core-rs/mcp-server
rm -rf uDosConnect/core-rs/feed-engine
rm -rf uDosConnect/core-rs/vector-db
```

**Deliverables:**
- [ ] manifest.yaml created
- [ ] Imports updated to Sonic
- [ ] Local implementations removed
- [ ] Configuration updated

### Week 5: Test and Document

**Task 3.4: Test end-to-end functionality**
- Verify MCP communication
- Test feed operations
- Check vector search
- Validate WebSocket connections

**Task 3.5: Update uDosConnect documentation**
- Document new architecture
- Update setup instructions
- Add migration guide

**Task 3.6: Create migration guide**
```markdown
# Migration Guide

## Before
```
uDosConnect/ (~500MB)
├── core/
├── core-rs/ (MCP, Feed, Vector)
└── ...
```

## After
```
uDosConnect/ (~50-100MB)
├── .udev/manifest.yaml
├── src/ (domain logic only)
└── ...
```

## Steps
1. Update to latest uDevFramework
2. Create manifest.yaml
3. Update imports
4. Test thoroughly
```

**Deliverables:**
- [ ] End-to-end tests passing
- [ ] Documentation updated
- [ ] Migration guide complete
- [ ] Performance metrics collected

## Phase 4: New Product Template (1 week)

### Week 6: Create Templates

**Task 4.1: Add `udev init` template**
```bash
# Add to udev CLI
commands.init = (projectName, type) => {
  const templates = {
    'swift-backend': 'templates/swift-backend',
    'python-cli': 'templates/python-cli',
    'node-server': 'templates/node-server'
  }
  // Copy template and set up manifest
}
```

**Task 4.2: Create base layer templates**
```bash
mkdir -p uDevFramework/templates/base-node
mkdir -p uDevFramework/templates/base-python
mkdir -p uDevFramework/templates/base-go
```

**Task 4.3: Add layer validation**
```bash
# Add to udev CLI
commands.validate = () => {
  // Check manifest.yaml
  // Verify layer compatibility
  // Validate dependencies
}
```

**Deliverables:**
- [ ] `udev init` template system
- [ ] Base layer templates (Node, Python, Go)
- [ ] Layer validation implemented
- [ ] Template documentation

### Week 6: Document and Example

**Task 4.4: Document composition system**
- Write layer composition guide
- Add examples for different product types
- Document versioning strategy

**Task 4.5: Create example products**
```bash
# Create example swift backend
udev init example-swift-backend --type swift-backend

# Create example python CLI
udev init example-python-cli --type python-cli
```

**Task 4.6: Update framework documentation**
- Update README with hybrid architecture
- Add getting started guide
- Create architecture decision record

**Deliverables:**
- [ ] Layer composition documentation
- [ ] Example products created
- [ ] Framework documentation updated
- [ ] Getting started guide

## Testing Strategy

### Unit Tests
- Test each layer independently
- Verify contract implementations
- Validate manifest parsing

### Integration Tests
- Test layer composition
- Verify cross-layer communication
- Check Sonic service integration

### Performance Tests
- Measure layer loading time
- Benchmark cross-layer calls
- Test under load

### End-to-End Tests
- Full workflow testing
- User journey validation
- Error handling verification

## Risk Management

### Risk: Tight Coupling
**Mitigation:**
- Clear contract boundaries
- Versioned layers
- Independent testing
- Interface validation

### Risk: Performance Overhead
**Mitigation:**
- Local caching
- Connection pooling
- Optimized RPC
- Performance monitoring

### Risk: Complex Debugging
**Mitigation:**
- Unified logging
- Distributed tracing
- Health endpoints
- Debug tools

### Risk: Update Conflicts
**Mitigation:**
- Semantic versioning
- Compatibility testing
- Staged rollouts
- Rollback procedures

## Success Criteria

### Technical Success
- [ ] uDosConnect size reduced to <100MB
- [ ] All base components extracted
- [ ] Sonic services operational
- [ ] Layer composition working
- [ ] New product template functional

### Operational Success
- [ ] Documentation complete
- [ ] Migration guide available
- [ ] Examples working
- [ ] Performance acceptable
- [ ] Team trained

### Business Success
- [ ] New product creation time <5 minutes
- [ ] 3+ products using base by Q3
- [ ] Framework adoption at 100%
- [ ] Positive developer feedback
- [ ] Improved maintainability

## Timeline

```
Week 1-2: Phase 1 - Extract Base Components
Week 3-4: Phase 2 - Move Services to Sonic
Week 5:   Phase 3 - Update uDosConnect
Week 6:   Phase 4 - New Product Template
```

## Resources Required

### Team
- 1-2 developers for extraction work
- 1 developer for Sonic integration
- 1 developer for uDosConnect refactoring
- 1 technical writer for documentation

### Tools
- udev CLI enhancements
- Layer validation scripts
- Performance testing tools
- Documentation templates

### Infrastructure
- Sonic-Screwdriver instance
- Test environments
- CI/CD pipeline updates
- Monitoring setup

## Monitoring and Metrics

### Key Metrics to Track

| Metric | Target | Measurement Method |
|--------|--------|---------------------|
| uDosConnect size | <100MB | `du -sh uDosConnect` |
| New product setup time | <5 minutes | Time from `udev init` to ready |
| Cross-layer call latency | <50ms | Performance testing |
| Layer loading time | <1s | Benchmarking |
| Memory usage | <50% of current | Profiling |

### Monitoring Setup

```bash
# Add to monitoring system
check_uDosConnect_size() {
  size=$(du -sm uDosConnect | cut -f1)
  [ $size -lt 100 ] && return 0 || return 1
}

check_layer_health() {
  udev layer validate
}

check_Sonic_services() {
  curl -s http://localhost:3000/health | grep -q '"status":"ok"'
}
```

## Rollback Plan

### If Issues Arise

1. **Revert to local implementations**
```bash
# Restore from backup
git checkout uDosConnect-backup
```

2. **Fallback to direct calls**
```javascript
// Temporary fallback
if (!sonicAvailable) {
  import { MCPClient } from './local-mcp-client'
}
```

3. **Monitor and alert**
```bash
# Add health check alerts
if ! check_Sonic_services; then
  notify "Sonic services down, falling back to local"
fi
```

## Communication Plan

### Stakeholders
- Development team
- Product owners
- Operations team
- Documentation team

### Updates
- Weekly progress reports
- Bi-weekly demos
- Final presentation
- Migration guide distribution

## Next Steps

1. **Review this plan** with team
2. **Assign tasks** to team members
3. **Set up tracking** in dev/@inbox
4. **Begin Phase 1** implementation
5. **Schedule checkpoints** for each phase

## Appendix

### Layer Manifest Example

```yaml
# .udev/manifest.yaml
name: uDosConnect
version: 1.0.0
description: uDosConnect domain layer

layers:
  base:
    name: uDevFramework/layers/base-node
    version: ^1.0.0
    required: true
  
  mcp:
    name: uDevFramework/layers/mcp-server
    version: ^1.0.0
    required: true
  
  feed:
    name: uDevFramework/layers/feed-engine
    version: ^1.0.0
    required: true
  
  domain:
    name: ./
    version: 1.0.0
    required: true

contracts:
  implements:
    - VibeCLI
    - DSC2
    - Swarm
  
  provides:
    - Hivemind
    - TaskManagement
    - VaultIntegration
```

### udev CLI Extensions

```bash
# New commands to add
udev layer list        # List current layers
udev layer add <layer> # Add a layer
udev layer remove <layer> # Remove a layer
udev layer update       # Update all layers
udev layer validate     # Validate manifest
udev layer info <layer> # Show layer info

udev init <name> --type <type> # Create new product
udev manifest validate        # Validate manifest.yaml
udev manifest update          # Update dependencies
```

### Performance Optimization Tips

1. **Cache layer manifests** locally
2. **Use connection pooling** for Sonic services
3. **Lazy load** non-critical layers
4. **Minimize cross-layer calls** through batching
5. **Profile regularly** to identify bottlenecks

## Conclusion

This implementation plan provides a clear roadmap for transitioning to the hybrid architecture. By following this plan, we will achieve a lighter, more maintainable uDosConnect while enabling rapid creation of new products that share the same powerful foundation.
