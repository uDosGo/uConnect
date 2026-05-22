import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface SnackbarMessage {
  message: string
  type: 'info' | 'success' | 'error' | 'warning'
  action?: string
}

export type PaletteId = 'notion' | 'paper' | 'parchment' | 'modern' | 'dark'
export type FontStyle = 'sans' | 'serif' | 'mono'

export const useCode3UIStore = defineStore('code3ui', () => {
  // ─── Theme ────────────────────────────────────────────────────
  const isDark = ref(false)

  function toggleTheme() {
    isDark.value = !isDark.value
    document.documentElement.classList.toggle('code3ui-dark', isDark.value)
  }

  // ─── Colour Palette ───────────────────────────────────────────
  const palette = ref<PaletteId>('notion')

  const paletteColors = ref({
    bg: '#37352f',
    accent: '#e8e7e4',
  })

  function setPalette(p: PaletteId) {
    palette.value = p
    // Update palette dot colors
    const colors: Record<PaletteId, { bg: string; accent: string }> = {
      notion: { bg: '#37352f', accent: '#e8e7e4' },
      paper: { bg: '#f5f0e8', accent: '#8b7355' },
      parchment: { bg: '#e8dcc8', accent: '#8b6914' },
      modern: { bg: '#ffffff', accent: '#1a73e8' },
      dark: { bg: '#1a1a1a', accent: '#bb86fc' },
    }
    paletteColors.value = colors[p]
  }

  // ─── Font Size ────────────────────────────────────────────────
  const fontSize = ref(14)

  function increaseFont() {
    if (fontSize.value < 24) fontSize.value++
  }

  function decreaseFont() {
    if (fontSize.value > 10) fontSize.value--
  }

  // ─── Font Style ───────────────────────────────────────────────
  const fontStyle = ref<FontStyle>('sans')

  function cycleFontStyle() {
    const order: FontStyle[] = ['sans', 'serif', 'mono']
    const idx = order.indexOf(fontStyle.value)
    fontStyle.value = order[(idx + 1) % order.length]
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
    palette,
    paletteColors,
    setPalette,
    fontSize,
    increaseFont,
    decreaseFont,
    fontStyle,
    cycleFontStyle,
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
