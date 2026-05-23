/* ═══════════════════════════════════════════════════════════════════
   code3ui — Zustand Store (React)
   Manages theme, palette, font, sidebar, chat, and snackbar state.
   Uses USX palette CSS classes from @usx/palettes/base.css.
   ═══════════════════════════════════════════════════════════════════ */
import { create } from 'zustand'

export interface SnackbarMessage {
  message: string
  type: 'info' | 'success' | 'error' | 'warning'
  action?: string
}

export interface PaletteEntry {
  id: string
  label: string
  cssClass: string
  lightBg: string
  lightAccent: string
  darkBg: string
  darkAccent: string
}

export type FontStyle = 'sans' | 'serif' | 'mono'

// ─── USX Palette Entries (user-controllable for uCode3+) ──────────
const PALETTES: PaletteEntry[] = [
  { id: 'notion',     label: 'Notion',     cssClass: 'palette-notion',     lightBg: '#ffffff',   lightAccent: '#37352f', darkBg: '#191919',   darkAccent: '#d4d4d0' },
  { id: 'paper',      label: 'Paper',      cssClass: 'palette-paper',      lightBg: '#f5f0e8',   lightAccent: '#8b7355', darkBg: '#1a1a1a',   darkAccent: '#c4b998' },
  { id: 'parchment',  label: 'Parchment',  cssClass: 'palette-parchment',  lightBg: '#e8dcc8',   lightAccent: '#8b6914', darkBg: '#1e1a10',   darkAccent: '#d4b84c' },
  { id: 'modern',     label: 'Modern',     cssClass: 'palette-modern',     lightBg: '#ffffff',   lightAccent: '#1a73e8', darkBg: '#1a1a2e',   darkAccent: '#6cb4ee' },
  { id: 'dark',       label: 'Dark',       cssClass: 'palette-dark',       lightBg: '#1a1a1a',   lightAccent: '#bb86fc', darkBg: '#0d0d0d',   darkAccent: '#bb86fc' },
]

interface Code3UIState {
  // Theme
  isDark: boolean
  toggleTheme: () => void

  // Palette
  palette: PaletteEntry
  palettes: PaletteEntry[]
  setPalette: (p: PaletteEntry) => void
  cyclePalette: () => void

  // Font
  fontSize: number
  increaseFont: () => void
  decreaseFont: () => void
  fontStyle: FontStyle
  cycleFontStyle: () => void

  // Sidebar
  sidebarCollapsed: boolean
  toggleSidebar: () => void

  // Chat
  chatOpen: boolean
  toggleChat: () => void
  chatMessages: { role: string; content: string }[]
  addChatMessage: (role: string, content: string) => void

  // Snackbar
  snackbar: SnackbarMessage | null
  showSnackbar: (msg: SnackbarMessage) => void
  dismissSnackbar: () => void
}

export const useCode3UIStore = create<Code3UIState>((set, get) => ({
  // ─── Theme ────────────────────────────────────────────────────
  isDark: true,
  toggleTheme: () => {
    set(state => {
      const next = !state.isDark
      document.documentElement.classList.toggle('usx-dark', next)
      return { isDark: next }
    })
  },

  // ─── Palette ──────────────────────────────────────────────────
  palette: PALETTES[0],
  palettes: PALETTES,
  setPalette: (p: PaletteEntry) => {
    // Remove all palette classes, add the new one
    document.documentElement.classList.remove(...PALETTES.map(pp => pp.cssClass))
    document.documentElement.classList.add(p.cssClass)
    set({ palette: p })
  },
  cyclePalette: () => {
    const { palette, palettes } = get()
    const idx = palettes.findIndex(p => p.id === palette.id)
    const next = palettes[(idx + 1) % palettes.length]
    get().setPalette(next)
  },

  // ─── Font Size ────────────────────────────────────────────────
  fontSize: 14,
  increaseFont: () => set(state => {
    const next = Math.min(state.fontSize + 1, 24)
    document.documentElement.style.fontSize = `${next}px`
    return { fontSize: next }
  }),
  decreaseFont: () => set(state => {
    const next = Math.max(state.fontSize - 1, 10)
    document.documentElement.style.fontSize = `${next}px`
    return { fontSize: next }
  }),

  // ─── Font Style ───────────────────────────────────────────────
  fontStyle: 'sans',
  cycleFontStyle: () => set(state => {
    const order: FontStyle[] = ['sans', 'serif', 'mono']
    const idx = order.indexOf(state.fontStyle)
    const next = order[(idx + 1) % order.length]
    document.documentElement.classList.remove('font-sans', 'font-serif', 'font-mono')
    document.documentElement.classList.add(`font-${next}`)
    return { fontStyle: next }
  }),

  // ─── Sidebar ──────────────────────────────────────────────────
  sidebarCollapsed: false,
  toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  // ─── Chat ─────────────────────────────────────────────────────
  chatOpen: false,
  toggleChat: () => set(state => ({ chatOpen: !state.chatOpen })),
  chatMessages: [],
  addChatMessage: (role, content) => set(state => ({
    chatMessages: [...state.chatMessages, { role, content }]
  })),

  // ─── Snackbar ─────────────────────────────────────────────────
  snackbar: null,
  showSnackbar: (msg: SnackbarMessage) => {
    set({ snackbar: msg })
    setTimeout(() => {
      set({ snackbar: null })
    }, 4000)
  },
  dismissSnackbar: () => set({ snackbar: null }),
}))
