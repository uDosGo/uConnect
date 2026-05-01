/**
 * uCode3 Grid Editor — Architecture & Plan
 *
 * ─── Core Philosophy ───
 * At the heart of uCode3 is an SVG utility where all images (and some data)
 * are handled as vectors. The Grid Editor is the first surface to embody this.
 *
 * ─── Two-Mode Architecture ───
 *
 * CELL EDITOR (Mode: Cell)
 *   - Character-level grid editing (40×25 teletext standard)
 *   - Switch between the 3 uCode1 fonts: PetMe64 (Mode 1), Press Start 2P (Mode 2), Teletext50 (Mode 3)
 *   - 128-slot character browser (ANSI + emoji overlays + word aliases)
 *   - Click a cell to edit its character, emoji overlay, or word alias
 *   - Font glyph catalog viewer (see what each font renders for each slot)
 *   - Export: ASCII art, Teletext page, SVG vector
 *
 * GRID LAYER COMPOSER (Mode: Layer)
 *   - Larger multi-layer grid editing (up to 200×200 virtual canvas)
 *   - Layers: background, teletext blocks, sprites, annotations
 *   - Grid scaling with the 3 mode fonts
 *   - Import: Monodraw (.monopic), ASCII, image (via image→ascii→teletext)
 *   - Export: SVG, USXD, UDX, PNG (via SVG→raster)
 *
 * SVG UTILITY CORE (shared)
 *   - All grid data stored as SVG path data (vectors)
 *   - Grid → SVG converter
 *   - SVG → Grid parser (inverse)
 *   - Image → SVG → ASCII pipeline (via edge detection + quantization)
 *   - Font glyph→SVG converter for each of the 3 fonts
 *
 * ─── Data Flow ───
 *
 *   User Input (click/draw)
 *        │
 *        ▼
 *   Cell Data (slot, char, emoji, alias)
 *        │
 *        ▼
 *   Grid Model (2D array of Cells + Layers)
 *        │
 *        ▼
 *   Render Pipeline
 *        ├── Canvas (pixel/teletext)
 *        ├── SVG (vector paths)
 *        └── ASCII (text export)
 *
 * ─── Integration Points ───
 *
 *   Monodraw CLI:  `monodraw export input.monopic --format svg`
 *   Teletext:      Teletext50 font + block graphics (slots 0-31)
 *   Vault:         Save/load grids as .udx or .svg files
 *   uCode3:        SVG-format grid data as Cells in the Cell storage
 */

export const GRID_CONSTANTS = {
  TELETEXT_COLS: 40,
  TELETEXT_ROWS: 25,
  MAX_SLOTS: 128,
  FONTS: [
    { id: 'petme64',     label: 'PetMe64 (C64)',     mode: 1 },
    { id: 'press2p',     label: 'Press Start 2P (NES)', mode: 2 },
    { id: 'teletext50',  label: 'Teletext50 (Ceefax)',  mode: 3 },
  ],
  LAYER_TYPES: ['background', 'blocks', 'sprites', 'annotations'],
};

export const SLOT_CATEGORIES = [
  { start: 0,  end: 31,  label: 'Teletext Blocks & Controls', color: '#8b5cf6' },
  { start: 32, end: 32,  label: 'Space',                      color: '#6366f1' },
  { start: 33, end: 47,  label: 'Punctuation',                color: '#6b7280' },
  { start: 48, end: 57,  label: 'Digits 0-9',                color: '#3b82f6' },
  { start: 58, end: 64,  label: 'Punctuation 2',              color: '#6b7280' },
  { start: 65, end: 90,  label: 'Uppercase A-Z',              color: '#10b981' },
  { start: 91, end: 96,  label: 'Punctuation 3',              color: '#6b7280' },
  { start: 97, end: 122, label: 'Lowercase a-z',              color: '#f59e0b' },
  { start: 123,end: 126, label: 'Punctuation 4',              color: '#6b7280' },
  { start: 127,end: 127, label: 'Reserved (DEL)',             color: '#ef4444' },
];

/* ── Teletext Block Characters (slots 0-31, CP437) ── */
export const TELETEXT_BLOCKS = {
  0:  ' ',    1:  '☺',   2:  '☻',   3:  '♥',
  4:  '♦',    5:  '♣',   6:  '♠',   7:  '•',
  8:  '◘',    9:  '○',   10: '◙',   11: '♂',
  12: '♀',    13: '♪',   14: '♫',   15: '☼',
  16: '▶',    17: '◀',   18: '↕',   19: '‼',
  20: '¶',    21: '§',   22: '█',   23: '▄',
  24: '▀',    25: '▌',   26: '▐',   27: '░',
  28: '▒',    29: '▓',   30: '█',   31: ' ',
};

/* ── Ceefax rendering: block chars used in Mode 3 pages ── */
export const BLOCK_CHARS = '█▓▒░▀▄▌▐╔╗╚╝║═╠╣╦╩╬';

/* ── UDO-style demo page (Ceefax Mode 3) ── */
export const DEMO_PAGE = [
  '                                        ',
  '   ██╗░░░░░░░██╗██████╗░░█████╗░░██████╗',
  '   ██║░░██╗░░██║██╔══██╗██╔══██╗██╔════╝',
  '   ╚██╗████╗██╔╝██║░░██║██║░░██║╚█████╗░',
  '   ░████╔═████║░██║░░██║██║░░██║░╚═══██╗',
  '   ░╚██╔╝░╚██╔╝░██████╔╝╚█████╔╝██████╔╝',
  '   ░░╚═╝░░░╚═╝░░╚═════╝░░╚════╝░╚═════╝░',
  '                                        ',
];
