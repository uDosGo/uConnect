# uDos Lexicon Database

## 🎯 Comprehensive Terminology & Command Management

### Purpose
This database tracks all uDos terminology, commands, aliases, translations, and system variables to ensure consistency, backward compatibility, and smooth evolution across the entire ecosystem.

**Scope:**
- Command lifecycle and aliases
- Terminology definitions
- Workspace and binder concepts
- System variables
- Translations and internationalization
- Deprecation and migration paths

---

## 📋 Command Categories

### 1. Core Commands (Stable)
These commands are stable and follow semantic versioning for changes.

### 2. Experimental Commands (Beta)
These commands may change and use aliases for flexibility.

### 3. Deprecated Commands (Maintained)
These commands are deprecated but still supported with warnings.

### 4. Planned Commands (Future)
These commands are planned for future rounds.

### 5. Terminology & Concepts
Standard definitions for uDos ecosystem terms.

### 6. Workspaces & Binders
Organization and structure definitions.

### 7. System Variables
Environment and configuration variables.

---

## 📖 Command Database

### Current Commands (Round 1)

| Command | Aliases | Status | Since | Deprecated | Replacement |
|---------|---------|--------|-------|-------------|-------------|
| `udo start` | - | stable | R1 | - | - |
| `udo stop` | - | stable | R1 | - | - |
| `udo restart` | - | stable | R1 | - | - |
| `udo status` | `udo health`, `udo check` | stable | R1 | - | - |
| `udo process` | - | stable | R1 | - | - |

### Planned Commands (Future Rounds)

| Command | Planned Round | Status | Notes |
|---------|---------------|--------|-------|
| `udo network` | Round 2 | planned | LAN/network management |
| `udo webhook` | Round 6 | planned | Webhook management |
| `udo cron` | Round 8 | planned | Scheduled jobs |
| `udo vector` | Round 9 | planned | Vector search |

### Deprecated Commands (Backward Compatibility)

| Command | Deprecated In | Replaced By | Removal In |
|---------|---------------|-------------|-------------|
| `udo compost` | - | `udo trash` | - |
| `udo trash` | - | `udo del` | - |
| `udo legacy` | - | `udo archive` | - |

---

## 🔄 Command Evolution Plan

### Round 1: Core Commands
- `udo start` - Start all services
- `udo stop` - Stop all services
- `udo restart` - Restart all services
- `udo status` - Check system status

### Round 2: Network Commands
- `udo network detect` - Detect network interfaces
- `udo network configure` - Configure network settings
- `udo network test` - Test network connectivity

### Round 3: Feed Commands
- `udo feed list` - List configured feeds
- `udo feed fetch` - Fetch all feeds
- `udo feed show <id>` - Show feed details

### Round 4: Process Commands (Enhanced)
- `udo process list` - List running processes
- `udo process kill <id>` - Kill specific process
- `udo process monitor` - Monitor processes

---

## 📊 Command Usage Statistics

### Round 1 Commands
```
udo start      - Usage: High (daily)
udo stop       - Usage: Medium (as needed)
udo restart    - Usage: Medium (recovery)
udo status     - Usage: High (monitoring)
```

### Command Aliases
```
udo status  ->  udo health, udo check
udo start   ->  (no aliases yet)
udo stop    ->  (no aliases yet)
```

---

## 🔧 Command Implementation Status

### Round 1 (Current)
- ✅ `udo start` - Implemented
- ✅ `udo stop` - Implemented
- ✅ `udo restart` - Implemented
- ✅ `udo status` - Implemented
- ✅ `udo process` - Implemented (group command)

### Round 2 (Next)
- ⏳ `udo network detect` - Planned
- ⏳ `udo network configure` - Planned
- ⏳ `udo network test` - Planned

### Round 3 (Future)
- ⏳ `udo feed list` - Planned
- ⏳ `udo feed fetch` - Planned
- ⏳ `udo feed show` - Planned

---

## 📖 Terminology & Concepts

### Core Terms

| Term | Definition | Aliases | Since |
|------|------------|---------|-------|
| **uDos** | Universal Device Operating Surface | uDos, UDOS | R1 |
| **Vault** | Central document storage | vault, storage | R1 |
| **Workspace** | Organized work area | workspace, area | R1 |
| **Binder** | Topic-based organization | binder, collection | R1 |
| **Compost** | Soft delete/archive | compost, archive | R1 |
| **Trash** | Temporary deletion | trash, delete | R1 |
| **Legacy** | Archived but relevant | legacy, archive | R1 |
| **Round** | Development cycle (3-5 days) | round, cycle | R1 |
| **Cycle** | 7 rounds = 1 cycle | cycle | R1 |

### Workspace Types

| Workspace | Purpose | Sync | Permissions |
|-----------|---------|------|-------------|
| `@inbox` | Incoming, unsorted | Master→Child | Write for all |
| `@workspace` | Active projects | Full sync | User-specific |
| `@toybox` | Experiments | No sync | Owner only |
| `@sandbox` | Isolated testing | No sync | Owner only |
| `@public` | Published content | Read-only | World-readable |
| `@private` | User-private | Encrypted | Single user |

### Binder Organization

| Binder | Purpose | Example |
|--------|---------|---------|
| `#topic` | Topic-based tagging | `#authentication` |
| `#project` | Project organization | `#udos-core` |
| `#status` | Status tracking | `#wip`, `#done` |

---

## ⚙️ System Variables

### Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `UDOS_VAULT` | Vault root path | `~/vault` |
| `UDOS_CONFIG` | Config file path | `~/vault/config.json` |
| `UDOS_ENV` | Environment mode | `development`, `production` |
| `UDOS_DEBUG` | Debug mode | `true`, `false` |

### Configuration Keys

| Key | Purpose | Type | Example |
|-----|---------|------|---------|
| `vault.root` | Vault root directory | string | `~/vault` |
| `feed.storage` | Feed storage type | enum | `jsonl`, `sqlite` |
| `network.fallback` | Fallback IP | string | `192.168.1.100` |

---

## 📋 Command Design Principles

### 1. Consistency
- Similar commands follow same patterns
- `udo <verb> <noun>` structure
- Flags follow `--flag` pattern

### 2. Discoverability
- Help text for all commands
- Examples in help output
- Related commands suggested

### 3. Backward Compatibility
- Deprecated commands show warnings
- Aliases maintained for 2 rounds
- Migration guides provided

### 4. Error Handling
- Clear error messages
- Suggested fixes
- Exit codes documented

---

## 🎯 Command Lifecycle

### Phase 1: Experimental
```
Round X: Introduce as experimental
- Flag: `--experimental`
- Warning: "This command is experimental"
```

### Phase 2: Beta
```
Round X+1: Promote to beta
- Flag: `--beta` (optional)
- Warning: "This command is in beta"
```

### Phase 3: Stable
```
Round X+2: Promote to stable
- No flags required
- Full documentation
```

### Phase 4: Deprecated
```
Round X+3: Mark as deprecated
- Warning: "This command is deprecated"
- Suggest replacement
```

### Phase 5: Removed
```
Round X+4: Remove command
- Error: "Command removed, use X instead"
```

---

## 🔗 Command Reference

### Current Commands

#### udo start
```bash
udo start              # Start all services
udo start --verbose    # Start with verbose output
```

#### udo stop
```bash
udo stop               # Stop all services
udo stop --force      # Force stop (if needed)
```

#### udo restart
```bash
udo restart            # Restart all services
udo restart --attempts 5 # Max 5 restart attempts
```

#### udo status
```bash
udo status             # Check system status
udo status --json      # JSON output
udo health             # Alias for status
udo check              # Alias for status
```

#### udo process
```bash
udo process            # Show process help
udo process start      # Start processes
udo process stop       # Stop processes
udo process restart    # Restart processes
udo process status     # Process status
```

---

## 📈 Command Usage Metrics

### Round 1 Targets
- `udo start`: 100+ uses/month
- `udo stop`: 50+ uses/month
- `udo restart`: 20+ uses/month
- `udo status`: 200+ uses/month

### Success Criteria
- 95% command success rate
- <5% error rate
- <1s average response time

---

## 🎓 Best Practices

### Command Naming
1. Use verbs for actions (`start`, `stop`, `restart`)
2. Use nouns for entities (`process`, `network`, `feed`)
3. Keep names short and clear

### Command Structure
```bash
udo <verb> <noun> <options>
udo start process --verbose
udo stop service --force
```

### Error Messages
```bash
✓ Success: Green checkmark
⚠️  Warning: Yellow triangle
✗ Error: Red X with suggestion
```

---

## 🔮 Future Command Evolution

### Round 2: Network Commands
```bash
udo network detect      # Auto-detect network
udo network configure   # Configure settings
udo network test        # Test connectivity
```

### Round 3: Feed Commands
```bash
udo feed list          # List feeds
udo feed fetch         # Fetch feeds
udo feed show <id>     # Show feed
```

### Round 4: Advanced Commands
```bash
udo ai ask <question>   # AI assistant
udo ai generate <prompt> # Content generation
udo ai explain <topic>  # Explanation
```

---

## Summary

**Current State:** Round 1 commands implemented and tested
**Next Round:** Round 2 network commands
**Quality:** All commands follow design principles
**Documentation:** Complete command reference available

*Command database established for tracking evolution and aliases.*