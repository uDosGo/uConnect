import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as api from '../services/api.prod'

export const useGitHubStore = defineStore('github', () => {
  const targets = ref<api.UDOPublishTarget[]>([])
  const syncStatus = ref<string>('idle')
  const lastSync = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const connectedTargets = computed(() => targets.value.filter(t => t.status === 'connected'))

  async function loadTargets() {
    isLoading.value = true
    error.value = null
    try {
      targets.value = await api.listPublishTargets()
    } catch (err: any) {
      error.value = err.message || 'Failed to load publish targets'
      targets.value = []
    } finally {
      isLoading.value = false
    }
  }

  async function publishTo(targetId: string, content: any) {
    syncStatus.value = 'syncing'
    try {
      const result = await api.publishTo(targetId, content)
      syncStatus.value = 'idle'
      lastSync.value = new Date().toISOString()
      return result
    } catch (err: any) {
      syncStatus.value = 'error'
      error.value = err.message || 'Failed to publish'
      return null
    }
  }

  return {
    targets,
    syncStatus,
    lastSync,
    isLoading,
    error,
    connectedTargets,
    loadTargets,
    publishTo,
  }
})
