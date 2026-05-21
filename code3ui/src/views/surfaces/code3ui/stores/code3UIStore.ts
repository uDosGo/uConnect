import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface SnackbarMessage {
  message: string
  type: 'info' | 'success' | 'error' | 'warning'
  action?: string
}

export const useCode3UIStore = defineStore('code3ui', () => {
  // ─── Theme ────────────────────────────────────────────────────
  const isDark = ref(false)

  function toggleTheme() {
    isDark.value = !isDark.value
    document.documentElement.classList.toggle('code3ui-dark', isDark.value)
  }

  // ─── Sidebar ──────────────────────────────────────────────────
  const sidebarCollapsed = ref(false)

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  // ─── Chat Panel ───────────────────────────────────────────────
  const chatOpen = ref(false)
  const chatMessages = ref<{ role: string; content: string }[]>([])

  function toggleChat() {
    chatOpen.value = !chatOpen.value
  }

  function addChatMessage(role: string, content: string) {
    chatMessages.value.push({ role, content })
  }

  // ─── Snackbar ─────────────────────────────────────────────────
  const snackbar = ref<SnackbarMessage | null>(null)
  let snackbarTimeout: ReturnType<typeof setTimeout> | null = null

  function showSnackbar(msg: SnackbarMessage) {
    snackbar.value = msg
    if (snackbarTimeout) clearTimeout(snackbarTimeout)
    snackbarTimeout = setTimeout(() => {
      snackbar.value = null
    }, 4000)
  }

  function dismissSnackbar() {
    snackbar.value = null
    if (snackbarTimeout) clearTimeout(snackbarTimeout)
  }

  return {
    isDark,
    toggleTheme,
    sidebarCollapsed,
    toggleSidebar,
    chatOpen,
    toggleChat,
    chatMessages,
    addChatMessage,
    snackbar,
    showSnackbar,
    dismissSnackbar,
  }
})
