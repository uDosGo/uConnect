/* ═══════════════════════════════════════════════════════════════════
   code3ui — Main Surface Component (React)
   Notion-style block editor with USX palette theming.
   Original Jotion vendor code: ~/Code/Vendor/jotion
   ═══════════════════════════════════════════════════════════════════ */
import React, { useState, useEffect, useCallback } from 'react'
import { useCode3UIStore } from './stores/code3UIStore'
import Code3UINavRail from './Code3UINavRail'
import Code3UIChatSheet from './Code3UIChatSheet'
import './styles/code3ui-theme.css'

// ─── Types ──────────────────────────────────────────────────────
interface EditorBlock {
  id: string
  type: string
  content: string
  checked?: boolean
  expanded?: boolean
  language?: string
  imageUrl?: string
}

interface Document {
  id: string
  title: string
  icon: string
  coverImage: string | null
  isPublished: boolean
  blocks: EditorBlock[]
  createdAt: string
  updatedAt: string
}

// ─── Sample Documents ───────────────────────────────────────────
const SAMPLE_DOCUMENTS: Document[] = [
  {
    id: 'welcome',
    title: 'Welcome to code3ui',
    icon: 'file',
    coverImage: null,
    isPublished: true,
    blocks: [
      { id: 'b1', type: 'heading1', content: 'Welcome to code3ui' },
      { id: 'b2', type: 'paragraph', content: 'This is the code3ui Surface — a Notion-style document workspace powered by the Jotion integration. It uses the USX LENS/SKIN architecture for full theming and state management.' },
      { id: 'b3', type: 'callout', content: 'code3ui is the standalone Surface app for the uCode3 Jotion workspace. It provides rich document editing with block-based content, real-time collaboration, and USX compatibility.' },
      { id: 'b4', type: 'heading2', content: 'Getting Started' },
      { id: 'b5', type: 'paragraph', content: 'Use the sidebar to navigate between documents. Click "+ New Page" to create a new document. Each block can be customized using the type selector on the left.' },
      { id: 'b6', type: 'to_do', content: 'Explore the block editor', checked: true },
      { id: 'b7', type: 'to_do', content: 'Create your first document', checked: false },
      { id: 'b8', type: 'to_do', content: 'Try different block types', checked: false },
      { id: 'b9', type: 'heading2', content: 'Features' },
      { id: 'b10', type: 'bulleted_list', content: 'Block-based editor with 14 block types' },
      { id: 'b11', type: 'bulleted_list', content: 'Document tree sidebar with search' },
      { id: 'b12', type: 'bulleted_list', content: 'Cover images and document icons' },
      { id: 'b13', type: 'bulleted_list', content: 'Publish/unpublish documents' },
      { id: 'b14', type: 'bulleted_list', content: 'USX LENS/SKIN architecture' },
      { id: 'b15', type: 'heading2', content: 'Code Example' },
      { id: 'b16', type: 'code', content: 'const surface = new JotionSurface({\n  documentId: "welcome",\n  theme: "notion"\n});\n\nsurface.render();', language: 'typescript' },
      { id: 'b17', type: 'quote', content: 'code3ui brings Notion-style editing to the uDos ecosystem with full USX compatibility.' },
    ],
    createdAt: '2026-05-16T10:00:00Z',
    updatedAt: '2026-05-16T22:30:00Z',
  },
  {
    id: 'architecture',
    title: 'Architecture Overview',
    icon: 'layers',
    coverImage: null,
    isPublished: true,
    blocks: [
      { id: 'a1', type: 'heading1', content: 'Architecture Overview' },
      { id: 'a2', type: 'paragraph', content: 'code3ui is built on the USX (Universal Surface eXchange) architecture, which separates concerns into three layers: LENS, SKIN, and Router.' },
      { id: 'a3', type: 'heading2', content: 'LENS Layer' },
      { id: 'a4', type: 'paragraph', content: 'The LENS layer manages all application state and variables. It provides a reactive data store that surfaces can subscribe to for real-time updates.' },
      { id: 'a5', type: 'heading2', content: 'SKIN Layer' },
      { id: 'a6', type: 'paragraph', content: 'The SKIN layer handles all visual presentation. It maps LENS variables to CSS custom properties and component styles, enabling full theme support.' },
      { id: 'a7', type: 'heading2', content: 'Router Layer' },
      { id: 'a8', type: 'paragraph', content: 'The Router connects LENS state to SKIN output through configurable transforms. It defines how data flows from the application to the presentation layer.' },
    ],
    createdAt: '2026-05-15T08:00:00Z',
    updatedAt: '2026-05-16T20:00:00Z',
  },
  {
    id: 'integration',
    title: 'Jotion Integration Plan',
    icon: 'link',
    coverImage: null,
    isPublished: false,
    blocks: [
      { id: 'i1', type: 'heading1', content: 'Jotion → code3ui Integration' },
      { id: 'i2', type: 'paragraph', content: 'The Jotion project (Notion clone by Osadhi) provides the core document editing capabilities. code3ui wraps this as a USX-compatible surface.' },
      { id: 'i3', type: 'heading2', content: 'Integration Points' },
      { id: 'i4', type: 'numbered_list', content: 'Document Editor — BlockNote-based editor with 14 block types' },
      { id: 'i5', type: 'numbered_list', content: 'Convex DB — Real-time backend for document sync' },
      { id: 'i6', type: 'numbered_list', content: 'Clerk Auth — User authentication and session management' },
      { id: 'i7', type: 'numbered_list', content: 'Edge Store — File uploads and cover images' },
      { id: 'i8', type: 'numbered_list', content: 'USX Surface — LENS/SKIN/Router architecture' },
    ],
    createdAt: '2026-05-14T14:00:00Z',
    updatedAt: '2026-05-16T18:00:00Z',
  },
  {
    id: 'roadmap',
    title: 'Development Roadmap',
    icon: 'map',
    coverImage: null,
    isPublished: false,
    blocks: [
      { id: 'r1', type: 'heading1', content: 'Development Roadmap' },
      { id: 'r2', type: 'paragraph', content: 'The code3ui surface is under active development. Here is the planned roadmap:' },
      { id: 'r3', type: 'heading2', content: 'Phase 1: Core Editor' },
      { id: 'r4', type: 'to_do', content: 'Block editor with all 14 block types', checked: true },
      { id: 'r5', type: 'to_do', content: 'Document tree sidebar', checked: true },
      { id: 'r6', type: 'to_do', content: 'Cover images and document icons', checked: true },
      { id: 'r7', type: 'to_do', content: 'Publish/unpublish workflow', checked: true },
      { id: 'r8', type: 'heading2', content: 'Phase 2: Vault Integration' },
      { id: 'r9', type: 'to_do', content: 'Wire to vault-user as source of truth', checked: false },
      { id: 'r10', type: 'to_do', content: 'Overlay vault-shared and vault-global', checked: false },
      { id: 'r11', type: 'to_do', content: 'Contacts, Tasks, Binders, Feeds panels', checked: false },
      { id: 'r12', type: 'to_do', content: 'Full vault file manager (inbox, sandbox)', checked: false },
    ],
    createdAt: '2026-05-14T12:00:00Z',
    updatedAt: '2026-05-16T16:00:00Z',
  },
]

// ─── Sidebar Tabs ───────────────────────────────────────────────
const SIDEBAR_TABS = [
  { id: 'docs', icon: 'description', label: 'Documents' },
  { id: 'contacts', icon: 'contacts', label: 'Contacts' },
  { id: 'tasks', icon: 'checklist', label: 'Tasks' },
  { id: 'binders', icon: 'folder_open', label: 'Binders' },
  { id: 'feeds', icon: 'rss_feed', label: 'Feeds' },
  { id: 'files', icon: 'folder', label: 'Files' },
]

// ─── Palette Order ──────────────────────────────────────────────
const PALETTE_ORDER = ['notion', 'paper', 'parchment', 'modern', 'dark']

// ─── Block Editor Component ─────────────────────────────────────
interface BlockEditorProps {
  blocks: EditorBlock[]
  onBlocksChange: (blocks: EditorBlock[]) => void
}

const BlockEditor: React.FC<BlockEditorProps> = ({ blocks, onBlocksChange }) => {
  const updateBlock = (index: number, updates: Partial<EditorBlock>) => {
    const next = [...blocks]
    next[index] = { ...next[index], ...updates }
    onBlocksChange(next)
  }

  const addBlockAbove = (index: number) => {
    const newBlock: EditorBlock = { id: `b-${Date.now()}`, type: 'paragraph', content: '' }
    const next = [...blocks]
    next.splice(index, 0, newBlock)
    onBlocksChange(next)
  }

  const addBlockBelow = (index: number) => {
    const newBlock: EditorBlock = { id: `b-${Date.now()}`, type: 'paragraph', content: '' }
    const next = [...blocks]
    next.splice(index + 1, 0, newBlock)
    onBlocksChange(next)
  }

  const deleteBlock = (index: number) => {
    const next = blocks.filter((_, i) => i !== index)
    onBlocksChange(next)
  }

  const splitBlock = (index: number) => {
    const block = blocks[index]
    if (block.type !== 'paragraph') return
    // We can't get cursor position easily in React without refs per block,
    // so we split at the end as a simplification
    const mid = Math.floor(block.content.length / 2)
    const before = block.content.slice(0, mid)
    const after = block.content.slice(mid)
    updateBlock(index, { content: before })
    const newBlock: EditorBlock = { id: `b-${Date.now()}`, type: 'paragraph', content: after }
    const next = [...blocks]
    next.splice(index + 1, 0, newBlock)
    onBlocksChange(next)
  }

  const mergeWithPrevious = (index: number) => {
    if (index === 0) return
    const block = blocks[index]
    if (block.content !== '') return
    const prev = blocks[index - 1]
    if (prev.type !== 'paragraph') return
    const next = blocks.filter((_, i) => i !== index)
    onBlocksChange(next)
  }

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      splitBlock(index)
    }
    if (e.key === 'Backspace' && blocks[index].content === '') {
      e.preventDefault()
      mergeWithPrevious(index)
    }
  }

  const copyCode = (block: EditorBlock) => {
    navigator.clipboard.writeText(block.content)
  }

  const uploadImage = (block: EditorBlock) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const idx = blocks.findIndex(b => b.id === block.id)
        if (idx >= 0) updateBlock(idx, { imageUrl: URL.createObjectURL(file) })
      }
    }
    input.click()
  }

  const removeImage = (block: EditorBlock) => {
    const idx = blocks.findIndex(b => b.id === block.id)
    if (idx >= 0) updateBlock(idx, { imageUrl: undefined })
  }

  return (
    <div className="block-editor">
      {blocks.map((block, index) => (
        <div
          key={block.id}
          className={`editor-block block-${block.type} ${!block.content ? 'is-empty' : ''}`}
        >
          {/* Drag Handle */}
          <span className="drag-handle" title="Drag to reorder">
            <svg viewBox="0 0 24 24" fill="currentColor" className="icon-xs">
              <circle cx="9" cy="5" r="1.5" />
              <circle cx="15" cy="5" r="1.5" />
              <circle cx="9" cy="12" r="1.5" />
              <circle cx="15" cy="12" r="1.5" />
              <circle cx="9" cy="19" r="1.5" />
              <circle cx="15" cy="19" r="1.5" />
            </svg>
          </span>

          {/* Block Type Select */}
          <select
            value={block.type}
            onChange={e => {
              const newType = e.target.value
              updateBlock(index, {
                type: newType,
                content: newType === 'divider' ? '──────────────' : block.content,
              })
            }}
            className="block-type-select"
          >
            <option value="paragraph">Text</option>
            <option value="heading1">Heading 1</option>
            <option value="heading2">Heading 2</option>
            <option value="heading3">Heading 3</option>
            <option value="bulleted_list">Bulleted List</option>
            <option value="numbered_list">Numbered List</option>
            <option value="to_do">To-do</option>
            <option value="toggle">Toggle</option>
            <option value="code">Code</option>
            <option value="quote">Quote</option>
            <option value="callout">Callout</option>
            <option value="divider">Divider</option>
            <option value="image">Image</option>
          </select>

          {/* Block Content by Type */}
          {block.type === 'heading1' && (
            <div className="block-content heading-1">
              <input
                value={block.content}
                onChange={e => updateBlock(index, { content: e.target.value })}
                className="block-input heading-input"
                placeholder="Heading 1"
              />
            </div>
          )}
          {block.type === 'heading2' && (
            <div className="block-content heading-2">
              <input
                value={block.content}
                onChange={e => updateBlock(index, { content: e.target.value })}
                className="block-input heading-input"
                placeholder="Heading 2"
              />
            </div>
          )}
          {block.type === 'heading3' && (
            <div className="block-content heading-3">
              <input
                value={block.content}
                onChange={e => updateBlock(index, { content: e.target.value })}
                className="block-input heading-input"
                placeholder="Heading 3"
              />
            </div>
          )}
          {block.type === 'to_do' && (
            <div className="block-content todo-block">
              <input
                type="checkbox"
                checked={block.checked || false}
                onChange={e => updateBlock(index, { checked: e.target.checked })}
                className="todo-checkbox"
              />
              <input
                value={block.content}
                onChange={e => updateBlock(index, { content: e.target.value })}
                className={`block-input todo-input ${block.checked ? 'checked' : ''}`}
                placeholder="To-do item..."
              />
            </div>
          )}
          {block.type === 'toggle' && (
            <div className="block-content toggle-block">
              <button
                className="toggle-btn"
                onClick={() => updateBlock(index, { expanded: !block.expanded })}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-xs">
                  {block.expanded ? (
                    <polyline points="6 9 12 15 18 9" />
                  ) : (
                    <polyline points="9 18 15 12 9 6" />
                  )}
                </svg>
              </button>
              <input
                value={block.content}
                onChange={e => updateBlock(index, { content: e.target.value })}
                className="block-input"
                placeholder="Toggle heading..."
              />
            </div>
          )}
          {block.type === 'code' && (
            <div className="block-content code-block">
              <div className="code-lang-bar">
                <select
                  value={block.language || 'javascript'}
                  onChange={e => updateBlock(index, { language: e.target.value })}
                  className="code-lang-select"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="html">HTML</option>
                  <option value="css">CSS</option>
                  <option value="json">JSON</option>
                  <option value="bash">Bash</option>
                  <option value="plaintext">Plain Text</option>
                </select>
                <button className="copy-btn" onClick={() => copyCode(block)}>Copy</button>
              </div>
              <textarea
                value={block.content}
                onChange={e => updateBlock(index, { content: e.target.value })}
                className="code-textarea"
                placeholder="Write code..."
                spellCheck={false}
              />
            </div>
          )}
          {block.type === 'quote' && (
            <div className="block-content quote-block">
              <textarea
                value={block.content}
                onChange={e => updateBlock(index, { content: e.target.value })}
                className="block-textarea quote-textarea"
                placeholder="Quote..."
              />
            </div>
          )}
          {block.type === 'callout' && (
            <div className="block-content callout-block">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="callout-icon">
                <path d="M9 18h6" /><path d="M10 22h4" />
                <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
              </svg>
              <textarea
                value={block.content}
                onChange={e => updateBlock(index, { content: e.target.value })}
                className="block-textarea callout-textarea"
                placeholder="Callout text..."
              />
            </div>
          )}
          {block.type === 'divider' && (
            <div className="block-content divider-block">
              <hr className="divider" />
            </div>
          )}
          {block.type === 'image' && (
            <div className="block-content image-block">
              {block.imageUrl ? (
                <div className="image-preview">
                  <img src={block.imageUrl} alt="Block image" />
                  <button className="remove-image-btn" onClick={() => removeImage(block)}>
                    <span className="material-symbol" style={{ fontSize: 14 }}>close</span>
                  </button>
                </div>
              ) : (
                <div className="image-upload-area" onClick={() => uploadImage(block)}>
                  <span className="material-symbol" style={{ fontSize: 20 }}>add_photo_alternate</span>
                  <span>Click to upload image</span>
                </div>
              )}
            </div>
          )}
          {block.type === 'bulleted_list' && (
            <div className="block-content list-block">
              <span className="list-marker">•</span>
              <input
                value={block.content}
                onChange={e => updateBlock(index, { content: e.target.value })}
                className="block-input"
                placeholder="List item..."
              />
            </div>
          )}
          {block.type === 'numbered_list' && (
            <div className="block-content list-block">
              <span className="list-marker number-marker">{index + 1}.</span>
              <input
                value={block.content}
                onChange={e => updateBlock(index, { content: e.target.value })}
                className="block-input"
                placeholder="List item..."
              />
            </div>
          )}
          {block.type === 'paragraph' && (
            <div className="block-content paragraph-block">
              <textarea
                value={block.content}
                onChange={e => updateBlock(index, { content: e.target.value })}
                onKeyDown={e => handleKeyDown(e, index)}
                className="block-textarea paragraph-textarea"
                placeholder="Type '/' for commands, or just start writing..."
              />
            </div>
          )}

          {/* Block Actions */}
          <div className="block-actions">
            <button className="block-action-btn add-above" onClick={() => addBlockAbove(index)} title="Add block above">
              <span className="material-symbol" style={{ fontSize: 12 }}>add</span>
            </button>
            <button className="block-action-btn add-below" onClick={() => addBlockBelow(index)} title="Add block below">
              <span className="material-symbol" style={{ fontSize: 12 }}>add</span>
            </button>
            <button className="block-action-btn delete-block" onClick={() => deleteBlock(index)} title="Delete block">
              <span className="material-symbol" style={{ fontSize: 12 }}>delete</span>
            </button>
          </div>
        </div>
      ))}

      <button className="add-block-btn" onClick={() => {
        const newBlock: EditorBlock = { id: `b-${Date.now()}`, type: 'paragraph', content: '' }
        onBlocksChange([...blocks, newBlock])
      }}>
        <span className="material-symbol" style={{ fontSize: 12 }}>add</span>
        Add a block
      </button>
    </div>
  )
}

// ─── Main Surface Component ─────────────────────────────────────
const Code3UISurface: React.FC = () => {
  const store = useCode3UIStore()
  const [activeTab, setActiveTab] = useState('docs')
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null)
  const [documents, setDocuments] = useState<Document[]>(SAMPLE_DOCUMENTS)

  const activeDocument = documents.find(d => d.id === activeDocumentId) || null

  // Initialize palette on mount
  useEffect(() => {
    store.setPalette(store.palette)
    setActiveDocumentId('welcome')
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      store.toggleTheme()
    }
  }, [])

  // ─── Document Actions ─────────────────────────────────────────
  const createDocument = useCallback(() => {
    const now = new Date().toISOString()
    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      title: 'Untitled',
      icon: 'file',
      coverImage: null,
      isPublished: false,
      blocks: [
        { id: `b-${Date.now()}-1`, type: 'heading1', content: 'Untitled' },
        { id: `b-${Date.now()}-2`, type: 'paragraph', content: '' },
      ],
      createdAt: now,
      updatedAt: now,
    }
    setDocuments(prev => [newDoc, ...prev])
    setActiveDocumentId(newDoc.id)
  }, [])

  const deleteDocument = useCallback(() => {
    if (!activeDocument) return
    setDocuments(prev => prev.filter(d => d.id !== activeDocument.id))
    setActiveDocumentId(prev => {
      const remaining = documents.filter(d => d.id !== prev)
      return remaining[0]?.id || null
    })
  }, [activeDocument, documents])

  const togglePublish = useCallback(() => {
    if (!activeDocument) return
    setDocuments(prev => prev.map(d =>
      d.id === activeDocument.id ? { ...d, isPublished: !d.isPublished } : d
    ))
  }, [activeDocument])

  const addCover = useCallback(() => {
    if (!activeDocument) return
    setDocuments(prev => prev.map(d =>
      d.id === activeDocument.id
        ? { ...d, coverImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200' }
        : d
    ))
  }, [activeDocument])

  const removeCover = useCallback(() => {
    if (!activeDocument) return
    setDocuments(prev => prev.map(d =>
      d.id === activeDocument.id ? { ...d, coverImage: null } : d
    ))
  }, [activeDocument])

  const updateBlocks = useCallback((blocks: EditorBlock[]) => {
    if (!activeDocument) return
    setDocuments(prev => prev.map(d =>
      d.id === activeDocument.id ? { ...d, blocks, updatedAt: new Date().toISOString() } : d
    ))
  }, [activeDocument])

  const updateTitle = useCallback((title: string) => {
    if (!activeDocument) return
    setDocuments(prev => prev.map(d =>
      d.id === activeDocument.id ? { ...d, title, updatedAt: new Date().toISOString() } : d
    ))
  }, [activeDocument])

  const formatDate = (dateStr: string): string => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Build CSS classes
  const surfaceClasses = [
    'code3ui-surface',
    store.palette.cssClass,
    `font-${store.fontStyle}`,
    store.isDark ? 'usx-dark' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={surfaceClasses} style={{ '--code3ui-font-size': `${store.fontSize}px` } as React.CSSProperties}>
      {/* Surface Header */}
      <header className="surface-header">
        <div className="header-left">
          {/* Home button */}
          <a
            href="http://localhost:5173"
            className="header-btn"
            title="Back to UI Hub"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>home</span>
          </a>
          <button className="header-btn" onClick={store.toggleSidebar} title="Toggle sidebar">
            <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>menu</span>
          </button>
          <h1 className="header-title">code3ui</h1>
          <span className="header-badge">Jotion Workspace</span>
        </div>
        <div className="header-center">
          <div className="header-breadcrumb">
            <span className="breadcrumb-item">Documents</span>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-item breadcrumb-current">{activeDocument?.title || 'Untitled'}</span>
          </div>
        </div>
        <div className="header-right">
          {/* Palette dot */}
          <span
            className="palette-dot"
            style={{ background: store.palette.lightBg, borderColor: store.palette.lightAccent }}
            onClick={store.cyclePalette}
            title="Cycle colour palette"
          />

          {/* Font size */}
          <button className="header-btn" onClick={store.decreaseFont} title="Decrease font size">
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>text_decrease</span>
          </button>
          <span className="text-xs" style={{ minWidth: '2rem', textAlign: 'center', color: 'var(--usx-color-on-surface-variant)' }}>
            {store.fontSize}
          </span>
          <button className="header-btn" onClick={store.increaseFont} title="Increase font size">
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>text_increase</span>
          </button>

          {/* Font style */}
          <button className="header-btn" onClick={store.cycleFontStyle} title="Cycle font style">
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>format_size</span>
          </button>

          <button className="header-btn" onClick={store.toggleChat} title={store.chatOpen ? 'Close chat' : 'Open chat'}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>chat</span>
          </button>
          <button className="header-btn" onClick={store.toggleTheme} title={store.isDark ? 'Light mode' : 'Dark mode'}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>
              {store.isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
        </div>
      </header>

      {/* Workspace Layout */}
      <div className="workspace-layout">
        {/* Nav Rail Sidebar */}
        <Code3UINavRail
          activeTab={activeTab}
          tabs={SIDEBAR_TABS}
          onTabChange={setActiveTab}
        />

        {/* Main Content Area */}
        <main className="doc-main">
          {/* Documents Tab */}
          {activeTab === 'docs' && (
            <>
              {/* Empty State */}
              {!activeDocument ? (
                <div className="empty-state">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="empty-icon">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  <h2>Welcome to code3ui</h2>
                  <p>Select a document from the sidebar or create a new one.</p>
                  <button className="create-btn" onClick={createDocument}>
                    <span className="material-symbol" style={{ fontSize: 16 }}>add</span>
                    Create New Document
                  </button>
                </div>
              ) : (
                /* Document Editor */
                <div className="document-editor">
                  {/* Cover Image */}
                  {activeDocument.coverImage ? (
                    <div className="cover-image-container">
                      <img src={activeDocument.coverImage} alt="Cover" className="cover-image" />
                      <button className="remove-cover-btn" onClick={removeCover}>
                        <span className="material-symbol" style={{ fontSize: 14 }}>close</span>
                      </button>
                    </div>
                  ) : (
                    <div className="cover-placeholder" onClick={addCover}>
                      <span className="material-symbol" style={{ fontSize: 20 }}>add_photo_alternate</span>
                      <span>Add Cover</span>
                    </div>
                  )}

                  {/* Document Header */}
                  <div className="doc-header">
                    <div className="doc-icon-area">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="doc-icon-large">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      <button className="change-icon-btn">Change</button>
                    </div>
                    <input
                      value={activeDocument.title}
                      onChange={e => updateTitle(e.target.value)}
                      className="doc-title-input"
                      placeholder="Untitled"
                    />
                  </div>

                  {/* Block Editor */}
                  <BlockEditor
                    blocks={activeDocument.blocks}
                    onBlocksChange={updateBlocks}
                  />

                  {/* Document Footer */}
                  <div className="doc-footer">
                    <div className="footer-left">
                      <span className="footer-info">Last edited: {formatDate(activeDocument.updatedAt)}</span>
                      {activeDocument.isPublished && (
                        <span className="published-badge">
                          <span className="material-symbol" style={{ fontSize: 12 }}>language</span>
                          Published
                        </span>
                      )}
                    </div>
                    <div className="footer-right">
                      <button className="footer-btn" onClick={togglePublish}>
                        {activeDocument.isPublished ? 'Unpublish' : 'Publish'}
                      </button>
                      <button className="footer-btn trash-btn" onClick={deleteDocument}>
                        <span className="material-symbol" style={{ fontSize: 14 }}>delete</span>
                        Move to Trash
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Other Tabs (placeholder) */}
          {activeTab === 'contacts' && (
            <div className="panel-placeholder">
              <span className="material-symbol panel-icon">contacts</span>
              <h3>Contacts</h3>
              <p>Contact management panel — coming soon.</p>
            </div>
          )}
          {activeTab === 'tasks' && (
            <div className="panel-placeholder">
              <span className="material-symbol panel-icon">checklist</span>
              <h3>Tasks</h3>
              <p>Task management panel — coming soon.</p>
            </div>
          )}
          {activeTab === 'binders' && (
            <div className="panel-placeholder">
              <span className="material-symbol panel-icon">folder_open</span>
              <h3>Binders</h3>
              <p>Binder management panel — coming soon.</p>
            </div>
          )}
          {activeTab === 'feeds' && (
            <div className="panel-placeholder">
              <span className="material-symbol panel-icon">rss_feed</span>
              <h3>Feeds</h3>
              <p>Feed reader panel — coming soon.</p>
            </div>
          )}
          {activeTab === 'files' && (
            <div className="panel-placeholder">
              <span className="material-symbol panel-icon">folder</span>
              <h3>File Manager</h3>
              <p>Vault file manager panel — coming soon.</p>
            </div>
          )}
        </main>

        {/* Right Chat Panel */}
        <Code3UIChatSheet />
      </div>

      {/* Snackbar */}
      {store.snackbar && (
        <div className={`m3-snackbar m3-snackbar--${store.snackbar.type}`}>
          <span>{store.snackbar.message}</span>
          {store.snackbar.action && (
            <button className="m3-snackbar-action" onClick={store.dismissSnackbar}>
              {store.snackbar.action}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default Code3UISurface
