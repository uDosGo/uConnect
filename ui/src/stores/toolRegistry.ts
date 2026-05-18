import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as api from '../services/api.prod'

export interface ToolDefinition {
  id: string
  name: string
  description: string
  serverId: string
  parameters: Record<string, any>
  version?: string
  author?: string
  category?: string
  enabled?: boolean
  updateAvailable?: boolean
  icon?: string
  rating?: number
  license?: string
  features?: string[]
  screenshots?: string[]
  settings?: any[]
  permissions?: any[]
}

export const useToolRegistryStore = defineStore('toolRegistry', () => {
  const tools = ref<ToolDefinition[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const toolCount = computed(() => tools.value.length)

  // Computed properties for ToolRegistrySurface compatibility
  const installedTools = computed(() => 
    tools.value.map(t => ({
      ...t,
      enabled: t.enabled ?? true,
      version: t.version || '1.0.0',
      author: t.author || 'Unknown',
      category: t.category || 'Utilities',
      updateAvailable: false,
      icon: t.icon || '🔧'
    }))
  )

  const availableTools = computed(() => [
    {
      id: 'sample-tool-1',
      name: 'Sample Tool',
      description: 'A sample tool for demonstration',
      serverId: 'sample',
      parameters: {},
      version: '1.0.0',
      author: 'uDOS Team',
      category: 'Utilities',
      rating: 4.5,
      icon: '🔧',
      license: 'MIT',
      features: ['Feature 1', 'Feature 2'],
      screenshots: []
    }
  ])

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
            version: '1.0.0',
            author: 'System',
            category: 'MCP',
            enabled: true
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

  async function loadRegistry() {
    await loadTools()
  }

  async function checkForUpdates() {
    console.log('Checking for updates...')
    // Placeholder implementation
  }

  async function refreshAvailableTools() {
    console.log('Refreshing available tools...')
    // Placeholder implementation
  }

  async function saveToolConfig(tool: ToolDefinition) {
    console.log('Saving tool config:', tool)
    const index = tools.value.findIndex(t => t.id === tool.id)
    if (index !== -1) {
      tools.value[index] = tool
    }
  }

  async function saveSettings(settings: any) {
    console.log('Saving settings:', settings)
    // Placeholder implementation
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
    installedTools,
    availableTools,
    isLoading,
    error,
    toolCount,
    loadTools,
    loadRegistry,
    checkForUpdates,
    refreshAvailableTools,
    saveToolConfig,
    saveSettings,
    executeTool,
  }
})
