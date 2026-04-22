# 🚀 Consolidated Phase 8 Implementation Plan: Local CMS, Publishing & AI Resilience

## 🎯 Executive Summary

This document consolidates all Phase 8 requirements into a unified implementation plan, incorporating:
- **Local CMS & Publishing System** (WordPress-like user portal)
- **Static Site Generator** (`udo publish`)
- **User Management & Authentication**
- **Contacts Synchronization**
- **Admin Dashboard with Hivemind Integration**
- **Network Diagnostics** (`peek`/`poke`)
- **Compartmentalization System**
- **AI Hallucination Mitigation & Self-Healing**

**Total Estimated Duration:** 8-10 weeks
**MVP Available:** Week 4
**Full Implementation:** Week 10

## 📅 Phase 8 Master Plan

### 🗺️ Overall Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    uDos Home Network (Phase 7+8)            │
├─────────────────┬─────────────────┬─────────────────┬─────────────┤
│  MASTER (Linux)  │  CHILD (macOS)   │  CHILD (Win)     │  CHILD (Linux) │
│  ┌─────────────┐  │  ┌─────────────┐  │  ┌─────────────┐  │  ┌─────────────┐  │
│  │  Localhost  │  │  │  Local      │  │  │  Local      │  │  │  Local      │  │
│  │  Library    │  │  │  Cache      │  │  │  Cache      │  │  │  Cache      │  │
│  │  (Web:8080) │  │  │  (Read-only)│  │  │  (Read-only)│  │  │  (Read-only)│  │
│  └─────────────┘  │  └─────────────┘  │  └─────────────┘  │  └─────────────┘  │
│  ┌─────────────┐  │  ┌─────────────┐  │  ┌─────────────┐  │  ┌─────────────┐  │
│  │  User DB    │  │  │  User       │  │  │  User       │  │  │  User       │  │
│  │  (SQLite)    │  │  │  Profile    │  │  │  Profile    │  │  │  Profile    │  │
│  └─────────────┘  │  └─────────────┘  │  └─────────────┘  │  └─────────────┘  │
│  ┌─────────────┐  │  ┌─────────────┐  │  ┌─────────────┐  │  ┌─────────────┐  │
│  │  Static     │  │  │  Mounted    │  │  │  Mounted    │  │  │  Mounted    │  │
│  │  Site Gen   │  │  │  Vault     │  │  │  Vault     │  │  │  Vault     │  │
│  │  (udo pub)  │  │  └─────────────┘  │  └─────────────┘  │  └─────────────┘  │
│  └─────────────┘  │                    │                    │                    │
│  ┌─────────────┐  │                    │                    │                    │
│  │  Hivemind    │  │                    │                    │                    │
│  │  (Compart-  │  │                    │                    │                    │
│  │  mentalized)│  │                    │                    │                    │
│  └─────────────┘  │                    │                    │                    │
│  ┌─────────────┐  │                    │                    │                    │
│  │  Compost    │  │                    │                    │                    │
│  │  (AI State) │  │                    │                    │                    │
│  └─────────────┘  │                    │                    │                    │
│  ┌─────────────┐  │                    │                    │                    │
│  │  Secrets    │  │                    │                    │                    │
│  │  (Encrypted)│  │                    │                    │                    │
│  └─────────────┘  │                    │                    │                    │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

## 📋 Implementation Phases

### Phase 8A: Foundation (Weeks 1-2) - **CRITICAL PATH**

#### 8A.1 - Static Site Generator (`udo publish`)
**File:** `core/src/commands/publish.ts`
**Features:**
- Markdown → HTML conversion using `marked`
- Frontmatter support (title, date, author, permissions)
- Template system with Nunjucks
- Incremental builds (only changed files)
- Output to `/srv/udos/www/`
- Watch mode for development

**Commands:**
```bash
udo publish [path]          # Publish vault content
udo publish --watch         # Watch for changes
udo publish --force         # Force full rebuild
```

#### 8A.2 - Basic Web Server
**File:** `tools/localhost-library/server.ts`
**Features:**
- Express.js server on port 8080
- Static file serving from `/srv/udos/www`
- Basic routing (`/`, `/publish/*`)
- Health endpoint `/health`
- Configuration via environment variables

**Integration:**
- Works with shared vault from Phase 7
- Accessible from child nodes via NFS mount
- Basic error handling and logging

**Deliverables:**
- ✅ `udo publish` command working
- ✅ Web server serving static content
- ✅ Integration with Phase 7 network
- ✅ Basic documentation and examples

**Timeline:** Week 1-2
**Priority:** HIGH

### Phase 8B: User Management (Weeks 3-4) - **HIGH PRIORITY**

#### 8B.1 - User Database (SQLite)
**File:** `tools/localhost-library/db.ts`
**Schema:**
```sql
CREATE TABLE wp_users (
    id INTEGER PRIMARY KEY,
    user_login TEXT UNIQUE NOT NULL,
    user_pass TEXT NOT NULL,
    user_email TEXT,
    display_name TEXT,
    role TEXT DEFAULT 'viewer',
    home_device TEXT,
    trusted_devices TEXT,
    contact_sync_enabled INTEGER DEFAULT 1,
    created_at DATETIME,
    last_seen DATETIME
);

CREATE TABLE wp_sessions (
    session_id TEXT PRIMARY KEY,
    user_id INTEGER,
    expires DATETIME,
    ip TEXT,
    FOREIGN KEY(user_id) REFERENCES wp_users(id)
);
```

#### 8B.2 - Authentication System
**Features:**
- bcrypt password hashing
- Session management with secure cookies
- JWT tokens for API authentication
- Login/logout endpoints
- Default admin user creation

**Commands:**
```bash
# Admin commands (master only)
user add <name> --role <role> --email <email>
user list
user set-role <name> <role>
user delete <name>

# User commands (any device)
login <username>
logout
whoami
```

#### 8B.3 - Role-Based Access Control
**Roles:** admin, editor, viewer, guest
**Middleware:** Express middleware for route protection
**Permissions:**
- admin: Full access
- editor: Publish content, manage own devices
- viewer: Read-only access
- guest: Temporary access

**Deliverables:**
- ✅ User registration and authentication
- ✅ Session management
- ✅ Role-based access control
- ✅ CLI and web interface

**Timeline:** Week 3-4
**Priority:** HIGH

### Phase 8C: Content Management (Weeks 5-6) - **MEDIUM PRIORITY**

#### 8C.1 - Enhanced Static Site Generator
**Features:**
- Index page generation
- Sitemap.xml generation
- RSS feed generation
- Category/tag support
- Search functionality
- Permission-based publishing

**Commands:**
```bash
udo publish set-permission <file> --role <role>
udo publish generate-index
udo publish generate-rss
```

#### 8C.2 - Content API
**Endpoints:**
- `GET /api/content` - List all content
- `GET /api/content/:slug` - Get specific content
- `POST /api/content` - Create new content (editor+)
- `PUT /api/content/:id` - Update content (editor+)
- `DELETE /api/content/:id` - Delete content (admin)

**Frontmatter Enhancements:**
```yaml
---
title: Family Budget
required_role: editor
published: true
categories: [finance, family]
tags: [budget, 2026]
---
```

**Deliverables:**
- ✅ Full content publishing pipeline
- ✅ REST API for content management
- ✅ Enhanced metadata and search
- ✅ RSS feed generation

**Timeline:** Week 5-6
**Priority:** MEDIUM

### Phase 8D: Network Diagnostics (Weeks 7) - **MEDIUM PRIORITY**

#### 8D.1 - Network Peek/Poke Commands
**File:** `core/src/commands/network.ts` (extensions)

**Peek Commands:**
```bash
network peek device <name> --icmp          # ICMP ping
network peek all --tcp 3010                # TCP port check
network peek ip <address> --mdns         # mDNS discovery
network peek <target> --bandwidth         # Bandwidth test
```

**Poke Commands:**
```bash
network poke device <name> wake            # Wake-on-LAN
network poke all mdns-announce            # mDNS announcement
network poke ip <address> echo --port 8080 # UDP echo test
```

**Implementation:**
- Uses standard OS tools (ping, arp, traceroute)
- Raw sockets for UDP operations
- mDNS via Avahi/Bonjour
- Bandwidth measurement via HTTP transfer

**Deliverables:**
- ✅ Network-level diagnostics
- ✅ Device discovery and wake
- ✅ Connectivity testing
- ✅ Integration with sonic-doctor

**Timeline:** Week 7
**Priority:** MEDIUM

### Phase 8E: Compartmentalization (Weeks 8) - **HIGH PRIORITY**

#### 8E.1 - Compartment System Design
**File:** `core-rs/src/compartment.rs`

**Compartment Types:**
- `project` - External projects using @udos/code
- `user` - Individual user state
- `device` - Device-specific state
- `installation` - uDOS installation
- `workflow` - Workflow execution state

**Storage Layout:**
```
~/.udos/compartments/
├── project/
│   └── <hash>/
│       ├── tasks.db
│       ├── memory/
│       ├── config.yaml
│       └── swarm_state.json
├── user/
│   ├── alice/
│   └── bob/
└── device/
    ├── macbook-pro/
    └── windows-pc/
```

**Commands:**
```bash
# Compartment management
hivemind compartment list
hivemind compartment create --project /path
hivemind compartment switch --user alice
hivemind compartment delete --project /old/path

# Targeted operations
sonic-doctor repair --compartment project/myapp
network send macbook-pro sonic-doctor clean --compartment user/alice
```

**Deliverables:**
- ✅ Compartment isolation system
- ✅ Per-compartment state management
- ✅ CLI commands for compartment operations
- ✅ Integration with existing modules

**Timeline:** Week 8
**Priority:** HIGH

### Phase 8F: AI Resilience (Weeks 9-10) - **HIGH PRIORITY**

#### 8F.1 - Hallucination Detection
**Features:**
- Syntax checking (language parsers)
- Type checking (TypeScript, mypy)
- Dry-run execution (containerized)
- Static analysis (ESLint, Pylint)
- Self-consistency scoring (multiple samples)
- User feedback loop

**Implementation:**
```typescript
// In Hivemind orchestrator
async function validateOutput(code: string, language: string): Promise<boolean> {
  // Syntax check
  if (!await syntaxCheck(code, language)) return false;
  
  // Type check
  if (!await typeCheck(code, language)) return false;
  
  // Dry run in container
  if (!await dryRun(code, language)) return false;
  
  return true;
}
```

#### 8F.2 - Compost System (AI State Versioning)
**File:** `core/src/commands/compost.ts`

**Commands:**
```bash
compost init                    # Initialize compost
compost add <artifact>         # Stage AI response
compost commit -m "message"     # Save snapshot
compost checkout <commit>       # Rollback
compost log                    # Show history
compost diff <c1> <c2>         # Compare states
```

**Automatic Commits:**
- Every 10 successful interactions
- Before repair/clean operations
- When hallucination detected

#### 8F.3 - Self-Healing System
**Features:**
- Automatic rollback on failure
- Model trust scoring and fallback
- Human-in-the-loop for critical paths
- Compartment-specific recovery

**Commands:**
```bash
sonic-doctor heal --compartment project/myapp --auto-rollback
sonic-doctor heal --compartment user/alice --retry-model
```

**Deliverables:**
- ✅ Hallucination detection system
- ✅ Compost version control for AI state
- ✅ Automatic recovery mechanisms
- ✅ Model trust management

**Timeline:** Week 9-10
**Priority:** HIGH

### Phase 8G: Admin Dashboard (Weeks 11-12) - **MEDIUM PRIORITY**

#### 8G.1 - Web Admin Interface
**File:** `tools/localhost-library/admin.ts`

**Features:**
- User management (CRUD)
- Device registry with status
- Content publishing interface
- Hivemind metrics dashboard
- System health monitoring
- Backup/restore interface

**Pages:**
- `/admin` - Main dashboard
- `/admin/users` - User management
- `/admin/devices` - Device registry
- `/admin/content` - Content management
- `/admin/hivemind` - AI metrics
- `/admin/backups` - Backup management

#### 8G.2 - Hivemind Integration
**Features:**
- Swarm status visualization
- Cost metrics and budget tracking
- Workflow monitoring
- Compartment health overview
- Hallucination detection logs

**API Endpoints:**
- `GET /api/admin/stats` - System statistics
- `GET /api/admin/hivemind` - Hivemind metrics
- `POST /api/admin/backup` - Trigger backup

**Deliverables:**
- ✅ Full admin dashboard
- ✅ Hivemind metrics display
- ✅ User and device management
- ✅ Content publishing interface

**Timeline:** Week 11-12
**Priority:** MEDIUM

## 📊 Implementation Timeline

```
Week 1-2:  Foundation (Static Site Gen + Web Server) ✅ HIGH PRIORITY
Week 3-4:  User Management (Auth + RBAC) ✅ HIGH PRIORITY  
Week 5-6:  Content Management (API + Enhancements) ⚠️ MEDIUM PRIORITY
Week 7:    Network Diagnostics (Peek/Poke) ⚠️ MEDIUM PRIORITY
Week 8:    Compartmentalization ✅ HIGH PRIORITY
Week 9-10: AI Resilience (Hallucination + Compost) ✅ HIGH PRIORITY
Week 11-12: Admin Dashboard ⚠️ MEDIUM PRIORITY
```

## 🎯 Minimum Viable Product (MVP) - Week 4

**Components:**
1. ✅ Static Site Generator (`udo publish`)
2. ✅ Basic Web Server (serve static content)
3. ✅ User Authentication (basic login)
4. ✅ Content Publishing (markdown → HTML)

**Excludes:**
- Advanced user management
- Contacts synchronization
- Full admin dashboard
- Complex permissions
- AI resilience features

**MVP Value:** 80% of functionality with 20% of effort

## 🔧 Technical Stack

### Core Technologies
- **Backend:** Node.js + Express
- **Database:** SQLite
- **Authentication:** bcrypt + JWT
- **Markdown:** marked + gray-matter
- **Templating:** Nunjucks
- **File Watching:** chokidar
- **Network:** Standard OS tools + raw sockets

### Security
- bcrypt password hashing
- Secure cookies (httpOnly, sameSite)
- CSRF protection
- Input validation
- Rate limiting

### Performance
- Caching for static content
- Database indexing
- Connection pooling
- Lazy loading

## 🧪 Testing Strategy

### Unit Tests
- Static site generator functionality
- User authentication flows
- Permission checks
- API endpoints

### Integration Tests
- Full publishing workflow
- User login → content access
- Network diagnostics
- Compartment isolation

### End-to-End Tests
- Multi-user scenarios
- Cross-device synchronization
- Recovery from failures

## 📁 File Structure

```
core/
└── src/
    ├── commands/
    │   ├── publish.ts          # Static site generator
    │   ├── network.ts          # Extended with peek/poke
    │   ├── compost.ts          # AI state versioning
    │   └── ...
    └── actions/
        └── user.ts            # User management

tools/
└── localhost-library/
    ├── server.ts              # Web server
    ├── db.ts                  # User database
    ├── admin.ts               # Admin dashboard
    └── api.ts                 # REST API routes

core-rs/
└── src/
    ├── compartment.rs        # Compartment system
    └── ...
```

## 🚀 Deployment Strategy

### Phase 1: Foundation (Week 2)
```bash
# On master
npm install -g @udos/publish
udo publish /srv/udos/vault/docs

# Start web server
cd /srv/udos
node tools/localhost-library/server.js
```

### Phase 2: User Management (Week 4)
```bash
# Initialize user database
node tools/localhost-library/db.js init

# Add admin user
user add admin --role admin --email admin@example.com

# Start web server with auth
node tools/localhost-library/server.js --with-auth
```

### Phase 3: Full System (Week 12)
```bash
# Start all services
systemctl start udos-publish
systemctl start udos-web
systemctl start udos-hivemind
systemctl start udos-compost
```

## ✅ Success Criteria

### Phase 8A (Foundation)
- [ ] `udo publish` converts markdown to HTML
- [ ] Web server serves content on port 8080
- [ ] Content accessible from child nodes
- [ ] Basic health monitoring

### Phase 8B (User Management)
- [ ] Users can register and login
- [ ] Sessions persist across requests
- [ ] Roles enforce access control
- [ ] Admin user can manage content

### Phase 8C (Content Management)
- [ ] Full content publishing workflow
- [ ] API for content management
- [ ] Enhanced metadata and search
- [ ] RSS feed generation

### Phase 8D (Network Diagnostics)
- [ ] Network peek/poke commands working
- [ ] Device discovery functional
- [ ] Connectivity testing operational
- [ ] Integration with sonic-doctor

### Phase 8E (Compartmentalization)
- [ ] Compartment isolation working
- [ ] Per-compartment state management
- [ ] CLI commands operational
- [ ] Integration with modules

### Phase 8F (AI Resilience)
- [ ] Hallucination detection >95% accuracy
- [ ] Compost system operational
- [ ] Automatic recovery working
- [ ] Model trust management implemented

### Phase 8G (Admin Dashboard)
- [ ] Full admin dashboard functional
- [ ] Hivemind metrics displayed
- [ ] User/device management working
- [ ] Content management interface complete

## 🔮 Future Enhancements

### Post-Phase 8
1. **Mobile Companion App** - iOS/Android access to portal
2. **Offline-First Sync** - Vault sync when disconnected
3. **Advanced Search** - Full-text search across content
4. **Collaboration Features** - Real-time editing
5. **Plugin System** - Extensible functionality

### Long-Term
1. **AI Model Fine-Tuning** - Local models using compost data
2. **Blockchain Audit Trail** - Tamper-proof logging
3. **Multi-Master Replication** - High availability
4. **Enterprise Features** - LDAP integration
5. **Cloud Sync** - Hybrid cloud/local operation

## 📊 Resource Estimation

| Resource | Estimate |
|----------|----------|
| Development Time | 8-10 weeks |
| Lines of Code | 3,000-5,000 |
| Files Created | 20-30 |
| Dependencies | 10-15 npm packages |
| Storage | 50-200MB (plus content) |
| Memory | 100-300MB (web server) |

## 🎯 Risk Assessment

| Risk | Mitigation |
|------|------------|
| Security vulnerabilities | Code review, penetration testing |
| Performance issues | Load testing, profiling |
| Cross-platform issues | Test on all target platforms |
| User adoption | Comprehensive documentation |
| Integration complexity | Modular design, clear APIs |

## ✅ Approval & Next Steps

**Recommended Approach:**
- [ ] Proceed with full Phase 8 as outlined
- [ ] Start with MVP only (publishing + basic web server)
- [ ] Focus on specific components first
- [ ] Other (please specify)

**Immediate Next Steps:**
1. Begin Phase 8A implementation (Static Site Generator)
2. Set up development environment
3. Create initial test cases
4. Implement core publishing functionality

**Ready to implement!** 🚀

This consolidated plan provides a clear roadmap for transforming uDos into a full-featured home intranet with publishing, user management, and AI resilience capabilities.