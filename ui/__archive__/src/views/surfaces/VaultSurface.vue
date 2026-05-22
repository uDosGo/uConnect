<template>
  <div class="vault-surface">
    <!-- Surface Header -->
    <div class="surface-header">
      <div class="header-left">
        <SurfaceIcon name="folder" class="header-icon" :size="24" />
        <h1>Vault Browser</h1>
      </div>
      <div class="header-right">
        <button class="btn-secondary btn-sm" @click="syncAll" title="Sync changes with connected services">
          <SurfaceIcon name="refresh" :size="16" />
          Sync
        </button>
        <button class="btn-primary btn-sm" @click="handleUpload" title="Upload files from your computer">
          <SurfaceIcon name="upload" :size="16" />
          Upload
        </button>
      </div>
    </div>
    
    <!-- Action Bar -->
    <div class="action-bar">
      <button class="btn-secondary" @click="createNewDocument" title="Create a new document">
        <SurfaceIcon name="file-text" :size="16" />
        New Document
      </button>
      <button class="btn-secondary" @click="createNewFolder" title="Create a new folder">
        <SurfaceIcon name="folder" :size="16" />
        New Folder
      </button>
      
      <!-- Search Bar -->
      <div class="search-container">
        <SurfaceIcon name="search" :size="16" class="search-icon" />
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search files..." 
          @input="handleSearch"
          class="search-input"
        >
        <button v-if="searchQuery" class="btn-icon btn-sm" @click="clearSearch" title="Clear search">
          <SurfaceIcon name="x" :size="14" />
        </button>
      </div>
    </div>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading your files...</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">
        <SurfaceIcon name="alert-circle" :size="48" />
      </div>
      <h3>Couldn't load your files</h3>
      <p>We tried to reach your Vault, but something blocked the connection.</p>
      <button class="btn-primary" @click="reloadFiles">
        <SurfaceIcon name="refresh" :size="16" />
        Try Again
      </button>
    </div>
    
    <!-- Empty State -->
    <div v-else-if="filteredFiles.length === 0" class="empty-state">
      <div class="empty-icon">
        <SurfaceIcon name="folder" :size="64" />
      </div>
      <h3>{{ searchQuery ? 'No files found' : 'Your Vault is empty' }}</h3>
      <p>{{ searchQuery ? 'Try a different search term' : 'Add your first file to get started' }}</p>
      <div v-if="!searchQuery" class="empty-actions">
        <button class="btn-primary" @click="handleUpload">
          <SurfaceIcon name="upload" :size="16" />
          Upload File
        </button>
        <button class="btn-secondary" @click="createNewDocument">
          <SurfaceIcon name="file-text" :size="16" />
          Create Document
        </button>
      </div>
    </div>
    
    <!-- File Grid -->
    <div v-else class="file-container">
      <div class="file-grid">
        <div 
          v-for="file in filteredFiles" 
          :key="file.id" 
          class="file-card" 
          @click="openFile(file)"
        >
          <div class="file-icon-container">
            <SurfaceIcon :name="getFileIconName(file)" :size="32" class="file-i con" />
          </div>
          <div class="file-info">
            <div class="file-name" :title="file.name">{{ file.name }}</div>
            <div class="file-meta">
              <span class="file-size">{{ formatFileSize(file.size) }}</span>
              <span class="file-date">{{ formatRelativeTime(file.updatedAt) }}</span>
            </div>
          </div>
          <div class="file-actions">
            <button class="btn-icon btn-sm" @click.stop="shareFile(file)" title="Share this file">
              <SurfaceIcon name="share" :size="14" />
            </button>
            <button class="btn-icon btn-sm" @click.stop="downloadFile(file)" title="Download">
              <SurfaceIcon name="download" :size="14" />
            </button>
            <button class="btn-icon btn-sm" @click.stop="deleteFile(file)" title="Delete this file">
              <SurfaceIcon name="trash" :size="14" />
            </button>
          </div>
        </div>
      </div>
      
      <!-- File Statistics -->
      <div class="file-stats">
        <span>{{ filteredFiles.length }} files</span>
        <span>{{ formatFileSize(totalSize) }} total</span>
        <span>{{ folders.length }} folders</span>
      </div>
    </div>
    
    <!-- Upload Modal -->
    <div v-if="showUploadModal" class="modal-overlay" @click="showUploadModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Upload Files</h3>
          <button class="btn-icon btn-sm" @click="showUploadModal = false">
            <SurfaceIcon name="x" :size="16" />
          </button>
        </div>
        
        <div class="modal-body">
          <div class="upload-area" @click="triggerFileInput" @dragover.prevent @drop.prevent="handleDrop">
            <div class="upload-icon">
              <SurfaceIcon name="upload" :size="48" />
            </div>
            <p>Drag files here or click to browse</p>
            <p class="text-secondary text-sm">
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
        </div>
        
        <div class="modal-footer">
          <button class="btn-secondary" @click="showUploadModal = false">
            Cancel
          </button>
        </div>
      </div>
    </div>
    
    <!-- File Preview Modal -->
    <div v-if="previewFile" class="modal-overlay" @click="closePreview">
      <div class="preview-modal" @click.stop>
        <div class="modal-header">
          <div class="header-left">
            <SurfaceIcon :name="getFileIconName(previewFile)" :size="20" />
            <h3>{{ previewFile.name }}</h3>
          </div>
          <div class="header-actions">
            <button class="btn-secondary btn-sm" @click="downloadFile(previewFile)">
              <SurfaceIcon name="download" :size="14" />
              Download
            </button>
            <button class="btn-secondary btn-sm" @click="shareFile(previewFile)">
              <SurfaceIcon name="share" :size="14" />
              Share
            </button>
            <button class="btn-icon btn-sm" @click="closePreview">
              <SurfaceIcon name="x" :size="16" />
            </button>
          </div>
        </div>
        
        <div class="modal-body preview-content">
          <div v-if="previewFile.type === 'markdown'" class="markdown-preview" v-html="renderedMarkdown"></div>
          <div v-else-if="previewFile.type === 'image'" class="image-preview">
            <img :src="previewFile.previewUrl" alt="Preview">
          </div>
          <div v-else class="text-preview">
            <pre>{{ previewContent }}</pre>
          </div>
        </div>
        
        <div class="modal-footer">
          <div class="preview-meta">
            <span>{{ formatFileSize(previewFile.size) }}</span>
            <span>Updated {{ formatRelativeTime(previewFile.updatedAt) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useVaultStore } from '@/stores/vault'
import { formatDistanceToNow } from 'date-fns'
import SurfaceIcon from '@/components/SurfaceIcons.vue'

export default {
  name: 'VaultSurface',
  components: {
    SurfaceIcon
  },
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
        (file.tags && file.tags.some(tag => tag.toLowerCase().includes(query)))
      )
    })
    
    // Methods
    const handleUpload = () => {
      showUploadModal.value = true
    }
    
    const triggerFileInput = () => {
      fileInput.value?.click()
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
        await vaultStore.uploadFiles(fileList)
        showUploadModal.value = false
        await reloadFiles()
      } catch (err) {
        error.value = err.message
      }
    }
    
    const createNewDocument = () => {
      vaultStore.createDocument('Untitled Document')
    }
    
    const createNewFolder = () => {
      const name = prompt('Folder name:')
      if (name) {
        vaultStore.createFolder(name)
      }
    }
    
    const syncAll = async () => {
      try {
        await vaultStore.syncAll()
      } catch (err) {
        error.value = err.message
      }
    }
    
    const handleSearch = () => {
      // Handled by computed property
    }
    
    const clearSearch = () => {
      searchQuery.value = ''
    }
    
    const openFile = async (file) => {
      try {
        previewFile.value = file
        const content = await vaultStore.getFileContent(file.id)
        
        if (file.type === 'markdown') {
          renderedMarkdown.value = await vaultStore.renderMarkdown(content)
        } else {
          previewContent.value = content
        }
      } catch (err) {
        error.value = err.message
      }
    }
    
    const closePreview = () => {
      previewFile.value = null
      renderedMarkdown.value = ''
      previewContent.value = ''
    }
    
    const shareFile = (file) => {
      vaultStore.shareFile(file.id)
      alert(`Share link created for ${file.name}`)
    }
    
    const downloadFile = (file) => {
      vaultStore.downloadFile(file.id)
    }
    
    const deleteFile = (file) => {
      if (confirm(`Delete ${file.name}? This cannot be undone.`)) {
        vaultStore.deleteFile(file.id)
      }
    }
    
    const reloadFiles = async () => {
      isLoading.value = true
      error.value = null
      try {
        await vaultStore.loadFiles()
      } catch (err) {
        error.value = err.message
      } finally {
        isLoading.value = false
      }
    }
    
    const showImportOptions = () => {
      alert('Import from Bridge feature coming soon!')
    }
    
    // Helper functions
    const getFileIconName = (file) => {
      if (!file || !file.type) return 'file'
      
      const typeMap = {
        'markdown': 'file-text',
        'md': 'file-text',
        'txt': 'file-text',
        'doc': 'file-text',
        'docx': 'file-text',
        'pdf': 'file-text',
        'image': 'image',
        'jpg': 'image',
        'jpeg': 'image',
        'png': 'image',
        'gif': 'image',
        'svg': 'image',
        'video': 'video',
        'mp4': 'video',
        'mov': 'video',
        'avi': 'video',
        'music': 'music',
        'mp3': 'music',
        'wav': 'music',
        'code': 'code',
        'js': 'code',
        'ts': 'code',
        'py': 'code',
        'java': 'code',
        'cpp': 'code',
        'folder': 'folder',
        'directory': 'folder'
      }
      
      return typeMap[file.type.toLowerCase()] || 'file'
    }
    
    const formatFileSize = (bytes) => {
      if (!bytes) return '0 B'
      if (bytes < 1024) return `${bytes} B`
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
      if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
    }
    
    const formatRelativeTime = (dateString) => {
      if (!dateString) return 'Unknown'
      try {
        const date = new Date(dateString)
        return formatDistanceToNow(date, { addSuffix: true })
      } catch {
        return 'Unknown'
      }
    }
    
    // Load files on mount
    reloadFiles()
    
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
      uploadFiles,
      createNewDocument,
      createNewFolder,
      syncAll,
      handleSearch,
      clearSearch,
      openFile,
      closePreview,
      shareFile,
      downloadFile,
      deleteFile,
      reloadFiles,
      showImportOptions,
      getFileIconName,
      formatFileSize,
      formatRelativeTime
    }
  }
}
</script>

<style>
/* ─── VaultSurface uses USX global tokens from @usx/tokens ─────── */
/* No local CSS custom properties needed — all colors come from USX */
</style>

<style scoped>
.vault-surface {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--background);
  color: var(--text-primary);
}

/* Header */
.surface-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-icon {
  color: var(--primary-color);
}

.surface-header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.header-right {
  display: flex;
  gap: 0.5rem;
}

/* Action Bar */
.action-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--surface-background);
}

.search-container {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--background);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  max-width: 400px;
  margin-left: auto;
}

.search-icon {
  color: var(--text-tertiary);
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 0.875rem;
  color: var(--text-primary);
  outline: none;
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

/* Buttons */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: var(--primary-hover);
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--surface-background);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: var(--surface-hover);
  border-color: var(--primary-color);
}

.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-secondary);
}

.btn-icon:hover {
  background: var(--surface-hover);
  border-color: var(--primary-color);
  color: var(--text-primary);
}

.btn-sm {
  padding: 0.25rem 0.75rem;
  font-size: 0.8125rem;
  height: auto;
}

.btn-icon.btn-sm {
  width: 1.75rem;
  height: 1.75rem;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 4rem 2rem;
  text-align: center;
}

.error-icon {
  margin-bottom: 1.5rem;
  color: var(--danger-color);
}

.error-state h3 {
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.error-state p {
  margin-bottom: 1.5rem;
  color: var(--text-secondary);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-icon {
  margin-bottom: 1.5rem;
  color: var(--text-tertiary);
}

.empty-state h3 {
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.empty-state p {
  margin-bottom: 1.5rem;
  color: var(--text-secondary);
}

.empty-actions {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

/* File Container */
.file-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.file-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.file-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--surface-background);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.file-card:hover {
  background: var(--surface-hover);
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.file-icon-container {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--background);
  border-radius: 8px;
  color: var(--primary-color);
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.25rem;
}

.file-meta {
  display: flex;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.file-actions {
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.file-card:hover .file-actions {
  opacity: 1;
}

.file-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  padding: 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  border-top: 1px solid var(--border-color);
}

/* Modal */
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

.modal,
.preview-modal {
  background: var(--background);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.preview-modal {
  max-width: 900px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.modal-header .header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
}

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.upload-area:hover {
  border-color: var(--primary-color);
  background: var(--surface-hover);
}

.upload-icon {
  margin-bottom: 1rem;
  color: var(--text-tertiary);
}

.upload-area p {
  margin: 0.5rem 0;
  color: var(--text-primary);
}

.text-secondary {
  color: var(--text-secondary);
}

.text-sm {
  font-size: 0.875rem;
}

/* Preview Content */
.preview-content {
  min-height: 300px;
}

.markdown-preview,
.text-preview {
  padding: 1rem;
  line-height: 1.6;
}

.image-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.image-preview img {
  max-width: 100%;
  max-height: 600px;
  border-radius: 8px;
}

.text-preview pre {
  margin: 0;
  padding: 1rem;
  background: var(--surface-background);
  border-radius: 6px;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  overflow-x: auto;
}

.preview-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}
</style>