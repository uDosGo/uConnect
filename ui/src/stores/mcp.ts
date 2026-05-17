import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as api from '../services/api.prod'

export const useMCPStore = defineStore('mcp', () => {
  const servers = ref<api.MCPServerStatus[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const runningServers = computed(() => servers.value.filter(s => s.running))
  const stoppedServers = computed(() => servers.value.filter(s => !s.running))

  async function loadStatus() {
    isLoading.value = true
    error.value = null
    try {
      servers.value = await api.getMCPStatus()
    } catch (err: any) {
      error.value = err.message || 'Failed to load MCP status'
      servers.value = []
    } finally {
      isLoading.value = false
    }
  }

  async function startServer(id: string) {
    try {
      await api.startMCPServer(id)
      await loadStatus()
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to start MCP server'
      return false
    }
  }

  async function stopServer(id: string) {
    try {
      await api.stopMCPServer(id)
      await loadStatus()
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to stop MCP server'
      return false
    }
  }

  async function callTool(serverId: string, tool: string, args: Record<string, any>) {
    try {
      return await api.callMCPTool(serverId, tool, args)
    } catch (err: any) {
      error.value = err.message || 'Failed to call MCP tool'
      return null
    }
  }

  return {
    servers,
    isLoading,
    error,
    runningServers,
    stoppedServers,
    loadStatus,
    startServer,
    stopServer,
    callTool,
  }
})
