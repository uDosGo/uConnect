/* ═══════════════════════════════════════════════════════════════════
   code4ui Store — Wireframe Surface State
   Uses the unified useSurfaceStore from @usx/react for shared state,
   with code4ui-specific extensions for wireframe data.
   ═══════════════════════════════════════════════════════════════════ */

import { create } from 'zustand'
import type { ChatMessage } from '@usx/react'

export type FontStyle = 'mono' | 'sans' | 'serif'
export type Palette = 'wireframe' | 'blueprint' | 'terminal' | 'paper'

export interface Snackbar {
  message: string
  type: 'info' | 'success' | 'error'
  action?: string
}

export interface Code4UIState {
  // Surface state
  sidebarCollapsed: boolean
  chatOpen: boolean
  isDark: boolean
  chatMessages: ChatMessage[]
  snackbar: Snackbar | null
  fontSize: number
  fontStyle: FontStyle
  currentPalette: Palette

  // Actions
  toggleSidebar: () => void
  toggleChat: () => void
  toggleTheme: () => void
  increaseFontSize: () => void
  decreaseFontSize: () => void
  cycleFontStyle: () => void
  setPalette: (palette: Palette) => void
  cyclePalette: () => void
  addChatMessage: (role: 'user' | 'assistant', content: string) => void
  showSnackbar: (message: string, type?: 'info' | 'success' | 'error', action?: string) => void
  dismissSnackbar: () => void
}

export const useCode4UIStore = create<Code4UIState>((set, get) => ({
  // Initial state
  sidebarCollapsed: false,
  chatOpen: false,
  isDark: false,
  chatMessages: [],
  snackbar: null,
  fontSize: 14,
  fontStyle: 'mono',
  currentPalette: 'wireframe',

  // Actions
  toggleSidebar: () => set(s => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  toggleChat: () => set(s => ({ chatOpen: !s.chatOpen })),
  toggleTheme: () => set(s => ({ isDark: !s.isDark })),

  increaseFontSize: () => {
    const { fontSize } = get()
    if (fontSize < 24) set({ fontSize: fontSize + 1 })
  },

  decreaseFontSize: () => {
    const { fontSize } = get()
    if (fontSize > 10) set({ fontSize: fontSize - 1 })
  },

  cycleFontStyle: () => {
    const order: FontStyle[] = ['mono', 'sans', 'serif']
    const idx = order.indexOf(get().fontStyle)
    set({ fontStyle: order[(idx + 1) % order.length] })
  },

  setPalette: (palette: Palette) => set({ currentPalette: palette }),

  cyclePalette: () => {
    const order: Palette[] = ['wireframe', 'blueprint', 'terminal', 'paper']
    const idx = order.indexOf(get().currentPalette)
    set({ currentPalette: order[(idx + 1) % order.length] })
  },

  addChatMessage: (role, content) => {
    set(s => ({ chatMessages: [...s.chatMessages, { role, content }] }))
  },

  showSnackbar: (message, type = 'info', action) => {
    set({ snackbar: { message, type, action } })
    setTimeout(() => {
      set({ snackbar: null })
    }, 4000)
  },

  dismissSnackbar: () => set({ snackbar: null }),
}))
