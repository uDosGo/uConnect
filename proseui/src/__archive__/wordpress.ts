import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useWordPressStore = defineStore('wordpress', () => {
  const siteInfo = ref<any>(null)
  const posts = ref<any[]>([])
  const pages = ref<any[]>([])
  const media = ref<any[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function connect(config: { siteUrl: string; username: string; appPassword: string }) {
    // Stub
    siteInfo.value = { name: 'Demo Site', url: config.siteUrl, description: 'WordPress demo' }
    posts.value = [
      { id: 1, title: 'Hello World', status: 'publish', date: new Date().toISOString() },
      { id: 2, title: 'Getting Started', status: 'draft', date: new Date().toISOString() },
    ]
    pages.value = [
      { id: 1, title: 'About', status: 'publish', date: new Date().toISOString() },
    ]
    media.value = [
      { id: 1, title: 'logo.png', media_type: 'image', source_url: '' },
    ]
  }

  async function disconnect() {
    siteInfo.value = null
    posts.value = []
    pages.value = []
    media.value = []
  }

  async function loadPosts() {
    // Stub
    posts.value = [
      { id: 1, title: 'Hello World', status: 'publish', date: new Date().toISOString() },
      { id: 2, title: 'Getting Started', status: 'draft', date: new Date().toISOString() },
    ]
  }

  async function testConnection() {
    return { success: true, message: 'Connection successful' }
  }

  async function checkConnection() {
    return { connected: true, siteInfo: siteInfo.value }
  }

  return {
    siteInfo,
    posts,
    pages,
    media,
    isLoading,
    error,
    connect,
    disconnect,
    loadPosts,
    testConnection,
    checkConnection,
  }
})
