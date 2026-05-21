import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface Snackbar {
  message: string
  type: 'info' | 'success' | 'error'
  action?: string
}

export type FontStyle = 'mono' | 'sans' | 'serif'
export type Palette = 'wireframe' | 'blueprint' | 'terminal' | 'paper'

export const useCode4UIStore = defineStore('code4ui', () => {
  const sidebarCollapsed = ref(false)
  const chatOpen = ref(false)
  const isDark = ref(false)
  const chatMessages = ref<ChatMessage[]>([])
  const snackbar = ref<Snackbar | null>(null)
  const fontSize = ref(14)
  const fontStyle = ref<FontStyle>('mono')
  const currentPalette = ref<Palette>('wireframe')

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function toggleChat() {
    chatOpen.value = !chatOpen.value
  }

  function toggleTheme() {
    isDark.value = !isDark.value
  }

  function increaseFontSize() {
    if (fontSize.value < 24) fontSize.value += 1
  }

  function decreaseFontSize() {
    if (fontSize.value > 10) fontSize.value -= 1
  }

  function cycleFontStyle() {
    const order: FontStyle[] = ['mono', 'sans', 'serif']
    const idx = order.indexOf(fontStyle.value)
    fontStyle.value = order[(idx + 1) % order.length]
  }

  function setPalette(palette: Palette) {
    currentPalette.value = palette
  }

  function cyclePalette() {
    const order: Palette[] = ['wireframe', 'blueprint', 'terminal', 'paper']
    const idx = order.indexOf(currentPalette.value)
    currentPalette.value = order[(idx + 1) % order.length]
  }

  function addChatMessage(role: 'user' | 'assistant', content: string) {
    chatMessages.value.push({ role, content })
  }

  function showSnackbar(message: string, type: 'info' | 'success' | 'error' = 'info', action?: string) {
    snackbar.value = { message, type, action }
    setTimeout(() => {
      snackbar.value = null
    }, 4000)
  }

  function dismissSnackbar() {
    snackbar.value = null
  }

  return {
    sidebarCollapsed,
    chatOpen,
    isDark,
    chatMessages,
    snackbar,
    fontSize,
    fontStyle,
    currentPalette,
    toggleSidebar,
    toggleChat,
    toggleTheme,
    increaseFontSize,
    decreaseFontSize,
    cycleFontStyle,
    setPalette,
    cyclePalette,
    addChatMessage,
    showSnackbar,
    dismissSnackbar,
  }
})
