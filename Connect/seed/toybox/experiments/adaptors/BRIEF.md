# Adaptor Brief

**Status:** Experiment (A2/A3 candidate)  
**Location:** `@toybox/experiments/adaptors/`  
**Purpose:** Define how 3rd party code interfaces with uDos

---

## 1. What is an Adaptor?

An **adaptor** is a wrapper that translates between 3rd party APIs/formats and uDos internal models. Adaptors live in `@user/adaptors/` (user-created) or `@system/adaptors/` (system-provided).

**Examples:**

- WordPress adaptor → translates WP posts to uDos tasks
- GitHub adaptor → translates issues to tasks
- RSS adaptor → translates feeds to uDos feed items
- Docker adaptor → translates container logs to USXD widgets

---

## 2. Adaptor Types

| Type | Purpose | Example |
|------|--------|---------|
| **Import adaptor** | Convert external format → uDos | PDF → Markdown (Markdownify) |
| **Export adaptor** | Convert uDos → external format | Tasks → WordPress posts |
| **Sync adaptor** | Bidirectional sync | GitHub issues ↔ uDos tasks |
| **Event adaptor** | Translate external events → uDos feeds | Webhook → feed item |
| **Widget adaptor** | Wrap external tool as USXD widget | Docker logs widget |

---

## 3. Adaptor Definition Format

```yaml
# @user/adaptors/github.adaptor.yaml
name: github
version: 1
description: "Sync GitHub issues with uDos tasks"

capabilities:
  - import: issues → tasks
  - export: tasks → issues
  - sync: bidirectional

config:
  required:
    - GITHUB_TOKEN
    - REPO_OWNER
    - REPO_NAME
  optional:
    - LABEL_FILTER

mappings:
  issue_to_task:
    title: issue.title
    body: issue.body
    priority: map_priority(issue.labels)
    status: map_status(issue.state)

  task_to_issue:
    title: task.title
    body: task.body
    labels: [task.priority]
    state: map_state(task.status)

commands:
  - name: sync
    action: "fetch issues → update tasks → push changes"
  - name: import-all
    action: "import all open issues as tasks"
```

---

## 4. Adaptor Execution

Adaptors run in **isolated contexts** (sandboxed) and communicate via **MCP**.

```typescript
// uDos core loads adaptor
const adaptor = await loadAdaptor('@user/adaptors/github.adaptor.yaml');

// User runs command
await adaptor.run('sync');

// Adaptor emits events
adaptor.on('issue:created', (issue) => {
  taskCreate(issue);
});
```

---

## 5. Adaptor Lifecycle

```
User enables adaptor
    │
    ▼
Adaptor loads configuration
    │
    ▼
Adaptor authenticates (if needed)
    │
    ▼
Adaptor registers MCP tools/events
    │
    ▼
Adaptor runs (sync, import, export, watch)
    │
    ▼
Adaptor emits events → uDos core
```

---

## 6. Adaptor Sandboxing

For security, adaptors run in a sandboxed environment:

| Restriction | Implementation |
|-------------|------------------|
| No file system access except allowed paths | `chroot` or Deno sandbox |
| No network except allowed domains | Proxy + allowlist |
| Rate limiting | Per-adaptor token bucket |
| Resource limits | CPU, memory, timeouts |

---

## 7. Experiment Goals (`@toybox/experiments/adaptors/`)

| Goal | Success Criteria |
|------|------------------|
| Define adaptor schema | YAML format with validation |
| Implement one adaptor | GitHub issues ↔ uDos tasks |
| Sandbox execution | Adaptor runs isolated |
| MCP integration | Adaptor registers tools/events |

**Experiment adaptors to build:** see `manifest.yaml` in this folder (same entries as below).

```yaml
# @toybox/experiments/adaptors/manifest.yaml
adaptors:
  - name: "github"
    source: "https://api.github.com"
    purpose: "Sync issues with tasks"

  - name: "wordpress"
    source: "https://wordpress.org"
    purpose: "Sync posts with notes (vector DB prep)"

  - name: "docker"
    source: "local"
    purpose: "Container logs as USXD widget"
```

---

## 8. Relationship to Other Systems

| System | Role |
|--------|------|
| **MCP** | Adaptors register as MCP servers/tools |
| **Feeds** | Adaptors emit feed items (e.g., new issues) |
| **Spool** | Adaptor output can be spooled for compression |
| **Widgets** | Adaptors can expose UI as USXD widgets |
| **Compost** | Adaptor imports store originals in compost |

---

## 9. A2/A3 Path

| Phase | Work |
|-------|------|
| **A2** | Adaptor schema, sandbox foundation, GitHub adaptor experiment |
| **A3** | WordPress adaptor (vector DB integration), adaptor marketplace |

---

## Experiment tracking

The **adaptors** experiment is listed in `@toybox/experiments/manifest.yaml` (seed: `seed/toybox/experiments/manifest.yaml`) alongside rnmd, marki, foam, docker, and **usxd-widget**. Same file is the single source of truth for clone status and `a2_ready` / `a3_ready` flags.

```yaml
  - name: "adaptors"
    location: "adaptors/"
    purpose: "3rd party integration interface"
    status: "spec-written"
    brief: "adaptors/BRIEF.md"
    catalog: "adaptors/manifest.yaml"
    a2_ready: false
    a3_ready: false
```
