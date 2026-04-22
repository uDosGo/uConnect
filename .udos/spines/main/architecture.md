# uDos Main Spine Architecture
# Cycle 1, Round 3: Core Integration Layer

## Overview

The **main spine** is the primary architecture for uDos, designed for flexibility, safety, and integration with WordPress and other systems.

## Core Components

### 1. Core System (`core/`)
- **CLI**: Main command-line interface
- **Network Manager**: LAN detection, service discovery
- **WP Integration**: User synchronization
- **Feed Engine**: Universal feed format
- **Process Manager**: Startup and monitoring

### 2. Modules (`modules/`)
- **wp-integration**: WordPress user sync
- **feed-engine**: Feed processing
- **vector-db**: Semantic search (future)
- **cron-system**: Hybrid scheduling (future)

### 3. Tools (`tools/`)
- **sonic-express**: Fast build system
- **usxd-express**: UI surface tool
- **webhook-listener**: External events (future)

### 4. UI (`ui/`)
- **Vue 3**: Frontend framework
- **Tailwind CSS**: Styling
- **Admin Dashboard**: User management (future)

## Data Flow

```
WordPress MySQL → [WP Connector] → uDos SQLite → [Sync Engine] → uDos Core
                                    ↑                     ↓
                                Feed Engine ←→ REST API
```

## Integration Points

### WordPress Integration
- **MySQL Connector**: Direct database access
- **User Sync**: Bi-directional synchronization
- **Permission Mapping**: Role-based access control
- **Webhook Listener**: External event handling

### Network Layer
- **LAN Detection**: Auto-detect interfaces
- **Service Discovery**: mDNS/Avahi/Bonjour
- **Peer Detection**: Find other uDos instances
- **Fallback IP**: Automatic recovery

### Feed System
- **Universal Format**: JSON-based feed format
- **Reply Tracking**: Threaded conversations
- **Vector Indexing**: Semantic search (future)
- **Archive Hierarchy**: Trash→Compost→Legacy

## Safety Architecture

### Safety Levels
- **strict**: Core system, authentication
- **normal**: Most modules
- **relaxed**: Playground, experiments

### Safety Checks
- **Code Review**: Required for AI-generated code
- **Dependency Audit**: Security scanning
- **Secret Detection**: No hardcoded credentials
- **Hallucination Check**: AI output validation
- **Boundary Check**: No cross-compartment leaks

### Review Process
1. **Automated Checks**: Lint, type check, tests
2. **Human Review**: Code walkthrough
3. **Exception Handling**: Documented deviations
4. **Approval**: Sign-off for release

## Development Workflow

### Round-Based Development
1. **Plan**: Create round tasks from backlog
2. **Develop**: Code generation, testing, documentation
3. **Review**: Safety checks and approval
4. **Release**: Tag version and archive
5. **Repeat**: Next round begins

### Dev vs User Mode
- **Dev Mode**: AI-powered, may incur cost
- **User Mode**: Templated, safe, free
- **CLI Commands**: `udo dev` vs `ucode`

## Spine Variants

### Main Spine (Current)
- Full-featured
- WordPress integration
- Network resilience
- Safety reviews

### Lightweight Spine (Future)
- Minimal dependencies
- No WordPress integration
- Basic networking
- Simplified safety

### Experimental Spine (Future)
- Cutting-edge features
- Research and development
- Unstable, rapid iteration

## Configuration

### Environment Variables
- `UDOS_VAULT`: Vault directory
- `UDOS_SAFETY`: Safety level (strict/normal/relaxed)
- `UDOS_ROUND`: Current round version
- `UDOS_SPINE`: Active spine (main/lightweight/experimental)

### Configuration Files
- `.udos/config.yaml`: Main configuration
- `.udos/spines/<name>/`: Spine-specific config
- `udos.json`: Project metadata

## Deployment

### Production Requirements
- Node.js 18+
- npm 9+
- SQLite 3+
- MySQL 5.7+ (for WP integration)
- Network access (for service discovery)

### Deployment Steps
1. `npm install`
2. `npm run build`
3. `udo safety check`
4. `udo round finish`
5. `udo deploy` (future)

## Future Evolution

### Round 3 (Current)
- Complete WP integration
- REST API implementation
- Webhook system
- Admin UI

### Round 4
- Vector DB integration
- Hybrid cron system
- Real-time updates
- Performance optimization

### Round 5
- Multi-site support
- Enterprise features
- Advanced analytics
- Production hardening

## Conclusion

The main spine provides a robust, safe, and flexible architecture for uDos development, with clear paths for evolution and customization through alternative spines.
