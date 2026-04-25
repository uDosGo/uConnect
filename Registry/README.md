# uDosGo Registry

Promoted modules, plugins, themes, and extensions for the uDos platform.

## Structure

```
Registry/
├── modules/          # Shared Rust crates and libraries
│   ├── base-node/     # Core node functionality
│   ├── ok-helper/     # OK agent helpers
│   └── spatial-core/ # Spatial indexing
├── plugins/          # Lightweight add-ons
├── themes/           # Visual themes
├── docs/             # Documentation packages
└── extensions/       # Powerful subsystems
```

## Promotion Process

1. **Develop** in Sandbox or Toybox
2. **Test** thoroughly
3. **Promote** using `scripts/promote.sh`
4. **Version** using semantic versioning
5. **Document** API and usage

## Current Modules

### v0.1.0 (Initial Release)

- **base-node**: Core node structure and vault integration
- **ok-helper**: Intent classification and local LLM support
- **spatial-core**: 2D vector index and GeoJSON support

## Usage

Add to your `Cargo.toml`:

```toml
[dependencies]
base-node = { path = "../../Registry/modules/base-node" }
ok-helper = { path = "../../Registry/modules/ok-helper" }
```

## Versioning

- **Major**: Breaking changes
- **Minor**: Backwards-compatible features
- **Patch**: Bug fixes and improvements

## Contributing

See `CONTRIBUTING.md` in the main uDosGo repository.