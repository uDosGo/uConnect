import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type GridPanelId = 'terminal' | 'teledesk' | 'dashboard' | 'vault' | 'maps' | 'ceefax'

export interface GridPanel {
  id: GridPanelId
  label: string
  icon: string // Material Symbols icon name
  description: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
}

export interface GridLayer {
  id: string
  name: string
  visible: boolean
  zIndex: number
  color: string
}

export type GridDisplayMode = 'teletext' | 'mono' | 'wireframe'

export interface GridCell {
  x: number
  y: number
  char: string
  color?: string
  bgColor?: string
}

export interface SnackbarMessage {
  id: string
  message: string
  action?: string
  duration?: number
  type?: 'info' | 'success' | 'warning' | 'error'
}

export const PANELS: GridPanel[] = [
  { id: 'terminal', label: 'Terminal', icon: 'terminal', description: 'C64 BASIC terminal' },
  { id: 'teledesk', label: 'Teledesk', icon: 'live_tv', description: 'Ceefax teletext 40×24' },
  { id: 'ceefax', label: 'Ceefax', icon: 'stadia_controller', description: 'Mode 7 Canvas teletext' },
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', description: 'System stats & tasks' },
  { id: 'vault', label: 'Vault', icon: 'folder', description: 'Ceetex document viewer' },
  { id: 'maps', label: 'Maps', icon: 'map', description: 'USX grid layers & maps' },
]


export const useGridUIStore = defineStore('gridUI', () => {
  // ─── Active Panel ──────────────────────────────────────────────
  const activePanel = ref<GridPanelId>('terminal')

  function setActivePanel(id: GridPanelId) {
    activePanel.value = id
  }

  const activePanelMeta = computed(() =>
    PANELS.find(p => p.id === activePanel.value)
  )

  // ─── Chat ──────────────────────────────────────────────────────
  const chatVisible = ref(false)
  const chatMessages = ref<ChatMessage[]>([])
  const chatInput = ref('')
  const chatLoading = ref(false)

  function toggleChat() {
    chatVisible.value = !chatVisible.value
  }

  function addChatMessage(role: ChatMessage['role'], content: string) {
    chatMessages.value.push({
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      role,
      content,
      timestamp: Date.now(),
    })
  }

  function clearChat() {
    chatMessages.value = []
  }

  // ─── Theme ─────────────────────────────────────────────────────
  const isDark = ref(true)
  const currentPalette = ref<'c64' | 'teletext' | 'nes' | 'modern'>('modern')

  function toggleTheme() {
    isDark.value = !isDark.value
  }

  function setPalette(palette: typeof currentPalette.value) {
    currentPalette.value = palette
  }

  // ─── Font Size ─────────────────────────────────────────────────
  const fontSize = ref(14) // px, range 10–24

  function increaseFontSize() {
    fontSize.value = Math.min(24, fontSize.value + 1)
  }

  function decreaseFontSize() {
    fontSize.value = Math.max(10, fontSize.value - 1)
  }

  // ─── Font Style (3-way toggle: serif / sans / mono) ────────────
  const fontStyle = ref<'serif' | 'sans' | 'mono'>('mono')

  function cycleFontStyle() {
    const order: Array<typeof fontStyle.value> = ['serif', 'sans', 'mono']
    const idx = order.indexOf(fontStyle.value)
    fontStyle.value = order[(idx + 1) % order.length]
  }

  function setFontStyle(style: typeof fontStyle.value) {
    fontStyle.value = style
  }



  // ─── Grid Layers (Maps panel) ──────────────────────────────────
  const gridLayers = ref<GridLayer[]>([
    { id: 'layer-0', name: 'Base Grid', visible: true, zIndex: 0, color: '#1a1a1a' },
    { id: 'layer-1', name: 'System Status', visible: false, zIndex: 1, color: '#00FF00' },
    { id: 'layer-2', name: 'Vault Contents', visible: false, zIndex: 2, color: '#00FFFF' },
    { id: 'layer-3', name: 'Feed Items', visible: false, zIndex: 3, color: '#FFFF00' },
    { id: 'layer-4', name: 'QR Storage', visible: false, zIndex: 4, color: '#FF00FF' },
    { id: 'layer-5', name: 'Overlay', visible: false, zIndex: 5, color: '#FF6600' },
  ])

  function toggleLayer(layerId: string) {
    const layer = gridLayers.value.find(l => l.id === layerId)
    if (layer) layer.visible = !layer.visible
  }

  function setLayerVisibility(layerId: string, visible: boolean) {
    const layer = gridLayers.value.find(l => l.id === layerId)
    if (layer) layer.visible = visible
  }

  // ─── Grid Display Mode ─────────────────────────────────────────
  const gridDisplayMode = ref<GridDisplayMode>('teletext')

  function setGridDisplayMode(mode: GridDisplayMode) {
    gridDisplayMode.value = mode
  }

  // ─── Grid Cells (for Maps panel) ───────────────────────────────
  const gridCells = ref<GridCell[]>([])

  function setGridCells(cells: GridCell[]) {
    gridCells.value = cells
  }

  // ─── Navigation Rail Collapse ──────────────────────────────────
  const navRailCollapsed = ref(false)

  function toggleNavRail() {
    navRailCollapsed.value = !navRailCollapsed.value
  }

  // ─── Snackbar / Toast System ───────────────────────────────────
  const snackbarQueue = ref<SnackbarMessage[]>([])
  const activeSnackbar = ref<SnackbarMessage | null>(null)
  let snackbarTimer: ReturnType<typeof setTimeout> | null = null

  function showSnackbar(msg: Omit<SnackbarMessage, 'id'>) {
    const id = `snack-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    const snack: SnackbarMessage = { ...msg, id, duration: msg.duration ?? 4000, type: msg.type ?? 'info' }
    snackbarQueue.value.push(snack)
    processSnackbarQueue()
  }

  function processSnackbarQueue() {
    if (activeSnackbar.value || snackbarQueue.value.length === 0) return
    const next = snackbarQueue.value.shift()!
    activeSnackbar.value = next
    if (snackbarTimer) clearTimeout(snackbarTimer)
    snackbarTimer = setTimeout(() => {
      dismissSnackbar()
    }, next.duration)
  }

  function dismissSnackbar() {
    activeSnackbar.value = null
    if (snackbarTimer) {
      clearTimeout(snackbarTimer)
      snackbarTimer = null
    }
    processSnackbarQueue()
  }

  return {
    // State
    activePanel,
    chatVisible,
    chatMessages,
    chatInput,
    chatLoading,
    isDark,
    currentPalette,
    fontSize,
    fontStyle,
    gridLayers,
    gridDisplayMode,
    gridCells,
    navRailCollapsed,
    snackbarQueue,
    activeSnackbar,
    // Computed
    activePanelMeta,
    // Actions
    setActivePanel,
    toggleChat,
    addChatMessage,
    clearChat,
    toggleTheme,
    setPalette,
    increaseFontSize,
    decreaseFontSize,
    cycleFontStyle,
    setFontStyle,
    toggleLayer,
    setLayerVisibility,
    setGridDisplayMode,
    setGridCells,
    toggleNavRail,
    showSnackbar,
    dismissSnackbar,
  }

})
