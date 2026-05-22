import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useGitHubStore = defineStore('github', () => {
  const isConnected = ref(false)
  const repositories = ref<any[]>([])
  const userInfo = ref<any>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function initiateOAuth() {
    // Stub
    isConnected.value = true
    userInfo.value = { login: 'demo-user', avatar_url: '' }
    repositories.value = [
      { id: 1, name: 'uDosGo/Connect', description: 'Surface Manager & Publishing Platform', language: 'TypeScript', updated_at: new Date().toISOString() },
      { id: 2, name: 'uDosGo/uCode2', description: 'Document workspace', language: 'Vue', updated_at: new Date().toISOString() },
    ]
  }

  async function loadRepositories() {
    // Stub
    repositories.value = [
      { id: 1, name: 'uDosGo/Connect', description: 'Surface Manager & Publishing Platform', language: 'TypeScript', updated_at: new Date().toISOString() },
      { id: 2, name: 'uDosGo/uCode2', description: 'Document workspace', language: 'Vue', updated_at: new Date().toISOString() },
    ]
  }

  async function syncRepository(repoId: number) {
    // Stub
    console.log('Syncing repository:', repoId)
  }

  async function signOut() {
    isConnected.value = false
    userInfo.value = null
    repositories.value = []
  }

  function disconnectRepository(repoId: number) {
    // Stub
    console.log('Disconnecting repository:', repoId)
  }

  return {
    isConnected,
    repositories,
    userInfo,
    isLoading,
    error,
    initiateOAuth,
    loadRepositories,
    syncRepository,
    signOut,
    disconnectRepository,
  }
})
