<template>
  <div
    class="proseui-surface"
    :class="[
      `palette-${store.palette}`,
      `font-${store.fontStyle}`,
      store.themeMode === 'dark' ? 'dark' : '',
    ]"
    :style="{ fontSize: store.fontSize + 'px' }"
  >
    <!-- ═══ Header ═══ -->
    <header class="proseui-header">
      <div class="proseui-header-left">
        <span class="proseui-header-title">proseui</span>
        <span class="text-xs" :style="{ color: 'var(--usx-muted)' }">UDOUI Document Surface</span>
      </div>
      <div class="proseui-header-controls">
        <!-- Palette dot -->
        <span
          class="palette-dot"
          :style="{ background: store.paletteColors.bg, borderColor: store.paletteColors.accent }"
          @click="cyclePalette"
          title="Cycle colour palette"
        ></span>

        <!-- Font size -->
        <button class="proseui-header-btn" @click="store.decreaseFont()" title="Decrease font size">
          <span class="material-symbols-outlined" style="font-size: 1rem">text_decrease</span>
        </button>
        <span class="text-xs" style="min-width: 2rem; text-align: center; color: var(--usx-muted)">{{ store.fontSize }}</span>
        <button class="proseui-header-btn" @click="store.increaseFont()" title="Increase font size">
          <span class="material-symbols-outlined" style="font-size: 1rem">text_increase</span>
        </button>

        <!-- Font style -->
        <button class="proseui-header-btn" @click="store.cycleFontStyle()" title="Cycle font style">
          <span class="material-symbols-outlined" style="font-size: 1rem">format_size</span>
        </button>

        <!-- Theme toggle -->
        <button class="proseui-header-btn" @click="store.toggleTheme()" title="Toggle light/dark">
          <span class="material-symbols-outlined" style="font-size: 1rem">
            {{ store.themeMode === 'light' ? 'light_mode' : 'dark_mode' }}
          </span>
        </button>
      </div>
    </header>

    <!-- ═══ Body ═══ -->
    <div class="proseui-body">
      <!-- Nav Rail -->
      <nav class="proseui-nav-rail">
        <button
          v-for="tab in navTabs"
          :key="tab.id"
          class="proseui-nav-btn"
          :class="{ active: store.activeView === tab.id }"
          @click="store.activeView = tab.id"
          :title="tab.label"
        >
          <span class="material-symbols-outlined">{{ tab.icon }}</span>
          <span>{{ tab.label }}</span>
        </button>
      </nav>

      <!-- Main Content -->
      <main class="proseui-main">
        <!-- Kanban Board -->
        <div v-if="store.activeView === 'kanban'" class="kanban-board">
          <div v-for="col in kanbanColumns" :key="col.id" class="kanban-col">
            <div class="kanban-col-header">
              <span class="kanban-col-dot" :style="{ background: col.color }"></span>
              <span class="kanban-col-title">{{ col.title }}</span>
              <span class="kanban-col-count">{{ col.items.length }}</span>
            </div>
            <div class="kanban-col-body">
              <div v-for="item in col.items" :key="item.id" class="kanban-card" draggable="true">
                <div class="kanban-card-title">{{ item.title }}</div>
                <div class="kanban-card-meta">
                  <span class="kanban-card-type">{{ item.type }}</span>
                  <span class="kanban-card-date">{{ item.date }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Table View -->
        <div v-if="store.activeView === 'table'" class="table-view">
          <div class="table-header">
            <span class="table-th">Title</span>
            <span class="table-th">Status</span>
            <span class="table-th">Type</span>
            <span class="table-th">Updated</span>
          </div>
          <div v-for="item in tableItems" :key="item.id" class="table-row">
            <span class="table-td title">{{ item.title }}</span>
            <span class="table-td">
              <span class="status-badge" :class="item.status">{{ item.status }}</span>
            </span>
            <span class="table-td type">{{ item.type }}</span>
            <span class="table-td date">{{ item.date }}</span>
          </div>
        </div>

        <!-- Prose View -->
        <div v-if="store.activeView === 'prose'" class="prose-view">
          <h1>{{ proseDoc.title }}</h1>
          <div class="prose-meta">
            <span>{{ proseDoc.author }}</span>
            <span>{{ proseDoc.date }}</span>
            <span>{{ proseDoc.status }}</span>
          </div>
          <div class="prose-body" v-html="proseDoc.body"></div>
        </div>

        <!-- Editor View -->
        <div v-if="store.activeView === 'editor'" class="editor-view">
          <div class="editor-toolbar">
            <button class="editor-toolbar-btn" title="Bold"><strong>B</strong></button>
            <button class="editor-toolbar-btn" title="Italic"><em>I</em></button>
            <button class="editor-toolbar-btn" title="Code"><span v-text="'</>'"></span></button>
            <button class="editor-toolbar-btn" title="Link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
              </svg>
            </button>
            <button class="editor-toolbar-btn" title="Image">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </button>
            <span class="editor-toolbar-sep"></span>
            <button class="editor-toolbar-btn" title="Preview">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              Preview
            </button>
            <button class="editor-toolbar-btn primary" title="Publish">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="19" x2="12" y2="5"/>
                <polyline points="5 12 12 5 19 12"/>
              </svg>
              Publish
            </button>
          </div>
          <div class="editor-body">
            <textarea
              class="editor-textarea"
              v-model="editorContent"
              placeholder="Start writing in Markdown..."
              spellcheck="false"
            ></textarea>
          </div>
        </div>

        <!-- GitHub View -->
        <div v-if="store.activeView === 'github'" class="github-view">
          <div class="gh-header">
            <div class="gh-repo-info">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <div>
                <div class="gh-repo-name">uDosGo / Connect</div>
                <div class="gh-repo-desc">uDosGo Connect — Surface Manager & Publishing Platform</div>
              </div>
            </div>
            <div class="gh-tabs">
              <span class="gh-tab active">Code</span>
              <span class="gh-tab">Issues</span>
              <span class="gh-tab">Pull Requests</span>
              <span class="gh-tab">Actions</span>
              <span class="gh-tab">Projects</span>
              <span class="gh-tab">Wiki</span>
            </div>
          </div>
          <div class="gh-content">
            <div class="gh-file-list">
              <div class="gh-file-header">
                <span class="gh-file-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
                  </svg>
                </span>
                <span class="gh-branch">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 01-9 9"/>
                  </svg>
                  main
                </span>
              </div>
              <div v-for="file in githubFiles" :key="file.name" class="gh-file-row">
                <span class="gh-file-icon">
                  <svg v-if="file.type === 'dir'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
                  </svg>
                  <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  </svg>
                </span>
                <span class="gh-file-name">{{ file.name }}</span>
                <span class="gh-file-msg">{{ file.message }}</span>
                <span class="gh-file-date">{{ file.date }}</span>
              </div>
            </div>
            <div class="gh-readme">
              <div class="gh-readme-header">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
                README.md
              </div>
              <div class="gh-readme-body">
                <h1>uDosGo Connect</h1>
                <p>Surface Manager & Publishing Platform for the uDos ecosystem.</p>
                <h2>Getting Started</h2>
                <pre><code>npm install
npm run dev</code></pre>
                <h2>Surfaces</h2>
                <ul>
                  <li><strong>uCode1 Terminal</strong> — 40×25 character grid terminal</li>
                  <li><strong>uCode2 Publish</strong> — Document workspace with Kanban, Editor, Prose</li>
                  <li><strong>Dashboard</strong> — NES Classic system dashboard</li>
                  <li><strong>Vibe TUI</strong> — AI chat interface</li>
                  <li><strong>Vault Browser</strong> — File management</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Story Wizard -->
        <div v-if="store.activeView === 'story'" class="story-wrapper">
          <div class="prose-view">
            <h1>Story Wizard</h1>
            <p style="color: var(--usx-muted); margin-bottom: 1rem;">Create step-by-step guides and walkthroughs.</p>
            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
              <div v-for="story in stories" :key="story.id" class="kanban-card" style="width: 200px;">
                <div class="kanban-card-title">{{ story.title }}</div>
                <div class="kanban-card-meta">
                  <span>{{ story.steps }} steps</span>
                  <span>{{ story.status }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Chat Sheet -->
      <aside class="proseui-chat-sheet">
        <div class="proseui-chat-header">
          <span class="material-symbols-outlined" style="font-size: 1.2rem">chat</span>
          <span>Assistant</span>
        </div>
        <div class="proseui-chat-messages" ref="chatMessagesRef">
          <div v-for="(msg, i) in chatMessages" :key="i" class="proseui-chat-msg" :class="msg.role">
            {{ msg.content }}
          </div>
        </div>
        <div class="proseui-chat-input-area">
          <input
            v-model="chatInput"
            class="proseui-chat-input"
            placeholder="Ask about documents..."
            @keyup.enter="sendChat"
          />
          <button class="proseui-chat-send" @click="sendChat">Send</button>
        </div>
      </aside>
    </div>

    <!-- ═══ Command Bar ═══ -->
    <div class="proseui-command-bar">
      <span class="proseui-cmd-prompt">$</span>
      <input
        ref="cmdInput"
        v-model="cmdBuffer"
        type="text"
        class="proseui-cmd-input"
        @keyup.enter="executeCmd"
        placeholder="Type a command..."
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useProseUIStore, type PaletteId } from './stores/proseUIStore'
import './styles/proseui-theme.css'

const store = useProseUIStore()

// ─── Palette cycling ─────────────────────────────────────────────
const paletteOrder: PaletteId[] = ['paper', 'parchment', 'modern', 'dark']
function cyclePalette() {
  const idx = paletteOrder.indexOf(store.palette)
  store.palette = paletteOrder[(idx + 1) % paletteOrder.length]
}

// ─── Nav Tabs ────────────────────────────────────────────────────
const navTabs = [
  { id: 'kanban', icon: 'view_column', label: 'Board' },
  { id: 'table', icon: 'format_list_bulleted', label: 'List' },
  { id: 'prose', icon: 'article', label: 'Prose' },
  { id: 'editor', icon: 'edit_note', label: 'Editor' },
  { id: 'github', icon: 'code', label: 'GitHub' },
  { id: 'story', icon: 'auto_stories', label: 'Story' },
]

// ─── Kanban Data ─────────────────────────────────────────────────
const kanbanColumns = ref([
  {
    id: 'draft', title: 'Draft', color: '#94a3b8',
    items: [
      { id: 'd1', title: 'Getting Started Guide', type: 'doc', date: '2d ago' },
      { id: 'd2', title: 'API Reference v2', type: 'doc', date: '3d ago' },
      { id: 'd3', title: 'Tutorial: Kanban Setup', type: 'tutorial', date: '5d ago' },
    ],
  },
  {
    id: 'review', title: 'Review', color: '#f59e0b',
    items: [
      { id: 'r1', title: 'Architecture Overview', type: 'doc', date: '1d ago' },
      { id: 'r2', title: 'Workflow Automation', type: 'guide', date: '2d ago' },
    ],
  },
  {
    id: 'published', title: 'Published', color: '#22c55e',
    items: [
      { id: 'p1', title: 'Quickstart Guide', type: 'doc', date: '1w ago' },
      { id: 'p2', title: 'USXD Format Spec', type: 'spec', date: '2w ago' },
      { id: 'p3', title: 'uCode1 User Manual', type: 'manual', date: '3w ago' },
      { id: 'p4', title: 'Vault Integration', type: 'guide', date: '1m ago' },
    ],
  },
])

// ─── Table Data ──────────────────────────────────────────────────
const tableItems = ref([
  { id: '1', title: 'Getting Started Guide', status: 'draft', type: 'doc', date: '2026-05-14' },
  { id: '2', title: 'API Reference v2', status: 'draft', type: 'doc', date: '2026-05-13' },
  { id: '3', title: 'Architecture Overview', status: 'review', type: 'doc', date: '2026-05-15' },
  { id: '4', title: 'Workflow Automation', status: 'review', type: 'guide', date: '2026-05-14' },
  { id: '5', title: 'Quickstart Guide', status: 'published', type: 'doc', date: '2026-05-09' },
  { id: '6', title: 'USXD Format Spec', status: 'published', type: 'spec', date: '2026-05-02' },
  { id: '7', title: 'uCode1 User Manual', status: 'published', type: 'manual', date: '2026-04-25' },
  { id: '8', title: 'Vault Integration', status: 'published', type: 'guide', date: '2026-04-16' },
])

// ─── Prose Document ──────────────────────────────────────────────
const proseDoc = ref({
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
<h2>Colour Palettes</h2>
<p>Click the palette dot in the header to cycle through themes: Paper (cream/ink), Parchment (sepia), Modern (white/dark), Dark.</p>
<h2>Font Controls</h2>
<p>Use the A- / A+ buttons to adjust font size, and the format_size button to cycle between sans-serif, serif, and monospace.</p>
<blockquote>
  <p>Use the command bar below to execute publishing commands like <code>publish</code>, <code>status</code>, or <code>help</code>.</p>
</blockquote>`,
})

// ─── Editor ──────────────────────────────────────────────────────
const editorContent = ref(`# New Document

Start writing your content here...

## Section 1

Lorem ipsum dolor sit amet, consectetur adipiscing elit.

## Section 2

- Item one
- Item two
- Item three
`)

// ─── GitHub Files ───────────────────────────────────────────────
const githubFiles = ref([
  { name: 'src/', type: 'dir', message: 'Source code directory', date: '2d ago' },
  { name: 'docs/', type: 'dir', message: 'Documentation', date: '3d ago' },
  { name: 'ui/', type: 'dir', message: 'Vue.js frontend', date: '1d ago' },
  { name: 'package.json', type: 'file', message: 'Project dependencies', date: '1d ago' },
  { name: 'README.md', type: 'file', message: 'Project overview', date: '2d ago' },
  { name: 'tsconfig.json', type: 'file', message: 'TypeScript config', date: '5d ago' },
  { name: 'vite.config.ts', type: 'file', message: 'Vite build config', date: '5d ago' },
])

// ─── Stories ─────────────────────────────────────────────────────
const stories = ref([
  { id: 's1', title: 'Getting Started Walkthrough', steps: 5, status: 'draft' },
  { id: 's2', title: 'Publishing Workflow Guide', steps: 8, status: 'review' },
  { id: 's3', title: 'Vault Integration Tutorial', steps: 6, status: 'published' },
])

// ─── Chat ────────────────────────────────────────────────────────
const chatInput = ref('')
const chatMessages = ref<{ role: string; content: string }[]>([
  { role: 'assistant', content: 'Hello! I can help you with documents, publishing, and more. Try asking me something.' },
])
const chatMessagesRef = ref<HTMLElement | null>(null)

function sendChat() {
  const text = chatInput.value.trim()
  if (!text) return
  chatMessages.value.push({ role: 'user', content: text })
  chatInput.value = ''
  setTimeout(() => {
    chatMessages.value.push({ role: 'assistant', content: `I received your message: "${text}". This is a demo response.` })
    scrollChat()
  }, 500)
  scrollChat()
}

function scrollChat() {
  nextTick(() => {
    if (chatMessagesRef.value) {
      chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
    }
  })
}

// ─── Command Bar ────────────────────────────────────────────────
const cmdInput = ref<HTMLInputElement | null>(null)
const cmdBuffer = ref('')

function executeCmd() {
  const cmd = cmdBuffer.value.trim()
  if (!cmd) return
  cmdBuffer.value = ''
  // Command execution placeholder
}
</script>
