<template>
  <div class="terminal-panel" data-panel="terminal">
    <div class="terminal-viewport" ref="outputRef">
      <div class="terminal-output">
        <div v-for="(line, i) in contentLines" :key="i" class="terminal-line">{{ line }}</div>
      </div>
    </div>
    <div class="terminal-input-line">
      <span class="prompt">READY.</span>
      <span class="input-text">{{ inputBuffer }}</span>
      <span class="cursor">█</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

const outputRef = ref<HTMLDivElement | null>(null)
const inputBuffer = ref('')
const contentLines = ref<string[]>([])
const history = ref<string[]>([])
const historyIndex = ref(-1)
const isReady = ref(false)

const bootLines = [
  '',
  '    **** COMMODORE 64 BASIC V2 ****',
  '',
  '64K RAM SYSTEM  38911 BASIC BYTES FREE',
  '',
  'LOADING U-DOS CONNECT...',
  '',
  '╔══════════════════════════════════════╗',
  '║       gridui — Terminal Panel        ║',
  '║     Ported from uCode1 Surface       ║',
  '╚══════════════════════════════════════╝',
  '',
  'Type HELP for available commands.',
  '',
  'READY.',
]

const commandHandlers: Record<string, (args: string[]) => string | string[]> = {
  HELP: () => [
    '',
    '╔══════════════════════════════════════╗',
    '║        TERMINAL COMMAND REFERENCE    ║',
    '╠══════════════════════════════════════╣',
    '║  HELP     — Show this help           ║',
    '║  STATUS   — System status            ║',
    '║  CLS      — Clear screen             ║',
    '║  CLEAR    — Clear screen             ║',
    '║  LIST     — List vault contents      ║',
    '║  CATALOG  — C64-style file listing   ║',
    '║  MCP      — MCP Bridge status        ║',
    '║  TOOLS    — Tools list               ║',
    '║  UDO      — Execute udo command      ║',
    '║  EXIT     — Return to surface view   ║',
    '╚══════════════════════════════════════╝',
    '',
    'READY.',
  ],
  CLS: () => { contentLines.value = []; return []; },
  CLEAR: () => { contentLines.value = []; return []; },
  STATUS: () => [
    '',
    '╔══════════════════════════════════════╗',
    '║        gridui System Status          ║',
    '╠══════════════════════════════════════╣',
    '║  Surface:   gridui v1.0              ║',
    '║  Panel:     Terminal                 ║',
    '║  Format:    USX v1.0                 ║',
    '║  Font:      Monaspace Krypton        ║',
    '║  Grid:      40×24 Teletext           ║',
    '╚══════════════════════════════════════╝',
    '',
    'READY.',
  ],
  LIST: () => [
    '',
    '📁 Vault Contents:',
    '  📄 README.md             1.2 KB',
    '  📄 index.md              0.8 KB',
    '  📂 docs/                  -',
    '  📂 surfaces/              -',
    '',
    'READY.',
  ],
  CATALOG: () => [
    '',
    'LOADING "$"',
    'SEARCHING FOR $',
    'LOADING',
    'READY.',
    '',
    '0 "README          "  PRG 01200',
    '1 "INDEX           "  PRG 00800',
    '',
    'BLOCKS FREE: 38911',
    '',
    'READY.',
  ],
  MCP: () => [
    '',
    '🔌 MCP Bridge Status:',
    '  uCode1: 🟢 Running',
    '  uCode3: 🟢 Running',
    '  Vault:  🟢 Running',
    '',
    'READY.',
  ],
  TOOLS: () => [
    '',
    '🛠️ MCP Tools Registry:',
    '  vault_read     — Read vault documents',
    '  vault_write    — Write to vault',
    '  surface_nav    — Navigate surfaces',
    '  grid_render    — Render USX grids',
    '',
    'READY.',
  ],
  UDO: (args) => {
    if (args.length === 0) return ['Usage: UDO <command> [args...]', '', 'READY.']
    return [`Executing: udo ${args.join(' ')}`, 'Not yet connected to UDO backend.', '', 'READY.']
  },
  EXIT: () => ['Goodbye!'],
}

function addLine(text: string) {
  contentLines.value.push(text)
  scrollToBottom()
}

function addLines(lines: string | string[]) {
  if (typeof lines === 'string') lines = [lines]
  lines.forEach(l => contentLines.value.push(l))
  scrollToBottom()
}

function scrollToBottom() {
  nextTick(() => {
    if (outputRef.value) {
      outputRef.value.scrollTop = outputRef.value.scrollHeight
    }
  })
}

function processCommand(cmd: string) {
  const trimmed = cmd.trim()
  if (!trimmed) return

  history.value.push(trimmed)
  historyIndex.value = history.value.length
  addLine(`> ${trimmed}`)

  const parts = trimmed.split(/\s+/)
  const command = parts[0].toUpperCase()
  const args = parts.slice(1)

  const handler = commandHandlers[command]
  if (handler) {
    const result = handler(args)
    if (result && result.length > 0) {
      addLines(result)
    }
  } else {
    addLine(`?SYNTAX ERROR: ${command}`)
    addLine('Type HELP for available commands.')
    addLine('')
    addLine('READY.')
  }

  addLine('')
}

function handleKeyDown(e: KeyboardEvent) {
  if (!isReady.value) return

  if (e.key === 'Enter') {
    e.preventDefault()
    processCommand(inputBuffer.value)
    inputBuffer.value = ''
  } else if (e.key === 'Backspace') {
    if (inputBuffer.value.length > 0) {
      inputBuffer.value = inputBuffer.value.slice(0, -1)
    }
    e.preventDefault()
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (historyIndex.value > 0) {
      historyIndex.value--
      inputBuffer.value = history.value[historyIndex.value]
    }
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (historyIndex.value < history.value.length - 1) {
      historyIndex.value++
      inputBuffer.value = history.value[historyIndex.value]
    } else {
      historyIndex.value = history.value.length
      inputBuffer.value = ''
    }
  } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
    inputBuffer.value += e.key
    e.preventDefault()
  }
}

onMounted(() => {
  addLines(bootLines)
  setTimeout(() => { isReady.value = true }, 1500)
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.terminal-panel {
  width: 42em;
  max-width: 92vw;
  height: 32em;
  max-height: 85vh;
  background: var(--usx-paper, #1a1a2e);
  border: 2px solid var(--usx-accent, #533483);
  border-radius: var(--md-sys-shape-corner-small, 8px);
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  font-family: 'PetMe128', 'C64 User Mono', 'Courier New', monospace;
  color: var(--usx-ink, #e0e0ff);
}

.terminal-viewport {
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  margin-bottom: 0.5rem;
}

.terminal-output {
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 1em;
  line-height: 1.3;
}

.terminal-line {
  line-height: 1.3;
  min-height: 1.3em;
}

.terminal-input-line {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  font-size: 1em;
  flex-shrink: 0;
}

.prompt {
  color: var(--usx-warning, #ffcc00);
  font-weight: bold;
}

.input-text {
  color: var(--usx-ink, #e0e0ff);
  white-space: pre;
}

.cursor {
  color: var(--usx-ink, #e0e0ff);
  animation: blink 0.5s step-end infinite;
}

@keyframes blink {
  50% { opacity: 0; }
}

.terminal-viewport::-webkit-scrollbar {
  width: 6px;
}

.terminal-viewport::-webkit-scrollbar-track {
  background: var(--usx-grid, #16213e);
}

.terminal-viewport::-webkit-scrollbar-thumb {
  background: var(--usx-accent, #533483);
  border-radius: 3px;
}
</style>
