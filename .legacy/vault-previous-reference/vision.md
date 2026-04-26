# Family Vision

## Purpose

State the short public direction for the v2 family.

## Direction

The family aims to be:

- local-first by default
- text-first and inspectable
- explicit about ownership boundaries
- able to share modules without collapsing repo responsibilities

## Core Values

- human-readable state over hidden system state
- deterministic local contracts before provider-specific behavior
- shared architecture language across sibling repos
- practical pathways from learning to building to contribution

## Family Shape

The v2 family now separates concerns on purpose:

- `uDOS-core` for canonical semantics
- `uDOS-wizard` for networking, providers, MCP, and Beacon-facing contracts
- `uHOME-server` for local-network runtime and nearby content surfaces
- `uDOS-empire` for always-on webhook/API/sync lanes
- private client apps for platform-native UX and platform-specific integrations

## Practical Promise

The family should not require the user to choose between:

- readable local ownership
- useful networked services
- reusable shared modules

Those can coexist when the boundaries stay explicit.
