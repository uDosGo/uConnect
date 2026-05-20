# uDos Feed Format Specification

**Version:** 1.0
**Status:** Active
**Purpose:** Standardize JSON feeds across all uDos domains

---

## 1. Core Principles

- **Everything is a JSON feed**: All uDos domains use a standardized JSON feed format.
- **One source of truth**: Each domain has one feed file (e.g., `devlog.json`, `tasks.json`).
- **Queryable**: Feeds are designed to be queried with tools like `jq`.
- **Spoolable**: Feeds can be compressed, archived, or cleaned based on spool types.
- **Replayable**: Feeds can be replayed for debugging or auditing.

---

## 2. Feed Structure

All uDos feeds follow a common structure:

```json
{
  "version": "1.0",
  "type": "feed",
  "source": "udos.<domain>",
  "items": [
    {
      "id": "<unique-id>",
      "timestamp": "<ISO-8601>",
      "type": "<event-type>",
      "summary": "<brief-description>",
      "payload": { ... }
    }
  ]
}
```

### Fields

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `version` | string | Feed format version | Yes |
| `type` | string | Always `"feed"` | Yes |
| `source` | string | Domain identifier (e.g., `"udos.devlog"`) | Yes |
| `items` | array | List of feed items | Yes |

### Feed Item Fields

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `id` | string | Unique identifier for the item | Yes |
| `timestamp` | string | ISO-8601 timestamp | Yes |
| `type` | string | Event type (e.g., `"session.start"`) | Yes |
| `summary` | string | Brief description | Yes |
| `payload` | object | Additional data | No |

---

## 3. Domain-Specific Feeds

### 3.1. Dev Log Feed (`dev/devlog.json`)

**Purpose:** Track daily development activity.

**Event Types:**
- `session.start`: Start of a development session
- `session.end`: End of a development session
- `commit`: Code commit
- `build`: Build process
- `test`: Test run
- `deploy`: Deployment

**Example:**
```json
{
  "version": "1.0",
  "type": "feed",
  "source": "udos.devlog",
  "items": [
    {
      "id": "log-20260418-001",
      "timestamp": "2026-04-18T10:00:00Z",
      "type": "session.start",
      "summary": "Started work on MCP integration",
      "payload": {
        "round": "R12",
        "focus": "mcp-server",
        "tasks": ["SFT-001", "SFT-002"]
      }
    }
  ]
}
```

---

### 3.2. Session IO Feed (`dev/session-io.json`)

**Purpose:** Capture terminal input/output and REPL history.

**Event Types:**
- `command`: Terminal command
- `error`: Command error
- `repl`: REPL input/output

**Example:**
```json
{
  "version": "1.0",
  "type": "feed",
  "source": "udos.session",
  "items": [
    {
      "id": "io-001",
      "timestamp": "2026-04-18T10:00:00Z",
      "type": "command",
      "summary": "List feeds",
      "payload": {
        "input": "mcsnack feed list",
        "output": "apple/snack-feed.json\napple/calendar.json",
        "exit_code": 0,
        "duration_ms": 45
      }
    }
  ]
}
```

---

### 3.3. Tasks Feed (`dev/tasks.json`)

**Purpose:** Track project tasks and their status.

**Event Types:**
- `create`: Task created
- `update`: Task updated
- `complete`: Task completed
- `delete`: Task deleted

**Example:**
```json
{
  "version": "1.0",
  "type": "feed",
  "source": "udos.tasks",
  "items": [
    {
      "id": "SFT-001",
      "timestamp": "2026-04-18T17:00:00Z",
      "type": "complete",
      "summary": "Implemented MCP server",
      "payload": {
        "status": "done",
        "priority": "high",
        "round": "R12",
        "completed_at": "2026-04-18T17:00:00Z"
      }
    }
  ]
}
```

---

### 3.4. Documentation Feed (`docs/docs.json`)

**Purpose:** Track documentation changes.

**Event Types:**
- `create`: Documentation created
- `update`: Documentation updated
- `delete`: Documentation deleted

**Example:**
```json
{
  "version": "1.0",
  "type": "feed",
  "source": "udos.docs",
  "items": [
    {
      "id": "doc-001",
      "timestamp": "2026-04-18T11:00:00Z",
      "type": "update",
      "summary": "Added compression section",
      "payload": {
        "path": "docs/specs/feed-format.md",
        "round": "R12"
      }
    }
  ]
}
```

---

### 3.5. Courses Feed (`courses/courses.json`)

**Purpose:** Track course progress and completions.

**Event Types:**
- `module.start`: Module started
- `module.complete`: Module completed
- `course.complete`: Course completed

**Example:**
```json
{
  "version": "1.0",
  "type": "feed",
  "source": "udos.courses",
  "items": [
    {
      "id": "course-001",
      "timestamp": "2026-04-18T09:00:00Z",
      "type": "module.complete",
      "summary": "Completed advanced syntax module",
      "payload": {
        "course": "01-markdown-first",
        "module": "03-advanced-syntax",
        "progress": 0.75
      }
    }
  ]
}
```

---

### 3.6. Wiki Feed (`wiki/wiki.json`)

**Purpose:** Track wiki page edits and structure changes.

**Event Types:**
- `page.create`: Page created
- `page.edit`: Page edited
- `page.delete`: Page deleted

**Example:**
```json
{
  "version": "1.0",
  "type": "feed",
  "source": "udos.wiki",
  "items": [
    {
      "id": "wiki-001",
      "timestamp": "2026-04-18T12:00:00Z",
      "type": "page.edit",
      "summary": "Updated architecture diagram",
      "payload": {
        "path": "wiki/Home.md",
        "author": "wizard"
      }
    }
  ]
}
```

---

## 4. Spool Types

Feeds can be spoolable based on their type and age:

| Feed | Spool Type | When |
|------|------------|------|
| `devlog.json` | Compress | Monthly |
| `session-io.json` | Clean | Weekly (remove duplicate errors) |
| `tasks.json` | Vector | For AI task suggestions |
| `docs.json` | Archive | Quarterly |
| `courses.json` | Compress | After course completion |
| `wiki.json` | Clean | Monthly |

---

## 5. Querying Feeds

Feeds are designed to be queried using tools like `jq`:

```bash
# List all commits in April 2026
jq '.items | map(select(.type=="commit" and (.timestamp | startswith("2026-04"))))' dev/devlog.json

# Count errors in session IO
jq '.items | map(select(.type=="error")) | length' dev/session-io.json

# List incomplete tasks
jq '.items | map(select(.payload.status!="done"))' dev/tasks.json
```

---

## 6. Replaying Feeds

Feeds can be replayed for debugging or auditing:

```bash
# Replay a session
udo session replay --id io-001

# Replay a dev log session
udo devlog replay --round R12 --date 2026-04-18
```

---

## 7. Compression and Archiving

Feeds can be compressed or archived based on their spool type:

```bash
# Compress dev log
udo devlog spool --compress --before 2026-01-01

# Archive docs feed
udo docs spool --archive --older-than 90d
```

---

## 8. Success Criteria

- [x] Feed format is standardized across all domains
- [x] Feeds are queryable with `jq`
- [x] Feeds are spoolable (compress, clean, archive)
- [x] Feeds are replayable for debugging
- [x] No more than one feed file per domain
- [x] Feeds are valid JSON

---

## 9. CLI Commands

```bash
# Dev log
udo devlog add "Started R12" --type session.start --round R12
udo devlog list --type commit --since 2026-04-01
udo devlog spool --compress --before 2026-01-01

# Session IO
udo session log --capture  # Start capturing terminal I/O
udo session replay --id io-001
udo session spool --clean --older-than 30d

# Tasks
udo task list --status in-progress
udo task add "Implement vector spool" --priority high --round R12
udo task spool --vector --embed

# Documentation
udo docs track --path docs/specs/ --round R12
udo docs list --type update --since 2026-04-01

# Courses
udo course list --in-progress
udo course complete 02-local-first-dev --score 92
udo course spool --archive --completed-before 2026-01-01

# Wiki
udo wiki edit Home.md --message "Updated architecture"
udo wiki list --type page.create
```

---

## 10. References

- [JSON Feed Specification](https://jsonfeed.org/)
- [jq Manual](https://stedolan.github.io/jq/manual/)
- [ISO 8601 Date Format](https://en.wikipedia.org/wiki/ISO_8601)

---

**Status:** Active
**Version:** 1.0
**Last Updated:** 2026-04-18