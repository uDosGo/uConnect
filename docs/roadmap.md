# uDos Development Roadmap

## Current Status

**Version**: 1.0.0 (Pre-Alpha)
**Last Updated**: 2026-04-26
**Current Focus**: Implementing Snack & Relic system, stabilizing core architecture

---

## Phase 1: Core Stabilization (Month 1-3)

### ✅ Completed
- [x] Fixed ThinUI whitescreen issue with proper error handling
- [x] Implemented comprehensive plugin loading system
- [x] Added loading and error states to AppShell
- [x] Created basic dashboard plugin structure
- [x] Implemented mock core method responses

### 🚧 In Progress
- [ ] Testing ThinUI with improved error handling
- [ ] Verifying MCP socket connection
- [ ] Implementing proper plugin discovery system
- [ ] Documenting Snack & Relic Specification
- [ ] Documenting uCode1 128-Character ANSI Set + Emoji Overlays + Word Aliases

### 📌 Upcoming
- [ ] Add comprehensive logging system
- [ ] Implement proper Tauri command integration
- [ ] Add unit and integration tests
- [x] Implement CONDENSE for document consolidation (basic deduplication)
- [x] Apply CONDENSE to docs-process collection (1,543 files → 1,543 files, 0% reduction)
- [x] Implement CONDENSE v2 with semantic analysis (1,543 files → 1,543 files, 0% reduction)
- [x] Implement CONDENSE v2 filtered (1,543 files → 519 files, 66% reduction with <50 lines and <100 words filter)
- [ ] Implement CONDENSE v3 with AI-assisted merging (target 30-50% reduction) - ON HOLD
- [ ] Implement development mode with hot reload

---

## Phase 2: Snack & Relic System (Month 4-6)

### Snack Implementation
- [ ] Create Snack schema and validator
- [ ] Add CLI commands: `ucode snack list/run/create`
- [ ] Implement Snack execution engine
- [ ] Add Snack dependency resolution

### Relic Implementation
- [ ] Create Relic binary format
- [ ] Add CLI commands: `ucode relic create/unpack/run`
- [ ] Implement Relic integrity verification
- [ ] Add Relic registry support

### Integration
- [ ] Modify feed spool to accept `snack_execution` event types
- [ ] Extend Yarnspinner to generate story entries from snack executions
- [ ] Add ASCII flowchart parser to `.udx` and `.md` files

---

## Phase 3: Binder & MDX Runtime (Month 7-9)

### Binder Implementation
- [ ] Create Binder structure and configuration
- [ ] Implement sub-binder inheritance
- [ ] Add Binder state management
- [ ] Implement Binder registry

### MDX Runtime
- [ ] Support `<Snack>` shortcode in MDX files
- [ ] Implement Snack resolution and execution
- [ ] Add Snack output rendering
- [ ] Implement Snack error handling

### Story Format
- [ ] Add `save_binder` action to Story format
- [ ] Implement Story data saving to binder
- [ ] Add Story execution tracking
- [ ] Implement Story error handling

---

## Phase 4: USXD/OBF & ASCII Grid Parser (Month 10-12)

### USXD/OBF Implementation
- [ ] Create USXD/OBF format specification
- [ ] Implement ASCII grid parser
- [ ] Add component mapping support
- [ ] Implement grid rendering in TUI

### ThinUI Integration
- [ ] Add ASCII grid rendering in ThinUI
- [ ] Implement component mapping in ThinUI
- [ ] Add grid editing support
- [ ] Implement grid error handling

### Grid & Spatial Hierarchy Integration
- [ ] Create `.state/cells/` directory structure
- [ ] Implement `ucode cell` commands (read/write)
- [ ] Extend `.udx` parser to support Cell mapping
- [ ] Modify feed spool archiving to use Cells
- [ ] Add Cube storage format for SnackBox packing

### Lexicon & Character System
- [ ] Implement 128-Character ANSI Set
- [ ] Add Emoji Overlays for each slot
- [ ] Add Word Aliases for each slot
- [ ] Implement rendering priority (emoji > word > teletext > ANSI)

### Lexicon + Yarnspinner Integration
- [ ] Implement Command Slots (0-31)
- [ ] Implement Snack Slots (32-63)
- [ ] Implement Alias Slots (96-127)
- [ ] Add Yarnspinner Lexicon Lookup
- [ ] Add CLI commands for Lexicon & Yarnspinner

### uCode1 to uCode2 Progression
- [ ] Document uCode1 to uCode2 progression
- [ ] Plan uCode2 implementation
- [ ] Update roadmap for uCode2

---

## Phase 5: Testing & Documentation (Month 13-15)

### Testing
- [ ] Implement comprehensive test suite
- [ ] Add unit tests for Snack & Relic system
- [ ] Add integration tests for Binder & MDX runtime
- [ ] Add end-to-end tests for USXD/OBF

### Documentation
- [ ] Complete API documentation
- [ ] Add developer guides
- [ ] Create user manual
- [ ] Add troubleshooting guide

---

## Phase 6: Deployment & Release (Month 16-18)

### Deployment
- [ ] Implement CI/CD pipeline
- [ ] Add automated builds
- [ ] Implement release management
- [ ] Add update notifications

### Release
- [ ] uCode1 v1.0 official release
- [ ] Community call to showcase features
- [ ] Gather user feedback
- [ ] Plan next steps

---

## Long-Term Roadmap

### Future Enhancements
- [ ] Add AI-powered features
- [ ] Implement voice interface
- [ ] Add AR/VR support
- [ ] Implement blockchain integration

### Ecosystem
- [ ] Build plugin ecosystem
- [ ] Create theme marketplace
- [ ] Develop integration partners
- [ ] Build community

---

## Release Plan

### v0.1.0 (Alpha)
- Basic functionality
- Core plugin system
- Basic dashboard
- Development mode

### v0.2.0 (Beta)
- MCP integration
- Real data support
- Theme system
- Basic plugins

### v1.0.0 (Stable)
- Production ready
- Full feature set
- Comprehensive documentation
- Enterprise support

---

## Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to uDos.

---

## Support

For issues, questions, or feature requests, please open an issue on our GitHub repository or contact our support team.

---

*This roadmap is subject to change based on development progress and community feedback.*
