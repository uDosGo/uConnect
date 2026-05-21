import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type PaletteId = 'paper' | 'parchment' | 'modern' | 'dark'
export type FontStyle = 'sans' | 'serif' | 'mono'
export type ThemeMode = 'light' | 'dark'

export const useProseUIStore = defineStore('proseUI', () => {
  // ─── Palette ────────────────────────────────────────────────────
  const palette = ref<PaletteId>('paper')
  const palettes: Record<PaletteId, { bg: string; fg: string; accent: string; muted: string; surface: string; border: string }> = {
    paper:     { bg: '#f5f0e8', fg: '#2c2416', accent: '#8b5e3c', muted: '#9c9278', surface: '#ede4d3', border: '#d4c9b4' },
    parchment: { bg: '#faf3e0', fg: '#3a2a1a', accent: '#a0522d', muted: '#b8a88a', surface: '#f0e6cc', border: '#dcc8a8' },
    modern:    { bg: '#ffffff', fg: '#1a1a2e', accent: '#4361ee', muted: '#8d99ae', surface: '#f8f9fa', border: '#dee2e6' },
    dark:      { bg: '#0f172a', fg: '#e2e8f0', accent: '#60a5fa', muted: '#64748b', surface: '#1e293b', border: '#334155' },
  }
  const paletteColors = computed(() => palettes[palette.value])

  // ─── Font Size ──────────────────────────────────────────────────
  const fontSize = ref(16)
  function increaseFont() { if (fontSize.value < 24) fontSize.value += 2 }
  function decreaseFont() { if (fontSize.value > 10) fontSize.value -= 2 }

  // ─── Font Style ─────────────────────────────────────────────────
  const fontStyle = ref<FontStyle>('sans')
  function cycleFontStyle() {
    const order: FontStyle[] = ['sans', 'serif', 'mono']
    const idx = order.indexOf(fontStyle.value)
    fontStyle.value = order[(idx + 1) % order.length]
  }

  // ─── Theme Mode ─────────────────────────────────────────────────
  const themeMode = ref<ThemeMode>('light')
  function toggleTheme() {
    themeMode.value = themeMode.value === 'light' ? 'dark' : 'light'
  }

  // ─── Active View ────────────────────────────────────────────────
  const activeView = ref<string>('kanban')

  return {
    palette, palettes, paletteColors,
    fontSize, increaseFont, decreaseFont,
    fontStyle, cycleFontStyle,
    themeMode, toggleTheme,
    activeView,
  }
})
