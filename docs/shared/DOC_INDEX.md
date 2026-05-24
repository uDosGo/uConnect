# uDos Ecosystem — Cross-Repo Documentation Index

This index maps where to find documentation across all uDos ecosystem repos.

---

## uConnect (Shared Infrastructure)

**Path:** `~/Code/uConnect/`

### uConnect/docs/shared/ — Ecosystem-wide reference

| File | Description |
|------|-------------|
| `ECOSYSTEM_MAP.md` | Full ecosystem architecture, MCP layout, vault structure |
| `STRUCTURE_CHEAT_SHEET.md` | Flat repo layout, vault architecture, quick reference |
| `SPECIFICATIONS.md` | Technical specs: MCP protocol, UDX/UDO formats, feeds, API |
| `GITHUB_WORKFLOW.md` | GitHub workflow guide |
| `TROUBLESHOOTING.md` | Troubleshooting guide |
| `educational-content/` | 7 lesson modules (00-orientation → 06-ucode-runtime) |
| `workflow/` | Dev workflow, checklist, tasks, spine structure |

### uConnect/uDos-docs/ — Central documentation hub

| Section | Path | Description |
|---------|------|-------------|
| Entry | `README.md` | Documentation hub entry point |
| Quickstart | `QUICKSTART.md` | 5-minute setup |
| Structure | `STRUCTURE.md` | Project structure overview |
| Architecture | `CORE_ARCHITECTURE.md` | Python/Rust version boundaries |
| Dev guides | `DEV-GUIDE-NODE.md` | Node.js development guide |
| Dev guides | `DEV-GUIDE-PYTHON.md` | Python/Rust development guide |
| Lexicon | `lexicon.md` | Terminology across dev/story/student lanes |
| Lexicon | `LEXICON-DATABASE.md` | Comprehensive terminology & command management |
| Policy | `documentation-policy.md` | Audience tags, OBF, VA1 anchors |
| Guides | `guides/` | 15 guides (AGENTS, DEPLOYMENT, MCP, ThinUI, etc.) |
| Public | `public/` | 7 public-facing docs (faq, feeds, getting-started, etc.) |
| Roadmap | `ROADMAP.md` | **Consolidated** development roadmap (single source of truth) |
| Legacy roadmaps | `legacy/roadmaps/` | Superseded roadmaps (WordPress, pre-v5, dev logs, etc.) |
| Specs | `specs/` | ~35 spec docs (OBF, USXD, UDO, grid, fonts, vault, etc.) |
| Student | `student/` | Student-facing tutorials |
| API | `api/openapi.yaml` | OpenAPI specification |
| **Legacy** | `legacy/` | Superseded docs (ARCHITECTURE.md, GITHUB_WORKFLOW.md, DEVLOG.md, roadmap/) |
| **Review** | `review/` | Docs under review (LOCKED_* specs, v4/ subdirectory) |

---

## uCode1 (Foundation Layer)

**Path:** `~/Code/uCode1/docs/`

| File | Description |
|------|-------------|
| `README.md` | Entry point, layer architecture |
| `QUICK_START.md` | Quick start guide |
| `CLI_README.md` | Comprehensive user guide |
| `CLI_COMMANDS.md` | Command reference |
| `CHARACTER_SET_REFERENCE.md` | Teletext character set |
| `C_LAYER_CHEAT_SHEET.md` | C layer reference |
| `MARKDOWN_STANDARDS.md` | Markdown standards |
| `SPRITE_OBJECT_REFERENCE.md` | Sprite object reference |
| `SPATIAL_CHARACTER_MAPPING.md` | Spatial character mapping |
| `SPATIAL_CHARACTER_INTEGRATION.md` | Spatial integration |
| `GITHUB_NEXT_INTEGRATION.md` | GitHub Next integration |
| `VAULT_DOCS_TEMPLATE.md` | Vault docs template |
| `specs/udo/` | 8 UDO spec docs (core, skill, task, variable, agent, workflow, publish, meta) |
| `specs/usx/` | 6 USX spec docs (core, grid, style, surface, ui) |

---

## uCode2 (Services Layer)

**Path:** `~/Code/uCode2/docs/`

| File | Description |
|------|-------------|
| `README.md` | Entry point, quick links |
| `MCP-GATEWAY.md` | MCP Gateway architecture & usage |
| `VAULT-BRIDGE.md` | Vault operations reference |
| `API-REFERENCE.md` | CLI command reference |

---

## uCode3 (Application Layer — HomeNest)

**Path:** `~/Code/uCode3/docs/`

| Section | Path | Description |
|---------|------|-------------|
| Entry | `README.md` | Consolidated map with entry points |
| Architecture | `architecture/` | UHOME-SERVER-DEV-PLAN, media/DVR-DESIGN |
| Clients | `clients/` | BEACON, CLIENT-CAPABILITIES, HOUSEHOLD-API, etc. |
| Decisions | `decisions/` | Architectural decision records |
| How-to | `howto/` | DEPENDENCY-MANAGEMENT, JELLYFIN, SONIC-RELEASE, UHOME-INSTALL |
| Operations | `operations/` | 7 runbooks (shutdown, degradation, cache, observability, etc.) |
| Pathway | `pathway/` | BUILD, LEARN, USE, REPO-FAMILY |
| Specs | `specs/` | UHOME-v1.5, JOTION surface spec |
| Surfaces | `surfaces/` | JOTION integration |
| Deployment | `DEPLOYMENT-UHOMENEST.md` | uHomeNest deployment guide |
| Deployment | `DEPLOYMENT-UHOME-SERVER.md` | uHOME Server deployment guide |
| Other | `getting-started.md`, `activation.md`, `boundary.md`, etc. | Various reference docs |

---

## uCode4 (Spatial/3D Layer)

**Path:** `~/Code/uCode4/docs/`

| File | Description |
|------|-------------|
| `README.md` | Entry point, L100–899 grid layer map, slot architecture |
| `LAYER_MAP.md` | Full L100–899 grid layer spec |
| `UCODE3_CONSOLE_LAYBACK.md` | Layback computing concept |
| `UCODE3_HOMEKIT_BRIDGE.md` | HomeKit bridge reference |
| `specs/WIREFRAME_SPEC.md` | Wireframe specification |
| `themes/` | Wireframe theme docs |

---

## Quick Reference — Finding Docs by Topic

| Topic | Where to Look |
|-------|---------------|
| Ecosystem overview | `uConnect/docs/shared/ECOSYSTEM_MAP.md` |
| Architecture (Python/Rust) | `uConnect/uDos-docs/CORE_ARCHITECTURE.md` |
| MCP Protocol | `uConnect/docs/shared/SPECIFICATIONS.md` |
| MCP Gateway | `uCode2/docs/MCP-GATEWAY.md` |
| Vault system | `uCode2/docs/VAULT-BRIDGE.md` |
| USX/UDO specs | `uCode1/docs/specs/usx/` and `uCode1/docs/specs/udo/` |
| OBF specs | `uConnect/uDos-docs/specs/` |
| HomeNest deployment | `uCode3/docs/DEPLOYMENT-UHOMENEST.md` |
| uHOME Server | `uCode3/docs/DEPLOYMENT-UHOME-SERVER.md` |
| uCode1 CLI | `uCode1/docs/CLI_COMMANDS.md` |
| uCode2 CLI | `uCode2/docs/API-REFERENCE.md` |
| Educational content | `uConnect/docs/shared/educational-content/` |
| Roadmap | `uConnect/uDos-docs/ROADMAP.md` |
| Documentation policy | `uConnect/uDos-docs/documentation-policy.md` |

---

*Last Updated: 2026-05-20*
