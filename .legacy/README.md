# uDos Legacy Reference Archive

## 📚 Purpose

This `.legacy` directory contains **reference-only** code and scripts from previous uDos versions that may be useful for:
- Historical reference
- Migration guidance
- Understanding legacy implementations
- Extracting useful patterns for uCode1

## ⚠️ IMPORTANT NOTICE

**ALL CONTENT IN THIS FOLDER IS REFERENCE ONLY:**
- ❌ Do NOT use in production
- ❌ Do NOT modify these files
- ❌ No runtime dependencies included
- ✅ For study and migration purposes only

## 📁 Structure

```
.legacy/
├── connect-reference/    # Legacy Connect framework scripts
│   └── bin/              # Useful CLI tools and scripts
│       ├── ok-commands.js # Legacy command system
│   └── udev              # Legacy development tool
│
└── retro-reference/     # Legacy retro-blitz components
    ├── src/              # Rust source code
    └── test_wasm.sh       # WASM testing script
```

## 🔍 Usage Guidelines

1. **Study patterns**: Examine how previous versions handled specific problems
2. **Extract logic**: Copy useful algorithms with proper attribution
3. **Migration reference**: Understand data structures from older versions
4. **Documentation**: Use as historical reference for architecture decisions

## 🚀 For uCode1 Development

If you find useful scripts or patterns here that should be revived for uCode1:
1. Copy the relevant code
2. Modernize and adapt it
3. Place it in the appropriate uCode1 module
4. Add proper tests and documentation
5. Update this README to note the migration

## 📝 Migration Notes

- **connect-reference/udev**: Contains project scaffolding tools that could inform uCode1 CLI development
- **retro-reference/src/**: Contains Rust patterns that may be useful for retro-core integration

## 🗃️ Archive Policy

- No runtime files (.git, node_modules, target/, etc.)
- Code is preserved "as-is" from original state
- No modifications unless migrating to active development
- Regular review for potential migration candidates

Last updated: 2026-04-26
## uDos-test-v1.0 Reference
**Date**: 2026-04-26
**Mode**: feed-spool
**Location**: uDos-test-v1.0-reference/
**Summary**: Test extraction demonstrating inbox workflow
