import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type GridPanelId = 'terminal' | 'teledesk' | 'dashboard' | 'vault' | 'maps'

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

export const PANELS: GridPanel[] = [
  { id: 'terminal', label: 'Terminal', icon: 'terminal', description: 'C64 BASIC terminal' },
  { id: 'teledesk', label: 'Teledesk', icon: 'live_tv', description: 'Ceefax teletext 40×24' },
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

  return {
    // State
    activePanel,
    chatVisible,
    chatMessages,
    chatInput,
    chatLoading,
    isDark,
    currentPalette,
    gridLayers,
    gridDisplayMode,
    gridCells,
    navRailCollapsed,
    // Computed
    activePanelMeta,
    // Actions
    setActivePanel,
    toggleChat,
    addChatMessage,
    clearChat,
    toggleTheme,
    setPalette,
    toggleLayer,
    setLayerVisibility,
    setGridDisplayMode,
    setGridCells,
    toggleNavRail,
  }
})
