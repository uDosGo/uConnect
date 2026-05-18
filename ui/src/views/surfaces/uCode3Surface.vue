<template>
  <div class="ucode3-surface">
    <!-- Surface Header -->
    <div class="surface-header">
      <div class="surface-header-left">
        <svg class="surface-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
        <h1>uCode3 <span class="badge">Surface</span></h1>
      </div>
      <div class="surface-header-right">
        <span class="header-badge notion-badge">Notion-Style Workspace</span>
        <span class="header-badge lens-badge">LENS Ready</span>
        <button class="theme-toggle" @click="toggleTheme" :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'">
          <!-- Sun icon -->
          <svg v-if="isDark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-sm">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
          <!-- Moon icon -->
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-sm">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Document Workspace -->
    <div class="workspace-layout">
      <!-- Sidebar (Document Tree) -->
      <aside class="doc-sidebar" :class="{ collapsed: sidebarCollapsed }">
        <div class="sidebar-header">
          <div class="sidebar-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-xs">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              class="search-input"
              placeholder="Search documents..."
            />
          </div>
          <button class="new-doc-btn" @click="createDocument">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-xs">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Page
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
            <!-- File icon -->
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-xs">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <span class="doc-title">{{ doc.title || 'Untitled' }}</span>
            <!-- Globe icon for published -->
            <svg v-if="doc.isPublished" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-xs published-dot" title="Published">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          </div>
        </div>
        <div class="sidebar-footer">
          <button class="sidebar-toggle-btn" @click="sidebarCollapsed = !sidebarCollapsed">
            <!-- Chevron left/right -->
            <svg v-if="!sidebarCollapsed" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-xs">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-xs">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
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
          <!-- File text icon -->
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="empty-icon">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          <h2>Welcome to uCode3</h2>
          <p>Select a document from the sidebar or create a new one.</p>
          <button class="create-btn" @click="createDocument">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-sm">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Create New Document
          </button>
        </div>

        <!-- Document Editor -->
        <div v-else class="document-editor">
          <!-- Cover Image -->
          <div v-if="activeDocument.coverImage" class="cover-image-container">
            <img :src="activeDocument.coverImage" alt="Cover" class="cover-image" />
            <button class="remove-cover-btn" @click="removeCover">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-xs">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div v-else class="cover-placeholder" @click="addCover">
            <!-- Image icon -->
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-sm">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span>Add Cover</span>
          </div>

          <!-- Document Header -->
          <div class="doc-header">
            <div class="doc-icon-area">
              <!-- File icon large -->
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
              <!-- Drag Handle -->
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
                  <!-- Chevron right/down -->
                  <svg v-if="!block.expanded" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-xs">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-xs">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
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
                <!-- Lightbulb icon -->
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="callout-icon">
                  <path d="M9 18h6"/>
                  <path d="M10 22h4"/>
                  <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
                </svg>
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
                  <button class="remove-image-btn" @click="removeImage(block)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-xs">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
                <div v-else class="image-upload-area" @click="uploadImage(block)">
                  <!-- Image icon -->
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-sm">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
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
                <button class="block-action-btn add-above" @click="addBlockAbove(index)" title="Add block above">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-xs">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </button>
                <button class="block-action-btn add-below" @click="addBlockBelow(index)" title="Add block below">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-xs">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </button>
                <button class="block-action-btn delete-block" @click="deleteBlock(index)" title="Delete block">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-xs">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Add Block Button (bottom) -->
            <button class="add-block-btn" @click="addBlockAtEnd">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-xs">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add a block
            </button>
          </div>

          <!-- Document Footer -->
          <div class="doc-footer">
            <div class="footer-left">
              <span class="footer-info">
                Last edited: {{ formatDate(activeDocument.updatedAt) }}
              </span>
              <span v-if="activeDocument.isPublished" class="published-badge">
                <!-- Globe icon -->
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-xs">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
                Published
              </span>
            </div>
            <div class="footer-right">
              <button class="footer-btn" @click="togglePublish">
                {{ activeDocument.isPublished ? 'Unpublish' : 'Publish' }}
              </button>
              <button class="footer-btn trash-btn" @click="deleteDocument">
                <!-- Trash icon -->
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-xs">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                Move to Trash
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
const isDark = ref(false)

// ─── Theme ──────────────────────────────────────────────────────
function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('ucode3-dark', isDark.value)
}

onMounted(() => {
  activeDocumentId.value = 'welcome'
  // Respect system preference
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    isDark.value = true
    document.documentElement.classList.add('ucode3-dark')
  }
})

// ─── Sample Documents ───────────────────────────────────────────
const documents = ref<Document[]>([
  {
    id: 'welcome',
    title: 'Welcome to uCode3',
    icon: 'file',
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
    icon: 'layers',
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
    icon: 'link',
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
    icon: 'map',
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
    icon: 'file',
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

  const cursorPos = 0
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
  const icons = ['file', 'layers', 'link', 'map', 'star', 'target', 'lightbulb', 'pin', 'clipboard', 'folder']
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

</script>

<style>
/* ─── CSS Custom Properties (Light / Dark) — UNSCOPED ─────────── */
:root {
  --ucode3-bg: #ffffff;
  --ucode3-text: #37352f;
  --ucode3-header-bg: #fafafa;
  --ucode3-header-border: #e9e9e7;
  --ucode3-sidebar-bg: #f7f6f3;
  --ucode3-sidebar-border: #e9e9e7;
  --ucode3-sidebar-hover: #e9e9e7;
  --ucode3-sidebar-active: #d9e8ff;
  --ucode3-input-bg: #ffffff;
  --ucode3-input-border: #e9e9e7;
  --ucode3-text-muted: #6b6b6b;
  --ucode3-text-subtle: #b0b0b0;
  --ucode3-badge-bg: #e9e9e7;
  --ucode3-badge-text: #6b6b6b;
  --ucode3-notion-bg: #e8f5e9;
  --ucode3-notion-text: #2e7d64;
  --ucode3-lens-bg: #e3f2fd;
  --ucode3-lens-text: #1565c0;
  --ucode3-callout-bg: #f7f6f3;
  --ucode3-cover-placeholder: #f7f6f3;
  --ucode3-cover-border: #e9e9e7;
  --ucode3-divider: #e9e9e7;
  --ucode3-scrollbar: #e9e9e7;
  --ucode3-scrollbar-hover: #b0b0b0;
  --ucode3-btn-hover: #f7f6f3;
  --ucode3-create-btn-bg: #2e7d64;
  --ucode3-create-btn-text: #ffffff;
  --ucode3-create-btn-hover: #236b54;
  --ucode3-published-bg: #e8f5e9;
  --ucode3-published-text: #2e7d64;
  --ucode3-trash-hover-bg: #fce4e4;
  --ucode3-trash-hover-text: #eb5757;
  --ucode3-trash-hover-border: #eb5757;
  --ucode3-code-bg: #1e1e1e;
  --ucode3-code-bar: #2d2d2d;
  --ucode3-code-border: #3d3d3d;
  --ucode3-code-text: #d4d4d4;
  --ucode3-code-select-bg: #3d3d3d;
  --ucode3-code-select-text: #ccc;
  --ucode3-code-select-border: #555;
  --ucode3-toggle-btn: #6b6b6b;
  --ucode3-drag-handle: #b0b0b0;
  --ucode3-drag-handle-hover: #6b6b6b;
  --ucode3-block-type-color: #b0b0b0;
  --ucode3-block-type-hover-border: #e9e9e7;
  --ucode3-block-type-hover-bg: #f7f6f3;
  --ucode3-block-action-border: #e9e9e7;
  --ucode3-block-action-color: #6b6b6b;
  --ucode3-block-action-hover-bg: #e9e9e7;
  --ucode3-add-block-border: #e9e9e7;
  --ucode3-add-block-color: #6b6b6b;
  --ucode3-add-block-hover-bg: #f7f6f3;
  --ucode3-add-block-hover-border: #b0b0b0;
  --ucode3-add-block-hover-color: #37352f;
  --ucode3-footer-btn-bg: #ffffff;
  --ucode3-footer-btn-border: #e9e9e7;
  --ucode3-footer-btn-color: #37352f;
  --ucode3-footer-btn-hover-bg: #f7f6f3;
  --ucode3-quote-text: #6b6b6b;
  --ucode3-quote-border: #2e7d64;
  --ucode3-todo-checked: #b0b0b0;
  --ucode3-checkbox-accent: #2e7d64;
  --ucode3-image-upload-border: #e9e9e7;
  --ucode3-image-upload-color: #6b6b6b;
  --ucode3-image-upload-hover-bg: #f7f6f3;
  --ucode3-list-marker: #6b6b6b;
  --ucode3-option-bg: #ffffff;
  --ucode3-option-text: #37352f;
}

.ucode3-dark {
  --ucode3-bg: #1a1a2e;
  --ucode3-text: #e0e0e0;
  --ucode3-header-bg: #16213e;
  --ucode3-header-border: #2a2a4a;
  --ucode3-sidebar-bg: #16213e;
  --ucode3-sidebar-border: #2a2a4a;
  --ucode3-sidebar-hover: #2a2a4a;
  --ucode3-sidebar-active: #1a3a5e;
  --ucode3-input-bg: #1a1a2e;
  --ucode3-input-border: #2a2a4a;
  --ucode3-text-muted: #a0a0c0;
  --ucode3-text-subtle: #6b6b8a;
  --ucode3-badge-bg: #2a2a4a;
  --ucode3-badge-text: #a0a0c0;
  --ucode3-notion-bg: #1a3a2e;
  --ucode3-notion-text: #7dcea0;
  --ucode3-lens-bg: #1a2a3e;
  --ucode3-lens-text: #7db0e0;
  --ucode3-callout-bg: #16213e;
  --ucode3-cover-placeholder: #16213e;
  --ucode3-cover-border: #2a2a4a;
  --ucode3-divider: #2a2a4a;
  --ucode3-scrollbar: #2a2a4a;
  --ucode3-scrollbar-hover: #3a3a5a;
  --ucode3-btn-hover: #2a2a4a;
  --ucode3-create-btn-bg: #2e7d64;
  --ucode3-create-btn-text: #ffffff;
  --ucode3-create-btn-hover: #236b54;
  --ucode3-published-bg: #1a3a2e;
  --ucode3-published-text: #7dcea0;
  --ucode3-trash-hover-bg: #3a1a1a;
  --ucode3-trash-hover-text: #eb5757;
  --ucode3-trash-hover-border: #eb5757;
  --ucode3-toggle-btn: #a0a0c0;
  --ucode3-drag-handle: #6b6b8a;
  --ucode3-drag-handle-hover: #a0a0c0;
  --ucode3-block-type-color: #6b6b8a;
  --ucode3-block-type-hover-border: #2a2a4a;
  --ucode3-block-type-hover-bg: #16213e;
  --ucode3-block-action-border: #2a2a4a;
  --ucode3-block-action-color: #a0a0c0;
  --ucode3-block-action-hover-bg: #2a2a4a;
  --ucode3-add-block-border: #2a2a4a;
  --ucode3-add-block-color: #a0a0c0;
  --ucode3-add-block-hover-bg: #16213e;
  --ucode3-add-block-hover-border: #6b6b8a;
  --ucode3-add-block-hover-color: #e0e0e0;
  --ucode3-footer-btn-bg: #1a1a2e;
  --ucode3-footer-btn-border: #2a2a4a;
  --ucode3-footer-btn-color: #e0e0e0;
  --ucode3-footer-btn-hover-bg: #2a2a4a;
  --ucode3-quote-text: #a0a0c0;
  --ucode3-quote-border: #7dcea0;
  --ucode3-todo-checked: #6b6b8a;
  --ucode3-checkbox-accent: #7dcea0;
  --ucode3-image-upload-border: #2a2a4a;
  --ucode3-image-upload-color: #a0a0c0;
  --ucode3-image-upload-hover-bg: #16213e;
  --ucode3-list-marker: #a0a0c0;
  --ucode3-option-bg: #1a1a2e;
  --ucode3-option-text: #e0e0e0;
}
</style>

<style scoped>
/* ─── Icon Sizes ──────────────────────────────────────────────── */
.icon-xs {
  width: 14px;
  height: 14px;
}

.icon-sm {
  width: 18px;
  height: 18px;
}

/* ─── Surface Layout ──────────────────────────────────────────── */
.ucode3-surface {
  background: var(--ucode3-bg);
  color: var(--ucode3-text);
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
  border-bottom: 1px solid var(--ucode3-header-border);
  background: var(--ucode3-header-bg);
}

.surface-header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.surface-icon {
  width: 20px;
  height: 20px;
  color: var(--ucode3-text);
}

.surface-header-left h1 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: var(--ucode3-text);
}

.badge {
  font-size: 0.6rem;
  background: var(--ucode3-badge-bg);
  color: var(--ucode3-badge-text);
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
  align-items: center;
}

.header-badge {
  font-size: 0.65rem;
  padding: 3px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.notion-badge {
  background: var(--ucode3-notion-bg);
  color: var(--ucode3-notion-text);
}

.lens-badge {
  background: var(--ucode3-lens-bg);
  color: var(--ucode3-lens-text);
}

/* ─── Theme Toggle ────────────────────────────────────────────── */
.theme-toggle {
  background: transparent;
  border: 1px solid var(--ucode3-header-border);
  border-radius: 6px;
  padding: 0.3rem 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  transition: background 0.15s;
  display: flex;
  align-items: center;
  color: var(--ucode3-text);
}

.theme-toggle:hover {
  background: var(--ucode3-btn-hover);
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
  background: var(--ucode3-sidebar-bg);
  border-right: 1px solid var(--ucode3-sidebar-border);
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
  border-bottom: 1px solid var(--ucode3-sidebar-border);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sidebar-search {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--ucode3-input-bg);
  border: 1px solid var(--ucode3-input-border);
  border-radius: 6px;
  padding: 0.4rem 0.6rem;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 0.8rem;
  color: var(--ucode3-text);
  outline: none;
  font-family: inherit;
}

.search-input::placeholder {
  color: var(--ucode3-text-subtle);
}

.new-doc-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.75rem;
  background: var(--ucode3-input-bg);
  border: 1px solid var(--ucode3-input-border);
  border-radius: 6px;
  color: var(--ucode3-text);
  font-size: 0.8rem;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s;
}

.new-doc-btn:hover {
  background: var(--ucode3-btn-hover);
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
  background: var(--ucode3-sidebar-hover);
}

.doc-tree-item.active {
  background: var(--ucode3-sidebar-active);
}

.doc-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--ucode3-text);
}

.published-dot {
  flex-shrink: 0;
  color: var(--ucode3-published-text);
}

.sidebar-footer {
  padding: 0.5rem;
  border-top: 1px solid var(--ucode3-sidebar-border);
}

.sidebar-toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.6rem;
  background: transparent;
  border: 1px solid var(--ucode3-input-border);
  border-radius: 4px;
  color: var(--ucode3-text-muted);
  font-size: 0.75rem;
  font-family: inherit;
  cursor: pointer;
  width: 100%;
  transition: background 0.15s;
}

.sidebar-toggle-btn:hover {
  background: var(--ucode3-btn-hover);
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
  color: var(--ucode3-text-muted);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--ucode3-divider);
  border-top-color: var(--ucode3-create-btn-bg);
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
  width: 48px;
  height: 48px;
  margin-bottom: 1rem;
  color: var(--ucode3-text-muted);
}

.empty-state h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  color: var(--ucode3-text);
}

.empty-state p {
  font-size: 0.9rem;
  color: var(--ucode3-text-muted);
  margin: 0 0 1.5rem;
  max-width: 400px;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.25rem;
  background: var(--ucode3-create-btn-bg);
  color: var(--ucode3-create-btn-text);
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s;
}

.create-btn:hover {
  background: var(--ucode3-create-btn-hover);
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
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s;
  display: flex;
  align-items: center;
}

.cover-image-container:hover .remove-cover-btn {
  opacity: 1;
}

.cover-placeholder {
  width: 100%;
  height: 48px;
  background: var(--ucode3-cover-placeholder);
  border: 1px dashed var(--ucode3-cover-border);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  cursor: pointer;
  transition: background 0.15s;
  font-size: 0.8rem;
  color: var(--ucode3-text-muted);
}

.cover-placeholder:hover {
  background: var(--ucode3-btn-hover);
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
  width: 40px;
  height: 40px;
  color: var(--ucode3-text);
}

.change-icon-btn {
  font-size: 0.7rem;
  color: var(--ucode3-text-muted);
  background: transparent;
  border: 1px solid var(--ucode3-input-border);
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
  color: var(--ucode3-text);
  width: 100%;
  padding: 0.25rem 0;
  outline: none;
  font-family: inherit;
}

.doc-title-input::placeholder {
  color: var(--ucode3-text-subtle);
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
  color: var(--ucode3-drag-handle);
  cursor: grab;
  padding: 0.25rem;
  opacity: 0;
  transition: opacity 0.15s;
  flex-shrink: 0;
  width: 16px;
  text-align: center;
  margin-top: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drag-handle:hover {
  color: var(--ucode3-drag-handle-hover);
}

.block-type-select {
  font-size: 0.65rem;
  padding: 0.15rem 0.3rem;
  border: 1px solid transparent;
  border-radius: 3px;
  background: transparent;
  color: var(--ucode3-block-type-color);
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
  border-color: var(--ucode3-block-type-hover-border);
  background: var(--ucode3-block-type-hover-bg);
}

.block-type-select option {
  color: var(--ucode3-option-text);
  background: var(--ucode3-option-bg);
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
  color: var(--ucode3-text);
  font-family: inherit;
  outline: none;
  padding: 0.25rem 0;
  font-size: 1rem;
  line-height: 1.5;
}

.block-input::placeholder {
  color: var(--ucode3-text-subtle);
}

.block-textarea {
  width: 100%;
  border: none;
  background: transparent;
  color: var(--ucode3-text);
  font-family: inherit;
  outline: none;
  padding: 0.25rem 0;
  font-size: 1rem;
  line-height: 1.5;
  resize: none;
  min-height: 1.5em;
}

.block-textarea::placeholder {
  color: var(--ucode3-text-subtle);
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
  accent-color: var(--ucode3-checkbox-accent);
}

.todo-input.checked {
  text-decoration: line-through;
  color: var(--ucode3-todo-checked);
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
  color: var(--ucode3-toggle-btn);
  margin-top: 2px;
  display: flex;
  align-items: center;
}

/* ─── Code Block ──────────────────────────────────────────────── */
.code-block {
  background: var(--ucode3-code-bg);
  border-radius: 8px;
  overflow: hidden;
  margin: 0.5rem 0;
}

.code-lang-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: var(--ucode3-code-bar);
  border-bottom: 1px solid var(--ucode3-code-border);
}

.code-lang-select {
  font-size: 0.7rem;
  padding: 0.15rem 0.4rem;
  background: var(--ucode3-code-select-bg);
  color: var(--ucode3-code-select-text);
  border: 1px solid var(--ucode3-code-select-border);
  border-radius: 3px;
  font-family: inherit;
  cursor: pointer;
}

.copy-btn {
  font-size: 0.7rem;
  padding: 0.15rem 0.5rem;
  background: var(--ucode3-code-select-bg);
  color: var(--ucode3-code-select-text);
  border: 1px solid var(--ucode3-code-select-border);
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
  color: var(--ucode3-code-text);
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
  border-left: 3px solid var(--ucode3-quote-border);
  padding-left: 1rem;
  margin: 0.5rem 0;
}

.quote-textarea {
  font-style: italic;
  color: var(--ucode3-quote-text);
}

/* ─── Callout Block ───────────────────────────────────────────── */
.callout-block {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  background: var(--ucode3-callout-bg);
  border-radius: 8px;
  padding: 1rem;
  margin: 0.5rem 0;
}

.callout-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  margin-top: 2px;
  color: var(--ucode3-text);
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
  border-top: 1px solid var(--ucode3-divider);
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
  display: flex;
  align-items: center;
}

.remove-image-btn:hover {
  background: rgba(0, 0, 0, 0.7);
}

.image-upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
  border: 2px dashed var(--ucode3-image-upload-border);
  border-radius: 8px;
  cursor: pointer;
  color: var(--ucode3-image-upload-color);
  font-size: 0.85rem;
  transition: background 0.15s;
}

.image-upload-area:hover {
  background: var(--ucode3-image-upload-hover-bg);
}

/* ─── List Blocks ─────────────────────────────────────────────── */
.list-block {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.list-marker {
  color: var(--ucode3-list-marker);
  font-size: 1rem;
  min-width: 1.5rem;
  text-align: right;
  margin-top: 4px;
}

.number-marker {
  font-variant-numeric: tabular-nums;
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
  background: transparent;
  border: 1px solid var(--ucode3-block-action-border);
  border-radius: 3px;
  padding: 0.15rem;
  cursor: pointer;
  color: var(--ucode3-block-action-color);
  display: flex;
  align-items: center;
  transition: background 0.1s;
}

.block-action-btn:hover {
  background: var(--ucode3-block-action-hover-bg);
}

.delete-block:hover {
  background: var(--ucode3-trash-hover-bg);
  color: var(--ucode3-trash-hover-text);
  border-color: var(--ucode3-trash-hover-border);
}

/* ─── Add Block Button ────────────────────────────────────────── */
.add-block-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: transparent;
  border: 1px solid var(--ucode3-add-block-border);
  border-radius: 6px;
  color: var(--ucode3-add-block-color);
  font-size: 0.85rem;
  font-family: inherit;
  cursor: pointer;
  width: 100%;
  margin-top: 0.5rem;
  transition: all 0.15s;
}

.add-block-btn:hover {
  background: var(--ucode3-add-block-hover-bg);
  border-color: var(--ucode3-add-block-hover-border);
  color: var(--ucode3-add-block-hover-color);
}

/* ─── Document Footer ─────────────────────────────────────────── */
.doc-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  margin-top: 2rem;
  border-top: 1px solid var(--ucode3-divider);
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.footer-info {
  font-size: 0.75rem;
  color: var(--ucode3-text-muted);
}

.published-badge {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.7rem;
  background: var(--ucode3-published-bg);
  color: var(--ucode3-published-text);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-weight: 500;
}

.footer-right {
  display: flex;
  gap: 0.5rem;
}

.footer-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.75rem;
  background: var(--ucode3-footer-btn-bg);
  border: 1px solid var(--ucode3-footer-btn-border);
  border-radius: 6px;
  color: var(--ucode3-footer-btn-color);
  font-size: 0.8rem;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s;
}

.footer-btn:hover {
  background: var(--ucode3-footer-btn-hover-bg);
}

.trash-btn:hover {
  background: var(--ucode3-trash-hover-bg);
  color: var(--ucode3-trash-hover-text);
  border-color: var(--ucode3-trash-hover-border);
}

/* ─── Scrollbar ───────────────────────────────────────────────── */
.doc-sidebar::-webkit-scrollbar,
.doc-main::-webkit-scrollbar {
  width: 6px;
}

.doc-sidebar::-webkit-scrollbar-track,
.doc-main::-webkit-scrollbar-track {
  background: transparent;
}

.doc-sidebar::-webkit-scrollbar-thumb,
.doc-main::-webkit-scrollbar-thumb {
  background: var(--ucode3-scrollbar);
  border-radius: 3px;
}

.doc-sidebar::-webkit-scrollbar-thumb:hover,
.doc-main::-webkit-scrollbar-thumb:hover {
  background: var(--ucode3-scrollbar-hover);
}
</style>
