<template>
  <div class="usxd-surface">
    <!-- Surface Header with Definition -->
    <div class="surface-header">
      <h1><span class="surface-icon">📖</span> USXD Renderer</h1>
      <p class="surface-tagline">View and edit universal documents. One format, any surface.</p>
      <p class="surface-definition">
        <strong>What's USXD?</strong> Universal Surface Document - a file format that looks right on any screen.
        Create once, view anywhere.
      </p>
    </div>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <span class="spinner">⏳</span>
      <p>Loading USXD renderer…</p>
      <p class="helper-text">This usually takes a few seconds.</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <span class="error-icon">⚠️</span>
      <h3>Couldn't load USXD renderer</h3>
      <p>{{ error.message }}</p>
      <p class="helper-text">
        Try:
        <br>
        • Refreshing the page
        <br>
        • Checking your internet connection
        <br>
        • Making sure you have the required dependencies
      </p>
      <button @click="reloadRenderer" class="primary">
        🔄 Try Again
      </button>
    </div>
    
    <!-- Main Content -->
    <div v-else class="main-content">
      <!-- Document List -->
      <div class="document-list">
        <div class="list-header">
          <h2>Your USXD Documents</h2>
          <div class="list-actions">
            <button @click="createNewDocument" class="primary">
              ➕ New USXD
            </button>
            <button @click="importDocument" class="secondary">
              📤 Import
            </button>
          </div>
        </div>
        
        <!-- Search Bar -->
        <div class="search-bar">
          <span class="search-icon">🔍</span>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search documents…" 
            @input="searchDocuments"
          >
          <button v-if="searchQuery" @click="clearSearch" class="clear-search">
            ✕
          </button>
        </div>
        
        <!-- Empty State -->
        <div v-if="filteredDocuments.length === 0" class="empty-state">
          <span class="empty-icon">📭</span>
          <h3>No USXD documents found</h3>
          <p>Create your first universal document</p>
          <button @click="createNewDocument" class="primary">
            ➕ New USXD Document
          </button>
          <p class="helper-text">
            💡 USXD files work on any device and surface
          </p>
        </div>
        
        <!-- Document Grid -->
        <div v-else class="document-grid">
          <div 
            v-for="doc in filteredDocuments" 
            :key="doc.id" 
            class="document-card" 
            @click="openDocument(doc)"
          >
            <div class="document-icon">📖</div>
            <h3 class="document-title">{{ doc.title || 'Untitled Document' }}</h3>
            <p class="document-meta">
              {{ formatRelativeTime(doc.modified) }} • {{ formatFileSize(doc.size) }}
            </p>
            <div class="document-actions">
              <button @click.stop="shareDocument(doc)" class="action-icon" title="Share">
                🔗
              </button>
              <button @click.stop="deleteDocument(doc)" class="action-icon danger" title="Delete">
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Document Statistics -->
      <div class="document-stats">
        <p>
          📊 {{ documents.length }} documents • {{ formatFileSize(totalSize) }} total
        </p>
      </div>
    </div>
    
    <!-- Document Viewer Modal -->
    <div v-if="selectedDocument" class="modal-overlay">
      <div class="document-viewer">
        <div class="viewer-header">
          <h2>{{ selectedDocument.title || 'Untitled Document' }}</h2>
          <div class="viewer-actions">
            <button @click="exportDocument" class="secondary small">
              📥 Export
            </button>
            <button @click="closeViewer" class="secondary small">
              ✕ Close
            </button>
          </div>
        </div>
        
        <div class="viewer-content">
          <!-- USXD Content Renderer -->
          <div class="usxd-content" v-html="renderedContent"></div>
        </div>
        
        <div class="viewer-footer">
          <p>
            {{ formatFileSize(selectedDocument.size) }} • 
            Modified {{ formatRelativeTime(selectedDocument.modified) }}
          </p>
        </div>
      </div>
    </div>
    
    <!-- New Document Modal -->
    <div v-if="showNewDocumentModal" class="modal-overlay">
      <div class="new-document-modal">
        <h3>📝 Create New USXD Document</h3>
        
        <div class="form-group">
          <label for="document-title">Document Title</label>
          <input 
            id="document-title" 
            v-model="newDocumentTitle" 
            type="text" 
            placeholder="My Document"
          >
        </div>
        
        <div class="form-group">
          <label for="document-template">Start with a template</label>
          <select id="document-template" v-model="newDocumentTemplate">
            <option value="blank">Blank Document</option>
            <option value="meeting-notes">Meeting Notes</option>
            <option value="project-plan">Project Plan</option>
            <option value="report">Report</option>
            <option value="presentation">Presentation</option>
          </select>
        </div>
        
        <div class="modal-actions">
          <button @click="createDocument" class="primary">
            ✅ Create Document
          </button>
          <button @click="showNewDocumentModal = false" class="secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
    
    <!-- Import Document Modal -->
    <div v-if="showImportModal" class="modal-overlay">
      <div class="import-modal">
        <h3>📤 Import USXD Document</h3>
        <p>Upload a USXD file from your computer</p>
        
        <div class="upload-area" @click="triggerFileInput" @dragover.prevent @drop.prevent="handleDrop">
          <span class="upload-icon">📁</span>
          <p>Drag USXD file here or click to browse</p>
          <p class="helper-text">
            Only .usxd files are supported
          </p>
          <input 
            type="file" 
            ref="fileInput" 
            accept=".usxd" 
            @change="handleFileSelect" 
            style="display: none"
          >
        </div>
        
        <div class="modal-actions">
          <button @click="showImportModal = false" class="secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useUSXDStore } from '@/stores/usxd'
import { formatDistanceToNow } from 'date-fns'

export default {
  name: 'USXDSurface',
  setup() {
    const usxdStore = useUSXDStore()
    
    // State
    const isLoading = ref(false)
    const error = ref(null)
    const searchQuery = ref('')
    const selectedDocument = ref(null)
    const renderedContent = ref('')
    const showNewDocumentModal = ref(false)
    const showImportModal = ref(false)
    const newDocumentTitle = ref('Untitled Document')
    const newDocumentTemplate = ref('blank')
    
    // Computed properties
    const documents = computed(() => usxdStore.documents)
    const totalSize = computed(() => {
      return documents.value.reduce((sum, doc) => sum + doc.size, 0)
    })
    
    const filteredDocuments = computed(() => {
      if (!searchQuery.value) return documents.value
      
      const query = searchQuery.value.toLowerCase()
      return documents.value.filter(doc => 
        doc.title.toLowerCase().includes(query) ||
        doc.content.toLowerCase().includes(query)
      )
    })
    
    // Methods
    const formatFileSize = (bytes) => {
      if (bytes < 1024) return `${bytes} B`
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
      if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
    }
    
    const formatRelativeTime = (dateString) => {
      if (!dateString) return 'Unknown'
      const date = new Date(dateString)
      return formatDistanceToNow(date, { addSuffix: true })
    }
    
    const loadDocuments = async () => {
      isLoading.value = true
      error.value = null
      try {
        await usxdStore.loadDocuments()
      } catch (err) {
        error.value = { message: err.message || 'Could not load USXD documents' }
      } finally {
        isLoading.value = false
      }
    }
    
    const reloadRenderer = loadDocuments
    
    const createNewDocument = () => {
      newDocumentTitle.value = 'Untitled Document'
      newDocumentTemplate.value = 'blank'
      showNewDocumentModal.value = true
    }
    
    const createDocument = async () => {
      if (!newDocumentTitle.value.trim()) return
      
      isLoading.value = true
      try {
        await usxdStore.createDocument({
          title: newDocumentTitle.value,
          template: newDocumentTemplate.value
        })
        showNewDocumentModal.value = false
        await loadDocuments()
      } catch (err) {
        error.value = { message: err.message || 'Could not create document' }
      } finally {
        isLoading.value = false
      }
    }
    
    const importDocument = () => {
      showImportModal.value = true
    }
    
    const triggerFileInput = () => {
      // Would trigger file input
    }
    
    const handleDrop = (event) => {
      // Would handle file drop
    }
    
    const handleFileSelect = (event) => {
      // Would handle file select
    }
    
    const openDocument = async (doc) => {
      isLoading.value = true
      try {
        const content = await usxdStore.openDocument(doc.id)
        renderedContent.value = content
        selectedDocument.value = doc
      } catch (err) {
        error.value = { message: err.message || 'Could not open document' }
      } finally {
        isLoading.value = false
      }
    }
    
    const closeViewer = () => {
      selectedDocument.value = null
      renderedContent.value = ''
    }
    
    const shareDocument = (doc) => {
      alert(`Would share document: ${doc.title}`)
    }
    
    const deleteDocument = (doc) => {
      if (confirm(`Delete ${doc.title}? This cannot be undone.`)) {
        alert(`Would delete document: ${doc.title}`)
      }
    }
    
    const exportDocument = () => {
      if (selectedDocument.value) {
        alert(`Would export: ${selectedDocument.value.title}`)
      }
    }
    
    const searchDocuments = () => {
      // Handled by computed property
    }
    
    const clearSearch = () => {
      searchQuery.value = ''
    }
    
    // Load initial data
    loadDocuments()
    
    return {
      isLoading,
      error,
      searchQuery,
      selectedDocument,
      renderedContent,
      showNewDocumentModal,
      showImportModal,
      newDocumentTitle,
      newDocumentTemplate,
      documents,
      totalSize,
      filteredDocuments,
      formatFileSize,
      formatRelativeTime,
      reloadRenderer,
      createNewDocument,
      createDocument,
      importDocument,
      triggerFileInput,
      handleDrop,
      handleFileSelect,
      openDocument,
      closeViewer,
      shareDocument,
      deleteDocument,
      exportDocument,
      searchDocuments,
      clearSearch
    }
  }
}
</script>

<style scoped>
.usxd-surface {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.surface-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.surface-icon {
  margin-right: 0.5rem;
}

.surface-tagline {
  color: var(--text-secondary);
  margin: 0.5rem 0;
}

.surface-definition {
  color: var(--text-tertiary);
  font-size: 0.9rem;
  margin: 0;
}

.loading-state, .error-state {
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
}

.spinner, .error-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 1rem;
}

.main-content {
  margin-top: 1rem;
}

.document-list {
  margin-bottom: 1rem;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.list-header h2 {
  margin: 0;
  font-size: 1.2rem;
}

.list-actions {
  display: flex;
  gap: 0.5rem;
}

.search-bar {
  position: relative;
  margin-bottom: 1rem;
}

.search-bar input {
  width: 100%;
  padding: 0.75rem 2.5rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 1rem;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
}

.clear-search {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-tertiary);
}

.empty-state {
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
  background: var(--surface-background);
  border-radius: 8px;
}

.empty-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 1rem;
}

.document-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.document-card {
  background: var(--surface-background);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.document-card:hover {
  background: var(--surface-hover);
  border-color: var(--primary-color);
}

.document-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.document-title {
  margin: 0;
  font-size: 1.1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.document-meta {
  font-size: 0.85rem;
  color: var(--text-tertiary);
  margin: 0.5rem 0;
}

.document-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.action-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.25rem;
}

.action-icon.danger {
  color: var(--danger-color);
}

.document-stats {
  text-align: right;
  color: var(--text-tertiary);
  font-size: 0.85rem;
  padding: 0.5rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.document-viewer, .new-document-modal, .import-modal {
  background: var(--background);
  border-radius: 8px;
  padding: 1.5rem;
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.viewer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.viewer-content {
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 1rem;
  background: white;
  min-height: 400px;
  margin-bottom: 1rem;
}

.usxd-content {
  line-height: 1.6;
}

.usxd-content h1, .usxd-content h2, .usxd-content h3 {
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.usxd-content pre {
  background: var(--code-background);
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
}

.viewer-footer {
  text-align: right;
  color: var(--text-tertiary);
  font-size: 0.85rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.form-group input, .form-group select {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 1rem;
}

.upload-area {
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  margin: 1rem 0;
}

.upload-area:hover {
  border-color: var(--primary-color);
  background: var(--surface-hover);
}

.upload-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.modal-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

button.primary {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

button.secondary {
  background: var(--surface-background);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

button.danger {
  background: var(--danger-background);
  color: var(--danger-color);
  border: 1px solid var(--danger-border);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

button.small {
  padding: 0.25rem 0.5rem;
  font-size: 0.85rem;
}
</style>