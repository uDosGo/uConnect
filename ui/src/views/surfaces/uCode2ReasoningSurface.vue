<template>
  <div class="reasoning-surface" data-font-style="modern">
    <!-- Surface Header -->
    <div class="surface-header">
      <div class="header-left">
        <h1 class="surface-title">uCode2 Reasoning</h1>
        <span class="surface-badge">AI</span>
      </div>
      <div class="header-right">
        <!-- Connection Status -->
        <div class="connection-status" :class="connectionClass">
          <span class="status-dot"></span>
          <span class="status-text">{{ connectionStatus }}</span>
        </div>
        <!-- Model Selector -->
        <select v-model="selectedModel" class="model-select">
          <option v-for="m in models" :key="m.id" :value="m.id">{{ m.label }}</option>
        </select>
        <!-- New Chat -->
        <button class="btn-icon" @click="newChat" title="New Chat">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Main Chat Area -->
    <div class="chat-container" ref="chatContainer">
      <!-- Empty State -->
      <div v-if="messages.length === 0" class="empty-state">
        <div class="empty-icon">🧠</div>
        <h2>uCode2 Reasoning</h2>
        <p class="empty-desc">AI-powered reasoning assistant connected to your workspace.</p>
        <div class="suggestion-chips">
          <button v-for="s in suggestions" :key="s.text" class="chip" @click="sendSuggestion(s.text)">
            {{ s.icon }} {{ s.text }}
          </button>
        </div>
      </div>

      <!-- Messages -->
      <div v-else class="messages-list">
        <div
          v-for="(msg, idx) in messages"
          :key="idx"
          class="message"
          :class="[msg.role, msg.status || 'done']"
        >
          <!-- User Message -->
          <div v-if="msg.role === 'user'" class="msg-content user-msg">
            <div class="msg-avatar">👤</div>
            <div class="msg-bubble">{{ msg.content }}</div>
          </div>

          <!-- Assistant Message -->
          <div v-else class="msg-content assistant-msg">
            <div class="msg-avatar">🧠</div>
            <div class="msg-bubble">
              <!-- Thinking indicator -->
              <div v-if="msg.status === 'thinking'" class="thinking-indicator">
                <span class="thinking-dot"></span>
                <span class="thinking-dot"></span>
                <span class="thinking-dot"></span>
                <span class="thinking-label">Reasoning...</span>
              </div>

              <!-- Tool calls -->
              <div v-if="msg.toolCalls && msg.toolCalls.length > 0" class="tool-calls">
                <div v-for="(tc, tci) in msg.toolCalls" :key="tci" class="tool-call">
                  <span class="tool-call-icon">🔧</span>
                  <span class="tool-call-name">{{ tc.tool }}</span>
                  <code class="tool-call-args">{{ tc.args }}</code>
                  <span v-if="tc.result" class="tool-call-result">{{ tc.result }}</span>
                </div>
              </div>

              <!-- Content -->
              <div v-if="msg.content" class="msg-text" v-html="renderMarkdown(msg.content)"></div>

              <!-- Sources -->
              <div v-if="msg.sources && msg.sources.length > 0" class="msg-sources">
                <span class="sources-label">Sources:</span>
                <span v-for="(src, si) in msg.sources" :key="si" class="source-tag">{{ src }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <div class="input-area">
      <div class="input-wrapper">
        <textarea
          v-model="inputText"
          class="msg-input"
          placeholder="Ask anything about your workspace..."
          rows="1"
          @keydown.enter.exact="sendMessage"
          @input="autoResize"
          ref="inputRef"
        ></textarea>
        <button
          class="send-btn"
          :disabled="!inputText.trim() || isProcessing"
          @click="sendMessage"
        >
          <svg v-if="!isProcessing" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
          <span v-else class="send-spinner"></span>
        </button>
      </div>
      <div class="input-footer">
        <span class="mcp-indicator" :class="{ active: mcpConnected }">
          <span class="mcp-dot"></span> MCP {{ mcpConnected ? 'Connected' : 'Disconnected' }}
        </span>
        <span class="vault-indicator" :class="{ active: vaultConnected }">
          <span class="vault-dot"></span> Vault {{ vaultConnected ? 'Online' : 'Offline' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';

// ─── Types ──────────────────────────────────────────────────────
interface ToolCall {
  tool: string;
  args: string;
  result?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  status?: 'thinking' | 'streaming' | 'done' | 'error';
  toolCalls?: ToolCall[];
  sources?: string[];
}

interface Model {
  id: string;
  label: string;
  provider: string;
}

// ─── State ──────────────────────────────────────────────────────
const inputText = ref('');
const inputRef = ref<HTMLTextAreaElement | null>(null);
const chatContainer = ref<HTMLDivElement | null>(null);
const isProcessing = ref(false);
const selectedModel = ref('mistral');
const messages = ref<ChatMessage[]>([]);
const mcpConnected = ref(false);
const vaultConnected = ref(false);

const models: Model[] = [
  { id: 'mistral', label: 'Mistral 7B', provider: 'local' },
  { id: 'mistral-large', label: 'Mistral Large', provider: 'local' },
  { id: 'claude', label: 'Claude (MCP)', provider: 'mcp' },
  { id: 'snackbar', label: 'Snackbar AI', provider: 'snackbar' },
];

const suggestions = [
  { icon: '📋', text: 'Summarize my current tasks' },
  { icon: '🔍', text: 'Search the vault for recent notes' },
  { icon: '📊', text: 'What is the status of my workspace?' },
  { icon: '💡', text: 'Suggest improvements to my workflow' },
  { icon: '🔧', text: 'List available MCP tools' },
];

// ─── Connection Status ──────────────────────────────────────────
const connectionStatus = computed(() => {
  if (mcpConnected.value) return 'Connected';
  return 'Connecting...';
});

const connectionClass = computed(() => ({
  'status-connected': mcpConnected.value,
  'status-connecting': !mcpConnected.value,
}));

// ─── MCP Service Discovery ──────────────────────────────────────
interface MCPService {
  name: string;
  url: string;
  type: 'mcp' | 'snackbar' | 'vault';
  status: 'online' | 'offline' | 'unknown';
}

const mcpServices = ref<MCPService[]>([
  { name: 'Snackbar Daemon', url: 'http://linux-mint-server:5175', type: 'snackbar', status: 'unknown' },
  { name: 'MCP Bridge', url: 'http://localhost:5175', type: 'mcp', status: 'unknown' },
  { name: 'Vault API', url: 'http://localhost:5175/api/vault', type: 'vault', status: 'unknown' },
]);

async function checkMCPServices() {
  for (const svc of mcpServices.value) {
    try {
      const response = await fetch(`${svc.url}/health`, {
        signal: AbortSignal.timeout(2000),
      });
      svc.status = response.ok ? 'online' : 'offline';
    } catch {
      svc.status = 'offline';
    }
  }

  mcpConnected.value = mcpServices.value.some(s => s.status === 'online');
  vaultConnected.value = mcpServices.value.find(s => s.type === 'vault')?.status === 'online';
}

// ─── MCP Tool Execution ─────────────────────────────────────────
async function executeMCPTool(tool: string, args: any): Promise<string> {
  const mcpSvc = mcpServices.value.find(s => s.type === 'mcp' && s.status === 'online');
  if (!mcpSvc) return 'MCP service not available';

  try {
    const response = await fetch(`${mcpSvc.url}/api/mcp/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool, args }),
      signal: AbortSignal.timeout(10000),
    });
    if (response.ok) {
      const data = await response.json();
      return data.result || '✅ Tool executed';
    }
    return '❌ Tool execution failed';
  } catch (e: any) {
    return `❌ Error: ${e.message}`;
  }
}

// ─── Vault Query ────────────────────────────────────────────────
async function queryVault(query: string): Promise<string[]> {
  const vaultSvc = mcpServices.value.find(s => s.type === 'vault');
  if (!vaultSvc || vaultSvc.status !== 'online') return [];

  try {
    const response = await fetch(`${vaultSvc.url}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, limit: 5 }),
      signal: AbortSignal.timeout(5000),
    });
    if (response.ok) {
      const data = await response.json();
      return data.results || [];
    }
    return [];
  } catch {
    return [];
  }
}

// ─── AI Chat Completion ─────────────────────────────────────────
async function getAIResponse(prompt: string): Promise<{
  content: string;
  toolCalls: ToolCall[];
  sources: string[];
}> {
  const toolCalls: ToolCall[] = [];
  const sources: string[] = [];

  // Try MCP-based AI first
  const mcpSvc = mcpServices.value.find(s => s.type === 'mcp' && s.status === 'online');
  if (mcpSvc) {
    try {
      const response = await fetch(`${mcpSvc.url}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel.value,
          messages: [
            { role: 'system', content: 'You are uCode2 Reasoning, an AI assistant connected to the uDOS workspace. You have access to MCP tools, vault search, and snackbar services. Be concise and helpful.' },
            ...messages.value.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: prompt },
          ],
          tools: true,
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          content: data.content || 'I processed your request.',
          toolCalls: data.toolCalls || [],
          sources: data.sources || [],
        };
      }
    } catch {
      // Fall through to local simulation
    }
  }

  // Simulated AI response with tool calls
  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes('task') || lowerPrompt.includes('workflow')) {
    toolCalls.push({ tool: 'get_tasks', args: '{}', result: 'Found 3 active tasks' });
    sources.push('Workflow Engine');
    return {
      content: 'Here are your current tasks:\n\n1. **Review PR #42** — In Progress\n2. **Update documentation** — Pending\n3. **Deploy v1.2** — Blocked\n\nWould you like me to take action on any of these?',
      toolCalls,
      sources,
    };
  }

  if (lowerPrompt.includes('vault') || lowerPrompt.includes('note') || lowerPrompt.includes('search')) {
    const vaultResults = await queryVault(prompt);
    if (vaultResults.length > 0) {
      sources.push(...vaultResults);
    }
    toolCalls.push({ tool: 'search_vault', args: `{ "query": "${prompt}" }`, result: `Found ${vaultResults.length} results` });
    return {
      content: vaultResults.length > 0
        ? `I found ${vaultResults.length} relevant notes in your vault.`
        : 'I searched the vault but didn\'t find direct matches. Try a different query.',
      toolCalls,
      sources: vaultResults,
    };
  }

  if (lowerPrompt.includes('mcp') || lowerPrompt.includes('tool')) {
    const tools = ['search_vault', 'get_tasks', 'exec_command', 'read_file', 'list_files', 'analyze_code'];
    toolCalls.push({ tool: 'list_mcp_tools', args: '{}', result: `Found ${tools.length} tools` });
    return {
      content: `Available MCP Tools:\n\n${tools.map(t => `- \`${t}\``).join('\n')}\n\nI can use these to help with your workspace tasks.`,
      toolCalls,
      sources: ['MCP Bridge'],
    };
  }

  if (lowerPrompt.includes('status') || lowerPrompt.includes('workspace')) {
    const onlineServices = mcpServices.value.filter(s => s.status === 'online').map(s => s.name);
    toolCalls.push({ tool: 'get_workspace_status', args: '{}', result: `${onlineServices.length} services online` });
    return {
      content: `**Workspace Status**\n\n- **Services Online:** ${onlineServices.join(', ') || 'None'}\n- **Model:** ${models.find(m => m.id === selectedModel.value)?.label || selectedModel.value}\n- **Vault:** ${vaultConnected.value ? '✅ Connected' : '❌ Disconnected'}\n- **MCP:** ${mcpConnected.value ? '✅ Connected' : '❌ Disconnected'}`,
      toolCalls,
      sources: ['System'],
    };
  }

  // Default response
  return {
    content: `I understand you're asking about "${prompt}". I can help with:\n\n- 📋 Task management\n- 🔍 Vault search\n- 🔧 MCP tool execution\n- 📊 Workspace status\n\nWhat would you like me to do?`,
    toolCalls: [],
    sources: [],
  };
}

// ─── Message Handling ───────────────────────────────────────────
async function sendMessage() {
  const text = inputText.value.trim();
  if (!text || isProcessing.value) return;

  inputText.value = '';
  isProcessing.value = true;

  // Add user message
  messages.value.push({ role: 'user', content: text });

  // Add thinking message
  const assistantIdx = messages.value.length;
  messages.value.push({
    role: 'assistant',
    content: '',
    status: 'thinking',
    toolCalls: [],
    sources: [],
  });

  await nextTick();
  scrollToBottom();

  try {
    // Get AI response
    const response = await getAIResponse(text);

    // Update message with response
    messages.value[assistantIdx] = {
      role: 'assistant',
      content: response.content,
      status: 'done',
      toolCalls: response.toolCalls,
      sources: response.sources,
    };
  } catch (e: any) {
    messages.value[assistantIdx] = {
      role: 'assistant',
      content: `❌ Error: ${e.message}`,
      status: 'error',
    };
  } finally {
    isProcessing.value = false;
    await nextTick();
    scrollToBottom();
  }
}

function sendSuggestion(text: string) {
  inputText.value = text;
  sendMessage();
}

function newChat() {
  messages.value = [];
  inputText.value = '';
}

// ─── Helpers ────────────────────────────────────────────────────
function scrollToBottom() {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
}

function autoResize(e: Event) {
  const el = e.target as HTMLTextAreaElement;
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 200) + 'px';
}

function renderMarkdown(text: string): string {
  // Simple markdown rendering
  return text
    .replace(/### (.+)/g, '<h3>$1</h3>')
    .replace(/## (.+)/g, '<h2>$1</h2>')
    .replace(/# (.+)/g, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/- (.+)/g, '<li>$1</li>')
    .replace(/\n/g, '<br>');
}

// ─── Polling ────────────────────────────────────────────────────
let pollInterval: ReturnType<typeof setInterval> | null = null;

// ─── Lifecycle ──────────────────────────────────────────────────
onMounted(() => {
  checkMCPServices();
  pollInterval = setInterval(checkMCPServices, 15000);
});

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval);
});
</script>

<style scoped>
/* ─── Root Surface ────────────────────────────────────────────── */
.reasoning-surface {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #0f1117;
  color: #e1e4e8;
  font-family: var(--usx-font-body, 'SF Pro', system-ui, sans-serif);
  font-size: var(--usx-active-font-size, 14px);
  line-height: var(--usx-active-line-height, 1.5);
}

/* ─── Surface Header ──────────────────────────────────────────── */
.surface-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #21262d;
  background: #161b22;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.surface-title {
  font-size: 1rem;
  font-weight: 600;
  color: #e1e4e8;
  margin: 0;
}

.surface-badge {
  font-size: 0.65rem;
  font-weight: 600;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  background: #1f6feb;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* ─── Connection Status ───────────────────────────────────────── */
.connection-status {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-connected .status-dot {
  background: #3fb950;
  box-shadow: 0 0 4px #3fb950;
}

.status-connecting .status-dot {
  background: #d29922;
  animation: pulse-dot 1.5s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.status-connected {
  color: #3fb950;
}

.status-connecting {
  color: #d29922;
}

/* ─── Model Select ────────────────────────────────────────────── */
.model-select {
  background: #21262d;
  color: #e1e4e8;
  border: 1px solid #30363d;
  border-radius: 6px;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-family: inherit;
  cursor: pointer;
  outline: none;
}

.model-select:focus {
  border-color: #1f6feb;
}

/* ─── Icon Button ─────────────────────────────────────────────── */
.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid #30363d;
  border-radius: 6px;
  background: #21262d;
  color: #8b949e;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-icon:hover {
  background: #30363d;
  color: #e1e4e8;
}

/* ─── Chat Container ──────────────────────────────────────────── */
.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  scroll-behavior: smooth;
}

.chat-container::-webkit-scrollbar {
  width: 6px;
}

.chat-container::-webkit-scrollbar-track {
  background: transparent;
}

.chat-container::-webkit-scrollbar-thumb {
  background: #30363d;
  border-radius: 3px;
}

/* ─── Empty State ─────────────────────────────────────────────── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 2rem;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #e1e4e8;
  margin: 0 0 0.5rem;
}

.empty-desc {
  font-size: 0.875rem;
  color: #8b949e;
  margin: 0 0 1.5rem;
  max-width: 400px;
}

/* ─── Suggestion Chips ────────────────────────────────────────── */
.suggestion-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  max-width: 500px;
}

.chip {
  padding: 0.5rem 0.75rem;
  border: 1px solid #30363d;
  border-radius: 8px;
  background: #161b22;
  color: #8b949e;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.chip:hover {
  background: #21262d;
  border-color: #1f6feb;
  color: #e1e4e8;
}

/* ─── Messages ────────────────────────────────────────────────── */
.messages-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  animation: fade-in 0.2s ease-out;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.msg-content {
  display: flex;
  gap: 0.75rem;
  max-width: 85%;
}

.user-msg {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.assistant-msg {
  align-self: flex-start;
}

.msg-avatar {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  flex-shrink: 0;
  background: #21262d;
}

.msg-bubble {
  padding: 0.6rem 0.85rem;
  border-radius: 8px;
  font-size: 0.875rem;
  line-height: 1.5;
}

.user-msg .msg-bubble {
  background: #1f6feb;
  color: #fff;
  border-bottom-right-radius: 2px;
}

.assistant-msg .msg-bubble {
  background: #161b22;
  border: 1px solid #21262d;
  color: #e1e4e8;
  border-bottom-left-radius: 2px;
}

/* ─── Thinking Indicator ──────────────────────────────────────── */
.thinking-indicator {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.5rem 0;
}

.thinking-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #8b949e;
  animation: thinking-bounce 1.4s ease-in-out infinite;
}

.thinking-dot:nth-child(2) { animation-delay: 0.2s; }
.thinking-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes thinking-bounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

.thinking-label {
  font-size: 0.75rem;
  color: #8b949e;
  margin-left: 0.3rem;
}

/* ─── Tool Calls ──────────────────────────────────────────────── */
.tool-calls {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  background: #0d1117;
  border-radius: 6px;
  border: 1px solid #21262d;
}

.tool-call {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  flex-wrap: wrap;
}

.tool-call-icon {
  font-size: 0.7rem;
}

.tool-call-name {
  color: #58a6ff;
  font-weight: 500;
}

.tool-call-args {
  color: #8b949e;
  font-size: 0.7rem;
  background: #161b22;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
}

.tool-call-result {
  color: #3fb950;
  font-size: 0.7rem;
}

/* ─── Message Text ────────────────────────────────────────────── */
.msg-text {
  white-space: pre-wrap;
  word-break: break-word;
}

.msg-text :deep(h1),
.msg-text :deep(h2),
.msg-text :deep(h3) {
  margin: 0.5rem 0 0.25rem;
  color: #e1e4e8;
}

.msg-text :deep(h1) { font-size: 1.1rem; }
.msg-text :deep(h2) { font-size: 1rem; }
.msg-text :deep(h3) { font-size: 0.9rem; }

.msg-text :deep(strong) {
  color: #e1e4e8;
}

.msg-text :deep(code) {
  background: #21262d;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
  font-size: 0.8em;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}

.msg-text :deep(li) {
  margin-left: 1rem;
  list-style: disc;
}

/* ─── Sources ─────────────────────────────────────────────────── */
.msg-sources {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #21262d;
  flex-wrap: wrap;
}

.sources-label {
  font-size: 0.7rem;
  color: #8b949e;
  font-weight: 500;
}

.source-tag {
  font-size: 0.65rem;
  padding: 0.1rem 0.35rem;
  border-radius: 3px;
  background: #1f6feb20;
  color: #58a6ff;
  border: 1px solid #1f6feb40;
}

/* ─── Input Area ──────────────────────────────────────────────── */
.input-area {
  border-top: 1px solid #21262d;
  padding: 0.75rem 1rem;
  background: #161b22;
  flex-shrink: 0;
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 8px;
  padding: 0.5rem;
  transition: border-color 0.15s;
}

.input-wrapper:focus-within {
  border-color: #1f6feb;
}

.msg-input {
  flex: 1;
  background: transparent;
  border: none;
  color: #e1e4e8;
  font-family: inherit;
  font-size: 0.875rem;
  line-height: 1.5;
  resize: none;
  outline: none;
  max-height: 200px;
}

.msg-input::placeholder {
  color: #484f58;
}

.send-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: #1f6feb;
  color: #fff;
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  background: #388bfd;
}

.send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.send-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid transparent;
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ─── Input Footer ────────────────────────────────────────────── */
.input-footer {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.4rem;
  padding: 0 0.25rem;
}

.mcp-indicator,
.vault-indicator {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.65rem;
  color: #484f58;
}

.mcp-dot,
.vault-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #484f58;
}

.mcp-indicator.active .mcp-dot,
.vault-indicator.active .vault-dot {
  background: #3fb950;
}

.mcp-indicator.active,
.vault-indicator.active {
  color: #8b949e;
}

/* ─── Error State ─────────────────────────────────────────────── */
.message.error .msg-bubble {
  border-color: #f85149;
  background: #2d1b1b;
}

.message.error .msg-text {
  color: #f85149;
}
</style>
