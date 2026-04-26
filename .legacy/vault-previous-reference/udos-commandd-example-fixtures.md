# udos-commandd Example Fixtures

This document provides concrete example requests and responses for the
Workspace 01 minimum operation set.

Use it with:

- `uDOS-dev/docs/udos-commandd-api-envelope.md`
- `uDOS-dev/docs/udos-commandd-minimum-operation-contracts.md`

## 1. `runtime.health`

Request:

```json
{
  "operation_id": "runtime.health",
  "request_id": "req_runtime_health_001",
  "session_id": "sess_local_admin",
  "surface": "tui",
  "actor": { "id": "local-admin", "role": "operator" },
  "params": {},
  "context": { "runtime_profile": "ubuntu-command-centre" }
}
```

Response:

```json
{
  "request_id": "req_runtime_health_001",
  "operation_id": "runtime.health",
  "status": "ok",
  "summary": "Runtime health is OK.",
  "payload": {
    "overall": "ok",
    "services": [
      { "id": "udos-commandd", "status": "ok" },
      { "id": "udos-vaultd", "status": "ok" }
    ],
    "missing_runtime_roots": [],
    "degraded": false
  },
  "ui_hints": { "preferred_view": "runtime-health" },
  "policy": { "allowed": true, "approval_required": false, "policy_id": "default-local-policy" },
  "budget": { "checked": true, "allowed": true, "approval_required": false, "budget_id": "local-default", "reason": "local-only operation" },
  "errors": [],
  "next_actions": [{ "operation_id": "runtime.service.status", "label": "Inspect services" }],
  "meta": { "service": "udos-hostd", "timestamp": "2026-03-29T12:00:00Z" }
}
```

## 2. `runtime.service.status`

Request:

```json
{
  "operation_id": "runtime.service.status",
  "request_id": "req_runtime_service_status_001",
  "session_id": "sess_local_admin",
  "surface": "web",
  "actor": { "id": "local-admin", "role": "operator" },
  "params": { "service_id": "udos-vaultd" }
}
```

Response:

```json
{
  "request_id": "req_runtime_service_status_001",
  "operation_id": "runtime.service.status",
  "status": "ok",
  "summary": "Service status loaded.",
  "payload": {
    "services": [
      { "id": "udos-vaultd", "status": "ok", "enabled": true, "uptime_s": 1234 }
    ]
  },
  "ui_hints": { "preferred_view": "service-status" },
  "policy": { "allowed": true, "approval_required": false, "policy_id": "default-local-policy" },
  "budget": { "checked": true, "allowed": true, "approval_required": false, "budget_id": "local-default", "reason": "local-only operation" },
  "errors": [],
  "next_actions": [{ "operation_id": "runtime.logs.inspect", "label": "Inspect logs" }],
  "meta": { "service": "udos-hostd", "timestamp": "2026-03-29T12:00:10Z" }
}
```

## 3. `vault.browse`

Request:

```json
{
  "operation_id": "vault.browse",
  "request_id": "req_vault_browse_001",
  "session_id": "sess_local_admin",
  "surface": "web",
  "actor": { "id": "local-admin", "role": "operator" },
  "params": { "path": "projects/" }
}
```

Response:

```json
{
  "request_id": "req_vault_browse_001",
  "operation_id": "vault.browse",
  "status": "ok",
  "summary": "Vault path loaded.",
  "payload": {
    "path": "projects/",
    "items": [
      { "id": "projects/runtime-spine.md", "kind": "file", "title": "Runtime Spine" }
    ]
  },
  "ui_hints": { "preferred_view": "vault-browser" },
  "policy": { "allowed": true, "approval_required": false, "policy_id": "default-local-policy" },
  "budget": { "checked": true, "allowed": true, "approval_required": false, "budget_id": "local-default", "reason": "local-only operation" },
  "errors": [],
  "next_actions": [{ "operation_id": "vault.open", "label": "Open selected item" }],
  "meta": { "service": "udos-vaultd", "timestamp": "2026-03-29T12:01:00Z" }
}
```

## 4. `vault.open`

Request:

```json
{
  "operation_id": "vault.open",
  "request_id": "req_vault_open_001",
  "session_id": "sess_local_admin",
  "surface": "tui",
  "actor": { "id": "local-admin", "role": "operator" },
  "target": { "kind": "vault_item", "id": "projects/runtime-spine.md" },
  "params": {}
}
```

Response:

```json
{
  "request_id": "req_vault_open_001",
  "operation_id": "vault.open",
  "status": "ok",
  "summary": "Vault item opened.",
  "payload": {
    "path": "projects/runtime-spine.md",
    "title": "Runtime Spine",
    "content_type": "markdown",
    "body": "# Runtime Spine ..."
  },
  "ui_hints": { "preferred_view": "document", "focus": "content" },
  "policy": { "allowed": true, "approval_required": false, "policy_id": "default-local-policy" },
  "budget": { "checked": true, "allowed": true, "approval_required": false, "budget_id": "local-default", "reason": "local-only operation" },
  "errors": [],
  "next_actions": [{ "operation_id": "vault.publish.static", "label": "Publish static page" }],
  "meta": { "service": "udos-vaultd", "timestamp": "2026-03-29T12:01:10Z" }
}
```

## 5. `vault.convert.markdown`

Request:

```json
{
  "operation_id": "vault.convert.markdown",
  "request_id": "req_vault_convert_markdown_001",
  "session_id": "sess_local_admin",
  "surface": "web",
  "actor": { "id": "local-admin", "role": "operator" },
  "params": {
    "input_kind": "audio",
    "source_ref": "library/audio/song-demo.wav",
    "destination_path": "inbox/converted/song-demo.md"
  }
}
```

Response:

```json
{
  "request_id": "req_vault_convert_markdown_001",
  "operation_id": "vault.convert.markdown",
  "status": "accepted",
  "summary": "Markdown conversion job started.",
  "payload": {
    "job_id": "job_convert_001",
    "destination_path": "inbox/converted/song-demo.md",
    "queued": true
  },
  "ui_hints": { "preferred_view": "job-status" },
  "policy": { "allowed": true, "approval_required": false, "policy_id": "default-local-policy" },
  "budget": { "checked": true, "allowed": true, "approval_required": false, "budget_id": "local-default", "reason": "local processing job" },
  "errors": [],
  "next_actions": [{ "operation_id": "jobs.status", "label": "Inspect job status" }],
  "meta": { "service": "udos-vaultd", "timestamp": "2026-03-29T12:02:00Z" }
}
```

## 6. `vault.publish.static`

Request:

```json
{
  "operation_id": "vault.publish.static",
  "request_id": "req_vault_publish_static_001",
  "session_id": "sess_local_admin",
  "surface": "web",
  "actor": { "id": "local-admin", "role": "operator" },
  "params": { "publish_scope": "full" }
}
```

Response:

```json
{
  "request_id": "req_vault_publish_static_001",
  "operation_id": "vault.publish.static",
  "status": "accepted",
  "summary": "Static publish job started.",
  "payload": {
    "job_id": "job_publish_001",
    "output_root": "~/.udos/publish/static/",
    "publish_scope": "full"
  },
  "ui_hints": { "preferred_view": "job-status" },
  "policy": { "allowed": true, "approval_required": false, "policy_id": "default-local-policy" },
  "budget": { "checked": true, "allowed": true, "approval_required": false, "budget_id": "local-default", "reason": "local static publish" },
  "errors": [],
  "next_actions": [{ "operation_id": "publish.local.status", "label": "Inspect publish status" }],
  "meta": { "service": "udos-vaultd", "timestamp": "2026-03-29T12:02:30Z" }
}
```

## 7. `sync.queue.list`

Request:

```json
{
  "operation_id": "sync.queue.list",
  "request_id": "req_sync_queue_list_001",
  "session_id": "sess_local_admin",
  "surface": "tui",
  "actor": { "id": "local-admin", "role": "operator" },
  "params": { "queue": "default", "status_filter": "failed" }
}
```

Response:

```json
{
  "request_id": "req_sync_queue_list_001",
  "operation_id": "sync.queue.list",
  "status": "ok",
  "summary": "Sync queue loaded.",
  "payload": {
    "queue": "default",
    "items": [
      { "id": "sync_001", "status": "failed", "target": "peer:ubuntu-main" }
    ]
  },
  "ui_hints": { "preferred_view": "queue-list" },
  "policy": { "allowed": true, "approval_required": false, "policy_id": "default-local-policy" },
  "budget": { "checked": true, "allowed": true, "approval_required": false, "budget_id": "local-default", "reason": "local-only operation" },
  "errors": [],
  "next_actions": [{ "operation_id": "sync.queue.retry", "label": "Retry selected item" }],
  "meta": { "service": "udos-syncd", "timestamp": "2026-03-29T12:03:00Z" }
}
```

## 8. `sync.queue.retry`

Request:

```json
{
  "operation_id": "sync.queue.retry",
  "request_id": "req_sync_queue_retry_001",
  "session_id": "sess_local_admin",
  "surface": "tui",
  "actor": { "id": "local-admin", "role": "operator" },
  "target": { "kind": "sync_item", "id": "sync_001" },
  "params": {}
}
```

Response:

```json
{
  "request_id": "req_sync_queue_retry_001",
  "operation_id": "sync.queue.retry",
  "status": "accepted",
  "summary": "Sync retry queued.",
  "payload": {
    "job_id": "job_retry_sync_001",
    "queue_item_id": "sync_001",
    "queued": true
  },
  "ui_hints": { "preferred_view": "job-status" },
  "policy": { "allowed": true, "approval_required": false, "policy_id": "default-local-policy" },
  "budget": { "checked": true, "allowed": true, "approval_required": false, "budget_id": "local-default", "reason": "local sync retry" },
  "errors": [],
  "next_actions": [{ "operation_id": "jobs.status", "label": "Inspect retry job" }],
  "meta": { "service": "udos-syncd", "timestamp": "2026-03-29T12:03:15Z" }
}
```

## 9. `jobs.schedule.list`

Request:

```json
{
  "operation_id": "jobs.schedule.list",
  "request_id": "req_jobs_schedule_list_001",
  "session_id": "sess_local_admin",
  "surface": "web",
  "actor": { "id": "local-admin", "role": "operator" },
  "params": {}
}
```

Response:

```json
{
  "request_id": "req_jobs_schedule_list_001",
  "operation_id": "jobs.schedule.list",
  "status": "ok",
  "summary": "Schedules loaded.",
  "payload": {
    "schedules": [
      { "id": "daily-static-publish", "status": "active", "next_run": "2026-03-30T09:00:00Z" }
    ]
  },
  "ui_hints": { "preferred_view": "schedule-list" },
  "policy": { "allowed": true, "approval_required": false, "policy_id": "default-local-policy" },
  "budget": { "checked": true, "allowed": true, "approval_required": false, "budget_id": "local-default", "reason": "local-only operation" },
  "errors": [],
  "next_actions": [{ "operation_id": "jobs.schedule.run", "label": "Run selected schedule" }],
  "meta": { "service": "udos-scheduled", "timestamp": "2026-03-29T12:04:00Z" }
}
```

## 10. `jobs.schedule.run`

Request:

```json
{
  "operation_id": "jobs.schedule.run",
  "request_id": "req_jobs_schedule_run_001",
  "session_id": "sess_local_admin",
  "surface": "web",
  "actor": { "id": "local-admin", "role": "operator" },
  "target": { "kind": "schedule", "id": "daily-static-publish" },
  "params": {}
}
```

Response:

```json
{
  "request_id": "req_jobs_schedule_run_001",
  "operation_id": "jobs.schedule.run",
  "status": "accepted",
  "summary": "Schedule run queued.",
  "payload": {
    "job_id": "job_schedule_001",
    "schedule_id": "daily-static-publish",
    "queued": true
  },
  "ui_hints": { "preferred_view": "job-status" },
  "policy": { "allowed": true, "approval_required": false, "policy_id": "default-local-policy" },
  "budget": { "checked": true, "allowed": true, "approval_required": false, "budget_id": "local-default", "reason": "local schedule execution" },
  "errors": [],
  "next_actions": [{ "operation_id": "jobs.status", "label": "Inspect job status" }],
  "meta": { "service": "udos-scheduled", "timestamp": "2026-03-29T12:04:15Z" }
}
```

## 11. `network.beacon.status`

Request:

```json
{
  "operation_id": "network.beacon.status",
  "request_id": "req_network_beacon_status_001",
  "session_id": "sess_local_admin",
  "surface": "tui",
  "actor": { "id": "local-admin", "role": "operator" },
  "params": {}
}
```

Response:

```json
{
  "request_id": "req_network_beacon_status_001",
  "operation_id": "network.beacon.status",
  "status": "ok",
  "summary": "Beacon host is available.",
  "payload": {
    "status": "ok",
    "listen_mode": "lan",
    "peers_online": 2
  },
  "ui_hints": { "preferred_view": "network-status" },
  "policy": { "allowed": true, "approval_required": false, "policy_id": "default-local-policy" },
  "budget": { "checked": true, "allowed": true, "approval_required": false, "budget_id": "local-default", "reason": "local-only operation" },
  "errors": [],
  "next_actions": [{ "operation_id": "network.portal.status", "label": "Inspect portal status" }],
  "meta": { "service": "udos-networkd", "timestamp": "2026-03-29T12:05:00Z" }
}
```

## 12. `network.portal.status`

Request:

```json
{
  "operation_id": "network.portal.status",
  "request_id": "req_network_portal_status_001",
  "session_id": "sess_local_admin",
  "surface": "web",
  "actor": { "id": "local-admin", "role": "operator" },
  "params": {}
}
```

Response:

```json
{
  "request_id": "req_network_portal_status_001",
  "operation_id": "network.portal.status",
  "status": "ok",
  "summary": "Portal status loaded.",
  "payload": {
    "status": "ok",
    "ingress_enabled": true,
    "remote_link": "connected"
  },
  "ui_hints": { "preferred_view": "network-status" },
  "policy": { "allowed": true, "approval_required": false, "policy_id": "default-local-policy" },
  "budget": { "checked": true, "allowed": true, "approval_required": false, "budget_id": "local-default", "reason": "local-only operation" },
  "errors": [],
  "next_actions": [],
  "meta": { "service": "udos-networkd", "timestamp": "2026-03-29T12:05:10Z" }
}
```

## 13. `budget.status`

Request:

```json
{
  "operation_id": "budget.status",
  "request_id": "req_budget_status_001",
  "session_id": "sess_local_admin",
  "surface": "web",
  "actor": { "id": "local-admin", "role": "operator" },
  "params": {}
}
```

Response:

```json
{
  "request_id": "req_budget_status_001",
  "operation_id": "budget.status",
  "status": "ok",
  "summary": "Budget status loaded.",
  "payload": {
    "budget_id": "local-default",
    "status": "ok",
    "remaining": {
      "requests": 120,
      "cost_units": 4500
    }
  },
  "ui_hints": { "preferred_view": "budget-status" },
  "policy": { "allowed": true, "approval_required": false, "policy_id": "default-local-policy" },
  "budget": { "checked": true, "allowed": true, "approval_required": false, "budget_id": "local-default", "reason": "budget status operation" },
  "errors": [],
  "next_actions": [{ "operation_id": "budget.approval.request", "label": "Request approval" }],
  "meta": { "service": "udos-budgetd", "timestamp": "2026-03-29T12:06:00Z" }
}
```

## 14. `budget.approval.request`

Request:

```json
{
  "operation_id": "budget.approval.request",
  "request_id": "req_budget_approval_request_001",
  "session_id": "sess_local_admin",
  "surface": "tui",
  "actor": { "id": "local-admin", "role": "operator" },
  "params": {
    "requested_operation_id": "publish.remote.run",
    "reason": "Push latest static publish to remote target"
  }
}
```

Response:

```json
{
  "request_id": "req_budget_approval_request_001",
  "operation_id": "budget.approval.request",
  "status": "ok",
  "summary": "Approval request recorded.",
  "payload": {
    "approval_request_id": "approval_001",
    "requested_operation_id": "publish.remote.run",
    "status": "pending"
  },
  "ui_hints": { "preferred_view": "approval-status" },
  "policy": { "allowed": true, "approval_required": true, "policy_id": "external-publish-policy" },
  "budget": { "checked": true, "allowed": true, "approval_required": true, "budget_id": "api-remote-default", "reason": "approval workflow started" },
  "errors": [],
  "next_actions": [],
  "meta": { "service": "udos-budgetd", "timestamp": "2026-03-29T12:06:15Z" }
}
```

## 15. `publish.local.status`

Request:

```json
{
  "operation_id": "publish.local.status",
  "request_id": "req_publish_local_status_001",
  "session_id": "sess_local_admin",
  "surface": "web",
  "actor": { "id": "local-admin", "role": "operator" },
  "params": {}
}
```

Response:

```json
{
  "request_id": "req_publish_local_status_001",
  "operation_id": "publish.local.status",
  "status": "ok",
  "summary": "Local publish status loaded.",
  "payload": {
    "output_root": "~/.udos/publish/static/",
    "last_publish_at": "2026-03-29T12:05:00Z",
    "status": "ok"
  },
  "ui_hints": { "preferred_view": "publish-status" },
  "policy": { "allowed": true, "approval_required": false, "policy_id": "default-local-policy" },
  "budget": { "checked": true, "allowed": true, "approval_required": false, "budget_id": "local-default", "reason": "local-only operation" },
  "errors": [],
  "next_actions": [{ "operation_id": "vault.publish.static", "label": "Run static publish" }],
  "meta": { "service": "udos-vaultd", "timestamp": "2026-03-29T12:06:30Z" }
}
```
