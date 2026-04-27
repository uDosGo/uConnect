# ThinUI

**ThinUI** is a lightweight, frameless GUI renderer for uDos core. It provides a graphical interface for users who prefer a visual experience over the terminal-based TUI.

## Status

**v0.1.0 (Planned - Dec 2026)** - Initial release with basic functionality

## Architecture

```
ThinUI (OkAgentDigital/)
├── src/
│   ├── main.rs          # Tauri entry point
│   ├── core/             # Core integration
│   ├── ui/               # UI components
│   ├── settings/         # Settings management
│   └── widgets/          # Widget container
├── public/               # Static assets
├── .github/workflows/    # CI/CD
├── Cargo.toml            # Rust configuration
├── tauri.conf.json      # Tauri configuration
└── README.md             # This file
```

## Features (v0.1.0)

### Core
- ✅ Connect to uCode1 via Unix socket
- ✅ IPC using MessagePack
- ✅ Mode flag support (--privacy, --user)
- ✅ Settings persistence

### UI
- Dashboard with service status
- Vault viewer
- Feed reader (basic)
- Widget container
- Settings panel

### Advanced
- Auto-update (opt-in, respects privacy)
- Remote connection (disabled by default)
- Blitz renderer (experimental flag)

## Development Plan

### Phase 1: Foundation (Weeks 1-2)
- [ ] Set up Tauri project
- [ ] Configure CI/CD pipeline
- [ ] Implement core connection to uCode1
- [ ] Basic IPC messaging

### Phase 2: UI Components (Weeks 3-4)
- [ ] Dashboard layout
- [ ] Vault viewer
- [ ] Feed reader
- [ ] Widget container

### Phase 3: Settings & Features (Weeks 5-6)
- [ ] Settings panel
- [ ] Auto-update system
- [ ] Remote connection UI
- [ ] Theme support

### Phase 4: Testing & Release (Weeks 7-8)
- [ ] Cross-platform testing
- [ ] Performance optimization
- [ ] Build size reduction
- [ ] Release packaging

## Technical Stack

- **Framework**: Tauri 2
- **Renderer**: System WebView (Blitz optional)
- **IPC**: MessagePack over Unix socket
- **Build**: Rust + Tauri CLI
- **CI/CD**: GitHub Actions

## Integration with uDos

ThinUI connects to uCode1 via:
- **Socket**: `~/.uds/control.sock`
- **Protocol**: MessagePack
- **Modes**: Respects `--privacy` and `--user` flags

## Building

```bash
# Install dependencies
npm install

# Build for development
cargo tauri dev

# Build for production
cargo tauri build

# Run tests
cargo test
```

## License

MIT License - See LICENSE file for details.

## Roadmap

- **v0.1.0 (Dec 2026)**: Initial release
- **v0.2.0 (Dec 2027)**: Blitz renderer default, enhanced features
- **v0.3.0 (Dec 2028)**: Advanced widgets, extensions

## Contributing

See CONTRIBUTING.md for guidelines.

---

**Note**: ThinUI is developed separately from uDos core to maintain clean separation between product and development tooling.