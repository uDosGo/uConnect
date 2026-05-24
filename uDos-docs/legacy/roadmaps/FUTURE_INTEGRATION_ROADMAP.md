# uDos Future Integration Roadmap

## What This Document Covers

This document outlines **future integration plans** that build upon the current implementation. These are **not yet implemented** but represent the architectural vision for uDos.

**Current Status:** ✅ Universal Feed Engine implemented (see CURRENT_IMPLEMENTATION_SUMMARY.md)
**Future Status:** ⏳ These integrations are planned but not yet built

---

## 1. REST API Layer (Future)

### 1.1 Planned API Endpoints

| Endpoint | Method | Future Purpose | Current Status |
|----------|--------|----------------|----------------|
| `/api/user/login` | POST | WP-style login | ❌ Not implemented |
| `/api/user/context` | GET | Get current context | ❌ Not implemented |
| `/api/user/switch` | POST | Switch contexts | ❌ Not implemented |
| `/api/feed/recent` | GET | Recent replies | ❌ Not implemented |
| `/api/feed/search` | POST | Search replies | ❌ Not implemented |
| `/api/feed/reply` | POST | Create reply | ❌ Not implemented |
| `/api/vector/search` | POST | Semantic search | ❌ Not implemented |
| `/api/cron/trigger` | POST | Trigger cron job | ❌ Not implemented |
| `/api/webhook/receive` | POST | Receive webhook | ❌ Not implemented |

### 1.2 Authentication Plan

**Future Implementation:**
```typescript
// Future JWT middleware (not implemented)
app.use('/api/*', authenticateJWT);

// Future rate limiting (not implemented)
app.use(rateLimiter);
```

**Current Status:** ❌ No authentication layer implemented

---

## 2. WordPress Integration (Future)

### 2.1 Planned Data Flow

```
WordPress MySQL (Users)
    │
    ▼
REST API (Future) → Sync to SQLite
    │
    ├───► Feed DB (replies)
    │
    ├───► Vector DB (embeddings)
    │
    ▼
MySQL Archive (permanent storage)
```

### 2.2 Planned Schema Relationships

```sql
-- Future schema (not implemented)
CREATE TABLE feed_replies (
    reply_id TEXT PRIMARY KEY,
    wp_user_id INT,  -- Future: foreign key to wp_users.ID
    content TEXT,
    created_at DATETIME
);
```

**Current Status:** ❌ No WordPress integration implemented

---

## 3. Vector Database Integration (Future)

### 3.1 Planned Vector DB Options

| Use Case | Localhost | Master | Cloud | Status |
|----------|-----------|--------|-------|--------|
| Reply similarity | SQLite-vec | SQLite-vec | Pgvector | ❌ Not implemented |
| User context RAG | SQLite-vec | SQLite-vec | Pgvector | ❌ Not implemented |
| Document embeddings | SQLite-vec | SQLite-vec | Pgvector | ❌ Not implemented |

### 3.2 Future Vector Operations

```typescript
// Future vector search (not implemented)
const results = await vectorDB.search(
  queryEmbedding,
  { limit: 10, filter: { userId: currentUser.id } }
);
```

**Current Status:** ❌ No vector database integration

---

## 4. Webhook System (Future)

### 4.1 Planned Webhook Listener

```bash
# Future webhook setup (not implemented)
webhook add --name github-push --url /api/webhook/github --secret abc123
webhook trigger github-push --payload '{"event":"push"}'
```

### 4.2 Future Webhook Flow

```
GitHub Push Event
    │
    ▼
master:8085/webhook/github (Future)
    │
    ▼
Feed Engine (creates reply)
    │
    ▼
Triggers workflows
```

**Current Status:** ❌ No webhook listener implemented

---

## 5. Cron & Scheduling (Future)

### 5.1 Planned Hybrid Cron System

| Task | WP Cron | Systemd Timer | Status |
|------|---------|---------------|--------|
| Feed cleanup | ❌ | ✅ (planned) | ❌ Not implemented |
| Vector sync | ✅ (planned) | ❌ | ❌ Not implemented |
| Compost promotion | ❌ | ✅ (planned) | ❌ Not implemented |

### 5.2 Future Cron Integration

```php
// Future WP cron (not implemented)
add_action('udos_hourly_sync', function() {
    wp_remote_post('http://localhost:8080/api/cron/sync');
});
```

**Current Status:** ❌ Only in-memory scheduling (no persistent cron)

---

## 6. DNS & Network Discovery (Future)

### 6.1 Planned Service Discovery

| Service | Port | Future DNS Name | Status |
|---------|------|-----------------|--------|
| Web portal | 8080 | `portal.udos.local` | ❌ Not implemented |
| REST API | 8080 | `api.udos.local` | ❌ Not implemented |
| Webhook | 8085 | `webhook.udos.local` | ❌ Not implemented |

### 6.2 Future mDNS Configuration

```xml
<!-- Future Avahi config (not implemented) -->
<service-group>
  <name>uDos Portal</name>
  <service>
    <type>_http._tcp</type>
    <port>8080</port>
  </service>
</service-group>
```

**Current Status:** ❌ No DNS/mDNS configuration

---

## 7. Integration Architecture (Future Vision)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           uDos Master (Future)                            │
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  WP User DB  │  │   REST API   │  │   Feed DB    │  │  Vector DB   │    │
│  │  (Future)     │◄─┤  (Future)    │  │  (Future)    │  │  (Future)    │    │
│  └──────────────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│                           │                 │                 │             │
│                           └─────────────────┼─────────────────┘             │
│                                             │                               │
│                                      ┌──────┴──────┐                        │
│                                      │  WP Cron    │                        │
│                                      │  (Future)    │                        │
│                                      └──────┬──────┘                        │
│                                             │                               │
│                                      ┌──────┴──────┐                        │
│                                      │  Webhook    │                        │
│                                      │  (Future)    │                        │
│                                      └─────────────┘                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ DNS (Future)
                                      ▼
                              ┌───────────────┐
                              │   Children    │
                              │   (Future)     │
                              └───────────────┘
```

---

## 8. Security & Performance (Future)

### 8.1 Future Security Measures

| Feature | Plan | Status |
|---------|------|--------|
| JWT authentication | OAuth2 + JWT tokens | ❌ Not implemented |
| Rate limiting | Redis-based | ❌ Not implemented |
| Row-level security | Per user/family | ❌ Not implemented |
| API keys | For cron/webhooks | ❌ Not implemented |

### 8.2 Future Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| User sync latency | <5s | ❌ Not measured |
| Vector search recall | >0.85 | ❌ Not implemented |
| Webhook processing | <100ms | ❌ Not implemented |
| Cron success rate | >99% | ❌ Not implemented |

---

## 9. Implementation Priority Roadmap

### Phase 1: Core API (Next)
1. ✅ Universal Feed Engine (DONE)
2. ⏳ REST API layer
3. ⏳ Authentication middleware
4. ⏳ Basic endpoints (feed, user)

### Phase 2: Integration (Future)
5. ⏳ WordPress user sync
6. ⏳ Webhook listener
7. ⏳ Cron integration
8. ⏳ DNS/mDNS setup

### Phase 3: Advanced Features (Future)
9. ⏳ Vector database
10. ⏳ Semantic search
11. ⏳ Cross-family search
12. ⏳ Performance optimization

---

## 10. Migration Path from Current to Future

### Step 1: Add REST API Layer
```bash
# Future implementation
cd modules/rest-api
npm init @udos/rest-api
# Implement endpoints
```

### Step 2: Integrate with WordPress
```php
// Future WP plugin
add_action('init', function() {
    // Sync users to feed DB
});
```

### Step 3: Add Vector Database
```bash
# Future implementation
npm install sqlite-vec
# Add embedding generation
```

### Step 4: Configure Network Services
```bash
# Future setup
sudo systemctl enable udos-webhook.service
sudo systemctl start udos-webhook.service
```

---

## Summary: What's Real vs. What's Planned

### ✅ **Currently Implemented (Production Ready)**
- Universal Feed Engine library
- PING/PONG operations
- Multiple feed type support
- Storage system
- Event system
- Structural update to uDos

### ⏳ **Future Integration (Not Yet Implemented)**
- REST API endpoints
- WordPress MySQL integration
- Vector database
- Webhook listener
- Cron/systemd integration
- DNS/mDNS configuration
- Authentication/authorization
- Network discovery

**The current implementation provides a solid foundation. The future integrations will extend it into a full-featured platform.**

---

## How to Use This Document

1. **For current development:** Refer to CURRENT_IMPLEMENTATION_SUMMARY.md
2. **For future planning:** Use this document to guide next steps
3. **For prioritization:** Follow the Phase 1-3 roadmap
4. **For architecture:** Use the integration diagrams as reference

**Next Step:** Implement REST API layer to expose feed engine functionality to other components.