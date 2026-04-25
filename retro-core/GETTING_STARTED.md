# Getting Started with Retro Core

## 🚀 Quick Start (No Server Required!)

### 1. Open the Simple Test
Simply **double-click** on `simple_test.html` - it should work in any modern browser!

```bash
# On macOS/Linux
open simple_test.html

# On Windows
explorer simple_test.html
```

### 2. What You Should See
- A black canvas with colored "A" and "B" characters in a pattern
- A border around the canvas
- Status message showing "Demo rendered successfully"
- The JavaScript fallback will work immediately
- After 1 second, it will try to load WASM (may fail without server)

### 3. If You See a Blank Screen

#### Check the Browser Console (F12)
- Press F12 to open developer tools
- Look for errors in the Console tab
- Common issues:
  - **CORS errors**: Need to serve the page
  - **WASM load errors**: Fallback to JavaScript should work
  - **Canvas errors**: Check if WebGL is enabled

#### Try Serving the Page
```bash
# From the retro-core directory
python3 -m http.server 8000

# Then open:
# http://localhost:8000/simple_test.html
```

## 🛠️ Building the WASM Module

### Prerequisites
1. **Rust** (stable toolchain)
2. **wasm-pack** (WASM build tool)
3. **Node.js** (for package management)

### Install Dependencies

```bash
# Install Rust (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Add WASM target
rustup target add wasm32-unknown-unknown

# Install wasm-pack
cargo install wasm-pack
```

### Build the Project

```bash
# From retro-core directory
cd ~/Code/uDosGo/retro-core

# Build for web (debug mode)
wasm-pack build --target web

# For production (optimized)
wasm-pack build --target web --release
```

### Build Output
- WASM module will be in `pkg/` directory
- `pkg/retro_core.js` - JavaScript bindings
- `pkg/retro_core_bg.wasm` - WebAssembly module

## 🌐 Serving the Test Pages

### Option 1: Python Simple Server (Recommended)

```bash
# From retro-core directory
python3 -m http.server 8000

# Open in browser:
# http://localhost:8000/simple_test.html
# http://localhost:8000/test.html
```

### Option 2: Node.js http-server

```bash
# Install http-server
npm install -g http-server

# Serve the directory
http-server -p 8000

# Open in browser:
# http://localhost:8000/simple_test.html
```

### Option 3: VS Code Live Server
1. Install "Live Server" extension in VS Code
2. Right-click on `simple_test.html`
3. Select "Open with Live Server"

## 🎮 Using the Test Pages

### Simple Test (`simple_test.html`)
- **Purpose**: Basic functionality test
- **Features**:
  - JavaScript fallback (works immediately)
  - WASM attempt after 1 second
  - Simple character grid demo
- **Best for**: Quick verification

### Full Test (`test.html`)
- **Purpose**: Complete system test
- **Features**:
  - System switching (C64/NES/Teletext)
  - Clear screen button
  - Demo pattern generator
- **Requires**: WASM module loaded
- **Best for**: Full functionality test

## 🔧 Troubleshooting

### Common Issues and Solutions

#### Issue: Blank white screen
**Causes & Solutions:**

1. **JavaScript disabled**
   - Enable JavaScript in browser settings
   - Check browser console for errors

2. **WASM failed to load (but JS fallback should work)**
   - Check console for CORS errors
   - Serve the page with `python3 -m http.server 8000`
   - The JS fallback should still show a pattern

3. **Canvas not supported**
   - Use Chrome, Firefox, or Edge
   - Update your browser

4. **File not found**
   - Make sure you're in the right directory
   - Check file permissions

#### Issue: WASM failed to load
**Causes & Solutions:**

1. **CORS policy blocking WASM**
   - Serve the page: `python3 -m http.server 8000`
   - Don't open file directly (use `http://` not `file://`)

2. **WASM module not built**
   - Run: `wasm-pack build --target web`
   - Check that `pkg/` directory exists

3. **Browser doesn't support WASM**
   - Use Chrome, Firefox, Edge, or Safari
   - Update your browser
   - The JS fallback should still work

#### Issue: Port already in use
**Solutions:**

1. **Find and kill the process**
   ```bash
   # Find process on port 8000
   lsof -i :8000
   
   # Kill it (replace PID with actual process ID)
   kill -9 PID
   ```

2. **Use a different port**
   ```bash
   python3 -m http.server 8080
   ```

3. **Let OS choose a port**
   ```bash
   python3 -m http.server 0
   ```

## 📋 Development Workflow

### 1. Make Changes
Edit the Rust files in `src/`:
- `lib.rs` - Main library
- `color.rs` - Color palettes
- `grid.rs` - Character grid
- `fonts.rs` - Font systems

### 2. Build in Watch Mode

```bash
# Watch for changes and rebuild automatically
wasm-pack build --target web --dev --watch
```

### 3. Test in Browser
Open `http://localhost:8000/simple_test.html` and refresh after changes

### 4. Build for Production

```bash
# Optimized build
wasm-pack build --target web --release
```

## 🎯 Integration with ThinUI

### Step 1: Build the WASM Module
```bash
cd ~/Code/uDosGo/retro-core
wasm-pack build --target web --release
```

### Step 2: Copy to ThinUI
```bash
cp -r pkg ~/Code/uDosGo/ThinUI/ui/retro-core/
```

### Step 3: Import in ThinUI
```javascript
// In your ThinUI JavaScript
import init, { create_c64_renderer } from './retro-core/retro_core.js';

async function initRetro() {
    await init();
    const renderer = await create_c64_renderer('thinui-canvas');
    // Use renderer in your ThinUI code
}
```

### Step 4: Add Canvas to ThinUI HTML
```html
<canvas id="thinui-canvas" width="320" height="200"></canvas>
```

## 📚 Understanding the Architecture

### Core Components

1. **Character Grid** (40×25)
   - Stores character codes and colors
   - Optimized with dirty flags

2. **Color Palette**
   - System-specific color sets
   - Easy color management

3. **Font System**
   - PETSCII for C64
   - Tile-based for NES
   - Block graphics for Teletext

4. **Renderer**
   - Canvas-based rendering
   - Character-by-character drawing
   - CRT effects (planned)

### Rendering Pipeline

```
Screen Memory → Font Lookup → Color Mapping → Canvas Rendering → CRT Effects
```

## 🎨 Customization

### Adding New Characters
Edit `src/fonts.rs`:

```rust
// In PETSCII::new()
glyphs[0x43] = [  // 'C'
    [false, false, true, true, true, false, false, false],
    [false, true, false, false, false, true, false, false],
    [false, true, false, false, false, false, false, false],
    [false, true, false, false, false, false, false, false],
    [false, true, false, false, false, false, false, false],
    [false, true, false, false, false, true, false, false],
    [false, false, true, true, true, false, false, false],
    [false, false, false, false, false, false, false, false],
];
```

### Adding New Colors
Edit `src/color.rs`:

```rust
// In c64_default()
colors: vec![
    RGBA::new(0x00, 0x00, 0x00, 0xFF), // Black
    RGBA::new(0xFF, 0xFF, 0xFF, 0xFF), // White
    // Add your custom colors here
    RGBA::new(0xFF, 0x00, 0x00, 0xFF), // Bright Red
],
```

## 🤝 Getting Help

### Common Questions

**Q: Do I need a server?**
- For `simple_test.html`: No, open directly
- For full WASM functionality: Yes, use `python3 -m http.server 8000`

**Q: Why is the canvas blank?**
- Check browser console (F12)
- Try the JavaScript fallback first
- Serve the page if WASM is needed

**Q: How do I switch systems?**
- Use `create_c64_renderer()`, `create_nes_renderer()`, etc.
- Or use `set_system()` on an existing renderer

**Q: Can I use this without WASM?**
- Yes! The JavaScript fallback in `simple_test.html` works without WASM
- For full features, WASM is recommended

### Where to Ask for Help
1. **Browser Console** (F12) - First place to check
2. **Rust/WASM Docs** - For build issues
3. **MDN Web Docs** - For canvas/JavaScript issues

## 🎯 Next Steps

Once you have the simple test working:

1. ✅ Get `simple_test.html` working (JavaScript fallback)
2. 🔄 Try `test.html` with WASM (serve with Python)
3. 🎨 Customize colors and fonts
4. 🔧 Add CRT effects (scanlines, phosphor)
5. 🤖 Integrate with ThinUI

## 📋 Checklist for Success

- [ ] Open `simple_test.html` directly in browser
- [ ] See the character pattern (JS fallback)
- [ ] Check console for any errors
- [ ] Serve with `python3 -m http.server 8000`
- [ ] Try `test.html` for full features
- [ ] Build WASM with `wasm-pack build --target web`
- [ ] Customize and extend!

## 🎉 Success!

You should now have a working retro renderer! The simple test provides an immediate visual confirmation, and you can gradually add more features as needed.

**Remember**: Start simple, get the basics working, then build up! 🚀
