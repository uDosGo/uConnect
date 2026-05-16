<template>
  <div class="teletext-surface min-h-screen" :style="themeStyle">
    <!-- Surface Header -->
    <div class="surface-header">
      <h1><span class="surface-icon">📺</span> Teletext Console</h1>
      <p class="surface-tagline">Retro teletext-style console interface with green phosphor display.</p>
    </div>

    <!-- Teletext Display -->
    <div class="teletext-display">
      <div class="teletext-screen">
        <div class="scanlines"></div>
        <div class="teletext-header">
          <span class="blink">uDos Teletext v1.0</span>
          <span class="right">CHANNEL 1</span>
        </div>
        <div class="teletext-content">
          <div v-for="(line, i) in displayLines" :key="i" class="teletext-line" :class="line.class">
            <span v-if="line.time" class="timestamp">[{{ line.time }}]</span>
            <span v-else class="prompt">></span>
            {{ line.text }}
          </div>
          <div class="teletext-line cursor-line">
            <span class="prompt">></span>
            <span class="input-text">{{ currentInput }}</span>
            <span class="cursor">▌</span>
          </div>
        </div>
        <div class="teletext-footer">
          <span>PAGE 001</span>
          <span class="right">PRESS CTRL+C FOR MENU</span>
        </div>
      </div>
    </div>

    <!-- Command Input -->
    <div class="command-bar">
      <input
        ref="inputRef"
        v-model="currentInput"
        type="text"
        placeholder="Type a command..."
        class="command-input"
        @keyup.enter="executeCommand"
        autofocus
      />
      <button @click="executeCommand" class="command-btn">⏎ ENTER</button>
      <button @click="clearScreen" class="command-btn secondary">⌧ CLEAR</button>
    </div>

    <!-- Quick Commands -->
    <div class="quick-commands">
      <button v-for="cmd in quickCommands" :key="cmd.label" @click="runQuickCommand(cmd.command)" class="quick-btn">
        {{ cmd.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'

const inputRef = ref<HTMLInputElement | null>(null)
const currentInput = ref('')
const displayLines = ref<Array<{ text: string; class?: string; time?: string }>>([])

const quickCommands = [
  { label: '📋 STATUS', command: 'status' },
  { label: '📁 LIST', command: 'list' },
  { label: '🌀 VIBE', command: 'vibe' },
  { label: '🔌 MCP', command: 'mcp status' },
  { label: '📖 USXD', command: 'usxd list' },
  { label: '🌐 GITHUB', command: 'github status' },
  { label: '⚙️ WORKFLOW', command: 'workflow list' },
  { label: '🗄️ VAULT', command: 'vault list' },
]

const themeStyle = {
  '--bg-color': '#0a0a0a',
  '--text-color': '#33ff33',
  '--text-dim': '#1a8c1a',
  '--text-bright': '#66ff66',
  '--border-color': '#33ff33',
  '--header-bg': '#111111',
}

function addLine(text: string, className?: string) {
  const now = new Date()
  const time = now.toLocaleTimeString()
  displayLines.value.push({ text, class: className, time })
  if (displayLines.value.length > 50) {
    displayLines.value.shift()
  }
}

function addOutput(text: string) {
  addLine(text, 'output')
}

function addError(text: string) {
  addLine(text, 'error')
}

function addInfo(text: string) {
  addLine(text, 'info')
}

function clearScreen() {
  displayLines.value = []
  addInfo('Screen cleared.')
}

async function executeCommand() {
  const cmd = currentInput.value.trim()
  if (!cmd) return

  addLine(` ${cmd}`)
  currentInput.value = ''

  // Simulate command execution
  await simulateCommand(cmd)

  nextTick(() => {
    inputRef.value?.focus()
  })
}

function runQuickCommand(cmd: string) {
  currentInput.value = cmd
  executeCommand()
}

async function simulateCommand(cmd: string) {
  const lower = cmd.toLowerCase()

  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500))

  if (lower === 'status' || lower === 'udo status') {
    addOutput('╔══════════════════════════════════════╗')
    addOutput('║        uDos System Status            ║')
    addOutput('╠══════════════════════════════════════╣')
    addOutput('║  Version:    1.1.0                   ║')
    addOutput('║  Vault:      ~/Vault (42 entries)    ║')
    addOutput('║  MCP:        Connected               ║')
    addOutput('║  USXD:       Ready                   ║')
    addOutput('║  Vibe:       Idle                    ║')
    addOutput('╚══════════════════════════════════════╝')
  } else if (lower === 'list' || lower === 'udo list') {
    addOutput('📁 Vault Contents:')
    addOutput('  README.md         2.4 KB')
    addOutput('  workflows/        -')
    addOutput('  notes/            -')
    addOutput('  config.yaml      1.2 KB')
    addOutput('  surfaces/         -')
  } else if (lower === 'vibe' || lower === 'udo vibe') {
    addOutput('🌀 Vibe TUI starting...')
    await new Promise(resolve => setTimeout(resolve, 500))
    addOutput('✅ Vibe connected (model: devstral-2)')
    addOutput('Type "help" for available commands.')
  } else if (lower.startsWith('mcp')) {
    addOutput('🔌 MCP Bridge Status:')
    addOutput('  Server:      Connected')
    addOutput('  Tools:       12 registered')
    addOutput('  Resources:   8 available')
  } else if (lower.startsWith('usxd')) {
    addOutput('📖 USXD Renderer:')
    addOutput('  Documents:   5 available')
    addOutput('  Templates:   4 installed')
    addOutput('  Server:      Ready on :3000')
  } else if (lower.startsWith('github')) {
    addOutput('🌐 GitHub Sync:')
    addOutput('  Repo:        uDosGo/Connect')
    addOutput('  Branch:      main')
    addOutput('  Status:      Up to date')
  } else if (lower.startsWith('workflow')) {
    addOutput('⚙️ Workflow Engine:')
    addOutput('  Active:      2 workflows')
    addOutput('  Pending:     1 workflow')
    addOutput('  Completed:   15 workflows')
  } else if (lower.startsWith('vault')) {
    addOutput('🗄️ Vault Operations:')
    addOutput('  Location:    ~/Vault')
    addOutput('  Entries:     42 files')
    addOutput('  Last Sync:   Today 14:30')
  } else if (lower === 'help') {
    addOutput('Available commands:')
    addOutput('  status      - Show system status')
    addOutput('  list        - List vault contents')
    addOutput('  vibe        - Start Vibe TUI')
    addOutput('  mcp         - MCP Bridge status')
    addOutput('  usxd        - USXD Renderer status')
    addOutput('  github      - GitHub Sync status')
    addOutput('  workflow    - Workflow Engine status')
    addOutput('  vault       - Vault operations')
    addOutput('  clear       - Clear screen')
    addOutput('  help        - Show this help')
  } else if (lower === 'clear') {
    clearScreen()
  } else {
    addOutput(`Command not recognized: ${cmd}`)
    addOutput('Type "help" for available commands.')
  }
}

onMounted(() => {
  addInfo('╔══════════════════════════════════════╗')
  addInfo('║    uDos Teletext Console v1.0        ║')
  addInfo('║    Type "help" for commands           ║')
  addInfo('╚══════════════════════════════════════╝')
  addInfo('')
  addInfo('System ready. Waiting for input...')
})
</script>

<style scoped>
.teletext-surface {
  background-color: var(--bg-color, #0a0a0a);
  color: var(--text-color, #33ff33);
  font-family: 'Courier New', 'Consolas', monospace;
  padding: 1rem;
  max-width: 900px;
  margin: 0 auto;
}

.surface-header {
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.surface-header h1 {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--text-bright);
  margin: 0;
}

.surface-tagline {
  color: var(--text-dim);
  font-size: 0.85rem;
  margin: 0.25rem 0 0;
}

.teletext-display {
  border: 2px solid var(--border-color);
  border-radius: 4px;
  margin-bottom: 1rem;
  background: #000;
}

.teletext-screen {
  position: relative;
  padding: 0.5rem;
  min-height: 400px;
  max-height: 500px;
  overflow-y: auto;
  background: #000;
}

.scanlines {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 255, 0, 0.03) 2px,
    rgba(0, 255, 0, 0.03) 4px
  );
  pointer-events: none;
  z-index: 1;
}

.teletext-header,
.teletext-footer {
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0.5rem;
  background: var(--header-bg);
  border-bottom: 1px solid var(--border-color);
  font-size: 0.8rem;
  color: var(--text-bright);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.teletext-footer {
  border-bottom: none;
  border-top: 1px solid var(--border-color);
}

.teletext-content {
  padding: 0.5rem;
  font-size: 0.9rem;
  line-height: 1.4;
  position: relative;
  z-index: 2;
}

.teletext-line {
  white-space: pre-wrap;
  word-break: break-all;
  margin-bottom: 2px;
}

.teletext-line.output {
  color: var(--text-color);
}

.teletext-line.error {
  color: #ff3333;
}

.teletext-line.info {
  color: var(--text-dim);
}

.timestamp {
  color: var(--text-dim);
  font-size: 0.75rem;
  margin-right: 0.5rem;
}

.prompt {
  color: var(--text-bright);
  font-weight: bold;
  margin-right: 0.5rem;
}

.cursor-line {
  display: flex;
  align-items: center;
}

.input-text {
  color: var(--text-bright);
}

.cursor {
  animation: blink 1s step-end infinite;
  color: var(--text-color);
}

@keyframes blink {
  50% { opacity: 0; }
}

.blink {
  animation: blink 1s step-end infinite;
}

.command-bar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.command-input {
  flex: 1;
  background: #111;
  border: 1px solid var(--border-color);
  color: var(--text-color);
  font-family: 'Courier New', monospace;
  padding: 0.75rem;
  font-size: 1rem;
  border-radius: 4px;
  outline: none;
}

.command-input:focus {
  border-color: var(--text-bright);
  box-shadow: 0 0 8px rgba(51, 255, 51, 0.3);
}

.command-btn {
  background: var(--text-color);
  color: #000;
  border: none;
  padding: 0.75rem 1rem;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
}

.command-btn.secondary {
  background: #222;
  color: var(--text-color);
  border: 1px solid var(--border-color);
}

.command-btn:hover {
  filter: brightness(1.2);
}

.quick-commands {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.quick-btn {
  background: #111;
  color: var(--text-color);
  border: 1px solid var(--border-color);
  padding: 0.4rem 0.75rem;
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  border-radius: 4px;
  cursor: pointer;
}

.quick-btn:hover {
  background: #1a1a1a;
  border-color: var(--text-bright);
}

.right {
  text-align: right;
}
</style>
