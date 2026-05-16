<template>
  <div class="ucode1-surface">
    <!-- Centered Viewport -->
    <div class="viewport">
      <!-- Terminal Output -->
      <div ref="output" class="terminal-viewport">
        <div class="terminal-output" id="output"></div>
      </div>

      <!-- Input Line -->
      <div class="terminal-input-line">
        <span class="prompt">READY.</span>
        <span class="input-text">{{ inputBuffer }}</span>
        <span class="cursor">█</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted } from 'vue';

// ─── State ──────────────────────────────────────────────────────
const output = ref<HTMLDivElement | null>(null);
const inputBuffer = ref('');
const history = ref<string[]>([]);
const historyIndex = ref(-1);
const isReady = ref(false);
const contentLines = ref<string[]>([]);
const cascadeTimer = ref<ReturnType<typeof setInterval> | null>(null);

// ─── Boot sequence ──────────────────────────────────────────────
const bootLines = [
  '',
  '    **** COMMODORE 64 BASIC V2 ****',
  '',
  '64K RAM SYSTEM  38911 BASIC BYTES FREE',
  '',
  'LOADING U-DOS CONNECT...',
  '',
  '╔══════════════════════════════════════╗',
  '║       uCode1 — Teletext/BASIC        ║',
  '║    128-slot · CP437 · 40×25 grid     ║',
  '╚══════════════════════════════════════╝',
  '',
  'Type HELP for available commands.',
  'Type EXIT to return to surface view.',
  '',
  'READY.',
];

// ─── Command handlers ────────────────────────────────────────────
const commandHandlers: Record<string, (args: string[]) => string | string[]> = {
  HELP: () => [
    '',
    '╔══════════════════════════════════════╗',
    '║        uCode1 COMMAND REFERENCE      ║',
    '╠══════════════════════════════════════╣',
    '║  HELP     — Show this help           ║',
    '║  STATUS   — System status            ║',
    '║  LIST     — List vault contents      ║',
    '║  CATALOG  — C64-style file listing   ║',
    '║  CLS      — Clear screen             ║',
    '║  CLEAR    — Clear screen             ║',
    '║  VIBE     — Start Vibe TUI           ║',
    '║  MCP      — MCP Bridge status        ║',
    '║  USXD     — USXD Renderer status     ║',
    '║  GITHUB   — GitHub Sync status       ║',
    '║  WP       — WordPress status         ║',
    '║  WORKFLOW — Workflow Engine status   ║',
    '║  DEV      — Dev status               ║',
    '║  TOOLS    — Tools list               ║',
    '║  UDO      — Execute udo command      ║',
    '║  RUN      — Run BASIC program        ║',
    '║  LIST     — List BASIC program       ║',
    '║  LOAD     — Load program             ║',
    '║  SYS      — System call              ║',
    '║  POKE     — POKE command             ║',
    '║  SIZE     — Set viewport size        ║',
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
    '║        uDos System Status            ║',
    '╠══════════════════════════════════════╣',
    '║  Version:    1.1.0                   ║',
    '║  Memory:     38911 BYTES FREE        ║',
    '║  Vault:      ~/Vault (42 entries)    ║',
    '║  MCP:        Connected               ║',
    '║  USXD:       Ready                   ║',
    '║  Vibe:       Idle                    ║',
    '║  Terminal:   40×24 Ceefax · 16px     ║',
    '╚══════════════════════════════════════╝',
    '',
    'READY.',
  ],
  LIST: () => [
    '',
    '📁 Vault Contents:',
    '  README.md         2.4 KB',
    '  workflows/        -',
    '  notes/            -',
    '  config.yaml      1.2 KB',
    '  surfaces/         -',
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
    '0 "U-DOS VAULT    "  PRG',
    '1 "README"        PRG 00245',
    '2 "CONFIG"        PRG 01152',
    '3 "WORKFLOWS"     PRG 03001',
    '4 "SURFACES"      PRG 01500',
    '5 "NOTES"         PRG 00800',
    '',
    'BLOCKS FREE: 38911',
    '',
    'READY.',
  ],
  VIBE: () => [
    '',
    'LOADING VIBE TUI',
    'SEARCHING FOR VIBE',
    'LOADING',
    '',
    '🌀 VIBE TUI ACTIVE',
    'MODEL: DEVSTRAL-2',
    '',
    'READY.',
  ],
  MCP: () => [
    '',
    '🔌 MCP Bridge Status:',
    '  Server:      Connected',
    '  Tools:       12 registered',
    '  Resources:   8 available',
    '',
    'READY.',
  ],
  USXD: () => [
    '',
    '📖 USXD Renderer:',
    '  Documents:   5 available',
    '  Templates:   4 installed',
    '  Server:      Ready on :3000',
    '',
    'READY.',
  ],
  GITHUB: () => [
    '',
    '🌐 GitHub Sync:',
    '  Repo:        uDosGo/Connect',
    '  Branch:      main',
    '  Status:      Up to date',
    '',
    'READY.',
  ],
  WP: () => [
    '',
    '🌍 WordPress Adaptor:',
    '  Site:        uDosGo Blog',
    '  Status:      Connected',
    '  Posts:       12 published',
    '',
    'READY.',
  ],
  WORKFLOW: () => [
    '',
    '⚙️ Workflow Engine:',
    '  Active:      2 workflows',
    '  Pending:     1 workflow',
    '  Completed:   15 workflows',
    '',
    'READY.',
  ],
  DEV: () => [
    '',
    '🔧 Dev Status:',
    '  API Server:  :5175',
    '  GUI:         :5176',
    '  USXD:        :3000',
    '  Vite:        :5173',
    '',
    'READY.',
  ],
  TOOLS: () => [
    '',
    '🛠️ MCP Tools Registry:',
    '  vault-read     — Read vault files',
    '  vault-write    — Write vault files',
    '  github-sync    — Sync with GitHub',
    '  wp-publish     — Publish to WordPress',
    '  usxd-render    — Render USXD documents',
    '  workflow-run   — Execute workflows',
    '  vibe-chat      — AI chat interface',
    '  dev-status     — System diagnostics',
    '',
    'READY.',
  ],
  RUN: () => [
    '',
    'RUNNING...',
    '',
    'U-DOS CONNECT V1.0',
    'ENTER COMMAND? HELP',
    'COMMANDS: HELP, STATUS, VIBE, LIST, CATALOG',
    '',
    'BREAK IN 60',
    '',
    'READY.',
  ],
  'LIST-PROGRAM': () => [
    '',
    '10 PRINT "U-DOS CONNECT V1.0"',
    '20 INPUT "ENTER COMMAND";A$',
    '30 IF A$="HELP" THEN GOSUB 100',
    '40 IF A$="STATUS" THEN GOSUB 200',
    '50 IF A$="VIBE" THEN GOSUB 300',
    '60 GOTO 20',
    '100 PRINT "COMMANDS: HELP, STATUS, VIBE, LIST, CATALOG"',
    '110 RETURN',
    '200 PRINT "SYSTEM: ONLINE"',
    '210 PRINT "VAULT: 42 FILES"',
    '220 RETURN',
    '300 PRINT "VIBE TUI ACTIVE"',
    '310 RETURN',
    '',
    'READY.',
  ],
  LOAD: () => [
    '',
    'LOADING PROGRAM',
    'SEARCHING FOR *',
    'LOADING',
    'READY.',
  ],
  SYS: () => [
    '',
    'SYS 64738',
    '',
    '*** SYSTEM RESET ***',
    '',
    '    **** COMMODORE 64 BASIC V2 ****',
    '',
    'READY.',
  ],
  POKE: () => [
    '',
    'POKE 53280,0 : POKE 53281,0',
    '',
    'BORDER AND BACKGROUND SET TO BLACK',
    '',
    'READY.',
  ],
  SIZE: (args) => {
    const key = args[0]?.toLowerCase();
    if (key && VIEWPORTS[key]) {
      currentViewport.value = key;
      return [`Viewport set to ${VIEWPORTS[key].label}`, '', 'READY.'];
    }
    return ['Usage: SIZE <viewport>', 'Available: 20x10, 32x16, 40x24, 80x30, 48x48', '', 'READY.'];
  },
  UDO: (args) => {
    if (args.length === 0) return ['Usage: UDO <command> [args...]', '', 'READY.'];
    return [`Executing: udo ${args.join(' ')}`, '  ✅ Command sent to udo backend', '', 'READY.'];
  },
  EXIT: () => ['Goodbye!'],
};

// ─── Viewport presets ────────────────────────────────────────────
const VIEWPORTS: Record<string, { cols: number; rows: number; label: string }> = {
  '20x10': { cols: 20, rows: 10, label: '20×10 TINY' },
  '32x16': { cols: 32, rows: 16, label: '32×16 NANO' },
  '40x24': { cols: 40, rows: 24, label: '40×24 CEEFAX' },
  '80x30': { cols: 80, rows: 30, label: '80×30 WIDE' },
  '48x48': { cols: 48, rows: 48, label: '48×48 SQUARE' },
};
const currentViewport = ref('40x24');

// ─── Terminal logic ──────────────────────────────────────────────
function addLine(text: string) {
  contentLines.value.push(text);
  scrollToBottom();
}

function addLines(lines: string | string[]) {
  if (typeof lines === 'string') lines = [lines];
  lines.forEach(l => contentLines.value.push(l));
  scrollToBottom();
}

function scrollToBottom() {
  nextTick(() => {
    if (output.value) {
      output.value.scrollTop = output.value.scrollHeight;
    }
  });
}

function processCommand(cmd: string) {
  const trimmed = cmd.trim();
  if (!trimmed) return;

  history.value.push(trimmed);
  historyIndex.value = history.value.length;
  addLine(`> ${trimmed}`);

  const parts = trimmed.split(/\s+/);
  const command = parts[0].toUpperCase();
  const args = parts.slice(1);

  const handler = commandHandlers[command];
  if (handler) {
    const result = handler(args);
    if (result && result.length > 0) {
      addLines(result);
    }
  } else {
    addLine(`?SYNTAX ERROR: ${command}`);
    addLine('Type HELP for available commands.');
    addLine('');
    addLine('READY.');
  }

  addLine('');
}

function handleKeyDown(e: KeyboardEvent) {
  if (!isReady.value) return;

  if (e.key === 'Enter') {
    e.preventDefault();
    processCommand(inputBuffer.value);
    inputBuffer.value = '';
  } else if (e.key === 'Backspace') {
    if (inputBuffer.value.length > 0) {
      inputBuffer.value = inputBuffer.value.slice(0, -1);
    }
    e.preventDefault();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (historyIndex.value > 0) {
      historyIndex.value--;
      inputBuffer.value = history.value[historyIndex.value];
    }
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (historyIndex.value < history.value.length - 1) {
      historyIndex.value++;
      inputBuffer.value = history.value[historyIndex.value];
    } else {
      historyIndex.value = history.value.length;
      inputBuffer.value = '';
    }
  } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
    inputBuffer.value += e.key;
    e.preventDefault();
  }
}

// ─── Cascade render ──────────────────────────────────────────────
function cascadeRender() {
  if (cascadeTimer.value) {
    clearInterval(cascadeTimer.value);
    cascadeTimer.value = null;
  }

  const el = output.value;
  if (!el) return;

  el.innerHTML = '';
  const lines = contentLines.value.slice();
  let idx = 0;
  const total = lines.length;
  const intervalMs = total > 0 ? Math.min(200, Math.floor(2000 / total)) : 100;

  if (total === 0) {
    el.innerHTML = '<span class="prompt">READY.</span><span class="cursor">█</span>';
    return;
  }

  cascadeTimer.value = setInterval(() => {
    if (idx >= total) {
      clearInterval(cascadeTimer.value!);
      cascadeTimer.value = null;
      el.innerHTML += '<br><span class="prompt">READY.</span><span class="cursor">█</span>';
      el.scrollTop = el.scrollHeight;
      return;
    }
    const line = document.createElement('div');
    line.className = 'resp';
    line.textContent = lines[idx];
    el.appendChild(line);
    el.scrollTop = el.scrollHeight;
    idx++;
  }, intervalMs);
}

// ─── Initialize ──────────────────────────────────────────────────
onMounted(() => {
  addLines(bootLines);
  
  setTimeout(() => {
    isReady.value = true;
    cascadeRender();
  }, 2000);

  document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
  if (cascadeTimer.value) clearInterval(cascadeTimer.value);
});
</script>

<style scoped>
.ucode1-surface {
  background: #1a1a2e;
  color: #e0e0ff;
  font-family: 'PetMe128', 'C64 User Mono', 'Courier New', monospace;
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.viewport {
  width: 42em;
  max-width: 92vw;
  height: 32em;
  max-height: 85vh;
  background: #16213e;
  border: 2px solid #533483;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(83, 52, 131, 0.3);
  display: flex;
  flex-direction: column;
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

.terminal-output .resp {
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
  color: #ffcc00;
  font-weight: bold;
}

.input-text {
  color: #e0e0ff;
  white-space: pre;
}

.cursor {
  color: #e0e0ff;
  animation: blink 0.5s step-end infinite;
}

@keyframes blink {
  50% { opacity: 0; }
}

/* Scrollbar */
.terminal-viewport::-webkit-scrollbar {
  width: 6px;
}

.terminal-viewport::-webkit-scrollbar-track {
  background: #0f3460;
}

.terminal-viewport::-webkit-scrollbar-thumb {
  background: #533483;
  border-radius: 3px;
}

.terminal-viewport::-webkit-scrollbar-thumb:hover {
  background: #7b2d8e;
}
</style>
