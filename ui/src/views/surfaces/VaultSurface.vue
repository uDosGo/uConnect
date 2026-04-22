<template>
  <div class="vault-surface">
    <!-- Surface Header with Definition -->
    <div class="surface-header">
      <h1><span class="surface-icon">📁</span> Vault</h1>
      <p class="surface-tagline">Your files, organized your way.</p>
      <p class="surface-definition">
        <strong>What's the Vault?</strong> It's where uDOS keeps everything you create—documents, notes, settings, uploads. 
        Think of it as your digital filing cabinet.
      </p>
    </div>
    
    <!-- Action Bar -->
    <div class="action-bar">
      <button class="primary" @click="handleUpload" title="Upload files from your computer">
        📤 Upload File
      </button>
      <button class="secondary" @click="createNewDocument" title="Create a new document">
        📝 New Document
      </button>
      <button class="secondary" @click="createNewFolder" title="Create a new folder">
        📁 New Folder
      </button>
      <button class="secondary" @click="syncAll" title="Sync changes with connected services">
        🔄 Sync Changes
      </button>
      <div class="helper-text">
        💡 <strong>Tip:</strong> Drag and drop files directly into the list below
      </div>
    </div>
    
    <!-- Search Bar -->
    <div class="search-bar">
      <span class="search-icon">🔍</span>
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="Search your files…" 
        @input="handleSearch"
      >
      <button v-if="searchQuery" class="clear-search" @click="clearSearch" title="Clear search">
        ✕
      </button>
    </div>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <span class="spinner">⏳</span>
      <p>Loading your files…</p>
      <p class="helper-text">This usually takes a few seconds.</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <span class="error-icon">⚠️</span>
      <h3>Couldn't load your files</h3>
      <p>We tried to reach your Vault, but something blocked the connection.</p>
      <p class="helper-text">
        Try: refreshing the page, or checking your internet connection.
      </p>
      <button class="primary" @click="reloadFiles">
        🔄 Try Again
      </button>
    </div>
    
    <!-- Empty State -->
    <div v-else-if="filteredFiles.length === 0" class="empty-state">
      <span class="empty-icon">📭</span>
      <h3>Your Vault is empty</h3>
      <p>Add your first file to get started.</p>
      <div class="empty-actions">
        <button class="primary" @click="handleUpload">
          📤 Upload File
        </button>
        <button class="secondary" @click="createNewDocument">
          📝 Create Document
        </button>
        <button class="secondary" @click="showImportOptions">
          🔗 Import from Bridge
        </button>
      </div>
      <p class="helper-text">
        Supported formats: Documents, images, code, and more
      </p>
    </div>
    
    <!-- File List (Main Content) -->
    <div v-else class="file-list">
      <div class="file-grid">
        <div 
          v-for="file in filteredFiles" 
          :key="file.id" 
          class="file-card" 
          @click="openFile(file)" 
          :title="`Open ${file.name}`"
        >
          <span class="file-icon">
            {{ getFileIcon(file) }}
          </span>
          <div class="file-info">
            <strong class="file-name">{{ file.name }}</strong>
            <span class="file-size">{{ formatFileSize(file.size) }}</span>
            <span class="file-date">Updated {{ formatRelativeTime(file.updatedAt) }}</span>
          </div>
          <div class="file-actions">
            <button @click.stop="shareFile(file)" title="Share this file">
              🔗
            </button>
            <button @click.stop="deleteFile(file)" title="Delete this file">
              🗑️
            </button>
          </div>
        </div>
      </div>
      
      <!-- File Statistics -->
      <div class="file-stats">
        <p>
          📊 {{ filteredFiles.length }} files • 
          {{ formatFileSize(totalSize) }} total • 
          {{ folders.length }} folders
        </p>
      </div>
    </div>
    
    <!-- File Upload Modal -->
    <div v-if="showUploadModal" class="modal-overlay">
      <div class="modal">
        <h3>📤 Upload Files</h3>
        <p>Add files from your computer to your Vault.</p>
        
        <div class="upload-area" @click="triggerFileInput" @dragover.prevent @drop.prevent="handleDrop">
          <span class="upload-icon">📁</span>
          <p>Drag files here or click to browse</p>
          <p class="helper-text">
            Supported: Documents, images, code, archives
          </p>
          <input 
            type="file" 
            ref="fileInput" 
            multiple 
            @change="handleFileSelect" 
            style="display: none"
          >
        </div>
        
        <div class="modal-actions">
          <button class="secondary" @click="showUploadModal = false">
            Cancel
          </button>
        </div>
      </div>
    </div>
    
    <!-- File Preview Modal -->
    <div v-if="previewFile" class="modal-overlay">
      <div class="file-preview-modal">
        <div class="preview-header">
          <h3>{{ previewFile.name }}</h3>
          <div class="preview-actions">
            <button @click="downloadFile(previewFile)" title="Download">
              💾 Download
            </button>
            <button @click="shareFile(previewFile)" title="Share">
              🔗 Share
            </button>
            <button @click="closePreview" title="Close">
              ✕ Close
            </button>
          </div>
        </div>
        
        <div class="preview-content">
          <div v-if="previewFile.type === 'markdown'" class="markdown-preview" v-html="renderedMarkdown"></div>
          <div v-else-if="previewFile.type === 'image'" class="image-preview">
            <img :src="previewFile.previewUrl" alt="Preview">
          </div>
          <div v-else class="text-preview">
            <pre>{{ previewContent }}</pre>
          </div>
        </div>
        
        <div class="preview-footer">
          <p>
            {{ formatFileSize(previewFile.size) }} • 
            Updated {{ formatRelativeTime(previewFile.updatedAt) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useVaultStore } from '@/stores/vault'
import { formatDistanceToNow, format } from 'date-fns'

export default {
  name: 'VaultSurface',
  setup() {
    const vaultStore = useVaultStore()
    
    // State
    const isLoading = ref(false)
    const error = ref(null)
    const searchQuery = ref('')
    const showUploadModal = ref(false)
    const previewFile = ref(null)
    const renderedMarkdown = ref('')
    const previewContent = ref('')
    const fileInput = ref(null)
    
    // Computed properties
    const files = computed(() => vaultStore.files)
    const folders = computed(() => vaultStore.folders)
    const totalSize = computed(() => {
      return files.value.reduce((sum, file) => sum + file.size, 0)
    })
    
    const filteredFiles = computed(() => {
      if (!searchQuery.value) return files.value
      
      const query = searchQuery.value.toLowerCase()
      return files.value.filter(file => 
        file.name.toLowerCase().includes(query) ||
        file.tags.some(tag => tag.toLowerCase().includes(query))
      )
    })
    
    // Methods
    const handleUpload = () => {
      showUploadModal.value = true
    }
    
    const triggerFileInput = () => {
      fileInput.value.click()
    }
    
    const handleFileSelect = (event) => {
      const selectedFiles = Array.from(event.target.files)
      uploadFiles(selectedFiles)
    }
    
    const handleDrop = (event) => {
      const droppedFiles = Array.from(event.dataTransfer.files)
      uploadFiles(droppedFiles)
    }
    
    const uploadFiles = async (fileList) => {
      try {
        isLoading.value = true
        error.value = null
        await vaultStore.uploadFiles(fileList)
        showUploadModal.value = false
      } catch (err) {
        error.value = err.message
      } finally {
        isLoading.value = false
      }
    }
    
    const createNewDocument = () => {
      vaultStore.createDocument('Untitled Document')
    }
    
    const createNewFolder = () => {
      const folderName = prompt('Enter folder name:', 'New Folder')
      if (folderName) {
        vaultStore.createFolder(folderName)
      }
    }
    
    const syncAll = async () => {
      try {
        isLoading.value = true
        await vaultStore.syncAll()
      } catch (err) {
        error.value = err.message
      } finally {
        isLoading.value = false
      }
    }
    
    const openFile = async (file) => {
      try {
        isLoading.value = true
        const content = await vaultStore.getFileContent(file.id)
        
        if (file.type === 'markdown') {
          renderedMarkdown.value = await vaultStore.renderMarkdown(content)
        } else if (file.type === 'image') {
          previewContent.value = ''
          // Image preview handled by URL
        } else {
          previewContent.value = content
          renderedMarkdown.value = ''
        }
        
        previewFile.value = { ...file, content }
      } catch (err) {
        error.value = `Couldn't open file: ${err.message}`
      } finally {
        isLoading.value = false
      }
    }
    
    const closePreview = () => {
      previewFile.value = null
      renderedMarkdown.value = ''
      previewContent.value = ''
    }
    
    const shareFile = (file) => {
      vaultStore.shareFile(file.id)
    }
    
    const deleteFile = (file) => {
      if (confirm(`Delete ${file.name}? This cannot be undone.`)) {
        vaultStore.deleteFile(file.id)
      }
    }
    
    const downloadFile = (file) => {
      vaultStore.downloadFile(file.id)
    }
    
    const reloadFiles = async () => {
      try {
        isLoading.value = true
        error.value = null
        await vaultStore.loadFiles()
      } catch (err) {
        error.value = err.message
      } finally {
        isLoading.value = false
      }
    }
    
    const handleSearch = () => {
      // Handled by computed property
    }
    
    const clearSearch = () => {
      searchQuery.value = ''
    }
    
    const showImportOptions = () => {
      // Show import modal or navigate to bridges
      alert('Import options would be shown here')
    }
    
    // Helper functions
    const formatFileSize = (bytes) => {
      if (bytes < 1024) return `${bytes} B`
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
      if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
    }
    
    const formatRelativeTime = (dateString) => {
      const date = new Date(dateString)
      return formatDistanceToNow(date, { addSuffix: true })
    }
    
    const getFileIcon = (file) => {
      const extension = file.name.split('.').pop().toLowerCase()
      
      const icons = {
        md: '📄',
        txt: '📝',
        js: '💻',
        json: '📊',
        yaml: '⚙️',
        yml: '⚙️',
        html: '🌐',
        css: '🎨',
        png: '🖼️',
        jpg: '🖼️',
        jpeg: '🖼️',
        gif: '🎥',
        svg: '📐',
        pdf: '📑',
        doc: '📄',
        docx: '📄',
        xls: '📊',
        xlsx: '📊',
        ppt: '📽️',
        pptx: '📽️',
        zip: '🗄️',
        rar: '🗄️',
        usxd: '📖'
      }
      
      return icons[extension] || '📄'
    }
    
    // Load files on mount
    const loadInitialData = async () => {
      try {
        isLoading.value = true
        await vaultStore.loadFiles()
      } catch (err) {
        error.value = err.message
      } finally {
        isLoading.value = false
      }
    }
    
    loadInitialData()
    
    return {
      isLoading,
      error,
      searchQuery,
      showUploadModal,
      previewFile,
      renderedMarkdown,
      previewContent,
      fileInput,
      files,
      folders,
      totalSize,
      filteredFiles,
      handleUpload,
      triggerFileInput,
      handleFileSelect,
      handleDrop,
      createNewDocument,
      createNewFolder,
      syncAll,
      openFile,
      closePreview,
      shareFile,
      deleteFile,
      downloadFile,
      reloadFiles,
      handleSearch,
      clearSearch,
      showImportOptions,
      formatFileSize,
      formatRelativeTime,
      getFileIcon
    }
  }
}
</script>

<style scoped>
.vault-surface {
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

.action-bar {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
  align-items: center;
}

.helper-text {
  color: var(--text-tertiary);
  font-size: 0.85rem;
  margin-left: auto;
  padding-left: 1rem;
}

.search-bar {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: var(--surface-background);
  border-radius: 6px;
  border: 1px solid var(--border-color);
}

.search-bar input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 0.5rem;
  font-size: 1rem;
}

.loading-state, .error-state, .empty-state {
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
}

.spinner, .error-icon, .empty-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 1rem;
}

.file-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.file-card {
  background: var(--surface-background);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.file-card:hover {
  background: var(--surface-hover);
  border-color: var(--primary-color);
}

.file-icon {
  font-size: 1.5rem;
  margin-right: 0.5rem;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size, .file-date {
  font-size: 0.8rem;
  color: var(--text-tertiary);
}

.file-actions {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
}

.file-actions button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.25rem;
}

.file-stats {
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

.modal {
  background: var(--background);
  border-radius: 8px;
  padding: 1.5rem;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.upload-area {
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
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

.file-preview-modal {
  background: var(--background);
  border-radius: 8px;
  padding: 1.5rem;
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.preview-content {
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 1rem;
  background: var(--surface-background);
  max-height: 60vh;
  overflow-y: auto;
}

.markdown-preview {
  line-height: 1.6;
}

.markdown-preview h1, .markdown-preview h2, .markdown-preview h3 {
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.markdown-preview pre {
  background: var(--code-background);
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
}

.image-preview img {
  max-width: 100%;
  height: auto;
}

.empty-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin: 1rem 0;
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

button.primary:hover {
  background: var(--primary-hover);
}

button.secondary:hover {
  background: var(--surface-hover);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>