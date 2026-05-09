# udoui Extensions Market

**Discover, install, and manage extensions for the uDos ecosystem.**

The udoui Extensions Market is a structured registry of packages that extend uDos functionality across all uCode surfaces (uCode1-4, HomeNest, DevStudio). Extensions are versioned, discoverable, and installable via the udoui surface manager.

## Directory Structure

```
udoui/extensions/
├── README.md              # This file
├── catalog/               # Extension catalog (discoverable packages)
│   ├── index.json         # Master catalog index
│   ├── categories.json    # Category definitions
│   └── featured.json      # Featured/curated extensions
├── registry/              # Extension registry (installed packages)
│   ├── index.json         # Registry index (what's installed)
│   └── <pkg-name>/        # Per-package registry entries
├── manifests/             # Extension manifests (package definitions)
│   ├── <pkg-name>.json    # Manifest for each extension
│   └── schema.json        # Manifest schema definition
└── market.yaml            # Market configuration
```

## Extension Types

| Type | Description | Example |
|------|-------------|---------|
| **skill** | CLI command set (YAML + scripts) | `sys-ops`, `vault` |
| **surface** | Vue UI view/component | `HomeNest Launcher`, `Media Browser` |
| **service** | Background daemon/service | `Snackbar`, `Feed Spool` |
| **integration** | Third-party API bridge | `Home Assistant`, `HDHomeRun` |
| **theme** | Visual theme/preset | `Retro`, `Console Dark` |
| **tool** | Standalone CLI tool | `PublishLane`, `OkGuide` |

## Catalog vs Registry

| Concept | Catalog | Registry |
|---------|---------|----------|
| **Purpose** | Discoverable packages | Installed packages |
| **Source** | Remote/curated | Local installation |
| **Mutable** | Yes (new versions) | No (pinned versions) |
| **Scope** | All available | What you've installed |

## Usage

### Browse Catalog
```bash
# List all available extensions
udo ext list

# Search by category
udo ext search media

# Show extension details
udo ext info homenest-media-scanner
```

### Install/Remove
```bash
# Install an extension
udo ext install homenest-media-scanner

# Remove an extension
udo ext remove homenest-media-scanner

# Update all extensions
udo ext update
```

### Development
```bash
# Create a new extension scaffold
udo ext create my-extension

# Validate manifest
udo ext validate my-extension

# Publish to catalog
udo ext publish my-extension
```

## Extension Manifest Format

Each extension has a JSON manifest in `manifests/`:

```json
{
  "name": "homenest-media-scanner",
  "version": "1.0.0",
  "type": "service",
  "displayName": "Media Scanner",
  "description": "Scans ~/media/ for new files and populates grid cells",
  "author": "uDosGo",
  "license": "MIT",
  "platform": "linux",
  "dependencies": {
    "uCode3": ">=1.0.0",
    "ffmpeg": "*"
  },
  "surfaces": ["homenest"],
  "tags": ["media", "scanner", "homenest"],
  "entry": "bin/media-scanner",
  "config": {
    "scanInterval": 3600,
    "mediaDirs": ["~/media/movies", "~/media/tv", "~/media/music"]
  }
}
```

## Market Configuration

See `market.yaml` for market-level settings:

```yaml
market:
  name: "udoui Extensions Market"
  version: "1.0.0"
  catalogUrl: "https://extensions.udoui.dev/catalog"
  registryPath: "~/.local/share/udoui/extensions"
  categories:
    - media
    - automation
    - tv-dvr
    - feed-spool
    - console
    - development
    - system
    - themes
```

---

*Part of the uDos ecosystem. See [ECOSYSTEM_MAP.md](../../docs/ECOSYSTEM_MAP.md) for full context.*
