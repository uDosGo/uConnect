<template>
  <aside
    class="gridui-chat-sheet"
    :class="{ 'gridui-chat-sheet--open': store.chatVisible }"
    :data-palette="store.currentPalette"
  >
    <!-- Header -->
    <div class="chat-header">
      <span class="material-symbol chat-header-icon">smart_toy</span>
      <span class="chat-header-title">AI Assistant</span>
      <button class="chat-close-btn" @click="store.toggleChat()" title="Close Chat">
        <span class="material-symbol">close</span>
      </button>
    </div>

    <!-- Messages -->
    <div class="chat-messages" ref="messagesRef">
      <div v-if="store.chatMessages.length === 0" class="chat-empty">
        <span class="material-symbol chat-empty-icon">forum</span>
        <p class="chat-empty-text">Ask me anything about the system, surfaces, or USX grids.</p>
      </div>

      <div
        v-for="msg in store.chatMessages"
        :key="msg.id"
        class="chat-message"
        :class="`chat-message--${msg.role}`"
      >
        <div class="chat-message-avatar">
          <span class="material-symbol">
            {{ msg.role === 'user' ? 'person' : msg.role === 'assistant' ? 'smart_toy' : 'info' }}
          </span>
        </div>
        <div class="chat-message-content">
          <div class="chat-message-text">{{ msg.content }}</div>
          <div class="chat-message-time">{{ formatTime(msg.timestamp) }}</div>
        </div>
      </div>

      <!-- Loading indicator -->
      <div v-if="store.chatLoading" class="chat-loading">
        <span class="chat-loading-dot"></span>
        <span class="chat-loading-dot"></span>
        <span class="chat-loading-dot"></span>
      </div>
    </div>

    <!-- Input -->
    <div class="chat-input-area">
      <input
        v-model="store.chatInput"
        class="chat-input"
        type="text"
        placeholder="Type a message..."
        @keydown.enter="sendMessage"
        :disabled="store.chatLoading"
      />
      <button
        class="chat-send-btn"
        @click="sendMessage"
        :disabled="!store.chatInput.trim() || store.chatLoading"
        title="Send"
      >
        <span class="material-symbol">send</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useGridUIStore } from './stores/gridUIStore'

const store = useGridUIStore()
const messagesRef = ref<HTMLDivElement | null>(null)

function formatTime(timestamp: number): string {
  const d = new Date(timestamp)
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

async function sendMessage() {
  const text = store.chatInput.trim()
  if (!text || store.chatLoading) return

  store.addChatMessage('user', text)
  store.chatInput = ''
  store.chatLoading = true

  // Scroll to bottom
  await nextTick()
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  }

  // Simulate AI response (will be replaced with MCP integration)
  setTimeout(async () => {
    store.addChatMessage('assistant', `You said: "${text}"\n\nI'm connected to the gridui surface. I can help with:\n- Navigating panels (terminal, teledesk, dashboard, vault, maps)\n- Toggling grid layers\n- Changing display modes\n- Running system commands`)
    store.chatLoading = false

    await nextTick()
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  }, 800)
}
</script>

<style scoped>
/* ─── Chat Sheet ────────────────────────────────────────────────── */
.gridui-chat-sheet {
  display: flex;
  flex-direction: column;
  width: 0;
  min-width: 0;
  overflow: hidden;
  background: var(--usx-color-surface);
  border-left: 1px solid var(--usx-color-outline-variant);
  transition: width 0.25s ease, min-width 0.25s ease;
  font-size: var(--gridui-font-size, 14px);
  font-family: var(--gridui-font-family, 'Source Code Pro', 'JetBrains Mono', 'Courier New', monospace);
}

.gridui-chat-sheet--open {
  width: var(--gridui-chat-width);
  min-width: var(--gridui-chat-width);
}

/* ─── Header ────────────────────────────────────────────────────── */
.chat-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--usx-color-outline-variant);
  flex-shrink: 0;
}

.chat-header-icon {
  color: var(--usx-color-primary);
  font-size: calc(var(--gridui-font-size, 14px) * 1.4);
}

.chat-header-title {
  flex: 1;
  font-family: var(--gridui-font-family, 'Source Code Pro', 'JetBrains Mono', 'Courier New', monospace);
  font-size: calc(var(--gridui-font-size, 14px) * 1);
  font-weight: 600;
  color: var(--usx-color-on-surface);
}

.chat-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: calc(var(--gridui-font-size, 14px) * 2.3);
  height: calc(var(--gridui-font-size, 14px) * 2.3);
  border: none;
  background: transparent;
  color: var(--usx-color-on-surface-variant);
  cursor: pointer;
  border-radius: var(--md-sys-shape-corner-full);
  transition: background 0.15s, color 0.15s;
}

.chat-close-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--usx-color-on-surface);
}

/* ─── Messages ──────────────────────────────────────────────────── */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 100%;
  text-align: center;
  padding: 24px;
}

.chat-empty-icon {
  font-size: calc(var(--gridui-font-size, 14px) * 3.4);
  color: var(--usx-color-on-surface-variant);
}

.chat-empty-text {
  font-family: var(--gridui-font-family, 'Source Code Pro', 'JetBrains Mono', 'Courier New', monospace);
  font-size: calc(var(--gridui-font-size, 14px) * 0.95);
  color: var(--usx-color-on-surface-variant);
  line-height: 1.5;
  max-width: 240px;
}

/* ─── Message Bubbles ───────────────────────────────────────────── */
.chat-message {
  display: flex;
  gap: 8px;
  max-width: 100%;
}

.chat-message-avatar {
  flex-shrink: 0;
  width: calc(var(--gridui-font-size, 14px) * 2);
  height: calc(var(--gridui-font-size, 14px) * 2);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--md-sys-shape-corner-full);
  font-size: calc(var(--gridui-font-size, 14px) * 1.3);
}

.chat-message--user .chat-message-avatar {
  background: var(--usx-color-primary-container);
  color: var(--usx-color-on-primary-container);
}

.chat-message--assistant .chat-message-avatar {
  background: var(--usx-color-secondary-container);
  color: var(--usx-color-on-secondary-container);
}

.chat-message--system .chat-message-avatar {
  background: var(--usx-color-tertiary-container);
  color: var(--usx-color-on-tertiary-container);
}

.chat-message-content {
  flex: 1;
  min-width: 0;
}

.chat-message-text {
  font-family: var(--gridui-font-family, 'Source Code Pro', 'JetBrains Mono', 'Courier New', monospace);
  font-size: calc(var(--gridui-font-size, 14px) * 0.95);
  color: var(--usx-color-on-surface);
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.chat-message-time {
  font-size: calc(var(--gridui-font-size, 14px) * 0.8);
  color: var(--usx-color-on-surface-variant);
  margin-top: 4px;
}

/* ─── Loading ───────────────────────────────────────────────────── */
.chat-loading {
  display: flex;
  gap: 4px;
  padding: 8px 0;
  align-items: center;
}

.chat-loading-dot {
  width: calc(var(--gridui-font-size, 14px) * 0.6);
  height: calc(var(--gridui-font-size, 14px) * 0.6);
  border-radius: 50%;
  background: var(--usx-color-primary);
  animation: chat-loading-bounce 1.4s ease-in-out infinite both;
}

.chat-loading-dot:nth-child(1) { animation-delay: -0.32s; }
.chat-loading-dot:nth-child(2) { animation-delay: -0.16s; }
.chat-loading-dot:nth-child(3) { animation-delay: 0s; }

@keyframes chat-loading-bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* ─── Input ─────────────────────────────────────────────────────── */
.chat-input-area {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--usx-color-outline-variant);
  flex-shrink: 0;
}

.chat-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--usx-color-outline-variant);
  border-radius: var(--md-sys-shape-corner-extra-small);
  background: var(--usx-color-background);
  color: var(--usx-color-on-surface);
  font-family: var(--gridui-font-family, 'Source Code Pro', 'JetBrains Mono', 'Courier New', monospace);
  font-size: calc(var(--gridui-font-size, 14px) * 0.95);
  outline: none;
  transition: border-color 0.15s;
}

.chat-input:focus {
  border-color: var(--usx-color-primary);
}

.chat-input::placeholder {
  color: var(--usx-color-on-surface-variant);
}

.chat-send-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: calc(var(--gridui-font-size, 14px) * 2.6);
  height: calc(var(--gridui-font-size, 14px) * 2.6);
  border: none;
  background: var(--usx-color-primary);
  color: var(--usx-color-on-primary);
  cursor: pointer;
  border-radius: var(--md-sys-shape-corner-full);
  transition: opacity 0.15s;
  flex-shrink: 0;
}

.chat-send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.chat-send-btn:not(:disabled):hover {
  opacity: 0.9;
}

/* ─── Scrollbar ─────────────────────────────────────────────────── */
.chat-messages::-webkit-scrollbar {
  width: 4px;
}

.chat-messages::-webkit-scrollbar-track {
  background: transparent;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: var(--usx-color-outline-variant);
  border-radius: 2px;
}

</style>

