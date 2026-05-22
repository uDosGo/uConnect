import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as api from '../services/api.prod'

export const useUSXDStore = defineStore('usxd', () => {
  const documents = ref<any[]>([])
  const currentDoc = ref<any | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const documentCount = computed(() => documents.value.length)

  async function loadDocuments() {
    isLoading.value = true
    error.value = null
    try {
      const result = await api.listVaultEntries('/usxd')
      documents.value = result
    } catch (err: any) {
      error.value = err.message || 'Failed to load USXD documents'
      documents.value = []
    } finally {
      isLoading.value = false
    }
  }

  async function parseDocument(text: string, title?: string) {
    isLoading.value = true
    error.value = null
    try {
      const result = await api.parseGrid(text, title)
      currentDoc.value = result
      return result
    } catch (err: any) {
      error.value = err.message || 'Failed to parse document'
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function loadFromFile(filepath: string) {
    isLoading.value = true
    error.value = null
    try {
      const result = await api.parseGridFromFile(filepath)
      currentDoc.value = result
      return result
    } catch (err: any) {
      error.value = err.message || 'Failed to load file'
      return null
    } finally {
      isLoading.value = false
    }
  }

  function clearCurrent() {
    currentDoc.value = null
  }

  async function createDocument(params: { title: string; template?: string }) {
    isLoading.value = true
    error.value = null
    try {
      const text = `# ${params.title}\n\nCreated from template: ${params.template || 'blank'}`
      const result = await api.parseGrid(text, params.title)
      currentDoc.value = result
      await loadDocuments()
      return result
    } catch (err: any) {
      error.value = err.message || 'Failed to create document'
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function openDocument(id: string): Promise<string> {
    isLoading.value = true
    error.value = null
    try {
      const result = await api.readVaultFile(`/usxd/${id}.usxd`)
      currentContent.value = result.content
      return result.content
    } catch (err: any) {
      error.value = err.message || 'Failed to open document'
      return ''
    } finally {
      isLoading.value = false
    }
  }

  const currentContent = ref<string | null>(null)

  return {
    documents,
    currentDoc,
    currentContent,
    isLoading,
    error,
    documentCount,
    loadDocuments,
    parseDocument,
    loadFromFile,
    clearCurrent,
    createDocument,
    openDocument,
  }
})
