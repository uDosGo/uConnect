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

  return {
    entries,
    currentPath,
    currentContent,
    currentMetadata,
    isLoading,
    error,
    breadcrumbs,
    loadEntries,
    navigateTo,
    openFile,
    saveFile,
  }
})
