# uDos Lexicon

This document maps the terminology used across the three lanes of uDos education:

- **Dev Lane**: Technical terms used in code and documentation
- **Public Story**: Narrative terms used in the Wizard/Dungeon metaphor
- **Student Lane**: Practical terms used in tutorials

## Core Concepts

### Vault

| Lane | Term | Meaning | Technical Implementation |
|------|------|---------|--------------------------|
| Dev | Vault | Core data storage structure | Filesystem directory with special structure |
| Story | Dungeon of Knowledge | Magical chamber where wisdom is stored | Obsidian-walled room with glowing parchments |
| Student | Digital notebook | Your personal knowledge base | Folder containing markdown files with frontmatter |

### Notes

| Lane | Term | Meaning | Technical Implementation |
|------|------|---------|--------------------------|
| Dev | Note | Markdown document with frontmatter | `.md` file with YAML header |
| Story | Parchment | Magical scroll containing knowledge | Glowing parchment on obsidian shelves |
| Student | Piece of knowledge | Individual idea or information | Markdown file you can edit |

### Tags

| Lane | Term | Meaning | Technical Implementation |
|------|------|---------|--------------------------|
| Dev | Tag | Metadata category | Array in YAML frontmatter |
| Story | Hue/Color | Magical glow identifying parchment type | Different colored auras on scrolls |
| Student | Category/Label | Way to organize notes | Hashtag-like identifiers |

### Links

| Lane | Term | Meaning | Technical Implementation |
|------|------|---------|--------------------------|
| Dev | Link | Bidirectional reference | `[[note-title]]` syntax in markdown |
| Story | Invisible thread | Magical connection between parchments | Glowing threads in the constellation |
| Student | Connection | Way to relate notes | Clickable links between files |

## Commands

### Vault Initialization

| Lane | Command | Meaning | Example |
|------|---------|---------|---------|
| Dev | `udos vault init` | Create new vault structure | `udos vault init ~/my-vault` |
| Story | First Incantation | Open the Dungeon of Knowledge | Sacred words to the stone door |
| Student | Create notebook | Set up your knowledge base | `udos vault init ~/my-first-vault` |

### Note Creation

| Lane | Command | Meaning | Example |
|------|---------|---------|---------|
| Dev | `udos note create` | Create new markdown note | `udos note create "Title" --tag category` |
| Story | Carve a Rune | Inscribe knowledge on parchment | Tracing fingers over the pedestal |
| Student | Add knowledge | Create a new note | `udos note create "Dragon encounter" --tag quest` |

### Listing Notes

| Lane | Command | Meaning | Example |
|------|---------|---------|---------|
| Dev | `udos note list` | List all notes in vault | `udos note list --tag quest` |
| Story | Oracle's Whisper | Hear what's in your chamber | Soft voice echoing through the chamber |
| Student | See your notes | List all your knowledge | `udos note list` |

## Advanced Concepts

### Tasks (Coming Week 2)

| Lane | Term | Meaning | Technical Implementation |
|------|------|---------|--------------------------|
| Dev | Task | Action item with checkbox | `- [ ]` or `- [x]` in markdown |
| Story | Quest | Adventure to be completed | Quest Log entry with status |
| Student | To-do item | Something to accomplish | Checkbox in your notes |

### Spatial Mapping (Coming Week 3)

| Lane | Term | Meaning | Technical Implementation |
|------|------|---------|--------------------------|
| Dev | Spatial Index | 2D coordinate system | Grid-based indexing |
| Story | Map of the Realms | Parchment showing locations | Pinning treasures to coordinates |
| Student | Location tracking | Where things are | Mapping your physical or digital space |

### Feed Spool (Coming Week 4)

| Lane | Term | Meaning | Technical Implementation |
|------|------|---------|--------------------------|
| Dev | Feed | Activity log | Append-only JSONL file |
| Story | Scroll of Chronicles | Record of all actions | Endless parchment with runes |
| Student | Activity history | What you've done | Timeline of your work |

## Metaphors & Themes

### uCode1: Nethack/D&D Theme

- **Dungeon of Knowledge**: Your vault where wisdom is stored
- **Oracle**: The intelligent assistant that helps you find information
- **Parchments**: Individual notes and documents
- **Quests**: Tasks and to-do items
- **Map of the Realms**: Spatial organization of your knowledge
- **Scroll of Chronicles**: Activity log and history

### uCode2: Classic Literature Theme (Future)

- **Library of Alexandria**: Your comprehensive knowledge base
- **Muse**: Creative writing assistant
- **Tomes**: Detailed documents and books
- **Sonnet**: Poetic expressions and creative writing
- **Atlas**: Comprehensive world mapping

### uCode3: Space/Elite Theme (Future)

- **Galactic Encyclopedia**: Your universal knowledge repository
- **Copilot**: AI navigation assistant
- **Star Charts**: Advanced spatial-temporal mapping
- **Warp Drive**: Instant knowledge retrieval
- **Hyperspace**: Real-time collaboration

### uCode4: Interdimensional Theme (Future)

- **Omniverse**: Multidimensional knowledge space
- **Oracle Trinity**: Three AI assistants working together
- **Portals**: Connections between different knowledge realms
- **Time Stream**: Temporal knowledge navigation
- **Reality Weaver**: Generative knowledge creation

## Evolution Path

The lexicon grows with each release as new features are added. Each week introduces new terms that are added to this document, ensuring consistency across all three educational lanes.