# uDos API Reference

Complete API reference for the uCode1 Python core modules.

---

## `core_py.snack` — Snack System

```python
from core_py.snack import (
    Snack, SnackInput, SnackOutput,
    SnackEngine, execute_snack,
    SnackLexicon, SnackVisuals, SnackChain, SnackResource,
    validate_snack, validate_snack_file, validate_snack_resources,
    DependencyResolver, resolve_snack_dependencies,
    SnackExecutionError, CircularDependencyError,
)
```

### Snack
```python
Snack(id, name, version, runtime="bash", code="",
      inputs=[], outputs=[], requires=[],
      emoji=None, glyph=None, ascii=None, kind="script",
      lexicon=None, visuals=None, chain=None, resources=None, tags=[])
Snack.create(id, name, version, code)  # Factory method
snack.to_dict()                         # → dict
Snack.from_dict(data)                   # ← dict
```

### SnackEngine
```python
engine = SnackEngine(working_dir=None)
engine.execute(snack, inputs=None)  # → {"exit_code":0, "stdout":"...", "stderr":"...", "outputs":{...}}
```

---

## `core_py.relic` — Relic System

```python
from core_py.relic import Relic, RelicMetadata, RelicResource, RelicBinaryFormat, RelicRegistry

Relic(metadata, main_code, resources=[])
relic.calculate_checksum()  # → str SHA256
relic.verify_integrity()    # → bool
relic.add_resource(name, data, resource_type="file")
```

---

## `core_py.binder` — Binder System

```python
from core_py.binder import Binder, BinderMetadata, BinderEntry, BinderResource, BinderRegistry

Binder(metadata, root)
binder.calculate_checksum()
binder.verify_integrity()

BinderMetadata(id, name, version)
BinderEntry(id, name, entry_type, value=None, resources=[], children=[])
BinderResource(id, name, resource_type, data=None, path=None)
```

---

## `core_py.usxd` — USXD Document System

```python
from core_py.usxd import (
    USXDDocument, USXDMetadata, USXDSection, USXDRegistry, USXDFormat,
    ASCIIGridParser, ParsedGrid, GridCell, GridComponent, GridFormat,
    add_cell_references_to_doc, restore_sections_from_cells, link_doc_to_cell_address,
)
```

### Grid Parser
```python
parser = ASCIIGridParser()
parsed = parser.parse_grid(text, title="Untitled")  # → ParsedGrid
parsed.rows, parsed.cols, parsed.grid, parsed.components
parsed.to_ascii()      # → str
parsed.to_dict()       # → dict
parsed.get_cell(r, c)  # → GridCell | None
```

### Cell Mapping
```python
section_to_cell(section, doc_id, store)            # → Cell
cell_to_section(cell)                               # → USXDSection
archive_document_sections(doc, store)               # → {section_id: cell_addr}
restore_sections_from_cells(refs, store)            # → [USXDSection]
link_doc_to_cell_address(doc, store)                # → str address
```

---

## `core_py.grid` — Grid Core

```python
from core_py.grid import (
    Grid, GridCell, GridRegion, GridSize, Coordinate, CoordSystem,
    slice_grid, rotate_grid, flip_grid, merge_grids,
    get_neighbors, get_neighbors_4way, get_neighbors_8way,
    find_path, find_shortest_path,
    GridLayer, GridStack,
    monodraw_available, monopic_to_ascii, export_grid_to_monopic,
    open_in_monodraw, edit_grid_interactive,
)
```

---

## `core_py.cell` — Cell System

```python
from core_py.cell import Cell, CellAddress, CellStore, Cube

# Addressing
CellAddress.parse("L100-AA00-0000-0")  # → CellAddress | None
str(addr)                                # → "L100-AA00-0000-0"

# Cell
Cell(address, data={})
cell.verify()            # → bool
cell.to_dict()           # → dict
Cell.from_dict(d)        # ← dict

# Store
store = CellStore(root_dir=".state/cells")
store.write(cell)
store.read("L100-AA00-0000-0")  # → Cell | None
store.delete("L100-AA00-0000-0") # → bool
store.list_cells(band=100)       # → [CellAddress]
store.count(band=100)            # → int
store.purge_band(100)            # → int

# Cube
Cube(id, cells=[])
cube.add(cell)
cube.remove("L100-AA00-0000-0")
cube.get("L100-AA00-0000-0")  # → Cell | None
cube.to_dict()                 # → dict
Cube.from_dict(d)              # ← dict
```

---

## `core_py.mdx` — MDX Runtime

```python
from core_py.mdx import MDXProcessor, SnackResolutionError

processor = MDXProcessor(snack_registry={}, snack_dir=None)
processor.register_snack(snack)
processor.register_snacks([snack])
processor.resolve_snack("greet")       # → Snack
processor.process("<Snack id='greet'>") # → str (with output)
processor.process_file("doc.mdx")      # → str
processor.list_registered()            # → [{id, name, runtime, ...}]
```

---

## `core_py.feed` — Feed Archiver

```python
from core_py.feed import archive_feed_file, archive_feed_entries, search_feed_cells, generate_feed_report

archive_feed_file("events.jsonl", store)        # → (count, [addresses])
archive_feed_entries([{...}], store)            # → (count, [addresses])
search_feed_cells(store, event_type="note")     # → [{...}]
generate_feed_report(store)                     # → {total_cells, event_types, ...}
```

---

## `core_py.thinui` — ThinUI Bridge

```python
from core_py.thinui import ThinUIGridBridge, ThinUIGridData

bridge = ThinUIGridBridge()
bridge.parse_to_thinui(text, title="Grid")  # → ThinUIGridData
bridge.parsed_grid_to_thinui(parsed)         # → ThinUIGridData
bridge.map_to_thinui(parsed)                 # → ThinUIGridData

# API server (Flask)
from core_py.thinui.api import create_api_server, run_api_server
run_api_server(host="127.0.0.1", port=8001)

### Component Mapper
```python
from core_py.thinui.component_mapper import ComponentMapper, ComponentMapping

mapper = ComponentMapper()
mapper.parse_grid(parsed)  # → List[ComponentMapping]
mapper.add_mapping(grid_component_id, thinui_type, properties)
```

### Grid Renderer
```python
from core_py.thinui.grid_renderer import GridRenderer

renderer = GridRenderer()
renderer.render_simple(parsed)                    # ANSI terminal output
renderer.render_curses(stdscr, parsed, config)    # curses-based TUI
```

---

## `narrator` — Narrator, Lexicon, Character System

```python
from narrator import NarratorEngine, Lexicon, CharacterSystem

# Narrator
narrator = NarratorEngine()
narrator.vault_init("/path")                           # → str
narrator.note_create("Title", tags=["core"])            # → str
narrator.snack_run("greet", "completed")                # → str
narrator.generate_story("vault_init", title="/vault")   # → dict
narrator.story_to_markdown(story)                       # → str
narrator.process_feed_file("events.jsonl")              # → [dict]

# Lexicon
lex = Lexicon()
lex.get("vault")                       # → LexiconEntry | None
lex.translate("vault", "story")        # → str
lex.search("vault")                    # → [LexiconEntry]
lex.add(LexiconEntry(term_id="...", dev="...", story="...", student="..."))
lex.list_terms(tag="core")             # → [LexiconEntry]
lex.to_dict()                          # → dict

# Character System
cs = CharacterSystem()
cs.get(0)                              # → SlotEntry | None
cs.get_by_term("vault")                # → SlotEntry | None
cs.render_line([0,1,2], "emoji")       # → str
cs.render_grid([[0,1],[32,33]], "ansi")# → str
cs.assign(SlotEntry(slot=10, term_id="custom", label="Custom"))
cs.assign_alias(32, "spell")
cs.assign_emoji(0, "🆕")
cs.list_slots(range_name="command")    # → [SlotEntry]
```

## Python CLI Entry Points

All CLI modules follow this pattern:

```python
def main():
    """Entry point called by ucode dispatcher."""
    parser = build_arg_parser()
    args = parser.parse_args()
    ...

if __name__ == "__main__":
    main()
```

| Module | Entry Point | Commands |
|--------|-------------|----------|
| `ucode` | `main()` | Dispatches to all sub-CLIs |
| `snack_cli.py` | `main()` | `list, show, create, validate, run, test` |
| `binder_cli.py` | `main()` | `create, validate, extract, tree` |
| `relic_cli.py` | `main()` | `create, validate, pack, unpack` |
| `usxd_cli.py` | `main()` | `list, show, create, validate, parse, render, map, export, import, grid, cell` |
| `grid_cli.py` | `main()` | `parse, render, interactive, to-usxd, edit, monodraw` |
| `thinui_cli.py` | `main()` | `parse, render, themes, api` |
| `mdx_cli.py` | `main()` | `process, render, list` |
| `cell_cli.py` | `main()` | `write, read, delete, list, count, purge, cube` |
| `feed_cli.py` | `main()` | `archive, list, report` |
| `vault_cli.py` | `main()` | `list, read, write, search` |
| `plugin_cli.py` | `main()` | `list, enable, disable` |
| `ucode_cli.py` | `main()` | Legacy entry point (delegates to ucode) |

## HTTP API Endpoints

The ThinUI Flask API server runs on `http://127.0.0.1:<port>`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/thinui/health` | Health check → `{"status":"ok"}` |
| POST | `/api/thinui/parse` | Parse ASCII grid → `ThinUIGridData` |
| POST | `/api/thinui/render` | Render grid data |
| POST | `/api/thinui/map` | Map grid components to ThinUI |
| POST | `/api/thinui/tree` | Generate component tree |
| POST | `/api/thinui/layout` | Generate layout |
| GET | `/api/thinui/projects` | List projects |
| POST | `/api/thinui/project` | Save project |
