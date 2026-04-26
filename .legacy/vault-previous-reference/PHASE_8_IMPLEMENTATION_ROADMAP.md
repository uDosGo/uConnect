# 🗺️ Phase 8 Implementation Roadmap: Local CMS & Publishing

## 🎯 Overview

Phase 8 adds a **WordPress-like user portal and static site generator** to the uDos master node, transforming it into a private intranet with user management, content publishing, and contact synchronization.

## 📅 Implementation Phases

### Phase 8A: Foundation (Week 1) - **HIGH PRIORITY**
**Goal:** Basic static site generation and web server foundation

#### 8A.1 - Static Site Generator (udo publish)
- **File:** `core/src/commands/publish.ts`
- **Commands:**
  - `udo publish [path]` - Convert markdown to HTML
  - `udo publish --watch` - Watch for changes and rebuild
- **Features:**
  - Markdown → HTML conversion using `marked`
  - Frontmatter support (title, date, author, permissions)
  - Template system (basic HTML wrapper)
  - Incremental builds (only changed files)
  - Output to `/srv/udos/www/`

#### 8A.2 - Basic Web Server
- **File:** `tools/localhost-library/server.ts`
- **Features:**
  - Express.js server on port 8080
  - Static file serving from `/srv/udos/www`
  - Basic routing (`/`, `/publish/*`)
  - Simple error handling
  - Configuration via environment variables

#### 8A.3 - Integration with Phase 7
- Ensure `udo publish` works with shared vault
- Web server accessible from child nodes
- Basic health endpoint for monitoring

**Deliverables:**
- ✅ `udo publish` command working
- ✅ Basic web server serving static content
- ✅ Integration with existing network architecture

### Phase 8B: User Management (Week 2) - **MEDIUM PRIORITY**
**Goal:** User authentication and role-based access control

#### 8B.1 - User Database (SQLite)
- **File:** `tools/localhost-library/db.ts`
- **Schema:**
  ```sql
  CREATE TABLE wp_users (
      id INTEGER PRIMARY KEY,
      user_login TEXT UNIQUE NOT NULL,
      user_pass TEXT NOT NULL,
      user_email TEXT,
      display_name TEXT,
      role TEXT DEFAULT 'viewer'
  );
  
  CREATE TABLE wp_sessions (
      session_id TEXT PRIMARY KEY,
      user_id INTEGER,
      expires DATETIME
  );
  ```

#### 8B.2 - Authentication System
- **Features:**
  - bcrypt password hashing
  - Session management with cookies
  - Login/logout endpoints
  - Default admin user creation

#### 8B.3 - Role-Based Access Control
- **Roles:** admin, editor, viewer
- **Middleware:** Check permissions for routes
- **Admin protection:** `/admin` route requires admin role

**Deliverables:**
- ✅ User registration and login
- ✅ Session management
- ✅ Role-based access control

### Phase 8C: Content Management (Week 3) - **MEDIUM PRIORITY**
**Goal:** Full content publishing workflow

#### 8C.1 - Enhanced Static Site Generator
- **Features:**
  - Index page generation
  - Sitemap.xml generation
  - RSS feed generation
  - Category/tag support
  - Search functionality

#### 8C.2 - Content API
- **Endpoints:**
  - `GET /api/content` - List all content
  - `GET /api/content/:slug` - Get specific content
  - `POST /api/content` - Create new content (editor+)
  - `PUT /api/content/:id` - Update content (editor+)

#### 8C.3 - Frontmatter Enhancements
- **Support:**
  - `published: true/false`
  - `featured: true/false`
  - `categories: [string]`
  - `tags: [string]`
  - `viewer_role: string` (minimum role to view)

**Deliverables:**
- ✅ Full content publishing pipeline
- ✅ API for content management
- ✅ Enhanced metadata support

### Phase 8D: Contacts Sync (Week 4) - **LOW PRIORITY**
**Goal:** Unified contact management across devices

#### 8D.1 - Contacts Collection (Per Platform)
- **macOS:** osascript to read Contacts.app
- **Windows:** PowerShell to query Windows Contacts
- **Linux:** Read from CardDAV or Evolution

#### 8D.2 - Contacts API
- **Endpoint:** `POST /api/contacts/sync`
- **Payload:** `{ device: string, contacts: Contact[] }`
- **Processing:** Merge into user's contacts field

#### 8D.3 - Contacts Display
- **Admin UI:** Show unified contacts
- **User UI:** Show personal contacts
- **Export:** CSV/VCF export options

**Deliverables:**
- ✅ Cross-platform contact collection
- ✅ Contacts sync API
- ✅ Contacts display in web UI

### Phase 8E: Admin Dashboard (Week 5) - **MEDIUM PRIORITY**
**Goal:** Comprehensive administration interface

#### 8E.1 - User Management UI
- **Features:**
  - List all users
  - Create/edit/delete users
  - Change roles
  - View user activity

#### 8E.2 - Hivemind Integration
- **Features:**
  - Display swarm status
  - Show cost metrics
  - Workflow monitoring
  - Device status overview

#### 8E.3 - Content Management UI
- **Features:**
  - Content list with filters
  - Publish/unpublish content
  - Featured content management
  - Bulk operations

**Deliverables:**
- ✅ Full admin dashboard
- ✅ Hivemind metrics display
- ✅ Content management interface

## 📋 Prioritization Matrix

| Component | Priority | Estimated LOE | Business Value | Technical Risk |
|-----------|----------|---------------|----------------|-----------------|
| Static Site Generator | HIGH | 2-3 days | HIGH | LOW |
| Basic Web Server | HIGH | 1-2 days | HIGH | LOW |
| User Database | MEDIUM | 2-3 days | HIGH | MEDIUM |
| Authentication | MEDIUM | 2-3 days | HIGH | MEDIUM |
| Content API | MEDIUM | 3-4 days | HIGH | LOW |
| Contacts Sync | LOW | 4-5 days | MEDIUM | HIGH |
| Admin Dashboard | MEDIUM | 5-7 days | HIGH | MEDIUM |

## 🚀 Recommended Implementation Order

### Sprint 1: Foundation (Highest ROI)
1. **Static Site Generator** - Core publishing capability
2. **Basic Web Server** - Make content accessible
3. **Integration Testing** - Ensure works with Phase 7

### Sprint 2: User Management
4. **User Database & Auth** - Secure access control
5. **Basic Admin UI** - User management interface

### Sprint 3: Content Enhancements
6. **Enhanced Generator** - Better content features
7. **Content API** - Programmatic management

### Sprint 4: Advanced Features
8. **Contacts Sync** - Nice-to-have unification
9. **Full Admin Dashboard** - Complete management

## 🎯 Minimum Viable Product (MVP)

**Goal:** Get a working publishing system as quickly as possible

### MVP Components:
1. ✅ Static Site Generator (`udo publish`)
2. ✅ Basic Web Server (serve static files)
3. ✅ Simple Authentication (basic login)
4. ✅ Content Publishing (markdown → HTML)

### MVP Excludes:
- Advanced user management
- Contacts synchronization
- Full admin dashboard
- Complex permissions

**MVP Timeline:** 1-2 weeks
**MVP Value:** 80% of functionality with 20% of effort

## 📊 Success Metrics

### Phase 8A (Foundation)
- [ ] `udo publish` command works with vault content
- [ ] Web server serves static content on port 8080
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

### Phase 8D (Contacts Sync)
- [ ] Contacts collected from all platforms
- [ ] Contacts synced to master
- [ ] Unified contacts view in admin

### Phase 8E (Admin Dashboard)
- [ ] Full user management UI
- [ ] Hivemind metrics display
- [ ] Content management interface

## 🔧 Technical Considerations

### Security
- Use bcrypt for password hashing
- Secure cookies (httpOnly, sameSite)
- CSRF protection
- Input validation
- Rate limiting on auth endpoints

### Performance
- Caching for static content
- Database indexing
- Connection pooling
- Lazy loading for large datasets

### Scalability
- SQLite is fine for home network scale
- Consider migration path if needed
- Horizontal scaling not required initially

### Compatibility
- Works with existing Phase 7 architecture
- Backward compatible with current vault structure
- Graceful degradation if features unavailable

## 📅 Timeline Estimate

| Phase | Duration | Start Date | End Date |
|-------|----------|------------|----------|
| 8A - Foundation | 1 week | 2026-04-20 | 2026-04-27 |
| 8B - User Mgmt | 1 week | 2026-04-27 | 2026-05-04 |
| 8C - Content Mgmt | 1 week | 2026-05-04 | 2026-05-11 |
| 8D - Contacts | 1 week | 2026-05-11 | 2026-05-18 |
| 8E - Admin UI | 2 weeks | 2026-05-18 | 2026-06-01 |

**Total Estimated Duration:** 6 weeks
**MVP Available:** Week 2 (2026-05-04)
**Full Implementation:** Week 6 (2026-06-01)

## 🎯 Next Steps

### Immediate (Next 24-48 hours)
1. ✅ Create this roadmap document
2. ✅ Get approval on prioritization
3. ✅ Begin Phase 8A implementation

### Short Term (Week 1)
1. Implement static site generator
2. Create basic web server
3. Test integration with Phase 7
4. Document usage examples

### Medium Term (Weeks 2-3)
1. Add user authentication
2. Implement content API
3. Create basic admin interface
4. Test security and permissions

## 💡 Recommendations

1. **Start with MVP** - Get basic publishing working first
2. **Iterative development** - Build, test, get feedback
3. **Focus on core value** - Publishing > contacts sync
4. **Leverage existing tools** - Use proven libraries (express, sqlite3, bcrypt)
5. **Security first** - Build auth properly from the start
6. **Documentation** - Keep docs updated as we build

## ✅ Approval Requested

Please review this roadmap and provide feedback on:
1. **Prioritization** - Are the phases in the right order?
2. **Scope** - Is this the right level of detail?
3. **Timeline** - Does this fit with business needs?
4. **MVP** - Does the minimum viable product meet requirements?

**Preferred Approach:**
- [ ] Proceed with full Phase 8 as outlined
- [ ] Start with MVP only (publishing + basic web server)
- [ ] Focus on specific components first (e.g., just publishing)
- [ ] Other (please specify)

Once approved, I'll begin implementation immediately! 🚀