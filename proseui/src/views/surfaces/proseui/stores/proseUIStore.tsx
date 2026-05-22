/* ═══════════════════════════════════════════════════════════════════
   proseUIStore — React state for ProseUISurface
   M3-style colour schemes with built-in light/dark variants.
   ═══════════════════════════════════════════════════════════════════ */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

export type FontStyle = 'sans' | 'serif' | 'mono'

/** M3 colour scheme — each palette has both light and dark tokens */
export interface M3Scheme {
  id: string
  label: string
  light: {
    background: string
    surface: string
    primary: string
    onSurface: string
    onSurfaceVariant: string
    outline: string
  }
  dark: {
    background: string
    surface: string
    primary: string
    onSurface: string
    onSurfaceVariant: string
    outline: string
  }
}

export type ThemeMode = 'light' | 'dark'

export interface ChatMessage { role: 'user' | 'assistant'; content: string }

export interface ProseUIStoreValue {
  scheme: M3Scheme
  setScheme: (s: M3Scheme) => void
  schemes: M3Scheme[]
  themeMode: ThemeMode
  toggleTheme: () => void
  fontSize: number
  setFontSize: (size: number) => void
  increaseFont: () => void
  decreaseFont: () => void
  fontStyle: FontStyle
  setFontStyle: (style: FontStyle) => void
  cycleFontStyle: () => void
  activeView: string
  setActiveView: (v: string) => void
  chatOpen: boolean
  toggleChat: () => void
  chatMessages: ChatMessage[]
  chatInput: string
  setChatInput: (v: string) => void
  sendChat: () => void
}


const M3_SCHEMES: M3Scheme[] = [
  {
    id: 'paper',
    label: 'Paper',
    light: {
      background: '#f5f0e8',
      surface: '#ede7d9',
      primary: '#8b5e3c',
      onSurface: '#3d3229',
      onSurfaceVariant: '#7a6b5a',
      outline: '#d4c9b8',
    },
    dark: {
      background: '#1a1612',
      surface: '#2a241e',
      primary: '#c49a6c',
      onSurface: '#e8e0d4',
      onSurfaceVariant: '#9a8b7a',
      outline: '#4a4036',
    },
  },
  {
    id: 'parchment',
    label: 'Parchment',
    light: {
      background: '#faf3e0',
      surface: '#f5ecd0',
      primary: '#a0522d',
      onSurface: '#3d3028',
      onSurfaceVariant: '#7a6b5a',
      outline: '#d4c4a8',
    },
    dark: {
      background: '#1e1812',
      surface: '#2e261e',
      primary: '#d4845a',
      onSurface: '#e8ddd0',
      onSurfaceVariant: '#9a8b7a',
      outline: '#4a3c30',
    },
  },
  {
    id: 'modern',
    label: 'Modern',
    light: {
      background: '#ffffff',
      surface: '#f5f5f5',
      primary: '#4361ee',
      onSurface: '#1a1a2e',
      onSurfaceVariant: '#6b7280',
      outline: '#e5e7eb',
    },
    dark: {
      background: '#0f172a',
      surface: '#1e293b',
      primary: '#60a5fa',
      onSurface: '#e2e8f0',
      onSurfaceVariant: '#64748b',
      outline: '#334155',
    },
  },
  {
    id: 'forest',
    label: 'Forest',
    light: {
      background: '#f0f7f0',
      surface: '#e4efe4',
      primary: '#2d6a4f',
      onSurface: '#1a2e1a',
      onSurfaceVariant: '#5a7a5a',
      outline: '#c8dcc8',
    },
    dark: {
      background: '#0f1a0f',
      surface: '#1a2e1a',
      primary: '#52b788',
      onSurface: '#d8e8d8',
      onSurfaceVariant: '#7a9a7a',
      outline: '#2a4a2a',
    },
  },
  {
    id: 'sunset',
    label: 'Sunset',
    light: {
      background: '#fef0e8',
      surface: '#fce4d6',
      primary: '#c2410c',
      onSurface: '#3d2018',
      onSurfaceVariant: '#8a6a5a',
      outline: '#e8ccc0',
    },
    dark: {
      background: '#1e1410',
      surface: '#2e2018',
      primary: '#f97316',
      onSurface: '#f0d8cc',
      onSurfaceVariant: '#a07a6a',
      outline: '#4a3428',
    },
  },
]

const ProseUIContext = createContext<ProseUIStoreValue | undefined>(undefined)

const STORAGE_KEY = 'proseui-prefs'

interface PersistedPrefs {
  schemeId: string
  themeMode: ThemeMode
  fontSize: number
  fontStyle: FontStyle
}

function loadPrefs(): PersistedPrefs | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as PersistedPrefs
  } catch {
    return null
  }
}

function savePrefs(prefs: PersistedPrefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  } catch { /* quota exceeded, ignore */ }
}

function getChatResponse(text: string): string {
  const lower = text.toLowerCase()
  if (lower.includes('publish') || lower.includes('publish')) {
    return 'I can help you publish documents. Use the Editor view to write content, then click the Publish button. Or type `publish` in the command bar below.'
  }
  if (lower.includes('status') || lower.includes('how many')) {
    return 'Current workspace status: check the Board and List views for document counts.'
  }
  if (lower.includes('help')) {
    return 'I can help with:\n- **Publishing** — Ask about publishing documents\n- **Status** — Ask about workspace status\n- **Navigation** — Use the tabs in the header\n- **Editor** — Write and preview Markdown\n- **Kanban** — Drag cards between columns'
  }
  if (lower.includes('hello') || lower.includes('hi')) {
    return 'Hello! How can I help you with your workspace today?'
  }
  return `I understand you're asking about "${text}". I can help with publishing, workspace status, navigation, and more. Try asking me about "status" or "help".`
}

export const ProseUIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const saved = loadPrefs()
  const initialScheme = saved ? M3_SCHEMES.find(s => s.id === saved.schemeId) || M3_SCHEMES[2] : M3_SCHEMES[2]
  const [scheme, setScheme] = useState<M3Scheme>(initialScheme)
  const [themeMode, setThemeMode] = useState<ThemeMode>(saved?.themeMode ?? 'dark')
  const [fontSize, setFontSize] = useState(saved?.fontSize ?? 16)
  const [fontStyle, setFontStyle] = useState<FontStyle>(saved?.fontStyle ?? 'serif')
  const [activeView, setActiveView] = useState('kanban')
  const [chatOpen, setChatOpen] = useState(true)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hello! I can help you with documents, publishing, and more. Try asking me something.' },
  ])
  const [chatInput, setChatInput] = useState('')

  const setFontSizeDirect = useCallback((size: number) => {
    setFontSize(Math.max(10, Math.min(24, size)))
  }, [])

  const increaseFont = useCallback(() => {
    setFontSize(prev => Math.min(prev + 2, 24))
  }, [])

  const decreaseFont = useCallback(() => {
    setFontSize(prev => Math.max(prev - 2, 10))
  }, [])

  const setFontStyleDirect = useCallback((style: FontStyle) => {
    setFontStyle(style)
  }, [])

  const cycleFontStyle = useCallback(() => {
    const order: FontStyle[] = ['sans', 'serif', 'mono']
    setFontStyle(prev => {
      const idx = order.indexOf(prev)
      return order[(idx + 1) % order.length]
    })
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeMode(prev => prev === 'light' ? 'dark' : 'light')
  }, [])

  const toggleChat = useCallback(() => {
    setChatOpen(prev => !prev)
  }, [])

  const sendChat = useCallback(() => {
    const text = chatInput.trim()
    if (!text) return
    setChatMessages(prev => [...prev, { role: 'user', content: text }])
    setChatInput('')
    setTimeout(() => {
      setChatMessages(prev => [...prev, { role: 'assistant', content: getChatResponse(text) }])
    }, 300)
  }, [chatInput])

  // Persist prefs whenever they change
  useEffect(() => {
    savePrefs({ schemeId: scheme.id, themeMode, fontSize, fontStyle })
  }, [scheme.id, themeMode, fontSize, fontStyle])

  const value: ProseUIStoreValue = {
    scheme, setScheme,
    schemes: M3_SCHEMES,
    themeMode, toggleTheme,
    fontSize, setFontSize: setFontSizeDirect, increaseFont, decreaseFont,
    fontStyle, setFontStyle: setFontStyleDirect, cycleFontStyle,
    activeView, setActiveView,
    chatOpen, toggleChat,
    chatMessages, chatInput, setChatInput, sendChat,
  }


  return (
    <ProseUIContext.Provider value={value}>
      {children}
    </ProseUIContext.Provider>
  )
}

export const useProseUIStore = (): ProseUIStoreValue => {
  const context = useContext(ProseUIContext)
  if (!context) throw new Error('useProseUIStore must be used within ProseUIProvider')
  return context
}
