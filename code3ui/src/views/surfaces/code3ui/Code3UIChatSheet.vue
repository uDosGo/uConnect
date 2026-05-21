<template>
  <aside class="code3ui-chat" :class="{ open: store.chatOpen }">
    <!-- Chat Header -->
    <div class="chat-header">
      <h3 class="chat-title">
        <span class="material-symbol" style="font-size: 16px; margin-right: 6px; vertical-align: middle;">chat</span>
        Assistant
      </h3>
      <button class="chat-close-btn" @click="store.toggleChat">
        <span class="material-symbol">close</span>
      </button>
    </div>

    <!-- Messages -->
    <div class="chat-messages" ref="messagesContainer">
      <div v-if="store.chatMessages.length === 0" class="chat-empty">
        <span class="material-symbol chat-empty-icon">smart_toy</span>
        <p>Ask me anything about your documents, tasks, or workspace.</p>
      </div>
      <div
        v-for="(msg, idx) in store.chatMessages"
        :key="idx"
        class="chat-message"
        :class="`chat-message--${msg.role}`"
      >
        <div class="chat-message-avatar">
          <span class="material-symbol" style="font-size: 16px">{{ msg.role === 'user' ? 'person' : 'smart_toy' }}</span>
        </div>
        <div class="chat-message-content">{{ msg.content }}</div>
      </div>
    </div>

    <!-- Input -->
    <div class="chat-input-area">
      <div class="chat-input-wrapper">
        <input
          v-model="inputText"
          type="text"
          class="chat-input"
          placeholder="Type a message..."
          @keydown.enter="sendMessage"
        />
        <button class="chat-send-btn" @click="sendMessage" :disabled="!inputText.trim()">
          <span class="material-symbol">send</span>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useCode3UIStore } from './stores/code3UIStore'

const store = useCode3UIStore()
const inputText = ref('')
const messagesContainer = ref<HTMLElement | null>(null)

async function sendMessage() {
  const text = inputText.value.trim()
  if (!text) return

  store.addChatMessage('user', text)
  inputText.value = ''

  // Simulate assistant response
  setTimeout(() => {
    store.addChatMessage('assistant', `I received your message: "${text}". This is a simulated response — wire to an actual AI backend for real functionality.`)
    scrollToBottom()
  }, 500)

  await nextTick()
  scrollToBottom()
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}
</script>

<style scoped>
.code3ui-chat {
  width: 0;
  min-width: 0;
  overflow: hidden;
  background: var(--usx-color-surface);
  border-left: 1px solid var(--usx-color-outline);
  display: flex;
  flex-direction: column;
  transition: width 0.25s ease, min-width 0.25s ease;
  font-size: var(--code3ui-font-size);
}

.code3ui-chat.open {
  width: var(--code3ui-chat-width);
  min-width: var(--code3ui-chat-width);
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--usx-color-outline);
  flex-shrink: 0;
}

.chat-title {
  font-size: calc(var(--code3ui-font-size) * 0.9);
  font-weight: 600;
  color: var(--usx-color-on-surface);
  margin: 0;
}

.chat-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: var(--md-sys-shape-corner-extra-small);
  background: transparent;
  color: var(--usx-color-on-surface-variant);
  cursor: pointer;
  transition: all 0.15s;
}

.chat-close-btn:hover {
  background: var(--usx-color-surface-variant);
  color: var(--usx-color-on-surface);
}

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
  height: 100%;
  text-align: center;
  color: var(--usx-color-on-surface-variant);
  font-size: calc(var(--code3ui-font-size) * 0.85);
  padding: 24px;
  gap: 12px;
}

.chat-empty-icon {
  font-size: 48px;
}

.chat-message {
  display: flex;
  gap: 8px;
  max-width: 100%;
}

.chat-message--user {
  flex-direction: row-reverse;
}

.chat-message-avatar {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--usx-color-surface-variant);
  font-size: 14px;
}

.chat-message-content {
  padding: 8px 12px;
  border-radius: var(--md-sys-shape-corner-small);
  font-size: calc(var(--code3ui-font-size) * 0.85);
  line-height: 1.4;
  max-width: 80%;
  word-wrap: break-word;
}

.chat-message--user .chat-message-content {
  background: var(--usx-color-primary);
  color: var(--usx-color-on-primary);
  border-bottom-right-radius: var(--md-sys-shape-corner-extra-small);
}

.chat-message--assistant .chat-message-content {
  background: var(--usx-color-surface-variant);
  color: var(--usx-color-on-surface);
  border-bottom-left-radius: var(--md-sys-shape-corner-extra-small);
}

.chat-input-area {
  padding: 12px 16px;
  border-top: 1px solid var(--usx-color-outline);
  flex-shrink: 0;
}

.chat-input-wrapper {
  display: flex;
  gap: 8px;
  align-items: center;
}

.chat-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--usx-color-outline);
  border-radius: var(--md-sys-shape-corner-full);
  background: var(--usx-color-surface-variant);
  color: var(--usx-color-on-surface);
  font-family: inherit;
  font-size: calc(var(--code3ui-font-size) * 0.85);
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
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: var(--usx-color-primary);
  color: var(--usx-color-on-primary);
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}

.chat-send-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.chat-send-btn:disabled {
  opacity: 0.38;
  cursor: not-allowed;
}

.chat-messages::-webkit-scrollbar {
  width: 4px;
}

.chat-messages::-webkit-scrollbar-track {
  background: transparent;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: var(--usx-color-outline);
  border-radius: 2px;
}
</style>
