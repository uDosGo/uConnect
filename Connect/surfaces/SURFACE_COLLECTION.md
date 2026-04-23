# USXD Surface Collection

A comprehensive collection of USXD surfaces for testing and improving the USXD > HTML rendering process.

## Surface Index

### Basic Surfaces
1. **minimal.md** - Minimal surface with basic elements
2. **demo-surface.md** - Basic demonstration surface
3. **teletext.md** - Retro teletext console style

### Application Surfaces
4. **dashboard.md** - Complex multi-region dashboard
5. **terminal.md** - Terminal emulator interface
6. **editor.md** - Code editor with syntax regions
7. **monitor.md** - System monitoring interface
8. **game.md** - Game console with interactive controls

### Advanced Testing Surfaces
9. **ascii-art.md** - Complex ASCII art with precise alignment
10. **matrix.md** - Matrix digital rain effect simulation
11. **complex-grid.md** - Advanced multi-panel grid layout

## Testing Scenarios

### Grid Complexity
- **Simple**: minimal (5x3), demo-surface (12x6)
- **Medium**: terminal (15x8), editor (25x12)
- **Complex**: dashboard (20x10), monitor (22x14)
- **Advanced**: ascii-art (30x15), matrix (40x20), complex-grid (24x12)

### Grid Modes
- `terminal` - Monospace terminal styling
- `teletext` - Retro teletext block characters
- `game` - Game interface with pixel art
- `ascii` - Precise ASCII art alignment
- `matrix` - Digital rain effect
- `complex` - Multi-panel layouts

### Styling Variations
- **Color Schemes**: Green-on-black, blue-on-dark, yellow-on-black, etc.
- **Typography**: Monospace, system-ui, retro fonts
- **Borders**: Various border styles and colors
- **Backgrounds**: Different background colors and opacity

### Region Complexity
- **Simple**: 3 regions (minimal)
- **Medium**: 5-7 regions (terminal, editor)
- **Complex**: 8+ regions (dashboard, monitor, complex-grid)

### Control Mappings
- **Basic**: esc, arrow keys
- **Function Keys**: F1-F5
- **Modifiers**: ctrl+combinations
- **Special**: space, enter, +/-

## Usage

### Start GUI
```bash
udo gui
```

### Test Individual Surface
```bash
# Replace <name> with surface name
curl http://localhost:4312/surface/<name>
```

### Validate All Surfaces
```bash
curl http://localhost:4312
```

## Development Notes

### Surface Creation Guidelines
1. Use `.md` files in `~/vault/surfaces/`
2. Include USXD code fence with metadata
3. Define STYLE, REGIONS, and CONTROLS sections
4. Include grid layout with ASCII art
5. Test with different grid modes

### USXD Code Fence Format
````markdown
```usxd
SURFACE name="your-surface" version="x.x.x"

STYLE
background: "#hexcolor"
color: "#hexcolor"
typography: "font-stack"

REGIONS
region1: "Description"
region2: "Description"

CONTROLS
key: action
key2: action2
```

```grid size="wxh" mode="mode"
[ASCII grid layout]
```
````

### Grid Mode Testing
Test different `mode` attributes:
- `terminal` - Monospace terminal
- `teletext` - Block characters
- `game` - Pixel art
- `ascii` - Precise alignment
- `matrix` - Digital effects
- `complex` - Multi-panel

## Rendering Test Cases

### Test Case 1: Minimal Surface
- **File**: minimal.md
- **Purpose**: Test core rendering without complexity
- **Expected**: Simple header, content, footer with 5x3 grid

### Test Case 2: Complex Grid
- **File**: complex-grid.md
- **Purpose**: Test advanced grid layouts
- **Expected**: Multi-panel layout with proper borders and alignment

### Test Case 3: ASCII Art
- **File**: ascii-art.md
- **Purpose**: Test precise character rendering
- **Expected**: Exact reproduction of ASCII characters with proper spacing

### Test Case 4: Matrix Rain
- **File**: matrix.md
- **Purpose**: Test high-density character grids
- **Expected**: Fast rendering of 40x20 grid with binary patterns

## Performance Testing

### Load Testing
```bash
# Test with multiple surfaces open
for i in {1..100}; do
  curl -s http://localhost:4312/surface/dashboard > /dev/null
  echo "Request $i: $(date)"
done
```

### Render Time Measurement
```bash
time curl -s http://localhost:4312/surface/complex-grid > /dev/null
```

## Improvement Areas

### CSS Enhancements
- [ ] Theme integration with active USXD theme
- [ ] Responsive grid layouts
- [ ] Animation support for dynamic surfaces
- [ ] Custom font loading

### Grid Rendering
- [ ] Optimize large grid performance
- [ ] Support for grid cell content
- [ ] Dynamic grid resizing
- [ ] Nested grid layouts

### Interactive Features
- [ ] Control key event handling
- [ ] Region focus management
- [ ] Live data updates
- [ ] WebSocket integration

## Surface Matrix

| Surface | Grid Size | Regions | Controls | Mode |
|---------|-----------|---------|----------|------|
| minimal | 5x3 | 3 | 1 | default |
| demo-surface | 12x6 | 3 | 3 | default |
| teletext | 8x4 | 4 | 6 | teletext |
| dashboard | 20x10 | 5 | 6 | default |
| terminal | 15x8 | 4 | 8 | terminal |
| editor | 25x12 | 5 | 8 | default |
| monitor | 22x14 | 7 | 7 | default |
| game | 20x12 | 6 | 10 | game |
| ascii-art | 30x15 | 5 | 8 | ascii |
| matrix | 40x20 | 4 | 8 | matrix |
| complex-grid | 24x12 | 8 | 6 | complex |

## Version History

- **v1.0** (2026-04-18): Initial surface collection
- **v1.1** (2026-04-18): Added advanced testing surfaces
- **v1.2** (2026-04-18): Added performance testing notes

## License

MIT License - Free for use in USXD development and testing.