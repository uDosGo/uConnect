<template>
  <div class="ceefax-surface" ref="surfaceRef">
    <!-- Status Bar -->
    <div class="ceefax-status-bar">
      <span class="ceefax-status-channel">Ceefax</span>
      <span class="ceefax-status-page">PAGE {{ currentPage.toString().padStart(3, '0') }}</span>
      <span class="ceefax-status-time">{{ currentTime }}</span>
    </div>

    <!-- Canvas 2D Mode 7 Renderer -->
    <div class="ceefax-canvas-wrapper">
      <canvas
        ref="canvasRef"
        :width="canvasWidth"
        :height="canvasHeight"
        class="ceefax-canvas"
      />
    </div>

    <!-- Footer Navigation -->
    <div class="ceefax-footer">
      <span class="footer-btn" @click="prevPage">← PREV</span>
      <span class="footer-btn" @click="gotoPage(100)">P100 INDEX</span>
      <span class="footer-btn" @click="nextPage">→ NEXT</span>
      <span class="footer-btn" @click="cycleSkin">SKIN: {{ currentSkin }}</span>
    </div>

    <!-- Page Number Input -->
    <div v-if="pageInputVisible" class="ceefax-page-input">
      <span class="page-input-label">PAGE:</span>
      <input
        ref="pageInputRef"
        v-model="pageInputBuffer"
        type="text"
        maxlength="3"
        class="page-input-field"
        @keydown.enter="submitPage"
        @keydown.escape="pageInputVisible = false"
        @blur="submitPage"
      />

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'

// ─── Teletext Mode 7 Constants ──────────────────────────────────────

const COLS = 40
const ROWS = 25
const CHAR_W = 12
const CHAR_H = 20
const PADDING = 8

const COLOURS: Record<string, string> = {
  black:   '#000000',
  red:     '#FF0000',
  green:   '#00FF00',
  yellow:  '#FFFF00',
  blue:    '#0000FF',
  magenta: '#FF00FF',
  cyan:    '#00FFFF',
  white:   '#FFFFFF',
}

const COLOUR_NAMES = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white']

// ─── Teletext G0 character set overrides ────────────────────────────
// Teletext replaces some ASCII chars with special glyphs
const TELETEXT_GLYPH: Record<number, string> = {
  0x23: '£',  // pound
  0x5E: '↑',  // up arrow
  0x5F: '←',  // left arrow
  0x60: '½',  // half
  0x7B: '¼',  // quarter
  0x7C: '│',  // vertical bar
  0x7D: '¾',  // three-quarters
  0x7E: '÷',  // division
  0x7F: '█',  // full block
}

// ─── Mosaic patterns (G1 set) ───────────────────────────────────────
// 2×3 grid patterns for each mosaic character (0x20-0x5F)
// Each pattern is a 6-bit bitmap (top-left to bottom-right)
const MOSAIC_PATTERNS: number[] = [
  // 0x20-0x2F
  0b000000, 0b000001, 0b000010, 0b000011, 0b000100, 0b000101, 0b000110, 0b000111,
  0b001000, 0b001001, 0b001010, 0b001011, 0b001100, 0b001101, 0b001110, 0b001111,
  // 0x30-0x3F
  0b010000, 0b010001, 0b010010, 0b010011, 0b010100, 0b010101, 0b010110, 0b010111,
  0b011000, 0b011001, 0b011010, 0b011011, 0b011100, 0b011101, 0b011110, 0b011111,
  // 0x40-0x4F
  0b100000, 0b100001, 0b100010, 0b100011, 0b100100, 0b100101, 0b100110, 0b100111,
  0b101000, 0b101001, 0b101010, 0b101011, 0b101100, 0b101101, 0b101110, 0b101111,
  // 0x50-0x5F
  0b110000, 0b110001, 0b110010, 0b110011, 0b110100, 0b110101, 0b110110, 0b110111,
  0b111000, 0b111001, 0b111010, 0b111011, 0b111100, 0b111101, 0b111110, 0b111111,
]

// ─── Skins ──────────────────────────────────────────────────────────

interface Skin {
  name: string
  screenBg: string
  screenFg: string
  headerBg: string
  headerFg: string
  statusBg: string
  statusFg: string
  footerBg: string
  footerFg: string
  accent: string
}

const SKINS: Skin[] = [
  { name: 'classic',  screenBg: '#000000', screenFg: '#ffffff', headerBg: '#0000ff', headerFg: '#ffffff', statusBg: '#000000', statusFg: '#ffff00', footerBg: '#000000', footerFg: '#00ff00', accent: '#00ffff' },
  { name: 'paper',    screenBg: '#F5E6C8', screenFg: '#4A3728', headerBg: '#8B4513', headerFg: '#F5E6C8', statusBg: '#F5E6C8', statusFg: '#4A3728', footerBg: '#F5E6C8', footerFg: '#4A3728', accent: '#D2B48C' },
  { name: 'dark',     screenBg: '#1E1E1E', screenFg: '#E0E0E0', headerBg: '#2D2D2D', headerFg: '#E0E0E0', statusBg: '#1E1E1E', statusFg: '#66BB6A', footerBg: '#1E1E1E', footerFg: '#66BB6A', accent: '#FFEE58' },
  { name: 'highvis',  screenBg: '#000000', screenFg: '#FFFF00', headerBg: '#000080', headerFg: '#FFFF00', statusBg: '#000000', statusFg: '#FFFF00', footerBg: '#000000', footerFg: '#FFFF00', accent: '#FFFFFF' },
  { name: 'amiga',    screenBg: '#0050A0', screenFg: '#FFFFFF', headerBg: '#003070', headerFg: '#FFFFFF', statusBg: '#0050A0', statusFg: '#FFFFFF', footerBg: '#0050A0', footerFg: '#FFFFFF', accent: '#0080FF' },
]

// ─── Teletext Cell ──────────────────────────────────────────────────

interface Cell {
  char: string
  fg: number
  bg: number
  flash: boolean
  conceal: boolean
  doubleHeight: boolean
  doubleWidth: boolean
  mosaic: boolean
  contiguous: boolean
}

function makeCell(): Cell {
  return { char: ' ', fg: 7, bg: 0, flash: false, conceal: false, doubleHeight: false, doubleWidth: false, mosaic: false, contiguous: false }
}

// ─── State ──────────────────────────────────────────────────────────

const surfaceRef = ref<HTMLDivElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const pageInputRef = ref<HTMLInputElement | null>(null)

const currentPage = ref(100)
const currentTime = ref('')
const pageInputVisible = ref(false)
const pageInputBuffer = ref('')
const currentSkinIdx = ref(0)
const revealActive = ref(false)


const currentSkin = computed(() => SKINS[currentSkinIdx.value].name)

const canvasWidth = computed(() => COLS * CHAR_W + PADDING * 2)
const canvasHeight = computed(() => ROWS * CHAR_H + PADDING * 2)

// ─── Page Store ─────────────────────────────────────────────────────

interface TeletextPage {
  title: string
  cells: Cell[][]
  url?: string
}

const pages = ref<Record<number, TeletextPage>>({
  100: { title: 'INDEX', cells: [] },
  101: { title: 'NEWS HEADLINES', cells: [] },
  102: { title: 'TECH', cells: [] },
  103: { title: 'SCIENCE', cells: [] },
  104: { title: 'SPORT', cells: [] },
  200: { title: 'HACKER NEWS', cells: [] },
  201: { title: 'DEV TO', cells: [] },
  300: { title: 'WEATHER', cells: [] },
  500: { title: 'SYSTEM STATUS', cells: [] },
})

// ─── Page Content Generators ────────────────────────────────────────

function generateIndexPage(): Cell[][] {
  const grid = Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => makeCell()))

  function set(row: number, col: number, char: string, fg = 7, bg = 0) {
    if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
      grid[row][col] = { ...makeCell(), char, fg, bg }
    }
  }

  function text(row: number, col: number, str: string, fg = 7, bg = 0) {
    for (let i = 0; i < str.length && col + i < COLS; i++) {
      set(row, col + i, str[i], fg, bg)
    }
  }

  function center(row: number, str: string, fg = 7, bg = 0) {
    const col = Math.floor((COLS - str.length) / 2)
    text(row, col, str, fg, bg)
  }

  // Header
  text(0, 0,  '╔══════════════════════════════════════╗', 6)
  text(1, 0,  '║', 6)
  center(1, 'C E E F A X   M O D E   7', 3)
  text(1, 39, '║', 6)
  text(2, 0,  '╚══════════════════════════════════════╝', 6)

  // Sub-header
  center(3, 'P100  INDEX', 3)

  // Page listings
  let y = 5
  const sortedPages = Object.entries(pages.value).sort(([a], [b]) => Number(a) - Number(b))
  for (const [code, page] of sortedPages) {
    if (y >= 22) break
    const codeStr = code.padStart(3, '0')
    text(y, 2, `${codeStr}  ${page.title}`, 2, 0)
    y++
  }

  // Footer bar
  text(23, 0, '═'.repeat(40), 6)

  return grid
}

function generateNewsPage(pageId: number): Cell[][] {
  const grid = Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => makeCell()))
  const page = pages.value[pageId]

  function set(row: number, col: number, char: string, fg = 7, bg = 0) {
    if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
      grid[row][col] = { ...makeCell(), char, fg, bg }
    }
  }

  function text(row: number, col: number, str: string, fg = 7, bg = 0) {
    for (let i = 0; i < str.length && col + i < COLS; i++) {
      set(row, col + i, str[i], fg, bg)
    }
  }

  function center(row: number, str: string, fg = 7, bg = 0) {
    const col = Math.floor((COLS - str.length) / 2)
    text(row, col, str, fg, bg)
  }

  // Header bar
  text(0, 0, '═'.repeat(40), 6)
  center(1, page.title, 3)
  text(2, 0, '═'.repeat(40), 6)

  // News items
  const headlines = NEWS_DATA[pageId] || []
  let y = 4
  for (let i = 0; i < Math.min(headlines.length, 14); i++) {
    const num = `${i + 1}.`.padEnd(3)
    const title = headlines[i].slice(0, 34)
    text(y, 1, num, 3)
    text(y, 4, title, 7)
    y++
  }

  // Footer
  text(22, 0, '═'.repeat(40), 6)
  text(23, 0, 'Press digits for page  |  ← → navigate', 2)

  return grid
}

function generateWeatherPage(): Cell[][] {
  const grid = Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => makeCell()))

  function set(row: number, col: number, char: string, fg = 7, bg = 0) {
    if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
      grid[row][col] = { ...makeCell(), char, fg, bg }
    }
  }

  function text(row: number, col: number, str: string, fg = 7, bg = 0) {
    for (let i = 0; i < str.length && col + i < COLS; i++) {
      set(row, col + i, str[i], fg, bg)
    }
  }

  function center(row: number, str: string, fg = 7, bg = 0) {
    const col = Math.floor((COLS - str.length) / 2)
    text(row, col, str, fg, bg)
  }

  text(0, 0, '═'.repeat(40), 6)
  center(1, 'WEATHER', 3)
  text(2, 0, '═'.repeat(40), 6)

  center(4, '☀️  Sunny  24°C', 3)
  center(5, 'Brisbane, Australia', 7)
  text(7, 2, 'Mon  ☀️  26°C', 2)
  text(8, 2, 'Tue  ⛅  24°C', 3)
  text(9, 2, 'Wed  🌧️  22°C', 1)
  text(10, 2, 'Thu  ☀️  25°C', 2)
  text(11, 2, 'Fri  ☀️  27°C', 2)

  text(23, 0, '═'.repeat(40), 6)

  return grid
}

function generateStatusPage(): Cell[][] {
  const grid = Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => makeCell()))

  function set(row: number, col: number, char: string, fg = 7, bg = 0) {
    if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
      grid[row][col] = { ...makeCell(), char, fg, bg }
    }
  }

  function text(row: number, col: number, str: string, fg = 7, bg = 0) {
    for (let i = 0; i < str.length && col + i < COLS; i++) {
      set(row, col + i, str[i], fg, bg)
    }
  }

  function center(row: number, str: string, fg = 7, bg = 0) {
    const col = Math.floor((COLS - str.length) / 2)
    text(row, col, str, fg, bg)
  }

  text(0, 0, '═'.repeat(40), 6)
  center(1, 'SYSTEM STATUS', 3)
  text(2, 0, '═'.repeat(40), 6)

  text(4, 2, 'Surface:    gridui v1.0', 2)
  text(5, 2, 'Panel:      Ceefax Mode 7', 2)
  text(6, 2, 'Format:     Canvas 2D', 2)
  text(7, 2, 'Pages:      ' + Object.keys(pages.value).length.toString(), 2)
  text(8, 2, 'Font:       Teletext50', 2)
  text(9, 2, 'Grid:       40×25', 2)
  text(10, 2, 'Skin:       ' + currentSkin.value, 3)
  text(11, 2, 'Reveal:     ' + (revealActive.value ? 'ON' : 'OFF'), 3)

  text(14, 2, 'Press 100 for Index', 7)
  text(23, 0, '═'.repeat(40), 6)

  return grid
}

function generateErrorPage(pageNum: number): Cell[][] {
  const grid = Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => makeCell()))

  function set(row: number, col: number, char: string, fg = 7, bg = 0) {
    if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
      grid[row][col] = { ...makeCell(), char, fg, bg }
    }
  }

  function center(row: number, str: string, fg = 7, bg = 0) {
    const col = Math.floor((COLS - str.length) / 2)
    for (let i = 0; i < str.length && col + i < COLS; i++) {
      set(row, col + i, str[i], fg, bg)
    }
  }

  center(10, '╔══════════════════════════════════════╗', 1)
  center(11, '║  PAGE ' + pageNum.toString().padStart(3, '0') + ' NOT FOUND  ║', 1)
  center(12, '║                                      ║', 1)
  center(13, '║  Press 100 to return to index        ║', 1)
  center(14, '╚══════════════════════════════════════╝', 1)

  return grid
}

// ─── News Data ──────────────────────────────────────────────────────

const NEWS_DATA: Record<number, string[]> = {
  101: [
    'Global Summit Addresses Climate Crisis',
    'New Technology Breakthrough in Quantum Computing',
    'Markets Rally on Economic Optimism',
    'Scientists Discover New Species in Deep Ocean',
    'Education Reform Bill Passes Parliament',
    'Space Agency Announces New Mars Mission',
    'Healthcare Workers Recognized for Service',
  ],
  102: [
    'AI Model Achieves Human-Level Reasoning',
    'New Programming Language Gains Popularity',
    'Open Source Community Releases Major Update',
    'Cybersecurity Threats on the Rise',
    'WebAssembly Reaches New Milestones',
    'Rust Adoption Continues to Grow',
  ],
  103: [
    'New Exoplanet Discovered in Habitable Zone',
    'CRISPR Gene Editing Shows Promise',
    'Quantum Entanglement Achieved at Room Temperature',
    'Deep Sea Expedition Reveals New Ecosystems',
    'Fusion Energy Breakthrough Announced',
  ],
  104: [
    'World Cup Qualifiers: Dramatic Finishes',
    'Grand Slam Tennis: Underdog Advances',
    'Olympic Committee Announces New Sports',
    'Marathon Record Broken by 22-Year-Old',
    'Cricket World Cup Schedule Released',
  ],
  200: [
    'Show HN: A New Terminal Emulator Written in Rust',
    'Ask HN: What are you working on?',
    'The Future of Web Development',
    'Why SQLite is Taking Over the World',
    'Building CLI Tools in Go',
  ],
  201: [
    'How to Build a CLI Tool in Rust',
    'Understanding Vue 3 Composition API',
    'CSS Grid vs Flexbox: When to Use Which',
    'Introduction to WebAssembly',
    'TypeScript 5.0: What\'s New',
  ],
}

// ─── Page Loading ───────────────────────────────────────────────────

function loadPage(pageNum: number) {
  if (pageNum < 100 || pageNum > 999) return

  currentPage.value = pageNum

  if (pageNum === 100) {
    pages.value[100].cells = generateIndexPage()
  } else if (pageNum === 300) {
    pages.value[300].cells = generateWeatherPage()
  } else if (pageNum === 500) {
    pages.value[500].cells = generateStatusPage()
  } else if (pages.value[pageNum]) {
    pages.value[pageNum].cells = generateNewsPage(pageNum)
  } else {
    // Generate error page on the fly
    const errPage: TeletextPage = { title: 'ERROR', cells: generateErrorPage(pageNum) }
    pages.value[pageNum] = errPage
  }

  renderFrame()
}

function gotoPage(pageNum: number) {
  loadPage(pageNum)
}

function prevPage() {
  if (currentPage.value > 100) loadPage(currentPage.value - 1)
}

function nextPage() {
  if (currentPage.value < 999) loadPage(currentPage.value + 1)
}

function cycleSkin() {
  currentSkinIdx.value = (currentSkinIdx.value + 1) % SKINS.length
  renderFrame()
}

function submitPage() {
  const num = parseInt(pageInputBuffer.value, 10)
  if (!isNaN(num) && num >= 100 && num <= 999) gotoPage(num)
  pageInputVisible.value = false
  pageInputBuffer.value = ''
}


// ─── Canvas 2D Mode 7 Renderer ──────────────────────────────────────

function renderFrame() {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const skin = SKINS[currentSkinIdx.value]

  // Clear canvas
  ctx.fillStyle = skin.screenBg
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Get cells for current page
  const page = pages.value[currentPage.value]
  if (!page || !page.cells || page.cells.length === 0) return

  const cells = page.cells

  // Set font
  ctx.font = '16px Teletext50, "Courier New", monospace'
  ctx.textBaseline = 'top'

  // Render each cell
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cell = cells[row]?.[col] || makeCell()
      const x = PADDING + col * CHAR_W
      const y = PADDING + row * CHAR_H

      // Background
      const bgColour = cell.bg >= 0 && cell.bg < COLOUR_NAMES.length ? COLOUR_NAMES[cell.bg] : 'black'
      ctx.fillStyle = COLOURS[bgColour] || '#000000'
      ctx.fillRect(x, y, CHAR_W, CHAR_H)

      // Character (skip if concealed and reveal is off)
      if (cell.conceal && !revealActive.value) continue

      // Foreground
      const fgColour = cell.fg >= 0 && cell.fg < COLOUR_NAMES.length ? COLOUR_NAMES[cell.fg] : 'white'
      ctx.fillStyle = COLOURS[fgColour] || '#ffffff'

      // Flash: skip rendering every other frame (handled by animation loop)
      if (cell.flash && !flashVisible.value) continue

      // Render character
      const char = cell.char
      ctx.fillText(char, x, y)
    }
  }
}

// ─── Flash Animation ────────────────────────────────────────────────

const flashVisible = ref(true)
let flashInterval: ReturnType<typeof setInterval> | null = null

function startFlashAnimation() {
  flashInterval = setInterval(() => {
    flashVisible.value = !flashVisible.value
    renderFrame()
  }, 500)
}

function stopFlashAnimation() {
  if (flashInterval) {
    clearInterval(flashInterval)
    flashInterval = null
  }
}

// ─── Keyboard Handling ──────────────────────────────────────────────

function handleKeyDown(e: KeyboardEvent) {
  if (/^[0-9]$/.test(e.key)) {
    if (!pageInputVisible.value) {
      pageInputVisible.value = true
      pageInputBuffer.value = e.key
      nextTick(() => pageInputRef.value?.focus())
    }
    e.preventDefault()
    return
  }

  switch (e.key) {
    case 'ArrowLeft': e.preventDefault(); prevPage(); break
    case 'ArrowRight': e.preventDefault(); nextPage(); break
    case 'r': case 'R': e.preventDefault(); loadPage(currentPage.value); break
    case 's': case 'S': e.preventDefault(); cycleSkin(); break
    case 'x': case 'X': e.preventDefault(); revealActive.value = !revealActive.value; renderFrame(); break
    case 'Enter': e.preventDefault(); if (pageInputVisible.value) submitPage(); break
    case 'Escape': pageInputVisible.value = false; pageInputBuffer.value = ''; break
  }
}


// ─── Clock ──────────────────────────────────────────────────────────

let clockInterval: ReturnType<typeof setInterval> | null = null

function updateClock() {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

// ─── Lifecycle ──────────────────────────────────────────────────────

onMounted(() => {
  updateClock()
  clockInterval = setInterval(updateClock, 10000)
  document.addEventListener('keydown', handleKeyDown)
  startFlashAnimation()

  // Generate initial pages
  pages.value[100].cells = generateIndexPage()
  pages.value[101].cells = generateNewsPage(101)
  pages.value[102].cells = generateNewsPage(102)
  pages.value[103].cells = generateNewsPage(103)
  pages.value[104].cells = generateNewsPage(104)
  pages.value[200].cells = generateNewsPage(200)
  pages.value[201].cells = generateNewsPage(201)
  pages.value[300].cells = generateWeatherPage()
  pages.value[500].cells = generateStatusPage()

  // Render initial frame
  renderFrame()
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
  if (clockInterval) clearInterval(clockInterval)
  stopFlashAnimation()
})
</script>

<style scoped>
.ceefax-surface {
  background: #000000;
  color: #ffffff;
  font-family: 'Teletext50', 'Courier New', monospace;
  font-size: 16px;
  line-height: 1.2;
  letter-spacing: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.ceefax-status-bar {
  background: #000;
  color: #ffff00;
  padding: 4px 12px;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #ffff00;
  font-weight: bold;
  font-size: 14px;
  flex-shrink: 0;
}

.ceefax-status-channel { color: #ffff00; }
.ceefax-status-page { color: #00ff00; }
.ceefax-status-time { color: #00ffff; }

.ceefax-canvas-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  overflow: hidden;
  padding: 4px;
}

.ceefax-canvas {
  display: block;
  image-rendering: pixelated;
  max-width: 100%;
  max-height: 100%;
}

.ceefax-footer {
  background: #000;
  color: #00ff00;
  padding: 4px 12px;
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #00ff00;
  font-size: 12px;
  flex-shrink: 0;
}

.footer-btn {
  cursor: pointer;
  padding: 2px 6px;
  transition: background 0.15s;
}

.footer-btn:hover { background: #003300; }

.ceefax-page-input {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  background: #000;
  border: 2px solid #ffff00;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 10;
}

.page-input-label { color: #ffff00; font-weight: bold; font-size: 14px; }

.page-input-field {
  background: #000;
  color: #00ff00;
  border: 1px solid #333;
  padding: 2px 4px;
  width: 50px;
  font-family: 'Teletext50', monospace;
  font-size: 14px;
  text-align: center;
  outline: none;
}

.page-input-field:focus { border-color: #ffff00; }
</style>
