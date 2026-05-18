import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as api from '../services/api.prod'

export const useVaultStore = defineStore('vault', () => {
  const entries = ref<any[]>([])
  const currentPath = ref('/')
  const currentContent = ref<string | null>(null)
  const currentMetadata = ref<any | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const breadcrumbs = computed(() => {
    const parts = currentPath.value.split('/').filter(Boolean)
    return parts.map((part, i) => ({
      name: part,
      path: '/' + parts.slice(0, i + 1).join('/'),
    }))
  })

  // Computed properties for VaultSurface compatibility
  const files = computed(() => 
    entries.value.filter(e => e.type === 'file').map(e => ({
      id: e.path,
      name: e.name,
      size: e.size || 0,
      updatedAt: e.modified || new Date().toISOString(),
      tags: [],
      type: e.name.split('.').pop() || 'file'
    }))
  )

  const folders = computed(() => 
    entries.value.filter(e => e.type === 'directory').map(e => ({
      id: e.path,
      name: e.name,
      path: e.path
    }))
  )

  async function loadEntries(path?: string) {
    isLoading.value = true
    error.value = null
    try {
      entries.value = await api.listVaultEntries(path || currentPath.value)
    } catch (err: any) {
      error.value = err.message || 'Failed to load vault entries'
      entries.value = []
    } finally {
      isLoading.value = false
    }
  }

  async function loadFiles() {
    await loadEntries('/')
  }

  async function navigateTo(path: string) {
    currentPath.value = path
    currentContent.value = null
    currentMetadata.value = null
    await loadEntries(path)
  }

  async function openFile(path: string) {
    isLoading.value = true
    error.value = null
    try {
      const result = await api.readVaultFile(path)
      currentContent.value = result.content
      currentMetadata.value = result.metadata
    } catch (err: any) {
      error.value = err.message || 'Failed to open file'
    } finally {
      isLoading.value = false
    }
  }

  async function saveFile(path: string, content: string) {
    try {
      await api.writeVaultFile(path, content)
      currentContent.value = content
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to save file'
      return false
    }
  }

  async function uploadFiles(fileList: File[]) {
    // Placeholder implementation
    console.log('Upload files:', fileList)
    throw new Error('Upload not implemented yet')
  }

  function createDocument(name: string) {
    // Placeholder implementation
    console.log('Create document:', name)
  }

  function createFolder(name: string) {
    // Placeholder implementation
    console.log('Create folder:', name)
  }

  async function syncAll() {
    // Placeholder implementation
    console.log('Sync all')
  }

  async function getFileContent(id: string) {
    await openFile(id)
    return currentContent.value || ''
  }

  async function renderMarkdown(content: string) {
    // Simple markdown rendering placeholder
    return content.replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  }

  function shareFile(id: string) {
    console.log('Share file:', id)
  }

  function deleteFile(id: string) {
    console.log('Delete file:', id)
    entries.value = entries.value.filter(e => e.path !== id)
  }

  function downloadFile(id: string) {
    console.log('Download file:', id)
  }

  return {
    entries,
    files,
    folders,
    currentPath,
    currentContent,
    currentMetadata,
    isLoading,
    error,
    breadcrumbs,
    loadEntries,
    loadFiles,
    navigateTo,
    openFile,
    saveFile,
    uploadFiles,
    createDocument,
    createFolder,
    syncAll,
    getFileContent,
    renderMarkdown,
    shareFile,
    deleteFile,
    downloadFile,
  }
})
