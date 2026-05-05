# uCode3 — Home Automation Console

uCode3 is the uDosGo home automation console, integrating smart home management with the SonicScrewdriver ecosystem.

## Components

### sonic-home
Home automation core — bundle packaging, verification, and deployment for smart home configurations.

- `cmd/sonic-home` — CLI entry point for pack, verify, install, and serve commands
- `cmd/pack` — Standalone pack command for building manifests and bundles
- `cmd/verify` — Standalone bundle verification
- `cmd/install` — Bundle installation scaffold
- `cmd/serve` — Bundle serving scaffold
- `pkg/manifest` — Manifest schema and dry-run builder
- `pkg/bundle` — SHE (Sonic Home Bundle) format: tar-based bundles with checksums and signatures
- `pkg/handler` — Handler interfaces
- `pkg/transport` — Transport layer

### sonic-express
Express deployment module — lightweight bundle management for rapid deployment scenarios.

- Same structure as sonic-home, optimized for express deployment workflows

### homeassistant
Home Assistant integration layer — Go-based integration for connecting SonicScrewdriver with Home Assistant.

- `integration.go` — Core integration logic

## Bundle Format (SHE)

The Sonic Home Bundle (`.she`) format is a tar archive containing:

- `header.sheh` — Bundle header
- `manifest.json` — Component manifest with checksums
- `signature.sig` — Digital signature
- `payload/` — Component payload directory
  - `base/` — Base files
  - `scripts/` — Lifecycle scripts (pre-install, post-install, healthcheck)

## Usage

```bash
# Build a dry-run manifest
cd sonic-home && go run . pack --dry-run --source . --output manifest.json

# Build a draft bundle
cd sonic-home && go run . pack --dry-run=false --output bundle.she

# Verify a bundle
cd sonic-home && go run . verify bundle.she
```

## Development

```bash
# Build all modules
cd sonic-home && go build ./...
cd sonic-express && go build ./...
```
