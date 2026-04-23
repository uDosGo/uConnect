# Wizard and Beacon
Wizard owns provider/API/MCP bridges, AI/OK/API budgeting, assisted/generative
tasks, bounded autonomy, and Beacon.

## Beacon Activate

`Beacon Activate` is the active family wording for the local Wi-Fi connection
and nearby portal experience offered by Wizard.

It should be understood as:

- a local Wi-Fi invitation
- a portal into curated offline content
- a handoff into `uHOME-server` vault-reader surfaces prepared by the Beacon
  host user

It is not:

- the canonical vault store
- a separate workflow engine
- a separate renderer stack by default

## Shared Module Rule

Shared modules may serve more than one contract.

For example, an `md -> html` IO renderer may serve both:

- the Wizard web publishing contract
- the Beacon Activate local portal library contract
- app-side publishing or preview consumers that use the same shared artifact

The function can be shared even when the runtime surface differs.

## Ownership Split

- Wizard owns the Beacon Activate access ritual and networking-side handoff
- `uHOME-server` owns the nearby library and reading surfaces behind it
- future beacon-to-beacon flows may be added later without changing the basic
  local portal model

Behind Beacon sit tunnel support, quota enforcement, plugin cache, and
monitoring.
