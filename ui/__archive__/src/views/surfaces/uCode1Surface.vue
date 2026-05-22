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
import * as api from '../../services/api.prod';
import { useMCPStore } from '../../stores/mcp';
import { useUSXDStore } from '../../stores/usxd';
import { useVaultStore } from '../../stores/vault';
import { useWorkflowStore } from '../../stores/workflow';
import { useGitHubStore } from '../../stores/github';
import { useToolRegistryStore } from '../../stores/toolRegistry';

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
  STATUS: async () => {
    const mcpStore = useMCPStore();
    const usxdStore = useUSXDStore();
    const vaultStore = useVaultStore();
    const workflowStore = useWorkflowStore();
    await Promise.all([
      mcpStore.loadStatus(),
      usxdStore.loadDocuments(),
      vaultStore.loadEntries('/'),
      workflowStore.loadWorkflows(),
    ]);
    const mcpCount = mcpStore.runningServers.length;
    const usxdCount = usxdStore.documentCount;
    const vaultCount = vaultStore.entries.length;
    const wfCount = workflowStore.activeWorkflows.length;
    return [
      '',
      '╔══════════════════════════════════════╗',
      '║        uDos System Status            ║',
      '╠══════════════════════════════════════╣',
      `║  Version:    1.1.0                   ║`,
      `║  Memory:     38911 BYTES FREE        ║`,
      `║  Vault:      ~/Vault (${vaultCount} entries)    ║`,
      `║  MCP:        ${mcpCount > 0 ? `${mcpCount} running` : 'Disconnected'}           ║`,
      `║  USXD:       ${usxdCount > 0 ? `${usxdCount} docs` : 'Ready'}                   ║`,
      `║  Workflows:  ${wfCount} active                 ║`,
      `║  Terminal:   40×24 Ceefax · 16px     ║`,
      '╚══════════════════════════════════════╝',
      '',
      'READY.',
    ];
  },
  LIST: async () => {
    const vaultStore = useVaultStore();
    await vaultStore.loadEntries('/');
    const lines = ['', '📁 Vault Contents:'];
    for (const entry of vaultStore.entries) {
      const icon = entry.type === 'dir' ? '📂' : '📄';
      const size = entry.type === 'dir' ? '-' : `${(entry.size / 1024).toFixed(1)} KB`;
      lines.push(`  ${icon} ${entry.name.padEnd(20)} ${size}`);
    }
    lines.push('', 'READY.');
    return lines;
  },
  CATALOG: async () => {
    const vaultStore = useVaultStore();
    await vaultStore.loadEntries('/');
    const lines = [
      '',
      'LOADING "$"',
      'SEARCHING FOR $',
      'LOADING',
      'READY.',
      '',
    ];
    vaultStore.entries.forEach((entry, i) => {
      const size = entry.type === 'dir' ? 'PRG 00000' : `PRG ${String(entry.size).padStart(5, '0')}`;
      lines.push(`${i} "${entry.name.toUpperCase().padEnd(16)}"  ${size}`);
    });
    lines.push('', 'BLOCKS FREE: 38911', '', 'READY.');
    return lines;
  },
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
  MCP: async () => {
    const mcpStore = useMCPStore();
    await mcpStore.loadStatus();
    const lines = ['', '🔌 MCP Bridge Status:'];
    if (mcpStore.servers.length === 0) {
      lines.push('  No MCP servers configured');
    } else {
      for (const server of mcpStore.servers) {
        const status = server.running ? '🟢 Running' : '🔴 Stopped';
        lines.push(`  ${server.name}: ${status}`);
      }
    }
    lines.push('', 'READY.');
    return lines;
  },
  USXD: async () => {
    const usxdStore = useUSXDStore();
    await usxdStore.loadDocuments();
    return [
      '',
      '📖 USXD Renderer:',
      `  Documents:   ${usxdStore.documentCount} available`,
      '  Templates:   4 installed',
      '  Server:      Ready on :3000',
      '',
      'READY.',
    ];
  },
  GITHUB: async () => {
    const githubStore = useGitHubStore();
    await githubStore.loadTargets();
    const connected = githubStore.connectedTargets.length;
    return [
      '',
      '🌐 GitHub Sync:',
      `  Targets:     ${githubStore.targets.length} configured`,
      `  Connected:   ${connected}`,
      `  Last Sync:   ${githubStore.lastSync || 'Never'}`,
      '',
      'READY.',
    ];
  },
  WP: async () => {
    const githubStore = useGitHubStore();
    await githubStore.loadTargets();
    const wpTargets = githubStore.targets.filter(t => t.type === 'wordpress');
    return [
      '',
      '🌍 WordPress Adaptor:',
      `  Sites:       ${wpTargets.length} configured`,
      `  Status:      ${wpTargets.some(t => t.status === 'connected') ? 'Connected' : 'Disconnected'}`,
      '',
      'READY.',
    ];
  },
  WORKFLOW: async () => {
    const workflowStore = useWorkflowStore();
    await Promise.all([
      workflowStore.loadWorkflows(),
      workflowStore.loadTasks(),
    ]);
    const active = workflowStore.activeWorkflows.length;
    const pending = workflowStore.tasks.filter(t => t.status === 'pending').length;
    const completed = workflowStore.tasks.filter(t => t.status === 'completed').length;
    return [
      '',
      '⚙️ Workflow Engine:',
      `  Active:      ${active} workflows`,
      `  Pending:     ${pending} tasks`,
      `  Completed:   ${completed} tasks`,
      '',
      'READY.',
    ];
  },
  DEV: () => [
    '',
    '🔧 Dev Status:',
    '  API Server:  :8001',
    '  GUI:         :5173',
    '  USXD:        :3000',
    '  Vite:        :5173',
    '',
    'READY.',
  ],
  TOOLS: async () => {
    const toolStore = useToolRegistryStore();
    await toolStore.loadTools();
    const lines = ['', '🛠️ MCP Tools Registry:'];
    for (const tool of toolStore.tools) {
      lines.push(`  ${tool.name.padEnd(16)} — ${tool.description}`);
    }
    if (toolStore.tools.length === 0) {
      lines.push('  No tools available (start MCP servers)');
    }
    lines.push('', 'READY.');
    return lines;
  },
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
  UDO: async (args) => {
    if (args.length === 0) return ['Usage: UDO <command> [args...]', '', 'READY.'];
    const sub = args[0].toLowerCase();
    try {
      if (sub === 'skills') {
        const result = await api.listSkills();
        const lines = ['', '📋 UDO Skills:'];
        for (const skill of result) {
          lines.push(`  ${skill.enabled ? '🟢' : '🔴'} ${skill.name} — ${skill.description}`);
        }
        lines.push('', 'READY.');
        return lines;
      }
      if (sub === 'tasks') {
        const result = await api.listTasks();
        const lines = ['', '📋 UDO Tasks:'];
        for (const task of result) {
          lines.push(`  ${task.status === 'running' ? '🔄' : task.status === 'completed' ? '✅' : '⏳'} ${task.type} (${task.status})`);
        }
        lines.push('', 'READY.');
        return lines;
      }
      if (sub === 'agents') {
        const result = await api.listAgents();
        const lines = ['', '🤖 UDO Agents:'];
        for (const agent of result) {
          lines.push(`  ${agent.status === 'running' ? '🟢' : '⚪'} ${agent.name} — Health: ${agent.health}%`);
        }
        lines.push('', 'READY.');
        return lines;
      }
      if (sub === 'workflows') {
        const result = await api.listWorkflows();
        const lines = ['', '⚙️ UDO Workflows:'];
        for (const wf of result) {
          lines.push(`  ${wf.status === 'active' ? '🟢' : '🔴'} ${wf.name} — ${wf.runs} runs`);
        }
        lines.push('', 'READY.');
        return lines;
      }
      if (sub === 'vault') {
        const path = args[1] || '/';
        const result = await api.listVaultEntries(path);
        const lines = ['', `📁 Vault: ${path}`];
        for (const entry of result) {
          const icon = entry.type === 'dir' ? '📂' : '📄';
          lines.push(`  ${icon} ${entry.name}`);
        }
        lines.push('', 'READY.');
        return lines;
      }
      if (sub === 'exec') {
        const cmd = args.slice(1).join(' ');
        const result = await api.executeCommand(cmd);
        return ['', `$ ${cmd}`, result.output, '', 'READY.'];
      }
      return [`Unknown udo command: ${sub}`, 'Available: skills, tasks, agents, workflows, vault, exec', '', 'READY.'];
    } catch (err: any) {
      return ['', `❌ UDO Error: ${err.message}`, '', 'READY.'];
    }
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
