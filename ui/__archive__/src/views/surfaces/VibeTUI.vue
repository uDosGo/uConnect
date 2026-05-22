<template>
  <div class="vibe-tui">
    <!-- Surface Header -->
    <div class="surface-header">
      <div class="header-left">
        <SurfaceIcon name="message-square" class="header-icon" :size="24" />
        <div>
          <h1>Vibe Terminal</h1>
          <p class="surface-tagline">AI-powered chat interface for uDOS.</p>
          <p class="surface-definition">
            <strong>What's Vibe?</strong> A conversational interface that lets you talk to uDOS like a chatbot.
            Ask questions, get help, and interact with your system through natural language.
          </p>
        </div>
      </div>
      <div class="header-right">
        <button class="btn-secondary btn-sm" @click="clearChat">
          <SurfaceIcon name="trash" :size="16" />
          Clear
        </button>
      </div>
    </div>

    <!-- Connection Status -->
    <div v-if="!isConnected" class="connection-panel">
      <div class="connection-icon">
        <SurfaceIcon name="lock" :size="48" />
      </div>
      <h3>Sign in to Vibe</h3>
      <p>To chat with uDOS, you'll need to connect first.</p>
      <button class="btn-primary" @click="connectVibe">
        <SurfaceIcon name="message-square" :size="16" />
        Connect Vibe
      </button>
      <p class="helper-text">
        <SurfaceIcon name="info" :size="14" />
        Vibe connects to your local uDOS services
      </p>
    </div>

    <!-- Loading State -->
    <div v-else-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading Vibe terminal...</p>
      <p class="helper-text">This usually takes a few seconds.</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">
        <SurfaceIcon name="alert-circle" :size="48" />
      </div>
      <h3>Couldn't connect to Vibe</h3>
      <p>{{ error }}</p>
      <p class="helper-text">
        Try:
        <br>
        • Refreshing the page
        <br>
        • Checking your internet connection
        <br>
        • Making sure uDOS services are running
      </p>
      <div class="error-actions">
        <button @click="retryConnection" class="btn-primary">
          <SurfaceIcon name="refresh" :size="16" />
          Try Again
        </button>
        <button @click="signOut" class="btn-secondary">
          <SurfaceIcon name="log-out" :size="16" />
          Disconnect
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="messages.length === 0" class="empty-state">
      <div class="empty-icon">
        <SurfaceIcon name="message-square" :size="48" />
      </div>
      <h3>No messages yet</h3>
      <p>Start a conversation with uDOS!</p>
      <p class="helper-text">
        <SurfaceIcon name="info" :size="14" />
        Type a message below and press Enter
      </p>
    </div>

    <!-- Main Content -->
    <div v-else class="chat-container">
      <div class="chat-messages">
        <div
          v-for="(message, index) in messages"
          :key="index"
          class="message"
          :class="message.role"
        >
          <div class="message-avatar">
            <SurfaceIcon :name="message.role === 'user' ? 'user' : 'bot'" :size="20" />
          </div>
          <div class="message-content">
            <p class="message-text">{{ message.content }}</p>
            <p class="message-time" v-if="message.timestamp">
              {{ formatTime(message.timestamp) }}
            </p>
          </div>
        </div>
      </div>

      <div class="chat-input">
        <div class="input-area">
          <textarea
            v-model="inputMessage"
            placeholder="Type your message here..."
            @keyup.enter="sendMessage"
            @input="adjustTextareaHeight"
            ref="textarea"
            rows="1"
          ></textarea>
          <button @click="sendMessage" class="send-button" :disabled="!inputMessage.trim()">
            <SurfaceIcon name="send" :size="20" />
          </button>
        </div>
        <p class="input-hint">
          <SurfaceIcon name="info" :size="14" />
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue'
import { formatDistanceToNow, format } from 'date-fns'
import SurfaceIcon from '@/components/SurfaceIcons.vue'

export default {
  name: 'VibeTUI',
  components: {
    SurfaceIcon
  },
  setup() {
    // State
    const isConnected = ref(false)
    const isLoading = ref(false)
    const error = ref(null)
    const messages = ref([
      {
        role: 'assistant',
        content: 'Hello! I am your uDOS assistant. How can I help you today?',
        timestamp: new Date().toISOString()
      }
    ])
    const inputMessage = ref('')
    const textarea = ref(null)

    // Methods
    const connectVibe = () => {
      isLoading.value = true
      setTimeout(() => {
        isConnected.value = true
        isLoading.value = false
      }, 500)
    }

    const sendMessage = async () => {
      const message = inputMessage.value.trim()
      if (!message) return

      // Add user message
      messages.value.push({
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      })

      inputMessage.value = ''

      // Simulate assistant response
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 500))

      const responses = [
        'I understand. Let me check that for you.',
        'That sounds interesting. I can help with that.',
        'I see. What would you like me to do next?',
        'Understood. Processing your request...',
        'I can help with that. What specific information do you need?',
        'Let me look into that for you.',
        'I\'m on it! Give me a moment to process...',
        'That makes sense. How can I assist further?'
      ]

      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      messages.value.push({
        role: 'assistant',
        content: randomResponse,
        timestamp: new Date().toISOString()
      })
    }

    const clearChat = () => {
      messages.value = [
        {
          role: 'assistant',
          content: 'Chat cleared. How can I help you?',
          timestamp: new Date().toISOString()
        }
      ]
    }

    const signOut = () => {
      isConnected.value = false
      error.value = null
    }

    const retryConnection = () => {
      error.value = null
      connectVibe()
    }

    const adjustTextareaHeight = () => {
      if (textarea.value) {
        textarea.value.style.height = 'auto'
        textarea.value.style.height = `${Math.min(150, textarea.value.scrollHeight)}px`
      }
    }

    const formatTime = (isoString) => {
      const date = new Date(isoString)
      return format(date, 'h:mm a')
    }

    return {
      isConnected,
      isLoading,
      error,
      messages,
      inputMessage,
      textarea,
      connectVibe,
      sendMessage,
      clearChat,
      signOut,
      retryConnection,
      adjustTextareaHeight,
      formatTime
    }
  }
}
</script>

<style>
/* ─── VibeTUI uses USX global tokens from @usx/tokens ──────────── */
/* No local CSS custom properties needed — all colors come from USX */
</style>

<style scoped>
.vibe-tui {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.surface-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 1.5rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-icon {
  color: var(--primary-color);
}

.surface-header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.surface-tagline {
  color: var(--text-secondary);
  margin: 0.5rem 0;
}

.surface-definition {
  color: var(--text-tertiary);
  font-size: 0.9rem;
  margin: 0;
}

.header-right {
  display: flex;
  gap: 0.5rem;
}

/* Connection Panel */
.connection-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  background: var(--surface-background);
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.connection-icon {
  margin-bottom: 1.5rem;
  color: var(--text-secondary);
}

.connection-panel h3 {
  margin-bottom: 0.5rem;
}

.connection-panel p {
  margin-bottom: 1.5rem;
  color: var(--text-secondary);
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 4rem 2rem;
  text-align: center;
}

.error-icon {
  margin-bottom: 1.5rem;
  color: var(--danger-color);
}

.error-state h3 {
  margin-bottom: 0.5rem;
}

.error-state p {
  margin-bottom: 1.5rem;
  color: var(--text-secondary);
}

.error-actions {
  display: flex;
  gap: 0.5rem;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-icon {
  margin-bottom: 1.5rem;
  color: var(--text-tertiary);
}

.empty-state h3 {
  margin-bottom: 0.5rem;
}

.empty-state p {
  margin-bottom: 1.5rem;
  color: var(--text-secondary);
}

/* Chat Container */
.chat-container {
  display: flex;
  flex-direction: column;
  height: calc(100% - 200px);
}

.chat-messages {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.message {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: var(--primary-color);
  color: white;
}

.message.user .message-avatar {
  background: var(--primary-color);
}

.message.assistant .message-avatar {
  background: var(--text-secondary);
  color: white;
}

.message-content {
  flex: 1;
  max-width: 80%;
}

.message.user .message-content {
  max-width: 80%;
  text-align: right;
}

.message-text {
  margin: 0;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  font-size: 0.95rem;
  line-height: 1.5;
}

.message.user .message-text {
  background: var(--user-message-bg);
  color: var(--text-primary);
  border-bottom-right-radius: 0;
}

.message.assistant .message-text {
  background: var(--assistant-message-bg);
  color: var(--text-primary);
  border-bottom-left-radius: 0;
}

.message-time {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin-top: 0.25rem;
}

.message.user .message-time {
  text-align: right;
}

/* Chat Input */
.chat-input {
  margin-top: 1rem;
}

.input-area {
  position: relative;
  display: flex;
  gap: 0.5rem;
}

.input-area textarea {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid var(--input-border);
  border-radius: 12px;
  font-size: 1rem;
  background: var(--background);
  color: var(--text-primary);
  resize: none;
  min-height: 44px;
  max-height: 150px;
  outline: none;
  transition: all 0.2s;
}

.input-area textarea::placeholder {
  color: var(--text-tertiary);
}

.send-button {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.send-button:hover {
  background: var(--primary-hover);
}

.send-button:disabled {
  background: var(--text-tertiary);
  cursor: not-allowed;
}

.input-hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-tertiary);
  margin-top: 0.5rem;
}

/* Buttons */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: var(--primary-hover);
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--surface-background);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: var(--surface-hover);
  border-color: var(--primary-color);
}

.btn-sm {
  padding: 0.25rem 0.75rem;
  font-size: 0.8125rem;
  height: auto;
}

/* Helper Text */
.helper-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-tertiary);
  margin-top: 1rem;
}

/* Scrollbar styling */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: var(--surface-background);
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}
</style>