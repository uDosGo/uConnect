# uDos User Guide

Welcome to uDos — a unified development operating system. This guide covers
everything you need to use the uCode1 Python core, its CLI tools, and
integrated systems.

---

## Quick Start

```bash
# Activate the environment
cd ~/Code/uDosGo
source .venv/bin/activate

# See all available commands
cd uCode1 && python3 ucode --help

# Check version
python3 ucode --version
```

---

## CLI Command Reference

### `ucode ok` — Local AI Assistant
```bash
ucode ok "What is the vault?"
```

### `ucode narrator` — Story Generation
Generates narrative text from system events using the Wizard/Dungeon metaphor.
```bash
# Generate a story for an event type
ucode narrator story vault_init --title "/my/vault"
ucode narrator story note_create --title "Meeting Notes"
ucode narrator story snack_run --title "greet" --detail "completed"

# Output formats
ucode narrator story vault_init --format text
ucode narrator story vault_init --format markdown
ucode narrator story vault_init --format ceefax

# Process a feed file
ucode narrator feed events.jsonl --format markdown
ucode narrator feed events.jsonl --format json

# Convert story to markdown
ucode narrator to-md story.json -o story.md
```

### `ucode lexicon` — Term Mapping
Maps terms across Dev / Story / Student lanes.
```bash
# List all terms
ucode lexicon list
ucode lexicon list --lane story
ucode lexicon list --tag core

# Search
ucode lexicon search vault

# Translate a term into a lane
ucode lexicon translate vault --lane story
```

### `ucode character` — Character System
128-slot character system with ANSI set, emoji overlays, and word aliases.
```bash
# List assigned slots
ucode character list
ucode character list --range command

# Show slot details with all renderings
ucode character show 0

# Render a line of slots
ucode character render 0-4,32-34 --priority emoji
ucode character render 0-4,32-34 --priority ansi

# Assign lexicon term to a slot
ucode character assign 10 --term skill

# Set word alias or emoji
ucode character alias 32 spell
ucode character emoji 0 🆕
```

### `ucode snack` — Snack Management
Executable containers (scripts, commands, automations).
```bash
# List snacks
ucode snack list

# Create a new snack
ucode snack create mysnack.yaml

# Validate a snack definition
ucode snack validate mysnack.yaml

# Run a snack
ucode snack run mysnack.yaml --input NAME=uDos
```

### `ucode binder` — Binder Management
Structured data containers with hierarchy and state management.
```bash
ucode binder create mybinder
ucode binder extract mybinder
ucode binder tree mybinder
```

### `ucode relic` — Relic Management
Binary executable units with integrity verification.
```bash
ucode relic list
ucode relic create myrelic
ucode relic validate myrelic
```

### `ucode usxd` — USXD Document Management
Portable structured exchange format for grid data.
```bash
# List, create, show documents
ucode usxd list
ucode usxd show mydoc
ucode usxd create mydoc --title "My Grid"

# Parse and render grids
ucode usxd parse --text "┌───┐\n│ A │\n└───┘"
ucode usxd render mygrid.txt

# Export to other formats
ucode usxd export mydoc --format yaml

# Cell mapping (archive sections as Cells)
ucode usxd cell archive mydoc
ucode usxd cell restore mydoc
ucode usxd cell link mydoc
ucode usxd cell show mydoc
```

### `ucode grid` — ASCII Grid Operations
Parse, render, and edit ASCII grids.
```bash
# Parse grid text
ucode grid parse --text "┌───┬───┐\n│ A │ B │\n└───┴───┘"
ucode grid parse --file mygrid.txt --title "My Grid"

# Render to terminal
ucode grid render mygrid.txt

# Visual editing with Monodraw
ucode grid edit mygrid.txt
ucode grid monodraw import mygrid.monopic
ucode grid monodraw export mygrid.txt
ucode grid monodraw install

# Convert to USXD document
ucode grid to-usxd mygrid.txt -o mygrid.usxd.json
```

### `ucode thinui` — ThinUI Bridge
Bridge between Python core and the React frontend.
```bash
# Start the API server (required by Grid Viewer surface)
ucode thinui api --port 8001

# Parse grid to ThinUI format
ucode thinui parse mygrid.txt --title "My Grid"

# Render grid via the bridge
ucode thinui render --file mygrid.txt
```

### `ucode mdx` — MDX Document Processing
Process MDX files with `<Snack>` shortcode execution.
```bash
# List shortcodes found in a file
ucode mdx list doc.mdx --snack-dir ./snacks

# Process shortcodes (resolve & execute snacks)
ucode mdx process doc.mdx --snack-dir ./snacks
ucode mdx render doc.mdx --snack-dir ./snacks -o output.md
```

### `ucode cell` — Cell Storage
UDX-addressed atomic storage units.
```bash
# CRUD operations
ucode cell write L100-AA00-0000-0 --key name --value "Hello"
ucode cell read L100-AA00-0000-0
ucode cell delete L100-AA00-0000-0

# List and count
ucode cell list
ucode cell list --band 100
ucode cell count --band 100

# Purge an entire band
ucode cell purge 100

# Cube (SnackBox packaging)
ucode cell cube create mypack --cell L100-AA00-0000-0
ucode cell cube show mypack.cube.json
ucode cell cube add mypack.cube.json L100-BB01-1001-0
```

### `ucode feed` — Feed Event Archiving
Archive feed events as Cells for searchable storage.
```bash
# Archive a JSONL feed file
ucode feed archive events.jsonl

# Search archived events
ucode feed list
ucode feed list --type note_create

# Generate archive report
ucode feed report
```

### `ucode vault` — Vault Operations
File operations on the uDos vault (`~/Code/Vault/`).
```bash
ucode vault list /
ucode vault read /notes/meeting.md
ucode vault write /notes/test.md "Hello"
ucode vault search "keyword"
```

### `ucode plugin` — Plugin Management
```bash
ucode plugin list
ucode plugin enable myplugin
ucode plugin disable myplugin
```

---

## Common Workflows

### Workflow: Create a Grid, Edit Visually, Export

```bash
# 1. Create an ASCII grid
cat > mygrid.txt << 'EOF'
┌─────┬─────┐
│ A   │ B   │
├─────┼─────┤
│ C   │ D   │
└─────┴─────┘
EOF

# 2. Parse and verify
ucode grid parse --file mygrid.txt --title "My Grid"

# 3. Edit visually in Monodraw
ucode grid edit mygrid.txt

# 4. Export as USXD document
ucode grid to-usxd mygrid.txt -o mygrid.usxd.json

# 5. Archive as Cells
ucode usxd cell archive mygrid.usxd.json
```

### Workflow: Process Events into Stories

```bash
# 1. Create a feed file
cat > events.jsonl << 'EOF'
{"type":"note_create","title":"Meeting","detail":"Discussed Q2"}
{"type":"snack_run","title":"deploy","status":"completed","detail":"Deployed v2.0"}
EOF

# 2. Generate stories
ucode narrator feed events.jsonl --format markdown

# 3. Archive feed as Cells
ucode feed archive events.jsonl

# 4. Search and report
ucode feed list --type note_create
ucode feed report
```

### Workflow: MDX with Snack Shortcodes

```bash
# 1. Create a snack definition
mkdir -p snacks
cat > snacks/greet.snack << 'EOF'
{"id":"greet","name":"Greeting","version":"1.0.0",
 "runtime":"bash","code":"echo Hello, $NAME!",
 "inputs":[{"name":"NAME","type":"string","default":"World"}]}
EOF

# 2. Create an MDX file
cat > doc.mdx << 'MDX'
# My Document
Hello from <Snack id="greet" inputs='{"NAME":"uDos"}'>
MDX

# 3. Process it
ucode mdx process doc.mdx --snack-dir ./snacks
cat doc.md
```

---

## Environment & Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `VAULT_PATH` | `~/Code/Vault` | Vault data directory |
| `UDOS_DEBUG` | `false` | Enable debug output |
| `CELL_STORE` | `.state/cells` | Cell storage directory |

Configuration via `~/Code/Projects/uDos/config/config.yaml`:
```yaml
lechat:
  api_key: "your-key"
  api_url: "https://api.lechat.pro"
  enabled: true
udos:
  debug_mode: false
  log_level: "info"
  memory_path: "~/Code/uDosGo/memory"
```
