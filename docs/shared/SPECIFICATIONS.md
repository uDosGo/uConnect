# uDos Ecosystem - Technical Specifications

**Complete reference for all components, protocols, and file formats**

## 📚 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [MCP Protocol](#mcp-protocol)
3. [UDX/UDO File Formats](#udxudo-file-formats)
4. [Feed Spool Structure](#feed-spool-structure)
5. [Workflow Definitions](#workflow-definitions)
6. [API Endpoints](#api-endpoints)
7. [Security Model](#security-model)
8. [Error Codes](#error-codes)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐

│                            uDos Ecosystem                                  │
├─────────────────┬─────────────────┬─────────────────┬─────────────────────────┤
│  DevStudio      │  uCode1         │  uCode2         │  udoui                 │
│  (Automation)   │  (BASIC/Teletext)│  (Rust Core)    │  (Web UI)             │
└─────────┬─────────┴─────────┬─────────┴─────────┬─────────┴─────────────────┘
          │                   │                   │
          ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            uCode1 Core                                      │
│                                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌───────────────────────────────┐  │
│  │  MCP Server  │    │ Feed Spool   │    │  Vault System                │  │
│  │              │    │              │    │                              │  │
│  └─────────────┘    └─────────────┘    └───────────────────────────────┘  │
│        │                   │                   │                        │  │
└────────┼───────────────┼───────────────┼────────────────────────────┘  │
         │               │               │                                │
         ▼               ▼               ▼                                ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Unix Socket │  │ JSONL Files  │  │ Markdown/UDX/UDO │  │ Git Integration │
└─────────────┘  └─────────────┘  └─────────────────┘  └─────────────────┘
```


## MCP Protocol

### Socket Specification

- **Path**: `~/.uds/control.sock`
- **Permissions**: `0600` (owner read/write only)
- **Protocol**: JSON-RPC 2.0 over Unix socket
- **Timeout**: 30 seconds

### Message Format

```json
{
  "method": "string",          // Required
  "params": "object",          // Optional
  "id": "number or string"     // Optional
}
```

### Response Format

```json
{
  "result": "any",             // On success
  "error": {
    "code": "number",
    "message": "string",
    "data": "any"              // Optional
  },
  "id": "number or string"     // Matches request id
}
```

### Supported Methods

| Method | Description | Parameters |
|--------|-------------|------------|
| `ping` | Health check | None |
| `chat` | AI chat | `{prompt, system?, context?, temperature?}` |
| `feed_recent` | Get recent feed items | `{limit?}` |
| `feed_search` | Search feed by tag | `{tag, limit?}` |
| `reply_create` | Create feed reply | `Reply` object |
| `workflow_run` | Execute workflow | `{name, params?}` |
| `vault_read` | Read vault file | `{path}` |
| `vault_write` | Write vault file | `{path, content}` |

### Example Exchange

**Request:**
```json
{
  "method": "chat",
  "params": {
    "prompt": "Hello, world!",
    "system": "You are a helpful assistant"
  },
  "id": 1
}
```

**Response:**
```json
{
  "result": "Hello! How can I assist you today?",
  "id": 1
}
```

## USX/UDO Specifications

The uDos ecosystem uses two complementary specification formats:

### USX (Unified Surface eXchange) — Style/Design Layer

**Purpose**: UI components, style tokens, grid layouts, surface definitions, story narratives

**Location**: [`uCode1/docs/specs/usx/`](https://github.com/OkAgentDigital/uCode1/tree/main/docs/specs/usx)

| Spec | What It Defines |
|------|----------------|
| [usx-core.md](https://github.com/OkAgentDigital/uCode1/blob/main/docs/specs/usx/usx-core.md) | Core format, fence types, surface kinds |
| [usx-ui.md](https://github.com/OkAgentDigital/uCode1/blob/main/docs/specs/usx/usx-ui.md) | UI components and authoring blocks |
| [usx-style.md](https://github.com/OkAgentDigital/uCode1/blob/main/docs/specs/usx/usx-style.md) | Style tokens, themes, font system |
| [usx-surface.md](https://github.com/OkAgentDigital/uCode1/blob/main/docs/specs/usx/usx-surface.md) | Surface definitions and story format |
| [usx-grid.md](https://github.com/OkAgentDigital/uCode1/blob/main/docs/specs/usx/usx-grid.md) | Grid system and cell maths |

### UDO (Unified Document Object) — System/Document Layer

**Purpose**: Skills, tasks, variables, agents, workflows, publishing, meta-schemas

**Location**: [`uCode1/docs/specs/udo/`](https://github.com/OkAgentDigital/uCode1/tree/main/docs/specs/udo)

| Spec | What It Defines |
|------|----------------|
| [udo-core.md](https://github.com/OkAgentDigital/uCode1/blob/main/docs/specs/udo/udo-core.md) | Core format, system kinds |
| [udo-skill.md](https://github.com/OkAgentDigital/uCode1/blob/main/docs/specs/udo/udo-skill.md) | Invocable capabilities |
| [udo-task.md](https://github.com/OkAgentDigital/uCode1/blob/main/docs/specs/udo/udo-task.md) | Work items with state |
| [udo-variable.md](https://github.com/OkAgentDigital/uCode1/blob/main/docs/specs/udo/udo-variable.md) | Configuration and secrets |
| [udo-agent.md](https://github.com/OkAgentDigital/uCode1/blob/main/docs/specs/udo/udo-agent.md) | AI/automation definitions |
| [udo-workflow.md](https://github.com/OkAgentDigital/uCode1/blob/main/docs/specs/udo/udo-workflow.md) | Multi-step process orchestration |
| [udo-publish.md](https://github.com/OkAgentDigital/uCode1/blob/main/docs/specs/udo/udo-publish.md) | Release pipelines |
| [udo-meta.md](https://github.com/OkAgentDigital/uCode1/blob/main/docs/specs/udo/udo-meta.md) | Schema definitions and type system |

### Legacy UDX Format

The older UDX (Universal Data Exchange) format is deprecated in favour of USX/UDO:

```json
{
  "version": "1.0",
  "type": "string",
  "title": "string",
  "description": "string",
  "created_at": "ISO8601",
  "updated_at": "ISO8601",
  "metadata": "object",
  "content": "any"
}
```

## Feed Spool Structure

### File Format

- **Location**: `~/Code/Vault/.uds/state/feed_spool/replies.jsonl`
- **Format**: NDJSON (Newline-Delimited JSON)
- **Encoding**: UTF-8

### Reply Schema

```json
{
  "reply_id": "string",           // UUID or timestamp-based
  "thread_id": "string",         // Grouping identifier
  "timestamp": "ISO8601",         // Creation time
  "source": "string",             // Component name
  "user_id": "string",            // User identifier
  "compartment": "string",        // Category
  "prompt": "string",             // User input
  "output": "string",             // System response
  "tokens": "number",            // Token count (optional)
  "model": "string",              // Model used (optional)
  "tags": "array",                // Classification tags
  "metadata": "object"            // Additional data
}
```

### Example Reply

```json
{
  "reply_id": "workflow-1234567890",
  "thread_id": "workflow-weekly-publish",
  "timestamp": "2024-04-24T10:00:00Z",
  "source": "devstudio",
  "user_id": "system",
  "compartment": "workflows",
  "prompt": "Starting workflow: weekly-publish",
  "output": "Workflow execution started",
  "tags": ["workflow", "start", "automated"],
  "metadata": {
    "workflow_name": "weekly-publish",
    "status": "started"
  }
}
```

## Workflow Definitions

### Agentic Workflow

**File**: `.udx`
**Location**: `~/Code/Sandbox/workflows/`

**Structure:**
```json
{
  "version": "1.0",
  "type": "agentic_workflow",
  "name": "string",
  "description": "string",
  "created_at": "ISO8601",
  "updated_at": "ISO8601",
  "steps": [
    {
      "name": "string",
      "action": "string",      // vault_read, vault_write, shell_command, etc.
      "parameters": "object"
    }
  ],
  "metadata": "object"
}
```

### Supported Actions

| Action | Description | Parameters |
|--------|-------------|------------|
| `vault_read` | Read file from vault | `{file: string}` |
| `vault_write` | Write file to vault | `{file: string, content: string}` |
| `shell_command` | Execute shell command | `{command: string, workdir?: string}` |
| `re3engine_call` | Call Re3Engine | `{prompt: string, system?: string}` |
| `github_api` | Call GitHub API | `{endpoint: string, method?: string, body?: object}` |

## API Endpoints

### HTTP API (ThinUI)

**Base URL**: `http://localhost:4687`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat` | POST | Send chat message |
| `/api/workflow` | POST | Execute workflow |
| `/api/feed` | GET | Get feed items |
| `/api/vault` | GET/POST | Vault operations |

### MCP API (uCode1)

**Socket**: `~/.uds/control.sock`

| Method | Description |
|--------|-------------|
| `ping` | Health check |
| `chat` | AI chat |
| `feed_recent` | Get recent feed items |
| `feed_search` | Search feed by tag |
| `reply_create` | Create feed reply |

## Security Model

### Authentication

- **MCP Socket**: Unix socket permissions (0600)
- **HTTP API**: Optional API keys
- **Rate Limiting**: 60 requests/minute

### Data Protection

- **Encryption**: TLS for HTTP (optional)
- **Logging**: All operations to feed spool
- **Backup**: Automatic backups of critical data

### Access Control

```yaml
# Example security config
security:
  mcp_socket_permissions: 0600
  api_keys: ["optional-key-1", "optional-key-2"]
  rate_limit: 60
  allowed_origins: ["http://localhost:4687"]
```

## Error Codes

### MCP Errors

| Code | Description | Solution |
|------|-------------|----------|
| 1001 | Invalid JSON | Check request format |
| 1002 | Unknown method | Check method name |
| 1003 | Authentication failed | Check socket permissions |
| 1004 | Timeout | Check server status |
| 1005 | Internal error | Check logs |

### HTTP Errors

| Code | Description | Solution |
|------|-------------|----------|
| 400 | Bad Request | Check request format |
| 401 | Unauthorized | Provide API key |
| 404 | Not Found | Check endpoint |
| 429 | Too Many Requests | Wait and retry |
| 500 | Internal Error | Check server logs |

## Best Practices

### Development

1. **Use local LLM** for fastest development
2. **Enable logging** for debugging
3. **Test in sandbox** before production
4. **Backup workflows** regularly

### Production

1. **Monitor feed spool** for errors
2. **Rotate API keys** periodically
3. **Limit network access** for sandbox
4. **Enable rate limiting** for API

### Security

1. **Restrict socket permissions** (0600)
2. **Disable network** in sandbox by default
3. **Audit feed spool** regularly
4. **Encrypt sensitive** data

---

*Last Updated: 2024-04-24*
*Version: 1.0.0*