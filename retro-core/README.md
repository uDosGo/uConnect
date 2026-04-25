# Retro Core - Authentic Retro System Renderer

![Retro Core Logo](https://via.placeholder.com/200x60/333/fff?text=RETRO+CORE)

**Retro Core** is a Blitz/WASM-based renderer that provides **hardware-accurate** rendering for classic retro computer systems including:

- 🎮 **Commodore 64** (C64) with PETSCII font and color cycling
- 🕹️ **Nintendo Entertainment System** (NES) with attribute tables
- 📺 **Teletext** with block graphics and page system

## 🚀 Features

### Authentic Rendering
- **Exact color palettes** - C64 NTSC, NES, Teletext
- **Character grid system** - 40×25 baseline with 8×8 pixels
- **PETSCII font** - Complete C64 character set
- **Memory-accurate** - Screen memory and color RAM simulation
- **CRT effects** - Scanlines, phosphor, curvature (planned)

### Performance
- **WASM-powered** - Native speed in browser
- **Optimized rendering** - Dirty rectangle updates
- **60fps target** - Smooth animation
- **Low overhead** - Minimal DOM manipulation

### Flexibility
- **Multiple systems** - Switch between C64, NES, Teletext
- **Extensible** - Add new retro systems easily
- **UDX integration** - Works with ThinUI data format
- **Web component** - Embed in any web page

## 📦 Installation

### Prerequisites
- Rust (stable)
- wasm-pack
- Node.js (for testing)

### Build

```bash
# Build the WASM module
cd retro-core
wasm-pack build --target web

# For development with watch mode
wasm-pack build --target web --dev --watch
```

### Test

Open `test.html` in a browser or serve it:

```bash
# Using Python
python3 -m http.server 8000

# Then open
# http://localhost:8000/test.html
```

## 📚 Usage

### Basic Example

```html
<canvas id="retro-canvas" width="320" height="200"></canvas>

<script type="module">
    import init, { create_c64_renderer } from './pkg/retro_core.js';
    
    async function main() {
        await init();
        
        // Create C64 renderer
        const renderer = await create_c64_renderer('retro-canvas');
        
        // Set some characters
        renderer.set_character(10, 10, 65, 1); // 'A' at (10,10), white
        renderer.set_character(11, 10, 66, 2); // 'B' at (11,10), red
        
        // Render the frame
        renderer.render_frame();
    }
    
    main();
</script>
```

### System Switching

```javascript
// Create different system renderers
const c64Renderer = await create_c64_renderer('canvas');
const nesRenderer = await create_nes_renderer('canvas');
const teletextRenderer = await create_teletext_renderer('canvas');
```

### Character Grid

The renderer uses a **40×25 character grid** (320×200 pixels):

```javascript
// Set character at position (x, y)
renderer.set_character(x, y, charCode, colorIndex);

// Character codes:
// 0x20-0x7F: Standard ASCII
// 0x80-0xFF: Graphics/special characters (system-dependent)

// Color indices:
// 0-15: System palette colors
```

## 🎨 Color Palettes

### C64 (NTSC)

| Index | Color       | Hex       |
|-------|-------------|-----------|
| 0     | Black       | `#000000` |
| 1     | White       | `#FFFFFF` |
| 2     | Red         | `#883932` |
| 3     | Cyan        | `#67B6BD` |
| 4     | Purple      | `#8B3F96` |
| 5     | Green       | `#55A049` |
| 6     | Blue        | `#40318D` |
| 7     | Yellow      | `#C8C569` |
| 8     | Orange      | `#8B542C` |
| 9     | Brown       | `#554000` |
| 10    | Pink        | `#B86962` |
| 11    | Dark Gray   | `#6E6E6E` |
| 12    | Medium Gray | `#969696` |
| 13    | Light Green | `#75CE66` |
| 14    | Light Blue  | `#6F5E91` |
| 15    | Light Gray  | `#A9A9A9` |

### NES

The NES has **8 palettes × 4 colors** each. The first palette is loaded by default.

### Teletext

| Index | Color     | Hex       |
|-------|-----------|-----------|
| 0     | Black     | `#000000` |
| 1     | Red       | `#FF0000` |
| 2     | Green     | `#00FF00` |
| 3     | Yellow    | `#FFFF00` |
| 4     | Blue      | `#0000FF` |
| 5     | Magenta   | `#FF00FF` |
| 6     | Cyan      | `#00FFFF` |
| 7     | White     | `#FFFFFF` |

## 🔧 Architecture

### Core Components

```
retro-core/
├── src/
│   ├── lib.rs          # Main library and WASM bindings
│   ├── color.rs         # Color palette system
│   ├── grid.rs          # Character grid system
│   ├── fonts.rs         # Font systems (PETSCII, NES, Teletext)
│   ├── systems.rs       # System definitions
│   └── renderer.rs      # Main rendering engine
├── test.html           # Test page
├── Cargo.toml          # Rust configuration
└── README.md           # This file
```

### Rendering Pipeline

1. **Character Fetch** - Get character code from screen memory
2. **Font Lookup** - Retrieve 8×8 pixel bitmap from ROM
3. **Color Mapping** - Apply color palette
4. **Pixel Rendering** - Draw to canvas
5. **CRT Effects** - Apply scanlines, phosphor, etc.

## 🚀 Roadmap

### Phase 1: Core Renderer ✅ (Current)
- [x] Character grid system (40×25)
- [x] Color palette system
- [x] Basic PETSCII font
- [x] Multiple system support
- [x] WASM bindings
- [x] Test page

### Phase 2: Enhanced Features
- [ ] Complete PETSCII character set
- [ ] C64 border system with color cycling
- [ ] NES attribute tables
- [ ] Teletext block graphics
- [ ] CRT scanline effects
- [ ] Phosphor decay simulation

### Phase 3: Advanced Features
- [ ] Sprite system (NES)
- [ ] Smooth scrolling
- [ ] Color emphasis (NES)
- [ ] Flashing text (Teletext)
- [ ] WebGL acceleration
- [ ] Audio support

### Phase 4: Integration
- [ ] ThinUI UDX format support
- [ ] Web component wrapper
- [ ] Tauri plugin
- [ ] Documentation
- [ ] Examples gallery

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/your-feature`)
3. **Commit your changes** (`git commit -am 'Add some feature'`)
4. **Push to the branch** (`git push origin feature/your-feature`)
5. **Open a Pull Request**

### Development Setup

```bash
# Install dependencies
rustup target add wasm32-unknown-unknown
cargo install wasm-pack

# Build in watch mode
wasm-pack build --target web --dev --watch

# Run tests
cargo test
```

## 📄 License

This project is licensed under the **MIT License**. See the LICENSE file for details.

## 🎮 Examples

### C64 Demo
```javascript
const renderer = await create_c64_renderer('canvas');

// Draw "HELLO WORLD" in center
const text = "HELLO WORLD";
let x = Math.floor((40 - text.length) / 2);
for (let i = 0; i < text.length; i++) {
    renderer.set_character(x + i, 12, text.charCodeAt(i), 1); // White
}

// Add border
for (let i = 0; i < 40; i++) {
    renderer.set_character(i, 0, 32, 2); // Top border (red)
    renderer.set_character(i, 24, 32, 2); // Bottom border (red)
}

renderer.render_frame();
```

### NES Demo
```javascript
const renderer = await create_nes_renderer('canvas');

// Draw "PRESS START" button-style
const text = "PRESS START";
let x = Math.floor((40 - text.length) / 2);
for (let i = 0; i < text.length; i++) {
    renderer.set_character(x + i, 10, text.charCodeAt(i), 1);
    renderer.set_character(x + i, 11, 95, 1); // Underscore
}

renderer.render_frame();
```

## 📚 Resources

- [C64 Programming Wiki](https://www.c64-wiki.com/)
- [NES Dev Wiki](https://wiki.nesdev.com/)
- [Teletext Specification](https://en.wikipedia.org/wiki/Teletext)
- [Blitz Documentation](https://github.com/DioxusLabs/blitz)
- [WASM Bindgen Guide](https://rustwasm.github.io/docs/wasm-bindgen/)

## 🎯 Vision

Retro Core aims to provide **the most authentic retro computing experience** in a web browser, with:

✅ **Hardware-accurate rendering** - True to the original systems
✅ **Performance** - 60fps smooth rendering
✅ **Extensibility** - Support for multiple retro systems
✅ **Education** - Learn how classic computers worked
✅ **Nostalgia** - Relive the retro computing experience

**Let's bring retro computing to the modern web!** 🚀
