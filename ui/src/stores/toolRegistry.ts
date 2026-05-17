import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as api from '../services/api.prod'

export interface ToolDefinition {
  id: string
  name: string
  description: string
  serverId: string
  parameters: Record<string, any>
}

export const useToolRegistryStore = defineStore('toolRegistry', () => {
  const tools = ref<ToolDefinition[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const toolCount = computed(() => tools.value.length)

  async function loadTools() {
    isLoading.value = true
    error.value = null
    try {
      const servers = await api.getMCPStatus()
      const allTools: ToolDefinition[] = []
      for (const server of servers) {
        if (server.running) {
          allTools.push({
            id: `${server.id}-status`,
            name: `${server.name} Status`,
            description: `Check status of ${server.name}`,
            serverId: server.id,
            parameters: {},
          })
        }
      }
      tools.value = allTools
    } catch (err: any) {
      error.value = err.message || 'Failed to load tools'
      tools.value = []
    } finally {
      isLoading.value = false
    }
  }

  async function executeTool(toolId: string, args: Record<string, any>) {
    const tool = tools.value.find(t => t.id === toolId)
    if (!tool) {
      error.value = `Tool ${toolId} not found`
      return null
    }
    try {
      return await api.callMCPTool(tool.serverId, tool.name, args)
    } catch (err: any) {
      error.value = err.message || 'Failed to execute tool'
      return null
    }
  }

  return {
    tools,
    isLoading,
    error,
    toolCount,
    loadTools,
    executeTool,
  }
})
