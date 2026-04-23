# uDos WordPress Integration

**Cycle 1, Round 3: Core Integration Layer**

This module provides bi-directional synchronization between WordPress MySQL user database and uDos SQLite user store.

## 🎯 Features

### User Synchronization
- ✅ WP MySQL → uDos SQLite sync
- ✅ Role-based permission mapping
- ✅ Batch processing for large user bases
- ✅ Conflict resolution
- ✅ Last sync tracking

### Database Support
- **WordPress**: MySQL/MariaDB
- **uDos**: SQLite (better-sqlite3)
- **Future**: PostgreSQL support

### Permission System
- Role-based access control
- Fine-grained permissions
- Context-aware access

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
cd modules/wp-integration
npm install

# Build
npm run build

# Test
npm test
```

### Basic Usage

```typescript
import { syncWpUsers, WpUserSync } from '@udos/wp-integration';

// Configure synchronization
const config = {
  wpDb: {
    host: 'localhost',
    user: 'wordpress',
    password: 'secure-password',
    database: 'wordpress'
  },
  sqliteDb: {
    path: '/path/to/udos-users.db'
  },
  syncInterval: 3600, // 1 hour
  batchSize: 50
};

// Run synchronization
const result = await syncWpUsers(config);
console.log(`Synced ${result.syncedUsers} users`);

// Or use the full API
const sync = await WpUserSync.create(config);
const users = sync.getAllUdosUsers();
await sync.close();
```

## 📋 API Reference

### WpDbConnector

```typescript
import { WpDbConnector } from '@udos/wp-integration';

// Create connector
const connector = new WpDbConnector({
  host: 'localhost',
  user: 'wordpress',
  password: 'secure-password',
  database: 'wordpress'
});

// Test connection
const connected = await connector.testConnection();

// Get user by ID
const user = await connector.getUserById(1);

// Get user by email
const userByEmail = await connector.getUserByEmail('admin@example.com');

// Get all users
const allUsers = await connector.getAllUsers(100, 0);

// Close connection
await connector.close();
```

### WpUserSync

```typescript
import { WpUserSync } from '@udos/wp-integration';

// Create sync engine
const sync = await WpUserSync.create({
  wpDb: { /* MySQL config */ },
  sqliteDb: { path: 'udos-users.db' }
});

// Sync all users
const result = await sync.syncWpToUdos();

// Get uDos user by WP ID
const udosUser = sync.getUdosUserByWpId(1);

// Get uDos user by email
const userByEmail = sync.getUdosUserByEmail('admin@example.com');

// Get all uDos users
const allUsers = sync.getAllUdosUsers();

// Close connections
await sync.close();
```

## 🔧 Configuration

### Sync Configuration

```typescript
interface SyncConfig {
  wpDb: {
    host: string;
    user: string;
    password: string;
    database: string;
    port?: number; // default: 3306
  };
  sqliteDb: {
    path: string; // Path to SQLite database
  };
  syncInterval?: number; // Default: 3600 (1 hour)
  batchSize?: number; // Default: 50
}
```

### Permission Mapping

| WP Role | uDos Permissions |
|---------|------------------|
| administrator | `manage:users`, `manage:settings`, `delete:any`, `admin:all` |
| editor | `edit:any`, `publish:any`, `moderate:comments` |
| author | `edit:own`, `publish:own`, `delete:own` |
| contributor | `edit:own`, `delete:own` |
| subscriber | `read:feed`, `create:reply` |

All users get base permissions: `read:feed`, `create:reply`

## 📊 Database Schema

### uDos Users Table (SQLite)

```sql
CREATE TABLE udos_users (
  udos_id TEXT PRIMARY KEY,      -- UUID
  wp_id INTEGER UNIQUE,          -- WordPress user ID
  user_login TEXT NOT NULL,      -- Username
  user_email TEXT NOT NULL,      -- Email
  display_name TEXT,             -- Display name
  user_status INTEGER,           -- Status (0=active, 1=inactive)
  roles TEXT,                    -- JSON array of WP roles
  context TEXT,                  -- Current context
  permissions TEXT,              -- JSON array of permissions
  last_sync TEXT,                -- Last sync timestamp
  meta TEXT                      -- Additional metadata
);

-- Indexes
CREATE INDEX idx_wp_id ON udos_users(wp_id);
CREATE INDEX idx_email ON udos_users(user_email);
```

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Tests include:
- Database connection validation
- User CRUD operations
- Permission mapping
- Sync process validation
- Error handling

## 🔗 Integration Points

### With uDos Core

```typescript
// In core system initialization
import { WpUserSync } from '@udos/wp-integration';

const sync = await WpUserSync.create(config);

// Make available to other modules
globalThis.userSync = sync;
```

### With REST API

```typescript
// API endpoint for user lookup
app.get('/api/user/:id', async (req, res) => {
  const user = sync.getUdosUserByWpId(parseInt(req.params.id));
  res.json(user);
});
```

## 🎯 Roadmap

### Round 3 (Current)
- [x] WP DB connector
- [x] User synchronization engine
- [x] Permission mapping
- [x] Basic sync functionality
- [ ] Real-time sync via webhooks
- [ ] Conflict resolution UI

### Round 4
- [ ] Bidirectional sync (uDos → WP)
- [ ] User context switching
- [ ] Session management
- [ ] Caching layer

### Round 5
- [ ] Admin UI for user management
- [ ] Audit logging
- [ ] Performance optimization
- [ ] Multi-site support

## 📋 Changelog

### 1.0.0 (Cycle 1, Round 3)
- Initial release
- WP MySQL connector
- SQLite user store
- Permission mapping
- Batch synchronization

## 🤝 Contributing

See main uDos CONTRIBUTING.md for guidelines.

## 📄 License

MIT License - See LICENSE

---

**Part of uDos Cycle 1, Round 3: Core Integration Layer** 🚀