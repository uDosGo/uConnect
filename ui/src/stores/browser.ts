import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as api from '../services/api.prod'

export const useBrowserStore = defineStore('browser', () => {
  const entries = ref<any[]>([])
  const currentPath = ref('/')
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const breadcrumbs = computed(() => {
    const parts = currentPath.value.split('/').filter(Boolean)
    return parts.map((part, i) => ({
      name: part,
      path: '/' + parts.slice(0, i + 1).join('/'),
    }))
  })

  async function navigateTo(path: string) {
    currentPath.value = path
    isLoading.value = true
    error.value = null
    try {
      entries.value = await api.listVaultEntries(path)
    } catch (err: any) {
      error.value = err.message || 'Failed to browse'
      entries.value = []
    } finally {
      isLoading.value = false
    }
  }

  async function refresh() {
    await navigateTo(currentPath.value)
  }

  return {
    entries,
    currentPath,
    isLoading,
    error,
    breadcrumbs,
    navigateTo,
    refresh,
  }
})
