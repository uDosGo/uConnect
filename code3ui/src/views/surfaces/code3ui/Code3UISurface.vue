<template>
  <div
    class="code3ui-surface"
    :class="[
      `palette-${store.palette}`,
      `font-${store.fontStyle}`,
      store.isDark ? 'code3ui-dark' : '',
    ]"
    :style="{ '--code3ui-font-size': store.fontSize + 'px' }"
  >
    <!-- Surface Header (USX Toolbar Style) -->
    <header class="surface-header">
      <div class="header-left">
        <button class="header-btn" @click="store.toggleSidebar" title="Toggle sidebar">
          <span class="material-symbols-outlined" style="font-size: 1.2rem">menu</span>
        </button>
        <h1 class="header-title">code3ui</h1>
        <span class="header-badge">Jotion Workspace</span>
      </div>
      <div class="header-center">
        <div class="header-breadcrumb">
          <span class="breadcrumb-item">Documents</span>
          <span class="breadcrumb-sep">/</span>
          <span class="breadcrumb-item breadcrumb-current">{{ activeDocument?.title || 'Untitled' }}</span>
        </div>
      </div>
      <div class="header-right">
        <!-- Palette dot -->
        <span
          class="palette-dot"
          :style="{ background: store.paletteColors.bg, borderColor: store.paletteColors.accent }"
          @click="cyclePalette"
          title="Cycle colour palette"
        ></span>

        <!-- Font size -->
        <button class="header-btn" @click="store.decreaseFont()" title="Decrease font size">
          <span class="material-symbols-outlined" style="font-size: 1rem">text_decrease</span>
        </button>
        <span class="text-xs" style="min-width: 2rem; text-align: center; color: var(--usx-color-on-surface-variant)">{{ store.fontSize }}</span>
        <button class="header-btn" @click="store.increaseFont()" title="Increase font size">
          <span class="material-symbols-outlined" style="font-size: 1rem">text_increase</span>
        </button>

        <!-- Font style -->
        <button class="header-btn" @click="store.cycleFontStyle()" title="Cycle font style">
          <span class="material-symbols-outlined" style="font-size: 1rem">format_size</span>
        </button>

        <button class="header-btn" @click="store.toggleChat" :title="store.chatOpen ? 'Close chat' : 'Open chat'">
          <span class="material-symbols-outlined" style="font-size: 1.2rem">chat</span>
        </button>
        <button class="header-btn" @click="store.toggleTheme" :title="store.isDark ? 'Light mode' : 'Dark mode'">
          <span class="material-symbols-outlined" style="font-size: 1.2rem">{{ store.isDark ? 'light_mode' : 'dark_mode' }}</span>
        </button>
      </div>
    </header>

    <!-- Workspace Layout -->
    <div class="workspace-layout">
      <!-- Nav Rail Sidebar -->
      <Code3UINavRail
        :activeTab="activeTab"
        :tabs="sidebarTabs"
        @tab-change="onTabChange"
      />

      <!-- Main Content Area -->
      <main class="doc-main">
        <!-- Documents Tab -->
        <template v-if="activeTab === 'docs'">
          <!-- Loading State -->
          <div v-if="isLoading" class="loading-state">
            <div class="m3-circular-progress"></div>
            <div class="loading-text">LOADING DOCUMENT...</div>
          </div>

          <!-- Empty State -->
          <div v-else-if="!activeDocument" class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="empty-icon">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <h2>Welcome to code3ui</h2>
            <p>Select a document from the sidebar or create a new one.</p>
            <button class="create-btn" @click="createDocument">
              <span class="material-symbol" style="font-size: 16px">add</span>
              Create New Document
            </button>
          </div>

          <!-- Document Editor -->
          <div v-else class="document-editor">
            <!-- Cover Image -->
            <div v-if="activeDocument.coverImage" class="cover-image-container">
              <img :src="activeDocument.coverImage" alt="Cover" class="cover-image" />
              <button class="remove-cover-btn" @click="removeCover">
                <span class="material-symbol" style="font-size: 14px">close</span>
              </button>
            </div>
            <div v-else class="cover-placeholder" @click="addCover">
              <span class="material-symbol" style="font-size: 20px">add_photo_alternate</span>
              <span>Add Cover</span>
            </div>

            <!-- Document Header -->
            <div class="doc-header">
              <div class="doc-icon-area">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="doc-icon-large">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                <button class="change-icon-btn" @click="changeIcon">Change</button>
              </div>
              <input
                v-model="activeDocument.title"
                class="doc-title-input"
                placeholder="Untitled"
                @input="onTitleChange"
              />
            </div>

            <!-- Block Editor -->
            <div class="block-editor">
              <div
                v-for="(block, index) in activeDocument.blocks"
                :key="block.id"
                class="editor-block"
                :class="[`block-${block.type}`, { 'is-empty': !block.content }]"
              >
                <span class="drag-handle" title="Drag to reorder">
                  <svg viewBox="0 0 24 24" fill="currentColor" class="icon-xs">
                    <circle cx="9" cy="5" r="1.5"/>
                    <circle cx="15" cy="5" r="1.5"/>
                    <circle cx="9" cy="12" r="1.5"/>
                    <circle cx="15" cy="12" r="1.5"/>
                    <circle cx="9" cy="19" r="1.5"/>
                    <circle cx="15" cy="19" r="1.5"/>
                  </svg>
                </span>

                <select
                  v-model="block.type"
                  class="block-type-select"
                  @change="onBlockTypeChange(block)"
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

                <div v-if="block.type === 'heading1'" class="block-content heading-1">
                  <input v-model="block.content" class="block-input heading-input" placeholder="Heading 1" @input="onBlockChange" />
                </div>
                <div v-else-if="block.type === 'heading2'" class="block-content heading-2">
                  <input v-model="block.content" class="block-input heading-input" placeholder="Heading 2" @input="onBlockChange" />
                </div>
                <div v-else-if="block.type === 'heading3'" class="block-content heading-3">
                  <input v-model="block.content" class="block-input heading-input" placeholder="Heading 3" @input="onBlockChange" />
                </div>
                <div v-else-if="block.type === 'to_do'" class="block-content todo-block">
                  <input type="checkbox" v-model="block.checked" class="todo-checkbox" />
                  <input v-model="block.content" class="block-input todo-input" :class="{ checked: block.checked }" placeholder="To-do item..." @input="onBlockChange" />
                </div>
                <div v-else-if="block.type === 'toggle'" class="block-content toggle-block">
                  <button class="toggle-btn" @click="block.expanded = !block.expanded">
                    <svg v-if="!block.expanded" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-xs">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-xs">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>
                  <input v-model="block.content" class="block-input" placeholder="Toggle heading..." @input="onBlockChange" />
                </div>
                <div v-else-if="block.type === 'code'" class="block-content code-block">
                  <div class="code-lang-bar">
                    <select v-model="block.language" class="code-lang-select">
                      <option value="javascript">JavaScript</option>
                      <option value="typescript">TypeScript</option>
                      <option value="python">Python</option>
                      <option value="html">HTML</option>
                      <option value="css">CSS</option>
                      <option value="json">JSON</option>
                      <option value="bash">Bash</option>
                      <option value="plaintext">Plain Text</option>
                    </select>
                    <button class="copy-btn" @click="copyCode(block)">Copy</button>
                  </div>
                  <textarea v-model="block.content" class="code-textarea" placeholder="Write code..." spellcheck="false" @input="onBlockChange"></textarea>
                </div>
                <div v-else-if="block.type === 'quote'" class="block-content quote-block">
                  <textarea v-model="block.content" class="block-textarea quote-textarea" placeholder="Quote..." @input="onBlockChange"></textarea>
                </div>
                <div v-else-if="block.type === 'callout'" class="block-content callout-block">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="callout-icon">
                    <path d="M9 18h6"/><path d="M10 22h4"/>
                    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
                  </svg>
                  <textarea v-model="block.content" class="block-textarea callout-textarea" placeholder="Callout text..." @input="onBlockChange"></textarea>
                </div>
                <div v-else-if="block.type === 'divider'" class="block-content divider-block">
                  <hr class="divider" />
                </div>
                <div v-else-if="block.type === 'image'" class="block-content image-block">
                  <div v-if="block.imageUrl" class="image-preview">
                    <img :src="block.imageUrl" alt="Block image" />
                    <button class="remove-image-btn" @click="removeImage(block)">
                      <span class="material-symbol" style="font-size: 14px">close</span>
                    </button>
                  </div>
                  <div v-else class="image-upload-area" @click="uploadImage(block)">
                    <span class="material-symbol" style="font-size: 20px">add_photo_alternate</span>
                    <span>Click to upload image</span>
                  </div>
                </div>
                <div v-else-if="block.type === 'bulleted_list'" class="block-content list-block">
                  <span class="list-marker">•</span>
                  <input v-model="block.content" class="block-input" placeholder="List item..." @input="onBlockChange" />
                </div>
                <div v-else-if="block.type === 'numbered_list'" class="block-content list-block">
                  <span class="list-marker number-marker">{{ index + 1 }}.</span>
                  <input v-model="block.content" class="block-input" placeholder="List item..." @input="onBlockChange" />
                </div>
                <div v-else class="block-content paragraph-block">
                  <textarea v-model="block.content" class="block-textarea paragraph-textarea" placeholder="Type '/' for commands, or just start writing..." @input="onBlockChange" @keydown.enter.exact.prevent="splitBlock(index)" @keydown.backspace.exact.prevent="mergeWithPrevious(index)"></textarea>
                </div>

                <div class="block-actions">
                  <button class="block-action-btn add-above" @click="addBlockAbove(index)" title="Add block above">
                    <span class="material-symbol" style="font-size: 12px">add</span>
                  </button>
                  <button class="block-action-btn add-below" @click="addBlockBelow(index)" title="Add block below">
                    <span class="material-symbol" style="font-size: 12px">add</span>
                  </button>
                  <button class="block-action-btn delete-block" @click="deleteBlock(index)" title="Delete block">
                    <span class="material-symbol" style="font-size: 12px">delete</span>
                  </button>
                </div>
              </div>

              <button class="add-block-btn" @click="addBlockAtEnd">
                <span class="material-symbol" style="font-size: 12px">add</span>
                Add a block
              </button>
            </div>

            <div class="doc-footer">
              <div class="footer-left">
                <span class="footer-info">Last edited: {{ formatDate(activeDocument.updatedAt) }}</span>
                <span v-if="activeDocument.isPublished" class="published-badge">
                  <span class="material-symbol" style="font-size: 12px">language</span>
                  Published
                </span>
              </div>
              <div class="footer-right">
                <button class="footer-btn" @click="togglePublish">{{ activeDocument.isPublished ? 'Unpublish' : 'Publish' }}</button>
                <button class="footer-btn trash-btn" @click="deleteDocument">
                  <span class="material-symbol" style="font-size: 14px">delete</span>
                  Move to Trash
                </button>
              </div>
            </div>
          </div>
        </template>

        <!-- Contacts Tab -->
        <template v-else-if="activeTab === 'contacts'">
          <div class="panel-placeholder">
            <span class="material-symbol panel-icon">contacts</span>
            <h3>Contacts</h3>
            <p>Contact management panel — coming soon.</p>
          </div>
        </template>

        <!-- Tasks Tab -->
        <template v-else-if="activeTab === 'tasks'">
          <div class="panel-placeholder">
            <span class="material-symbol panel-icon">checklist</span>
            <h3>Tasks</h3>
            <p>Task management panel — coming soon.</p>
          </div>
        </template>

        <!-- Binders Tab -->
        <template v-else-if="activeTab === 'binders'">
          <div class="panel-placeholder">
            <span class="material-symbol panel-icon">folder_open</span>
            <h3>Binders</h3>
            <p>Binder management panel — coming soon.</p>
          </div>
        </template>

        <!-- Feeds Tab -->
        <template v-else-if="activeTab === 'feeds'">
          <div class="panel-placeholder">
            <span class="material-symbol panel-icon">rss_feed</span>
            <h3>Feeds</h3>
            <p>Feed reader panel — coming soon.</p>
          </div>
        </template>

        <!-- File Manager Tab -->
        <template v-else-if="activeTab === 'files'">
          <div class="panel-placeholder">
            <span class="material-symbol panel-icon">folder</span>
            <h3>File Manager</h3>
            <p>Vault file manager panel — coming soon.</p>
          </div>
        </template>
      </main>

      <!-- Right Chat Panel -->
      <Code3UIChatSheet />
    </div>

    <!-- Snackbar -->
    <div v-if="store.snackbar" class="m3-snackbar" :class="`m3-snackbar--${store.snackbar.type}`">
      <span>{{ store.snackbar.message }}</span>
      <button v-if="store.snackbar.action" class="m3-snackbar-action" @click="store.dismissSnackbar">
        {{ store.snackbar.action }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCode3UIStore } from './stores/code3UIStore'
import Code3UINavRail from './Code3UINavRail.vue'
import Code3UIChatSheet from './Code3UIChatSheet.vue'

const store = useCode3UIStore()

// ─── Palette cycling ────────────────────────────────────────────
const paletteOrder = ['notion', 'paper', 'parchment', 'modern', 'dark'] as const

function cyclePalette() {
  const current = store.palette
  const idx = paletteOrder.indexOf(current)
  const next = paletteOrder[(idx + 1) % paletteOrder.length]
  console.log('cyclePalette: current=', current, 'idx=', idx, 'next=', next)
  store.setPalette(next)
}

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

// ─── Sidebar Tabs ───────────────────────────────────────────────
const sidebarTabs = [
  { id: 'docs', icon: 'description', label: 'Documents' },
  { id: 'contacts', icon: 'contacts', label: 'Contacts' },
  { id: 'tasks', icon: 'checklist', label: 'Tasks' },
  { id: 'binders', icon: 'folder_open', label: 'Binders' },
  { id: 'feeds', icon: 'rss_feed', label: 'Feeds' },
  { id: 'files', icon: 'folder', label: 'Files' },
]

const activeTab = ref('docs')

function onTabChange(tabId: string) {
  activeTab.value = tabId
}

// ─── State ──────────────────────────────────────────────────────
const isLoading = ref(false)
const activeDocumentId = ref<string | null>(null)

// ─── Sample Documents ───────────────────────────────────────────
const documents = ref<Document[]>([
  {
    id: 'welcome',
    title: 'Welcome to code3ui',
    icon: 'file',
    coverImage: null,
    isPublished: true,
    blocks: [
      { id: 'b1', type: 'heading1', content: 'Welcome to code3ui' },
      { id: 'b2', type: 'paragraph', content: 'This is the code3ui Surface — a Notion-style document workspace powered by the Jotion integration. It uses the USX LENS/SKIN architecture for full theming and state management.' },
      { id: 'b3', type: 'callout', content: 'code3ui is the standalone Surface app for the uCode3 Jotion workspace. It provides rich document editing with block-based content, real-time collaboration, and USX compatibility.', language: undefined },
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
      { id: 'i2', type: 'paragraph', content: 'The Jotion project (Notion clone by PerHac13) provides the core document editing capabilities. code3ui wraps this as a USX-compatible surface.' },
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
])

// ─── Computed ───────────────────────────────────────────────────
const activeDocument = computed(() => {
  return documents.value.find(d => d.id === activeDocumentId.value) || null
})

// ─── Document Actions ───────────────────────────────────────────
function selectDocument(id: string) {
  activeDocumentId.value = id
}

function createDocument() {
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
  documents.value.unshift(newDoc)
  activeDocumentId.value = newDoc.id
}

function deleteDocument() {
  if (!activeDocument.value) return
  documents.value = documents.value.filter(d => d.id !== activeDocument.value!.id)
  activeDocumentId.value = documents.value[0]?.id || null
}

function togglePublish() {
  if (!activeDocument.value) return
  activeDocument.value.isPublished = !activeDocument.value.isPublished
}

function addCover() {
  if (!activeDocument.value) return
  activeDocument.value.coverImage = 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200'
}

function removeCover() {
  if (!activeDocument.value) return
  activeDocument.value.coverImage = null
}

function changeIcon() {
  // Placeholder for icon picker
}

function onTitleChange() {
  // Auto-save placeholder
}

function onBlockChange() {
  // Auto-save placeholder
}

function onBlockTypeChange(block: EditorBlock) {
  if (block.type === 'divider') {
    block.content = '──────────────'
  }
}

function addBlockAbove(index: number) {
  if (!activeDocument.value) return
  const newBlock: EditorBlock = {
    id: `b-${Date.now()}`,
    type: 'paragraph',
    content: '',
  }
  activeDocument.value.blocks.splice(index, 0, newBlock)
}

function addBlockBelow(index: number) {
  if (!activeDocument.value) return
  const newBlock: EditorBlock = {
    id: `b-${Date.now()}`,
    type: 'paragraph',
    content: '',
  }
  activeDocument.value.blocks.splice(index + 1, 0, newBlock)
}

function addBlockAtEnd() {
  if (!activeDocument.value) return
  const newBlock: EditorBlock = {
    id: `b-${Date.now()}`,
    type: 'paragraph',
    content: '',
  }
  activeDocument.value.blocks.push(newBlock)
}

function deleteBlock(index: number) {
  if (!activeDocument.value) return
  activeDocument.value.blocks.splice(index, 1)
}

function splitBlock(index: number) {
  if (!activeDocument.value) return
  const block = activeDocument.value.blocks[index]
  if (block.type !== 'paragraph') return
  const cursorPos = (document.activeElement as HTMLTextAreaElement)?.selectionStart || 0
  const before = block.content.slice(0, cursorPos)
  const after = block.content.slice(cursorPos)
  block.content = before
  const newBlock: EditorBlock = {
    id: `b-${Date.now()}`,
    type: 'paragraph',
    content: after,
  }
  activeDocument.value.blocks.splice(index + 1, 0, newBlock)
}

function mergeWithPrevious(index: number) {
  if (!activeDocument.value || index === 0) return
  const block = activeDocument.value.blocks[index]
  if (block.content !== '') return
  const prev = activeDocument.value.blocks[index - 1]
  if (prev.type !== 'paragraph') return
  activeDocument.value.blocks.splice(index, 1)
}

function copyCode(block: EditorBlock) {
  navigator.clipboard.writeText(block.content)
}

function uploadImage(block: EditorBlock) {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      block.imageUrl = URL.createObjectURL(file)
    }
  }
  input.click()
}

function removeImage(block: EditorBlock) {
  block.imageUrl = undefined
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(() => {
  activeDocumentId.value = 'welcome'
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    store.toggleTheme()
  }
})
</script>

<style>
/* ─── Import Theme ────────────────────────────────────────────── */
@import url('./styles/code3ui-theme.css');

/* ─── Base Layout ────────────────────────────────────────────── */
.code3ui-surface {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--usx-color-background);
  color: var(--usx-color-on-surface);
  font-family: var(--code3ui-font-family);
  font-size: var(--code3ui-font-size);
}

/* ─── Surface Header (USX Toolbar Style) ─────────────────────── */
.surface-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: var(--code3ui-header-height);
  padding: 0 12px;
  border-bottom: 1px solid var(--usx-color-outline);
  flex-shrink: 0;
  background: var(--usx-color-surface);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--md-sys-shape-corner-extra-small);
  background: transparent;
  color: var(--usx-color-on-surface-variant);
  cursor: pointer;
  transition: all 0.15s;
}

.header-btn:hover {
  background: var(--usx-color-surface-variant);
  color: var(--usx-color-on-surface);
}

.header-title {
  font-size: calc(var(--code3ui-font-size) * 1.1);
  font-weight: 600;
  color: var(--usx-color-on-surface);
  margin: 0;
}

.header-badge {
  font-size: calc(var(--code3ui-font-size) * 0.7);
  padding: 2px 6px;
  border-radius: var(--md-sys-shape-corner-extra-small);
  background: var(--usx-color-primary-container);
  color: var(--usx-color-on-primary-container);
  font-weight: 500;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 0 16px;
}

.header-breadcrumb {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: calc(var(--code3ui-font-size) * 0.8);
  color: var(--usx-color-on-surface-variant);
}

.breadcrumb-item {
  padding: 2px 6px;
  border-radius: var(--md-sys-shape-corner-extra-small);
  cursor: default;
}

.breadcrumb-current {
  color: var(--usx-color-on-surface);
  font-weight: 500;
}

.breadcrumb-sep {
  color: var(--usx-color-outline);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Palette dot */
.palette-dot {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid;
  cursor: pointer;
  transition: transform 0.15s;
  flex-shrink: 0;
}

.palette-dot:hover {
  transform: scale(1.2);
}

/* ─── Workspace Layout ───────────────────────────────────────── */
.workspace-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* ─── Main Content ────────────────────────────────────────────── */
.doc-main {
  flex: 1;
  overflow-y: auto;
  background: var(--usx-color-background);
}

/* ─── Loading State ───────────────────────────────────────────── */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
  color: var(--usx-color-on-surface-variant);
}

.loading-text {
  font-size: calc(var(--code3ui-font-size) * 0.85);
  letter-spacing: 0.5px;
}

/* ─── Empty State ──────────────────────────────────────────────── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
  padding: 48px;
  text-align: center;
  color: var(--usx-color-on-surface-variant);
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: var(--usx-color-outline);
}

.empty-state h2 {
  font-size: calc(var(--code3ui-font-size) * 1.4);
  font-weight: 600;
  color: var(--usx-color-on-surface);
  margin: 0;
}

.empty-state p {
  font-size: calc(var(--code3ui-font-size) * 0.9);
  max-width: 400px;
  line-height: 1.5;
}

.create-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: var(--md-sys-shape-corner-small);
  background: var(--usx-color-primary);
  color: var(--usx-color-on-primary);
  font-family: inherit;
  font-size: calc(var(--code3ui-font-size) * 0.85);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.create-btn:hover {
  opacity: 0.9;
}

/* ─── Document Editor ──────────────────────────────────────────── */
.document-editor {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 96px 96px;
}

/* Cover Image */
.cover-image-container {
  position: relative;
  width: 100%;
  height: 240px;
  overflow: hidden;
  border-radius: 0 0 var(--md-sys-shape-corner-small) var(--md-sys-shape-corner-small);
  margin-bottom: 32px;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-cover-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: rgba(0,0,0,0.5);
  color: #fff;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s;
}

.cover-image-container:hover .remove-cover-btn {
  opacity: 1;
}

.cover-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 120px;
  border: 2px dashed var(--usx-color-outline);
  border-radius: var(--md-sys-shape-corner-small);
  color: var(--usx-color-on-surface-variant);
  font-size: calc(var(--code3ui-font-size) * 0.85);
  cursor: pointer;
  margin-bottom: 32px;
  transition: all 0.15s;
}

.cover-placeholder:hover {
  border-color: var(--usx-color-primary);
  color: var(--usx-color-primary);
  background: var(--usx-color-primary-container);
}

/* Document Header */
.doc-header {
  margin-bottom: 24px;
}

.doc-icon-area {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.doc-icon-large {
  width: 48px;
  height: 48px;
  color: var(--usx-color-on-surface);
}

.change-icon-btn {
  padding: 2px 8px;
  border: 1px solid var(--usx-color-outline);
  border-radius: var(--md-sys-shape-corner-extra-small);
  background: transparent;
  color: var(--usx-color-on-surface-variant);
  font-family: inherit;
  font-size: calc(var(--code3ui-font-size) * 0.75);
  cursor: pointer;
  transition: all 0.15s;
}

.change-icon-btn:hover {
  background: var(--usx-color-surface-variant);
}

.doc-title-input {
  width: 100%;
  border: none;
  background: transparent;
  color: var(--usx-color-on-surface);
  font-family: inherit;
  font-size: calc(var(--code3ui-font-size) * 2.5);
  font-weight: 700;
  outline: none;
  padding: 0;
  line-height: 1.2;
}

.doc-title-input::placeholder {
  color: var(--usx-color-on-surface-variant);
}

/* ─── Block Editor ─────────────────────────────────────────────── */
.block-editor {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.editor-block {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  padding: 2px 0;
  position: relative;
  min-height: 32px;
}

.editor-block:hover .block-actions {
  opacity: 1;
}

.editor-block:hover .drag-handle {
  opacity: 1;
}

.drag-handle {
  flex-shrink: 0;
  width: 20px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  opacity: 0;
  transition: opacity 0.1s;
  color: var(--usx-color-on-surface-variant);
}

.icon-xs {
  width: 14px;
  height: 14px;
}

.block-type-select {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: var(--usx-color-on-surface-variant);
  font-size: 10px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.1s;
  appearance: none;
  -webkit-appearance: none;
}

.editor-block:hover .block-type-select {
  opacity: 1;
}

.block-content {
  flex: 1;
  min-width: 0;
}

.block-input {
  width: 100%;
  border: none;
  background: transparent;
  color: var(--usx-color-on-surface);
  font-family: inherit;
  font-size: var(--code3ui-font-size);
  outline: none;
  padding: 2px 0;
  line-height: 1.5;
}

.block-input::placeholder {
  color: var(--usx-color-on-surface-variant);
}

.block-textarea {
  width: 100%;
  border: none;
  background: transparent;
  color: var(--usx-color-on-surface);
  font-family: inherit;
  font-size: var(--code3ui-font-size);
  outline: none;
  padding: 2px 0;
  line-height: 1.5;
  resize: none;
  min-height: 24px;
}

.block-textarea::placeholder {
  color: var(--usx-color-on-surface-variant);
}

/* Heading styles */
.heading-1 .block-input {
  font-size: calc(var(--code3ui-font-size) * 1.8);
  font-weight: 700;
  line-height: 1.3;
}

.heading-2 .block-input {
  font-size: calc(var(--code3ui-font-size) * 1.4);
  font-weight: 600;
  line-height: 1.3;
}

.heading-3 .block-input {
  font-size: calc(var(--code3ui-font-size) * 1.15);
  font-weight: 600;
  line-height: 1.3;
}

/* To-do */
.todo-block {
  display: flex;
  align-items: center;
  gap: 8px;
}

.todo-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: var(--usx-color-primary);
}

.todo-input.checked {
  text-decoration: line-through;
  color: var(--usx-color-on-surface-variant);
}

/* Toggle */
.toggle-block {
  display: flex;
  align-items: center;
  gap: 4px;
}

.toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: var(--usx-color-on-surface-variant);
  cursor: pointer;
  flex-shrink: 0;
}

/* Code */
.code-block {
  background: var(--usx-color-surface-variant);
  border-radius: var(--md-sys-shape-corner-small);
  overflow: hidden;
  border: 1px solid var(--usx-color-outline);
}

.code-lang-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  background: var(--usx-color-surface-container);
  border-bottom: 1px solid var(--usx-color-outline);
}

.code-lang-select {
  border: none;
  background: transparent;
  color: var(--usx-color-on-surface-variant);
  font-family: inherit;
  font-size: calc(var(--code3ui-font-size) * 0.8);
  cursor: pointer;
  outline: none;
}

.copy-btn {
  padding: 2px 8px;
  border: 1px solid var(--usx-color-outline);
  border-radius: var(--md-sys-shape-corner-extra-small);
  background: transparent;
  color: var(--usx-color-on-surface-variant);
  font-family: inherit;
  font-size: calc(var(--code3ui-font-size) * 0.75);
  cursor: pointer;
  transition: all 0.15s;
}

.copy-btn:hover {
  background: var(--usx-color-surface-container-high);
}

.code-textarea {
  width: 100%;
  min-height: 80px;
  padding: 12px;
  border: none;
  background: transparent;
  color: var(--usx-color-on-surface);
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  font-size: calc(var(--code3ui-font-size) * 0.85);
  line-height: 1.5;
  outline: none;
  resize: vertical;
  tab-size: 2;
}

/* Quote */
.quote-block {
  border-left: 3px solid var(--usx-color-primary);
  padding-left: 12px;
}

.quote-textarea {
  font-style: italic;
  color: var(--usx-color-on-surface-variant);
}

/* Callout */
.callout-block {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: var(--usx-color-surface-variant);
  border-radius: var(--md-sys-shape-corner-small);
}

.callout-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: var(--usx-color-primary);
  margin-top: 2px;
}

.callout-textarea {
  flex: 1;
}

/* Divider */
.divider-block {
  padding: 8px 0;
}

.divider {
  border: none;
  border-top: 1px solid var(--usx-color-outline);
  margin: 0;
}

/* Image */
.image-block {
  padding: 8px 0;
}

.image-preview {
  position: relative;
  display: inline-block;
  max-width: 100%;
}

.image-preview img {
  max-width: 100%;
  max-height: 400px;
  border-radius: var(--md-sys-shape-corner-small);
  object-fit: contain;
}

.remove-image-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background: rgba(0,0,0,0.5);
  color: #fff;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s;
}

.image-preview:hover .remove-image-btn {
  opacity: 1;
}

.image-upload-area {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px;
  border: 2px dashed var(--usx-color-outline);
  border-radius: var(--md-sys-shape-corner-small);
  color: var(--usx-color-on-surface-variant);
  font-size: calc(var(--code3ui-font-size) * 0.85);
  cursor: pointer;
  transition: all 0.15s;
}

.image-upload-area:hover {
  border-color: var(--usx-color-primary);
  color: var(--usx-color-primary);
  background: var(--usx-color-primary-container);
}

/* List */
.list-block {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.list-marker {
  flex-shrink: 0;
  width: 20px;
  text-align: center;
  color: var(--usx-color-on-surface-variant);
  font-size: calc(var(--code3ui-font-size) * 0.9);
  padding-top: 3px;
}

.number-marker {
  font-variant-numeric: tabular-nums;
}

/* Block Actions */
.block-actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.1s;
  flex-shrink: 0;
}

.block-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  border-radius: var(--md-sys-shape-corner-extra-small);
  background: transparent;
  color: var(--usx-color-on-surface-variant);
  cursor: pointer;
  transition: all 0.1s;
}

.block-action-btn:hover {
  background: var(--usx-color-surface-variant);
  color: var(--usx-color-on-surface);
}

.delete-block:hover {
  color: var(--usx-color-error);
}

/* Add block button */
.add-block-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: none;
  background: transparent;
  color: var(--usx-color-on-surface-variant);
  font-family: inherit;
  font-size: calc(var(--code3ui-font-size) * 0.85);
  cursor: pointer;
  transition: all 0.15s;
  margin-top: 4px;
  border-radius: var(--md-sys-shape-corner-extra-small);
}

.add-block-btn:hover {
  color: var(--usx-color-primary);
  background: var(--usx-color-primary-container);
}

/* ─── Document Footer ──────────────────────────────────────────── */
.doc-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  margin-top: 32px;
  border-top: 1px solid var(--usx-color-outline);
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.footer-info {
  font-size: calc(var(--code3ui-font-size) * 0.8);
  color: var(--usx-color-on-surface-variant);
}

.published-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: var(--md-sys-shape-corner-full);
  background: var(--usx-color-primary-container);
  color: var(--usx-color-on-primary-container);
  font-size: calc(var(--code3ui-font-size) * 0.75);
  font-weight: 500;
}

.footer-right {
  display: flex;
  gap: 8px;
}

.footer-btn {
  padding: 6px 12px;
  border: 1px solid var(--usx-color-outline);
  border-radius: var(--md-sys-shape-corner-extra-small);
  background: transparent;
  color: var(--usx-color-on-surface);
  font-family: inherit;
  font-size: calc(var(--code3ui-font-size) * 0.8);
  cursor: pointer;
  transition: all 0.15s;
}

.footer-btn:hover {
  background: var(--usx-color-surface-variant);
}

.trash-btn {
  color: var(--usx-color-error);
  border-color: var(--usx-color-error-container);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.trash-btn:hover {
  background: var(--usx-color-error-container);
}

/* ─── Panel Placeholder ────────────────────────────────────────── */
.panel-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 12px;
  color: var(--usx-color-on-surface-variant);
  padding: 48px;
  text-align: center;
}

.panel-icon {
  font-size: 48px !important;
}

.panel-placeholder h3 {
  font-size: calc(var(--code3ui-font-size) * 1.3);
  font-weight: 600;
  color: var(--usx-color-on-surface);
  margin: 0;
}

.panel-placeholder p {
  font-size: calc(var(--code3ui-font-size) * 0.9);
  max-width: 400px;
  line-height: 1.5;
}

/* ─── Scrollbar ────────────────────────────────────────────────── */
.doc-main::-webkit-scrollbar {
  width: 6px;
}

.doc-main::-webkit-scrollbar-track {
  background: transparent;
}

.doc-main::-webkit-scrollbar-thumb {
  background: var(--usx-color-outline);
  border-radius: 3px;
}

.doc-main::-webkit-scrollbar-thumb:hover {
  background: var(--usx-color-on-surface-variant);
}
</style>
