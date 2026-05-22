import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useVaultStore = defineStore('vault', () => {
  const files = ref<any[]>([])
  const folders = ref<any[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function loadFiles() {
    // Stub — loads demo data
    files.value = [
      { id: '1', name: 'README.md', size: 2048, updatedAt: new Date().toISOString(), tags: ['doc'], type: 'md' },
      { id: '2', name: 'architecture.md', size: 4096, updatedAt: new Date().toISOString(), tags: ['doc'], type: 'md' },
      { id: '3', name: 'api-spec.yaml', size: 1536, updatedAt: new Date().toISOString(), tags: ['config'], type: 'yaml' },
    ]
    folders.value = [
      { id: 'f1', name: 'docs', path: '/docs' },
      { id: 'f2', name: 'src', path: '/src' },
    ]
  }

  async function uploadFiles(fileList: FileList) {
    // Stub
    console.log('Uploading files:', fileList)
  }

  function createDocument(title: string) {
    // Stub
    console.log('Creating document:', title)
  }

  function createFolder(name: string) {
    // Stub
    console.log('Creating folder:', name)
  }

  async function syncAll() {
    // Stub
    console.log('Syncing vault...')
  }

  async function getFileContent(fileId: string): Promise<string> {
    return `# File ${fileId}\n\nDemo content for vault file.`
  }

  async function renderMarkdown(content: string): Promise<string> {
    return `<p>${content}</p>`
  }

  function shareFile(fileId: string) {
    // Stub
    console.log('Sharing file:', fileId)
  }

  function downloadFile(fileId: string) {
    // Stub
    console.log('Downloading file:', fileId)
  }

  function deleteFile(fileId: string) {
    // Stub
    console.log('Deleting file:', fileId)
  }

  return {
    files,
    folders,
    isLoading,
    error,
    loadFiles,
    uploadFiles,
    createDocument,
    createFolder,
    syncAll,
    getFileContent,
    renderMarkdown,
    shareFile,
    downloadFile,
    deleteFile,
  }
})
