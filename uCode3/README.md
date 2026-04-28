# uCode3 - Next Generation uDos Core

## Overview

uCode3 represents the evolution of the uDos core architecture, building upon the lessons learned from uCode1 and uCode2. This Rust-based implementation serves as the high-performance foundation for the uDos ecosystem.

## Key Features

- **High Performance**: Rust-based implementation for critical path operations
- **Memory Safety**: Leveraging Rust's ownership model for robust memory management
- **Zero-Cost Abstractions**: Efficient implementation without runtime overhead
- **Modular Design**: Clean separation of concerns across core components

## Architecture

```
uCode3 Core Components
├── Snack System       # Atomic executable units
├── Relic System       # Binary artifact management
├── Binder System      # Hierarchical data structures
└── USXD/OBF System    # Spatial data formats
```

## Migration from uCode1

uCode3 represents the migration of the Rust core from uCode1 to a dedicated uCode3 package. This allows:

1. **Clear Versioning**: uCode1 can now use Python core while uCode3 provides Rust performance
2. **Independent Evolution**: uCode3 can evolve separately from uCode1's Python implementation
3. **Performance Optimization**: Focused development on high-performance Rust components

## Build Requirements

- Rust 1.89.0+
- Cargo
- Standard Rust toolchain

## Building

```bash
cd uCode3
cargo build
cargo test
```

## Usage

Add uCode3 as a dependency in your Rust project:

```toml
[dependencies]
ucode3-core = { path = "../uCode3" }
```

## Development

### Testing

```bash
# Run all tests
cargo test

# Run specific module tests
cargo test snack
cargo test relic
cargo test binder
cargo test usxd
```

### Benchmarking

```bash
cargo bench
```

## Roadmap

- [ ] Complete migration of all uCode1 Rust components
- [ ] Performance optimization passes
- [ ] Python bindings for interoperability
- [ ] Documentation and examples
- [ ] Integration with uCode1 Python core

## License

MIT License - See LICENSE file for details.

## Contributing

Contributions welcome! Please see CONTRIBUTING.md for guidelines.

## Support

For issues and questions, please open a GitHub issue or contact the development team.