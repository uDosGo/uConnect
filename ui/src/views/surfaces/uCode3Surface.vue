<template>
  <div class="ucode3-surface">
    <!-- Surface Header -->
    <div class="surface-header">
      <div class="surface-header-left">
        <span class="surface-icon">📝</span>
        <h1>uCode3 <span class="badge">Surface</span></h1>
      </div>
      <div class="surface-header-right">
        <span class="header-badge notion-badge">Notion-Style Workspace</span>
        <span class="header-badge lens-badge">LENS Ready</span>
      </div>
    </div>

    <!-- Document Workspace -->
    <div class="workspace-layout">
      <!-- Sidebar (Document Tree) -->
      <aside class="doc-sidebar" :class="{ collapsed: sidebarCollapsed }">
        <div class="sidebar-header">
          <div class="sidebar-search">
            <span class="search-icon">🔍</span>
            <input
              v-model="searchQuery"
              type="text"
              class="search-input"
              placeholder="Search documents..."
            />
          </div>
          <button class="new-doc-btn" @click="createDocument">
            <span>+</span> New Page
          </button>
        </div>
        <div class="sidebar-documents">
          <div
            v-for="doc in filteredDocuments"
            :key="doc.id"
            class="doc-tree-item"
            :class="{ active: activeDocumentId === doc.id }"
            @click="selectDocument(doc.id)"
          >
            <span class="doc-icon">{{ doc.icon || '📄' }}</span>
            <span class="doc-title">{{ doc.title || 'Untitled' }}</span>
            <span v-if="doc.isPublished" class="published-dot" title="Published">🌐</span>
          </div>
        </div>
        <div class="sidebar-footer">
          <button class="sidebar-toggle-btn" @click="sidebarCollapsed = !sidebarCollapsed">
            <span v-if="sidebarCollapsed">→</span>
            <span v-else>←</span>
            <span class="toggle-label">{{ sidebarCollapsed ? 'Expand' : 'Collapse' }}</span>
          </button>
        </div>
      </aside>

      <!-- Main Document Area -->
      <main class="doc-main" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <div class="loading-text">LOADING DOCUMENT...</div>
        </div>

        <!-- Empty State -->
        <div v-else-if="!activeDocument" class="empty-state">
          <div class="empty-icon">📝</div>
          <h2>Welcome to uCode3</h2>
          <p>Select a document from the sidebar or create a new one.</p>
          <button class="create-btn" @click="createDocument">
            <span>+</span> Create New Document
          </button>
        </div>

        <!-- Document Editor -->
        <div v-else class="document-editor">
          <!-- Cover Image -->
          <div v-if="activeDocument.coverImage" class="cover-image-container">
            <img :src="activeDocument.coverImage" alt="Cover" class="cover-image" />
            <button class="remove-cover-btn" @click="removeCover">✕</button>
          </div>
          <div v-else class="cover-placeholder" @click="addCover">
            <span>Add Cover</span>
          </div>

          <!-- Document Header -->
          <div class="doc-header">
            <div class="doc-icon-area">
              <span class="doc-icon-large">{{ activeDocument.icon || '📄' }}</span>
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
              <!-- Drag Handle -->
              <span class="drag-handle" title="Drag to reorder">⠿</span>

              <!-- Block Type Selector -->
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

              <!-- Block Content -->
              <div v-if="block.type === 'heading1'" class="block-content heading-1">
                <input
                  v-model="block.content"
                  class="block-input heading-input"
                  placeholder="Heading 1"
                  @input="onBlockChange"
                />
              </div>
              <div v-else-if="block.type === 'heading2'" class="block-content heading-2">
                <input
                  v-model="block.content"
                  class="block-input heading-input"
                  placeholder="Heading 2"
                  @input="onBlockChange"
                />
              </div>
              <div v-else-if="block.type === 'heading3'" class="block-content heading-3">
                <input
                  v-model="block.content"
                  class="block-input heading-input"
                  placeholder="Heading 3"
                  @input="onBlockChange"
                />
              </div>
              <div v-else-if="block.type === 'to_do'" class="block-content todo-block">
                <input type="checkbox" v-model="block.checked" class="todo-checkbox" />
                <input
                  v-model="block.content"
                  class="block-input todo-input"
                  :class="{ checked: block.checked }"
                  placeholder="To-do item..."
                  @input="onBlockChange"
                />
              </div>
              <div v-else-if="block.type === 'toggle'" class="block-content toggle-block">
                <button class="toggle-btn" @click="block.expanded = !block.expanded">
                  <span>{{ block.expanded ? '▼' : '▶' }}</span>
                </button>
                <input
                  v-model="block.content"
                  class="block-input"
                  placeholder="Toggle heading..."
                  @input="onBlockChange"
                />
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
                <textarea
                  v-model="block.content"
                  class="code-textarea"
                  placeholder="Write code..."
                  spellcheck="false"
                  @input="onBlockChange"
                ></textarea>
              </div>
              <div v-else-if="block.type === 'quote'" class="block-content quote-block">
                <textarea
                  v-model="block.content"
                  class="block-textarea quote-textarea"
                  placeholder="Quote..."
                  @input="onBlockChange"
                ></textarea>
              </div>
              <div v-else-if="block.type === 'callout'" class="block-content callout-block">
                <span class="callout-icon">💡</span>
                <textarea
                  v-model="block.content"
                  class="block-textarea callout-textarea"
                  placeholder="Callout text..."
                  @input="onBlockChange"
                ></textarea>
              </div>
              <div v-else-if="block.type === 'divider'" class="block-content divider-block">
                <hr class="divider" />
              </div>
              <div v-else-if="block.type === 'image'" class="block-content image-block">
                <div v-if="block.imageUrl" class="image-preview">
                  <img :src="block.imageUrl" alt="Block image" />
                  <button class="remove-image-btn" @click="removeImage(block)">✕</button>
                </div>
                <div v-else class="image-upload-area" @click="uploadImage(block)">
                  <span>Click to upload image</span>
                </div>
              </div>
              <div v-else-if="block.type === 'bulleted_list'" class="block-content list-block">
                <span class="list-marker">•</span>
                <input
                  v-model="block.content"
                  class="block-input"
                  placeholder="List item..."
                  @input="onBlockChange"
                />
              </div>
              <div v-else-if="block.type === 'numbered_list'" class="block-content list-block">
                <span class="list-marker number-marker">{{ index + 1 }}.</span>
                <input
                  v-model="block.content"
                  class="block-input"
                  placeholder="List item..."
                  @input="onBlockChange"
                />
              </div>
              <div v-else class="block-content paragraph-block">
                <textarea
                  v-model="block.content"
                  class="block-textarea paragraph-textarea"
                  placeholder="Type '/' for commands, or just start writing..."
                  @input="onBlockChange"
                  @keydown.enter.exact.prevent="splitBlock(index)"
                  @keydown.backspace.exact.prevent="mergeWithPrevious(index)"
                ></textarea>
              </div>

              <!-- Block Actions -->
              <div class="block-actions">
                <button class="block-action-btn add-above" @click="addBlockAbove(index)" title="Add block above">+</button>
                <button class="block-action-btn add-below" @click="addBlockBelow(index)" title="Add block below">+</button>
                <button class="block-action-btn delete-block" @click="deleteBlock(index)" title="Delete block">🗑</button>
              </div>
            </div>

            <!-- Add Block Button (bottom) -->
            <button class="add-block-btn" @click="addBlockAtEnd">
              <span>+</span> Add a block
            </button>
          </div>

          <!-- Document Footer -->
          <div class="doc-footer">
            <div class="footer-left">
              <span class="footer-info">
                Last edited: {{ formatDate(activeDocument.updatedAt) }}
              </span>
              <span v-if="activeDocument.isPublished" class="published-badge">
                🌐 Published
              </span>
            </div>
            <div class="footer-right">
              <button class="footer-btn" @click="togglePublish">
                {{ activeDocument.isPublished ? 'Unpublish' : 'Publish' }}
              </button>
              <button class="footer-btn trash-btn" @click="deleteDocument">
                🗑 Move to Trash
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

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

// ─── State ──────────────────────────────────────────────────────
const sidebarCollapsed = ref(false)
const searchQuery = ref('')
const isLoading = ref(false)
const activeDocumentId = ref<string | null>(null)

// ─── Sample Documents ───────────────────────────────────────────
const documents = ref<Document[]>([
  {
    id: 'welcome',
    title: 'Welcome to uCode3',
    icon: '👋',
    coverImage: null,
    isPublished: true,
    blocks: [
      { id: 'b1', type: 'heading1', content: 'Welcome to uCode3' },
      { id: 'b2', type: 'paragraph', content: 'This is the uCode3 Surface — a Notion-style document workspace powered by the Jotion integration. It uses the USX LENS/SKIN architecture for full theming and state management.' },
      { id: 'b3', type: 'callout', content: 'uCode3 is the Surface layer of the uDos ecosystem. It provides rich document editing with block-based content, real-time collaboration, and USX compatibility.', language: undefined },
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
      { id: 'b17', type: 'quote', content: 'uCode3 brings Notion-style editing to the uDos ecosystem with full USX compatibility.' },
    ],
    createdAt: '2026-05-16T10:00:00Z',
    updatedAt: '2026-05-16T22:30:00Z',
  },
  {
    id: 'architecture',
    title: 'Architecture Overview',
    icon: '🏗️',
    coverImage: null,
    isPublished: true,
    blocks: [
      { id: 'a1', type: 'heading1', content: 'Architecture Overview' },
      { id: 'a2', type: 'paragraph', content: 'uCode3 is built on the USX (Universal Surface eXchange) architecture, which separates concerns into three layers: LENS, SKIN, and Router.' },
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
    icon: '🔗',
    coverImage: null,
    isPublished: false,
    blocks: [
      { id: 'i1', type: 'heading1', content: 'Jotion → uCode3 Integration' },
      { id: 'i2', type: 'paragraph', content: 'The Jotion project (Notion clone by PerHac13) provides the core document editing capabilities. uCode3 wraps this as a USX-compatible surface.' },
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
    icon: '🗺️',
    coverImage: null,
    isPublished: false,
    blocks: [
      { id: 'r1', type: 'heading1', content: 'Development Roadmap' },
      { id: 'r2', type: 'paragraph', content: 'The uCode3 surface is under active development. Here is the planned roadmap:' },
      { id: 'r3', type: 'heading2', content: 'Phase 1: Core Editor' },
      { id: 'r4', type: 'to_do', content: 'Block editor with all 14 block types', checked: true },
      { id: 'r5', type: 'to_do', content: 'Document tree sidebar', checked: true },
      { id: 'r6', type: 'to_do', content: 'Cover images and icons', checked: true },
      { id: 'r7', type: 'heading2', content: 'Phase 2: Collaboration' },
      { id: 'r8', type: 'to_do', content: 'Real-time sync via Convex', checked: false },
      { id: 'r9', type: 'to_do', content: 'Multi-user editing', checked: false },
      { id: 'r10', type: 'to_do', content: 'Comment threads', checked: false },
      { id: 'r11', type: 'heading2', content: 'Phase 3: Publishing' },
      { id: 'r12', type: 'to_do', content: 'Web publishing', checked: false },
      { id: 'r13', type: 'to_do', content: 'Export to Markdown/PDF', checked: false },
      { id: 'r14', type: 'to_do', content: 'Template library', checked: false },
    ],
    createdAt: '2026-05-13T09:00:00Z',
    updatedAt: '2026-05-16T16:00:00Z',
  },
])

// ─── Computed ───────────────────────────────────────────────────
const filteredDocuments = computed(() => {
  if (!searchQuery.value) return documents.value
  const q = searchQuery.value.toLowerCase()
  return documents.value.filter(doc =>
    doc.title.toLowerCase().includes(q)
  )
})

const activeDocument = computed(() => {
  if (!activeDocumentId.value) return null
  return documents.value.find(doc => doc.id === activeDocumentId.value) || null
})

// ─── Methods ────────────────────────────────────────────────────
function selectDocument(id: string) {
  activeDocumentId.value = id
}

function createDocument() {
  const newDoc: Document = {
    id: `doc-${Date.now()}`,
    title: 'Untitled',
    icon: '📄',
    coverImage: null,
    isPublished: false,
    blocks: [
      { id: `b-${Date.now()}-1`, type: 'heading1', content: '' },
      { id: `b-${Date.now()}-2`, type: 'paragraph', content: '' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  documents.value.push(newDoc)
  activeDocumentId.value = newDoc.id
}

function onTitleChange() {
  if (activeDocument.value) {
    activeDocument.value.updatedAt = new Date().toISOString()
  }
}

function onBlockChange() {
  if (activeDocument.value) {
    activeDocument.value.updatedAt = new Date().toISOString()
  }
}

function onBlockTypeChange(block: EditorBlock) {
  onBlockChange()
}

function addBlockAbove(index: number) {
  if (!activeDocument.value) return
  const newBlock: EditorBlock = {
    id: `b-${Date.now()}`,
    type: 'paragraph',
    content: '',
  }
  activeDocument.value.blocks.splice(index, 0, newBlock)
  onBlockChange()
}

function addBlockBelow(index: number) {
  if (!activeDocument.value) return
  const newBlock: EditorBlock = {
    id: `b-${Date.now()}`,
    type: 'paragraph',
    content: '',
  }
  activeDocument.value.blocks.splice(index + 1, 0, newBlock)
  onBlockChange()
}

function addBlockAtEnd() {
  if (!activeDocument.value) return
  const newBlock: EditorBlock = {
    id: `b-${Date.now()}`,
    type: 'paragraph',
    content: '',
  }
  activeDocument.value.blocks.push(newBlock)
  onBlockChange()
}

function deleteBlock(index: number) {
  if (!activeDocument.value) return
  if (activeDocument.value.blocks.length <= 1) return
  activeDocument.value.blocks.splice(index, 1)
  onBlockChange()
}

function splitBlock(index: number) {
  if (!activeDocument.value) return
  const currentBlock = activeDocument.value.blocks[index]
  if (!currentBlock || currentBlock.type !== 'paragraph') return

  const cursorPos = 0 // Simplified — in a real editor we'd track cursor position
  const before = currentBlock.content
  const after = ''

  currentBlock.content = before
  const newBlock: EditorBlock = {
    id: `b-${Date.now()}`,
    type: 'paragraph',
    content: after,
  }
  activeDocument.value.blocks.splice(index + 1, 0, newBlock)
  onBlockChange()
}

function mergeWithPrevious(index: number) {
  if (!activeDocument.value || index === 0) return
  const currentBlock = activeDocument.value.blocks[index]
  const previousBlock = activeDocument.value.blocks[index - 1]
  if (!currentBlock || !previousBlock) return
  if (currentBlock.content !== '') return

  activeDocument.value.blocks.splice(index, 1)
  onBlockChange()
}

function togglePublish() {
  if (!activeDocument.value) return
  activeDocument.value.isPublished = !activeDocument.value.isPublished
  onBlockChange()
}

function deleteDocument() {
  if (!activeDocument.value) return
  const idx = documents.value.findIndex(d => d.id === activeDocument.value!.id)
  if (idx !== -1) {
    documents.value.splice(idx, 1)
  }
  activeDocumentId.value = documents.value.length > 0 ? documents.value[0].id : null
}

function addCover() {
  if (!activeDocument.value) return
  activeDocument.value.coverImage = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200'
  onBlockChange()
}

function removeCover() {
  if (!activeDocument.value) return
  activeDocument.value.coverImage = null
  onBlockChange()
}

function changeIcon() {
  if (!activeDocument.value) return
  const icons = ['📄', '📝', '👋', '🏗️', '🔗', '🗺️', '⭐', '🎯', '💡', '📌', '📋', '📁']
  const currentIdx = icons.indexOf(activeDocument.value.icon)
  activeDocument.value.icon = icons[(currentIdx + 1) % icons.length]
  onBlockChange()
}

function uploadImage(block: EditorBlock) {
  block.imageUrl = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600'
  onBlockChange()
}

function removeImage(block: EditorBlock) {
  block.imageUrl = undefined
  onBlockChange()
}

function copyCode(block: EditorBlock) {
  navigator.clipboard.writeText(block.content)
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

// ─── Init ───────────────────────────────────────────────────────
onMounted(() => {
  activeDocumentId.value = 'welcome'
})
</script>

<style scoped>
/* ─── Surface Layout ──────────────────────────────────────────── */
.ucode3-surface {
  background: #fff;
  color: #37352f;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.surface-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid #e9e9e7;
  background: #fafafa;
}

.surface-header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.surface-icon {
  font-size: 1.25rem;
}

.surface-header-left h1 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: #37352f;
}

.badge {
  font-size: 0.6rem;
  background: #e9e9e7;
  color: #6b6b6b;
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  vertical-align: middle;
  margin-left: 4px;
}

.surface-header-right {
  display: flex;
  gap: 0.5rem;
}

.header-badge {
  font-size: 0.65rem;
  padding: 3px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.notion-badge {
  background: #e8f5e9;
  color: #2e7d64;
}

.lens-badge {
  background: #e3f2fd;
  color: #1565c0;
}

/* ─── Workspace Layout ────────────────────────────────────────── */
.workspace-layout {
  display: flex;
  flex: 1;
  min-height: 0;
}

/* ─── Document Sidebar ────────────────────────────────────────── */
.doc-sidebar {
  width: 280px;
  background: #f7f6f3;
  border-right: 1px solid #e9e9e7;
  display: flex;
  flex-direction: column;
  transition: width 0.2s ease;
  overflow: hidden;
  flex-shrink: 0;
}

.doc-sidebar.collapsed {
  width: 48px;
}

.sidebar-header {
  padding: 0.75rem;
  border-bottom: 1px solid #e9e9e7;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sidebar-search {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #fff;
  border: 1px solid #e9e9e7;
  border-radius: 6px;
  padding: 0.4rem 0.6rem;
}

.search-icon {
  font-size: 0.8rem;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 0.8rem;
  color: #37352f;
  outline: none;
  font-family: inherit;
}

.search-input::placeholder {
  color: #b0b0b0;
}

.new-doc-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.75rem;
  background: #fff;
  border: 1px solid #e9e9e7;
  border-radius: 6px;
  color: #37352f;
  font-size: 0.8rem;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s;
}

.new-doc-btn:hover {
  background: #e9e9e7;
}

.sidebar-documents {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.doc-tree-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.6rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.1s;
  font-size: 0.85rem;
}

.doc-tree-item:hover {
  background: #e9e9e7;
}

.doc-tree-item.active {
  background: #d9e8ff;
}

.doc-icon {
  font-size: 0.9rem;
  flex-shrink: 0;
}

.doc-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #37352f;
}

.published-dot {
  font-size: 0.75rem;
  flex-shrink: 0;
}

.sidebar-footer {
  padding: 0.5rem;
  border-top: 1px solid #e9e9e7;
}

.sidebar-toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.6rem;
  background: transparent;
  border: 1px solid #e9e9e7;
  border-radius: 4px;
  color: #6b6b6b;
  font-size: 0.75rem;
  font-family: inherit;
  cursor: pointer;
  width: 100%;
  transition: background 0.15s;
}

.sidebar-toggle-btn:hover {
  background: #e9e9e7;
}

.toggle-label {
  flex: 1;
  text-align: left;
}

/* ─── Main Document Area ──────────────────────────────────────── */
.doc-main {
  flex: 1;
  overflow-y: auto;
  margin-left: 0;
  transition: margin-left 0.2s ease;
}

.doc-main.sidebar-collapsed {
  margin-left: 0;
}

/* ─── Loading State ───────────────────────────────────────────── */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  color: #6b6b6b;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e9e9e7;
  border-top-color: #2e7d64;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 0.8rem;
  font-family: 'SF Mono', 'Fira Code', monospace;
  letter-spacing: 2px;
}

/* ─── Empty State ─────────────────────────────────────────────── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  text-align: center;
  padding: 2rem;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  color: #37352f;
}

.empty-state p {
  font-size: 0.9rem;
  color: #6b6b6b;
  margin: 0 0 1.5rem;
  max-width: 400px;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.25rem;
  background: #2e7d64;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s;
}

.create-btn:hover {
  background: #236b54;
}

/* ─── Document Editor ─────────────────────────────────────────── */
.document-editor {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 1.5rem 4rem;
}

/* ─── Cover Image ─────────────────────────────────────────────── */
.cover-image-container {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: 0 0 8px 8px;
  margin-bottom: 1.5rem;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-cover-btn {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s;
}

.cover-image-container:hover .remove-cover-btn {
  opacity: 1;
}

.cover-placeholder {
  width: 100%;
  height: 48px;
  background: #f7f6f3;
  border: 1px dashed #e9e9e7;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  cursor: pointer;
  transition: background 0.15s;
  font-size: 0.8rem;
  color: #6b6b6b;
}

.cover-placeholder:hover {
  background: #efefec;
}

/* ─── Document Header ─────────────────────────────────────────── */
.doc-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.doc-icon-area {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.doc-icon-large {
  font-size: 2.5rem;
  line-height: 1;
}

.change-icon-btn {
  font-size: 0.7rem;
  color: #6b6b6b;
  background: transparent;
  border: 1px solid #e9e9e7;
  border-radius: 4px;
  padding: 0.2rem 0.5rem;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s;
}

.doc-icon-area:hover .change-icon-btn {
  opacity: 1;
}

.doc-title-input {
  font-size: 2.5rem;
  font-weight: 700;
  border: none;
  background: transparent;
  color: #37352f;
  width: 100%;
  padding: 0.25rem 0;
  outline: none;
  font-family: inherit;
}

.doc-title-input::placeholder {
  color: #b0b0b0;
}

/* ─── Block Editor ────────────────────────────────────────────── */
.block-editor {
  min-height: 400px;
}

.editor-block {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.25rem 0;
  position: relative;
  min-height: 32px;
}

.editor-block:hover .drag-handle {
  opacity: 1;
}

.editor-block:hover .block-actions {
  opacity: 1;
}

.drag-handle {
  font-size: 0.8rem;
  color: #b0b0b0;
  cursor: grab;
  padding: 0.25rem;
  opacity: 0;
  transition: opacity 0.15s;
  flex-shrink: 0;
  width: 16px;
  text-align: center;
  margin-top: 4px;
}

.drag-handle:hover {
  color: #6b6b6b;
}

.block-type-select {
  font-size: 0.65rem;
  padding: 0.15rem 0.3rem;
  border: 1px solid transparent;
  border-radius: 3px;
  background: transparent;
  color: #b0b0b0;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s;
  flex-shrink: 0;
  margin-top: 4px;
  font-family: inherit;
}

.editor-block:hover .block-type-select {
  opacity: 1;
}

.block-type-select:hover {
  border-color: #e9e9e7;
  background: #f7f6f3;
}

.block-type-select option {
  color: #37352f;
  background: #fff;
}

.block-content {
  flex: 1;
  min-width: 0;
}

/* ─── Block Inputs ────────────────────────────────────────────── */
.block-input {
  width: 100%;
  border: none;
  background: transparent;
  color: #37352f;
  font-family: inherit;
  outline: none;
  padding: 0.25rem 0;
  font-size: 1rem;
  line-height: 1.5;
}

.block-input::placeholder {
  color: #b0b0b0;
}

.block-textarea {
  width: 100%;
  border: none;
  background: transparent;
  color: #37352f;
  font-family: inherit;
  outline: none;
  padding: 0.25rem 0;
  font-size: 1rem;
  line-height: 1.5;
  resize: none;
  min-height: 1.5em;
}

.block-textarea::placeholder {
  color: #b0b0b0;
}

/* ─── Heading Styles ──────────────────────────────────────────── */
.heading-input {
  font-weight: 700;
}

.heading-1 .heading-input {
  font-size: 2rem;
  margin: 0.5rem 0;
}

.heading-2 .heading-input {
  font-size: 1.5rem;
  margin: 0.4rem 0;
}

.heading-3 .heading-input {
  font-size: 1.25rem;
  margin: 0.3rem 0;
}

/* ─── To-do Block ─────────────────────────────────────────────── */
.todo-block {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.todo-checkbox {
  margin-top: 6px;
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #2e7d64;
}

.todo-input.checked {
  text-decoration: line-through;
  color: #b0b0b0;
}

/* ─── Toggle Block ────────────────────────────────────────────── */
.toggle-block {
  display: flex;
  align-items: flex-start;
  gap: 0.25rem;
}

.toggle-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  font-size: 0.75rem;
  color: #6b6b6b;
  margin-top: 2px;
}

/* ─── Code Block ──────────────────────────────────────────────── */
.code-block {
  background: #1e1e1e;
  border-radius: 8px;
  overflow: hidden;
  margin: 0.5rem 0;
}

.code-lang-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: #2d2d2d;
  border-bottom: 1px solid #3d3d3d;
}

.code-lang-select {
  font-size: 0.7rem;
  padding: 0.15rem 0.4rem;
  background: #3d3d3d;
  color: #ccc;
  border: 1px solid #555;
  border-radius: 3px;
  font-family: inherit;
  cursor: pointer;
}

.copy-btn {
  font-size: 0.7rem;
  padding: 0.15rem 0.5rem;
  background: #3d3d3d;
  color: #ccc;
  border: 1px solid #555;
  border-radius: 3px;
  cursor: pointer;
}

.copy-btn:hover {
  background: #555;
}

.code-textarea {
  width: 100%;
  min-height: 100px;
  padding: 0.75rem;
  background: transparent;
  color: #d4d4d4;
  border: none;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 0.85rem;
  line-height: 1.5;
  resize: vertical;
  outline: none;
  tab-size: 2;
}

.code-textarea::placeholder {
  color: #666;
}

/* ─── Quote Block ─────────────────────────────────────────────── */
.quote-block {
  border-left: 3px solid #2e7d64;
  padding-left: 1rem;
  margin: 0.5rem 0;
}

.quote-textarea {
  font-style: italic;
  color: #6b6b6b;
}

/* ─── Callout Block ───────────────────────────────────────────── */
.callout-block {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  background: #f7f6f3;
  border-radius: 8px;
  padding: 1rem;
  margin: 0.5rem 0;
}

.callout-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
  margin-top: 2px;
}

.callout-textarea {
  background: transparent;
}

/* ─── Divider Block ───────────────────────────────────────────── */
.divider-block {
  padding: 0.5rem 0;
}

.divider {
  border: none;
  border-top: 1px solid #e9e9e7;
  margin: 0;
}

/* ─── Image Block ─────────────────────────────────────────────── */
.image-preview {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  margin: 0.5rem 0;
}

.image-preview img {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  display: block;
}

.remove-image-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  font-size: 0.75rem;
  opacity: 0;
  transition: opacity 0.15s;
}

.image-preview:hover .remove-image-btn {
  opacity: 1;
}

.image-upload-area {
  border: 2px dashed #e9e9e7;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  color: #6b6b6b;
  font-size: 0.85rem;
  transition: background 0.15s;
  margin: 0.5rem 0;
}

.image-upload-area:hover {
  background: #f7f6f3;
}

/* ─── List Blocks ─────────────────────────────────────────────── */
.list-block {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.list-marker {
  color: #6b6b6b;
  font-size: 0.9rem;
  flex-shrink: 0;
  margin-top: 4px;
  min-width: 1.2rem;
}

.number-marker {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 0.85rem;
}

/* ─── Paragraph Block ─────────────────────────────────────────── */
.paragraph-textarea {
  min-height: 1.5em;
}

/* ─── Block Actions ───────────────────────────────────────────── */
.block-actions {
  display: flex;
  gap: 0.15rem;
  opacity: 0;
  transition: opacity 0.15s;
  flex-shrink: 0;
  margin-top: 2px;
}

.block-action-btn {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid #e9e9e7;
  border-radius: 3px;
  color: #6b6b6b;
  font-size: 0.65rem;
  cursor: pointer;
  padding: 0;
  transition: background 0.1s;
}

.block-action-btn:hover {
  background: #e9e9e7;
}

.delete-block:hover {
  background: #fce4e4;
  color: #eb5757;
  border-color: #eb5757;
}

/* ─── Add Block Button ────────────────────────────────────────── */
.add-block-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: transparent;
  border: 1px dashed #e9e9e7;
  border-radius: 6px;
  color: #6b6b6b;
  font-size: 0.85rem;
  font-family: inherit;
  cursor: pointer;
  width: 100%;
  margin-top: 0.5rem;
  transition: background 0.15s, border-color 0.15s;
}

.add-block-btn:hover {
  background: #f7f6f3;
  border-color: #b0b0b0;
  color: #37352f;
}

/* ─── Document Footer ─────────────────────────────────────────── */
.doc-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e9e9e7;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.footer-info {
  font-size: 0.8rem;
  color: #6b6b6b;
}

.published-badge {
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  background: #e8f5e9;
  color: #2e7d64;
  border-radius: 12px;
}

.footer-right {
  display: flex;
  gap: 0.5rem;
}

.footer-btn {
  padding: 0.4rem 0.75rem;
  background: #fff;
  border: 1px solid #e9e9e7;
  border-radius: 6px;
  color: #37352f;
  font-size: 0.8rem;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s;
}

.footer-btn:hover {
  background: #f7f6f3;
}

.trash-btn:hover {
  background: #fce4e4;
  color: #eb5757;
  border-color: #eb5757;
}

/* ─── Scrollbar Styling ───────────────────────────────────────── */
.doc-sidebar::-webkit-scrollbar,
.doc-main::-webkit-scrollbar {
  width: 4px;
}

.doc-sidebar::-webkit-scrollbar-track,
.doc-main::-webkit-scrollbar-track {
  background: transparent;
}

.doc-sidebar::-webkit-scrollbar-thumb,
.doc-main::-webkit-scrollbar-thumb {
  background: #e9e9e7;
  border-radius: 2px;
}

.doc-sidebar::-webkit-scrollbar-thumb:hover,
.doc-main::-webkit-scrollbar-thumb:hover {
  background: #b0b0b0;
}
</style>
