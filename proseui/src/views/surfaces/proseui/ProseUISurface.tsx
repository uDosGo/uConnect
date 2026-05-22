/* ═══════════════════════════════════════════════════════════════════
   ProseUISurface — Document-oriented Surface with Kanban, Table,
   Prose, Editor, GitHub, Story views + Chat Sheet + Command Bar.
   Renders inside ProseSurfaceManager shell (no own header/nav).
   Uses M3 CSS custom properties from parent shell.
   ═══════════════════════════════════════════════════════════════════ */
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { useProseUIStore } from './stores/proseUIStore'
import { Icon } from '@usx/styles/react/icon'
import './styles/proseui-theme.css'

/* ─── Types ─────────────────────────────────────────────────────── */
interface KanbanItem { id: string; title: string; type: string; date: string }
interface KanbanColumn { id: string; title: string; color: string; items: KanbanItem[] }
interface TableItem { id: string; title: string; status: string; type: string; date: string }
interface GitHubFile { name: string; type: 'dir' | 'file'; message: string; date: string; children?: GitHubFile[] }
interface StoryEntry { id: string; title: string; steps: number; status: string }
interface ChatMessage { role: 'user' | 'assistant'; content: string }


const INITIAL_KANBAN: KanbanColumn[] = [
  { id: 'draft', title: 'Draft', color: '#94a3b8', items: [
    { id: 'd1', title: 'Getting Started Guide', type: 'doc', date: '2d ago' },
    { id: 'd2', title: 'API Reference v2', type: 'doc', date: '3d ago' },
    { id: 'd3', title: 'Tutorial: Kanban Setup', type: 'tutorial', date: '5d ago' },
  ]},
  { id: 'review', title: 'Review', color: '#f59e0b', items: [
    { id: 'r1', title: 'Architecture Overview', type: 'doc', date: '1d ago' },
    { id: 'r2', title: 'Workflow Automation', type: 'guide', date: '2d ago' },
  ]},
  { id: 'published', title: 'Published', color: '#22c55e', items: [
    { id: 'p1', title: 'Quickstart Guide', type: 'doc', date: '1w ago' },
    { id: 'p2', title: 'USXD Format Spec', type: 'spec', date: '2w ago' },
    { id: 'p3', title: 'uCode1 User Manual', type: 'manual', date: '3w ago' },
    { id: 'p4', title: 'Vault Integration', type: 'guide', date: '1m ago' },
  ]},
]

const INITIAL_TABLE: TableItem[] = [
  { id: '1', title: 'Getting Started Guide', status: 'draft', type: 'doc', date: '2026-05-14' },
  { id: '2', title: 'API Reference v2', status: 'draft', type: 'doc', date: '2026-05-13' },
  { id: '3', title: 'Architecture Overview', status: 'review', type: 'doc', date: '2026-05-15' },
  { id: '4', title: 'Workflow Automation', status: 'review', type: 'guide', date: '2026-05-14' },
  { id: '5', title: 'Quickstart Guide', status: 'published', type: 'doc', date: '2026-05-09' },
  { id: '6', title: 'USXD Format Spec', status: 'published', type: 'spec', date: '2026-05-02' },
  { id: '7', title: 'uCode1 User Manual', status: 'published', type: 'manual', date: '2026-04-25' },
  { id: '8', title: 'Vault Integration', status: 'published', type: 'guide', date: '2026-04-16' },
]

const PROSE_DOC = {
  title: 'proseui — UDOUI Document Surface',
  author: 'uDos System',
  date: '2026-05-21',
  status: 'Draft',
  body: `<p>Welcome to <strong>proseui</strong>, the UDOUI document-oriented surface for uCode2.</p>
<h2>Getting Started</h2>
<p>Use the nav rail to switch between views:</p>
<ul>
  <li><strong>Board</strong> — Kanban-style workflow for tracking document progress</li>
  <li><strong>List</strong> — Table view of all documents with status and metadata</li>
  <li><strong>Prose</strong> — Read and preview rendered content</li>
  <li><strong>Editor</strong> — Write and edit Markdown documents</li>
  <li><strong>GitHub</strong> — Repository browser with file tree and README</li>
  <li><strong>Story</strong> — Create step-by-step guides and walkthroughs</li>
</ul>
<h2>Colour Schemes</h2>
<p>Click the palette button in the topbar to choose from M3 colour schemes: Paper, Parchment, Modern, Forest, Sunset.</p>
<h2>Font Controls</h2>
<p>Use the A- / A+ buttons to adjust font size, and the format_size button to cycle between sans-serif, serif, and monospace.</p>
<blockquote><p>Use the command bar below to execute publishing commands like <code>publish</code>, <code>status</code>, or <code>help</code>.</p></blockquote>`,
}

const INITIAL_GITHUB_FILES: GitHubFile[] = [
  { name: 'src/', type: 'dir', message: 'Source code directory', date: '2d ago', children: [
    { name: 'components/', type: 'dir', message: 'React components', date: '2d ago', children: [
      { name: 'App.tsx', type: 'file', message: 'Main app component', date: '2d ago' },
      { name: 'Header.tsx', type: 'file', message: 'Header component', date: '2d ago' },
    ]},
    { name: 'main.tsx', type: 'file', message: 'Entry point', date: '2d ago' },
  ]},
  { name: 'docs/', type: 'dir', message: 'Documentation', date: '3d ago', children: [
    { name: 'README.md', type: 'file', message: 'Project docs', date: '3d ago' },
    { name: 'API.md', type: 'file', message: 'API reference', date: '3d ago' },
  ]},
  { name: 'ui/', type: 'dir', message: 'Vue.js frontend', date: '1d ago', children: [
    { name: 'index.vue', type: 'file', message: 'Main view', date: '1d ago' },
  ]},
  { name: 'package.json', type: 'file', message: 'Project dependencies', date: '1d ago' },
  { name: 'README.md', type: 'file', message: 'Project overview', date: '2d ago' },
  { name: 'tsconfig.json', type: 'file', message: 'TypeScript config', date: '5d ago' },
  { name: 'vite.config.ts', type: 'file', message: 'Vite build config', date: '5d ago' },
]

const INITIAL_STORIES: StoryEntry[] = [
  { id: 's1', title: 'Getting Started Walkthrough', steps: 5, status: 'draft' },
  { id: 's2', title: 'Publishing Workflow Guide', steps: 8, status: 'review' },
  { id: 's3', title: 'Vault Integration Tutorial', steps: 6, status: 'published' },
]

/* ─── Simple Markdown Renderer ──────────────────────────────────── */
function renderMarkdown(md: string): string {
  let html = md
    .replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>')
    // Headings
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold & italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote><p>$1</p></blockquote>')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Horizontal rules
    .replace(/^---$/gm, '<hr>')
    // Paragraphs (double newlines)
    .replace(/\n\n/g, '</p><p>')
    // Line breaks
    .replace(/\n/g, '<br>')
  // Wrap in <p> if not already
  if (!html.startsWith('<h') && !html.startsWith('<p')) {
    html = '<p>' + html + '</p>'
  }
  return html
}

/* ─── Component ─────────────────────────────────────────────────── */
const ProseUISurface: React.FC = () => {
  const store = useProseUIStore()
  const location = useLocation()

  // Derive active view from URL path
  const pathTab = location.pathname.split('/').pop() || 'board'
  const activeView = pathTab === 'board' ? 'kanban' : pathTab === 'list' ? 'table' : pathTab


  /* ── Kanban state ── */
  const [kanbanColumns, setKanbanColumns] = useState<KanbanColumn[]>(INITIAL_KANBAN)
  const [dragItem, setDragItem] = useState<{ item: KanbanItem; colId: string } | null>(null)
  const [showAddCard, setShowAddCard] = useState(false)
  const [addCardCol, setAddCardCol] = useState('')
  const [addCardTitle, setAddCardTitle] = useState('')

  /* ── Table state ── */
  const [tableItems] = useState<TableItem[]>(INITIAL_TABLE)
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [selectedRow, setSelectedRow] = useState<string | null>(null)

  /* ── Editor state ── */
  const [editorContent, setEditorContent] = useState(() => {
    try { return localStorage.getItem('proseui-editor') || '# New Document\n\nStart writing your content here...\n\n## Section 1\n\nLorem ipsum dolor sit amet.\n\n## Section 2\n\n- Item one\n- Item two\n- Item three\n' }
    catch { return '# New Document\n\nStart writing your content here...\n\n## Section 1\n\nLorem ipsum dolor sit amet.\n\n## Section 2\n\n- Item one\n- Item two\n- Item three\n' }
  })
  const [showPreview, setShowPreview] = useState(false)
  const [publishStatus, setPublishStatus] = useState<string | null>(null)

  /* ── GitHub state ── */
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set(['src/', 'docs/']))

  /* ── Story state ── */
  const [stories, setStories] = useState<StoryEntry[]>(INITIAL_STORIES)
  const [showStoryDialog, setShowStoryDialog] = useState(false)
  const [storyForm, setStoryForm] = useState({ title: '', steps: 3, status: 'draft' as string })

  /* ── Chat state ── */
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hello! I can help you with documents, publishing, and more. Try asking me something.' },
  ])

  /* ── Command bar state ── */
  const [cmdBuffer, setCmdBuffer] = useState('')
  const [cmdOutput, setCmdOutput] = useState<string | null>(null)

  const chatMessagesRef = useRef<HTMLDivElement>(null)
  const cmdInputRef = useRef<HTMLInputElement>(null)

  /* ── Save editor to localStorage ── */
  useEffect(() => {
    try { localStorage.setItem('proseui-editor', editorContent) } catch {}
  }, [editorContent])

  /* ── Focus command bar ── */
  useEffect(() => { cmdInputRef.current?.focus() }, [])

  /* ── Chat scroll ── */
  const scrollChat = useCallback(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight
    }
  }, [])

  /* ═══════════════════════════════════════════════════════════════
     KANBAN
     ═══════════════════════════════════════════════════════════════ */
  const handleDragStart = (item: KanbanItem, colId: string) => {
    setDragItem({ item, colId })
  }

  const handleDrop = (targetColId: string) => {
    if (!dragItem || dragItem.colId === targetColId) {
      setDragItem(null)
      return
    }
    setKanbanColumns(prev => {
      const next = prev.map(col => ({ ...col, items: [...col.items] }))
      const srcCol = next.find(c => c.id === dragItem.colId)
      const tgtCol = next.find(c => c.id === targetColId)
      if (!srcCol || !tgtCol) return prev
      const idx = srcCol.items.findIndex(i => i.id === dragItem.item.id)
      if (idx === -1) return prev
      const [moved] = srcCol.items.splice(idx, 1)
      tgtCol.items.push(moved)
      return next
    })
    setDragItem(null)
  }

  const deleteKanbanItem = (itemId: string) => {
    setKanbanColumns(prev => prev.map(col => ({
      ...col,
      items: col.items.filter(i => i.id !== itemId),
    })))
  }

  const openAddCard = (colId: string) => {
    setAddCardCol(colId)
    setAddCardTitle('')
    setShowAddCard(true)
  }

  const confirmAddCard = () => {
    if (!addCardTitle.trim()) return
    const newItem: KanbanItem = {
      id: `card-${Date.now()}`,
      title: addCardTitle.trim(),
      type: 'doc',
      date: 'just now',
    }
    setKanbanColumns(prev => prev.map(col =>
      col.id === addCardCol ? { ...col, items: [...col.items, newItem] } : col
    ))
    setShowAddCard(false)
    setAddCardTitle('')
  }

  /* ═══════════════════════════════════════════════════════════════
     TABLE
     ═══════════════════════════════════════════════════════════════ */
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sortedTable = [...tableItems].sort((a, b) => {
    if (!sortKey) return 0
    const aVal = (a as any)[sortKey]?.toLowerCase() ?? ''
    const bVal = (b as any)[sortKey]?.toLowerCase() ?? ''
    const cmp = aVal.localeCompare(bVal)
    return sortDir === 'asc' ? cmp : -cmp
  })

  /* ═══════════════════════════════════════════════════════════════
     GITHUB
     ═══════════════════════════════════════════════════════════════ */
  const toggleDir = (name: string) => {
    setExpandedDirs(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const renderGitHubTree = (files: GitHubFile[], depth = 0) => {
    return files.map(file => {
      const isExpanded = expandedDirs.has(file.name)
      return (
        <React.Fragment key={file.name}>
          <div className="gh-file-row" style={{ paddingLeft: `${12 + depth * 20}px` }}>
            <span className="gh-file-icon" onClick={() => file.type === 'dir' && toggleDir(file.name)} style={{ cursor: file.type === 'dir' ? 'pointer' : 'default' }}>
              {file.type === 'dir' ? (
                <Icon name={isExpanded ? 'folder_open' : 'folder'} size={14} />
              ) : (
                <Icon name="description" size={14} />
              )}
            </span>
            <span className="gh-file-name">{file.name}</span>
            <span className="gh-file-msg">{file.message}</span>
            <span className="gh-file-date">{file.date}</span>
          </div>
          {file.type === 'dir' && isExpanded && file.children && renderGitHubTree(file.children, depth + 1)}
        </React.Fragment>
      )
    })
  }

  /* ═══════════════════════════════════════════════════════════════
     STORY
     ═══════════════════════════════════════════════════════════════ */
  const openNewStory = () => {
    setStoryForm({ title: '', steps: 3, status: 'draft' })
    setShowStoryDialog(true)
  }

  const confirmStory = () => {
    if (!storyForm.title.trim()) return
    const newStory: StoryEntry = {
      id: `story-${Date.now()}`,
      title: storyForm.title.trim(),
      steps: storyForm.steps,
      status: storyForm.status,
    }
    setStories(prev => [...prev, newStory])
    setShowStoryDialog(false)
  }

  const deleteStory = (id: string) => {
    setStories(prev => prev.filter(s => s.id !== id))
  }

  /* ═══════════════════════════════════════════════════════════════
     CHAT
     ═══════════════════════════════════════════════════════════════ */
  const getChatResponse = (text: string): string => {
    const lower = text.toLowerCase()
    if (lower.includes('publish') || lower.includes('publish')) {
      return 'I can help you publish documents. Use the Editor view to write content, then click the Publish button. Or type `publish` in the command bar below.'
    }
    if (lower.includes('status') || lower.includes('how many')) {
      const draftCount = kanbanColumns.find(c => c.id === 'draft')?.items.length ?? 0
      const reviewCount = kanbanColumns.find(c => c.id === 'review')?.items.length ?? 0
      const publishedCount = kanbanColumns.find(c => c.id === 'published')?.items.length ?? 0
      return `Current workspace status:\n- **Draft**: ${draftCount} documents\n- **Review**: ${reviewCount} documents\n- **Published**: ${publishedCount} documents\n- **Stories**: ${stories.length} total`
    }
    if (lower.includes('help')) {
      return 'I can help with:\n- **Publishing** — Ask about publishing documents\n- **Status** — Ask about workspace status\n- **Navigation** — Use the tabs in the header\n- **Editor** — Write and preview Markdown\n- **Kanban** — Drag cards between columns'

    }
    if (lower.includes('hello') || lower.includes('hi')) {
      return 'Hello! How can I help you with your workspace today?'
    }
    return `I understand you're asking about "${text}". I can help with publishing, workspace status, navigation, and more. Try asking me about "status" or "help".`
  }

  const sendChat = () => {
    const text = chatInput.trim()
    if (!text) return
    setChatMessages(prev => [...prev, { role: 'user', content: text }])
    setChatInput('')
    setTimeout(() => {
      setChatMessages(prev => [...prev, { role: 'assistant', content: getChatResponse(text) }])
      scrollChat()
    }, 300)
    scrollChat()
  }

  /* ═══════════════════════════════════════════════════════════════
     COMMAND BAR
     ═══════════════════════════════════════════════════════════════ */
  const executeCmd = () => {
    const cmd = cmdBuffer.trim().toLowerCase()
    if (!cmd) return
    setCmdBuffer('')

    if (cmd === 'help') {
      setCmdOutput('Available commands: publish, status, help, clear')
    } else if (cmd === 'status') {
      const draftCount = kanbanColumns.find(c => c.id === 'draft')?.items.length ?? 0
      const reviewCount = kanbanColumns.find(c => c.id === 'review')?.items.length ?? 0
      const publishedCount = kanbanColumns.find(c => c.id === 'published')?.items.length ?? 0
      setCmdOutput(`Workspace: ${draftCount} draft, ${reviewCount} review, ${publishedCount} published | ${stories.length} stories`)
    } else if (cmd === 'publish') {
      setPublishStatus('Publishing...')
      setTimeout(() => {
        setPublishStatus('Published successfully!')
        setTimeout(() => setPublishStatus(null), 3000)
      }, 1000)
      setCmdOutput('Publishing current document...')
    } else if (cmd === 'clear') {
      setCmdOutput(null)
    } else {
      setCmdOutput(`Unknown command: "${cmd}". Type "help" for available commands.`)
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════ */
  return (
    <div className="proseui-surface">
      {/* ═══ Body: Content + Chat Sheet ═══ */}
      <div className="proseui-surface-body">
        {/* Main Content */}
        <main className="proseui-surface-content">
          {/* ═══ KANBAN ═══ */}
          {activeView === 'kanban' && (

            <div className="kanban-board">
              {kanbanColumns.map(col => (
                <div key={col.id} className="kanban-col"
                     onDragOver={e => e.preventDefault()}
                     onDrop={() => handleDrop(col.id)}>
                  <div className="kanban-col-header">
                    <span className="kanban-col-dot" style={{ background: col.color }} />
                    <span className="kanban-col-title">{col.title}</span>
                    <span className="kanban-col-count">{col.items.length}</span>
                    <button className="kanban-add-btn" onClick={() => openAddCard(col.id)} title="Add card">
                      <Icon name="add" size={14} />
                    </button>
                  </div>
                  <div className="kanban-col-body">
                    {col.items.map(item => (
                      <div key={item.id} className="kanban-card"
                           draggable
                           onDragStart={() => handleDragStart(item, col.id)}>
                        <div className="kanban-card-header">
                          <div className="kanban-card-title">{item.title}</div>
                          <button className="kanban-card-delete" onClick={() => deleteKanbanItem(item.id)} title="Delete card">
                            <Icon name="close" size={12} />
                          </button>
                        </div>
                        <div className="kanban-card-meta">
                          <span className="kanban-card-type">{item.type}</span>
                          <span className="kanban-card-date">{item.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ═══ TABLE ═══ */}
          {activeView === 'table' && (

            <div className="table-view">
              <div className="table-header">
                {['title', 'status', 'type', 'date'].map(key => (
                  <span key={key} className={`table-th ${sortKey === key ? 'sorted' : ''}`}
                        onClick={() => handleSort(key)} style={{ cursor: 'pointer' }}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                    {sortKey === key && <span className="sort-arrow">{sortDir === 'asc' ? ' ▲' : ' ▼'}</span>}
                  </span>
                ))}
              </div>
              {sortedTable.map(item => (
                <div key={item.id} className={`table-row ${selectedRow === item.id ? 'selected' : ''}`}
                     onClick={() => setSelectedRow(selectedRow === item.id ? null : item.id)}>
                  <span className="table-td title">{item.title}</span>
                  <span className="table-td"><span className={`status-badge ${item.status}`}>{item.status}</span></span>
                  <span className="table-td type">{item.type}</span>
                  <span className="table-td date">{item.date}</span>
                </div>
              ))}
              {selectedRow && (
                <div className="table-detail">
                  <p>Selected: <strong>{tableItems.find(i => i.id === selectedRow)?.title}</strong></p>
                  <p>Status: {tableItems.find(i => i.id === selectedRow)?.status}</p>
                  <p>Type: {tableItems.find(i => i.id === selectedRow)?.type}</p>
                  <p>Updated: {tableItems.find(i => i.id === selectedRow)?.date}</p>
                </div>
              )}
            </div>
          )}

          {/* ═══ PROSE ═══ */}
          {activeView === 'prose' && (

            <div className="prose-view">
              <h1>{PROSE_DOC.title}</h1>
              <div className="prose-meta">
                <span>{PROSE_DOC.author}</span><span>{PROSE_DOC.date}</span><span>{PROSE_DOC.status}</span>
              </div>
              <div className="prose-body" dangerouslySetInnerHTML={{ __html: PROSE_DOC.body }} />
            </div>
          )}

          {/* ═══ EDITOR ═══ */}
          {activeView === 'editor' && (
            <div className="editor-view">
              {publishStatus && (
                <div className="editor-publish-status">{publishStatus}</div>
              )}
              <div className={`editor-body ${showPreview ? 'split' : ''}`}>
                <textarea className="editor-textarea" value={editorContent}
                          onChange={e => setEditorContent(e.target.value)}
                          placeholder="Start writing in Markdown..." spellCheck={false} />
                {showPreview && (
                  <div className="editor-preview"
                       dangerouslySetInnerHTML={{ __html: renderMarkdown(editorContent) }} />
                )}
              </div>
            </div>
          )}

          {/* ═══ STORY ═══ */}
          {activeView === 'story' && (

            <div className="story-view">
              <div className="story-header">
                <h2>Story Builder</h2>
                <p className="text-sm" style={{ color: 'var(--m3-on-surface-variant)' }}>Create step-by-step guides and walkthroughs</p>
                <button className="btn-primary btn-sm" onClick={openNewStory} style={{ marginTop: 8 }}>
                  <Icon name="add" size={14} />
                  New Story
                </button>
              </div>
              <div className="story-list">
                {stories.map(story => (
                  <div key={story.id} className="story-card">
                    <div className="story-card-header">
                      <span className="story-card-title">{story.title}</span>
                      <span className={`status-badge ${story.status}`}>{story.status}</span>
                    </div>
                    <div className="story-card-meta">
                      <span>{story.steps} steps</span>
                    </div>
                    <div className="story-card-actions">
                      <button className="btn-icon btn-sm" onClick={() => deleteStory(story.id)} title="Delete story">
                        <Icon name="delete" size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* ═══ Chat Sheet moved to ProseSurfaceManager shell ═══ */}

      </div>

      {/* ═══ Add Card Dialog ═══ */}
      {showAddCard && (
        <div className="modal-overlay" onClick={() => setShowAddCard(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h3>Add Card</h3>
              <button className="btn-icon btn-sm" onClick={() => setShowAddCard(false)}>
                <Icon name="close" size={16} />
              </button>
            </div>
            <div className="modal-body">
              <input type="text" className="modal-input" value={addCardTitle}
                     onChange={e => setAddCardTitle(e.target.value)}
                     onKeyDown={e => { if (e.key === 'Enter') confirmAddCard() }}
                     placeholder="Card title..." autoFocus />
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAddCard(false)}>Cancel</button>
              <button className="btn-primary" onClick={confirmAddCard} disabled={!addCardTitle.trim()}>Add</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Story Dialog ═══ */}
      {showStoryDialog && (
        <div className="modal-overlay" onClick={() => setShowStoryDialog(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h3>New Story</h3>
              <button className="btn-icon btn-sm" onClick={() => setShowStoryDialog(false)}>
                <Icon name="close" size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-field">
                <label>Title</label>
                <input type="text" className="modal-input" value={storyForm.title}
                       onChange={e => setStoryForm(prev => ({ ...prev, title: e.target.value }))}
                       placeholder="Story title..." autoFocus />
              </div>
              <div className="modal-field">
                <label>Steps</label>
                <input type="number" className="modal-input" value={storyForm.steps}
                       onChange={e => setStoryForm(prev => ({ ...prev, steps: parseInt(e.target.value) || 1 }))}
                       min={1} max={50} />
              </div>
              <div className="modal-field">
                <label>Status</label>
                <select className="modal-select" value={storyForm.status}
                        onChange={e => setStoryForm(prev => ({ ...prev, status: e.target.value }))}>
                  <option value="draft">Draft</option>
                  <option value="review">Review</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowStoryDialog(false)}>Cancel</button>
              <button className="btn-primary" onClick={confirmStory} disabled={!storyForm.title.trim()}>Create</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Command Bar (bottom) ═══ */}
      <div className="proseui-cmd-bar">
        <span className="cmd-prompt">$</span>
        <input ref={cmdInputRef} className="cmd-input" type="text" value={cmdBuffer}
               onChange={e => setCmdBuffer(e.target.value)}
               onKeyDown={e => { if (e.key === 'Enter') executeCmd() }}
               placeholder="Type a command (e.g. publish, status, help)..." />
        {cmdOutput && (
          <div className="cmd-output" onClick={() => setCmdOutput(null)}>
            {cmdOutput}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProseUISurface
