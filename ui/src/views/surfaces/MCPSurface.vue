<template>
  <div class="mcp-surface">
    <!-- Surface Header with Definition -->
    <div class="surface-header">
      <h1><span class="surface-icon">🤖</span> MCP Bridge</h1>
      <p class="surface-tagline">Connect AI assistants to your uDOS workspace.</p>
      <p class="surface-definition">
        <strong>What's MCP?</strong> Model Context Protocol - a fancy way to say "AI assistant connector".
        Connect AI tools to help with your work.
      </p>
    </div>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <span class="spinner">⏳</span>
      <p>Loading MCP Bridge…</p>
      <p class="helper-text">This usually takes a few seconds.</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <span class="error-icon">⚠️</span>
      <h3>Couldn't load MCP Bridge</h3>
      <p>{{ error.message }}</p>
      <p class="helper-text">
        Try:
        <br>
        • Refreshing the page
        <br>
        • Checking your internet connection
        <br>
        • Making sure AI services are available
      </p>
      <button @click="reloadBridge" class="primary">
        🔄 Try Again
      </button>
    </div>
    
    <!-- Main Content -->
    <div v-else class="main-content">
      <!-- Connection Status -->
      <div class="connection-status">
        <div class="status-indicator" :class="connectionStatus.class">
          {{ connectionStatus.icon }} {{ connectionStatus.text }}
        </div>
        <p class="status-description">{{ connectionStatus.description }}</p>
      </div>
      
      <!-- Tools Section -->
      <div class="tools-section">
        <div class="section-header">
          <h2>Connected AI Tools</h2>
          <button @click="addNewTool" class="primary">
            ➕ Add AI Tool
          </button>
        </div>
        
        <!-- Search Bar -->
        <div class="search-bar">
          <span class="search-icon">🔍</span>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search AI tools…" 
            @input="searchTools"
          >
          <button v-if="searchQuery" @click="clearSearch" class="clear-search">
            ✕
          </button>
        </div>
        
        <!-- Empty State -->
        <div v-if="filteredTools.length === 0" class="empty-state">
          <span class="empty-icon">🤖</span>
          <h3>No AI tools connected</h3>
          <p>Connect your first AI assistant</p>
          <button @click="addNewTool" class="primary">
            ➕ Connect AI Tool
          </button>
          <p class="helper-text">
            💡 AI tools can help with writing, coding, analysis, and more
          </p>
        </div>
        
        <!-- Tools Grid -->
        <div v-else class="tools-grid">
          <div 
            v-for="tool in filteredTools" 
            :key="tool.id" 
            class="tool-card"
          >
            <div class="tool-header">
              <span class="tool-icon">🤖</span>
              <h3 class="tool-name">{{ tool.name }}</h3>
              <span class="tool-status" :class="getStatusClass(tool.status)">
                {{ tool.status }}
              </span>
            </div>
            
            <p class="tool-description">{{ tool.description }}</p>
            
            <div class="tool-meta">
              <span class="tool-type">{{ tool.type }}</span>
              <span class="tool-provider">by {{ tool.provider }}</span>
            </div>
            
            <div class="tool-actions">
              <button @click="configureTool(tool)" class="secondary small">
                ⚙️ Configure
              </button>
              <button @click="testTool(tool)" class="secondary small">
                🧪 Test
              </button>
              <button @click="disconnectTool(tool)" class="danger small">
                🔗 Disconnect
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Context Management -->
      <div class="context-section">
        <h2>Context Management</h2>
        <p class="section-description">
          Manage what information AI tools can access and remember.
        </p>
        
        <div class="context-controls">
          <div class="context-setting">
            <label>
              <input type="checkbox" v-model="rememberContext">
              Remember conversation context
            </label>
            <p class="setting-description">
              AI tools will remember previous messages in the conversation
            </p>
          </div>
          
          <div class="context-setting">
            <label>
              <input type="checkbox" v-model="shareVault">
              Allow access to Vault files
            </label>
            <p class="setting-description">
              AI tools can read files from your Vault (when you allow it)
            </p>
          </div>
          
          <div class="context-setting">
            <label>
              <input type="checkbox" v-model="shareContacts">
              Allow access to contacts
            </label>
            <p class="setting-description">
              AI tools can use your contact information (when relevant)
            </p>
          </div>
          
          <button @click="saveContextSettings" class="primary">
            💾 Save Settings
          </button>
        </div>
      </div>
      
      <!-- Usage Statistics -->
      <div class="usage-stats">
        <h3>Usage Statistics</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-value">{{ totalTools }}</span>
            <span class="stat-label">Connected Tools</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ activeTools }}</span>
            <span class="stat-label">Active Tools</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ totalRequests }}</span>
            <span class="stat-label">Requests Today</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ formatFileSize(totalTokens) }}</span>
            <span class="stat-label">Tokens Used</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Add New Tool Modal -->
    <div v-if="showAddToolModal" class="modal-overlay">
      <div class="add-tool-modal">
        <h3>🤖 Add New AI Tool</h3>
        <p>Connect an AI assistant to your uDOS workspace</p>
        
        <div class="tool-types">
          <h4>Select tool type:</h4>
          <div class="type-grid">
            <div 
              v-for="type in toolTypes" 
              :key="type.id" 
              class="type-card" 
              @click="selectToolType(type)"
            >
              <span class="type-icon">{{ type.icon }}</span>
              <span class="type-name">{{ type.name }}</span>
            </div>
          </div>
        </div>
        
        <div v-if="selectedToolType" class="tool-configuration">
          <h4>Configure {{ selectedToolType.name }}</h4>
          
          <div class="form-group">
            <label for="tool-name">Tool Name</label>
            <input 
              id="tool-name" 
              v-model="newToolName" 
              type="text" 
              placeholder="My AI Assistant"
            >
          </div>
          
          <div class="form-group">
            <label for="tool-api-key">API Key</label>
            <input 
              id="tool-api-key" 
              v-model="newToolApiKey" 
              type="password" 
              placeholder="Enter API key"
            >
            <p class="helper-text">
              💡 Get your API key from {{ selectedToolType.provider }}
            </p>
          </div>
          
          <div class="form-group">
            <label for="tool-model">Model</label>
            <select id="tool-model" v-model="newToolModel">
              <option v-for="model in selectedToolType.models" :key="model" :value="model">
                {{ model }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="tool-description">Description</label>
            <textarea 
              id="tool-description" 
              v-model="newToolDescription" 
              placeholder="What does this AI tool do?"
              rows="3"
            ></textarea>
          </div>
        </div>
        
        <div class="modal-actions">
          <button @click="connectNewTool" class="primary" :disabled="!isToolConfigValid">
            🔗 Connect Tool
          </button>
          <button @click="showAddToolModal = false" class="secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
    
    <!-- Tool Configuration Modal -->
    <div v-if="configuringTool" class="modal-overlay">
      <div class="tool-config-modal">
        <div class="config-header">
          <h3>⚙️ Configure: {{ configuringTool.name }}</h3>
          <button @click="closeConfig" class="secondary small">
            ✕ Close
          </button>
        </div>
        
        <div class="config-content">
          <div class="form-group">
            <label>Tool Name</label>
            <input v-model="configuringTool.name" type="text">
          </div>
          
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="configuringTool.description" rows="3"></textarea>
          </div>
          
          <div class="form-group">
            <label>Model</label>
            <select v-model="configuringTool.model">
              <option v-for="model in getModelsForTool(configuringTool)" :key="model" :value="model">
                {{ model }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Temperature</label>
            <input v-model="configuringTool.temperature" type="range" min="0" max="1" step="0.1">
            <span>{{ configuringTool.temperature }}</span>
            <p class="setting-description">
              Higher values make output more random, lower values make it more focused
            </p>
          </div>
          
          <div class="form-group">
            <label>Max Tokens</label>
            <input v-model="configuringTool.maxTokens" type="number" min="50" max="4000">
            <p class="setting-description">
              Maximum length of AI responses
            </p>
          </div>
          
          <div class="form-group">
            <label>
              <input type="checkbox" v-model="configuringTool.rememberContext">
              Remember conversation context
            </label>
          </div>
        </div>
        
        <div class="config-actions">
          <button @click="saveToolConfig" class="primary">
            💾 Save Configuration
          </button>
          <button @click="testTool(configuringTool)" class="secondary">
            🧪 Test Tool
          </button>
        </div>
      </div>
    </div>
    
    <!-- Tool Test Modal -->
    <div v-if="testingTool" class="modal-overlay">
      <div class="tool-test-modal">
        <div class="test-header">
          <h3>🧪 Testing: {{ testingTool.name }}</h3>
          <button @click="closeTest" class="secondary small">
            ✕ Close
          </button>
        </div>
        
        <div class="test-content">
          <div class="test-input">
            <textarea 
              v-model="testPrompt" 
              placeholder="Enter a test prompt…"
              rows="4"
            ></textarea>
            <button @click="runTest" class="primary" :disabled="!testPrompt.trim()">
              ▶️ Run Test
            </button>
          </div>
          
          <div v-if="isTesting" class="test-loading">
            <span class="spinner">⏳</span>
            <p>AI is thinking…</p>
          </div>
          
          <div v-if="testResult" class="test-result">
            <h4>Result:</h4>
            <div class="result-content" v-html="testResult"></div>
            <div class="result-meta">
              <span>⏱️ {{ testDuration }}ms</span>
              <span>💬 {{ testTokens }} tokens</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useMCPStore } from '@/stores/mcp'

export default {
  name: 'MCPSurface',
  setup() {
    const mcpStore = useMCPStore()
    
    // State
    const isLoading = ref(false)
    const error = ref(null)
    const searchQuery = ref('')
    const showAddToolModal = ref(false)
    const configuringTool = ref(null)
    const testingTool = ref(null)
    const testPrompt = ref('')
    const testResult = ref('')
    const isTesting = ref(false)
    const testDuration = ref(0)
    const testTokens = ref(0)
    
    // New tool form
    const selectedToolType = ref(null)
    const newToolName = ref('')
    const newToolApiKey = ref('')
    const newToolModel = ref('')
    const newToolDescription = ref('')
    
    // Settings
    const rememberContext = ref(true)
    const shareVault = ref(false)
    const shareContacts = ref(false)
    
    // Computed properties
    const tools = computed(() => mcpStore.tools)
    const totalTools = computed(() => tools.value.length)
    const activeTools = computed(() => tools.value.filter(t => t.status === 'active').length)
    const totalRequests = computed(() => 42) // Would come from store
    const totalTokens = computed(() => 1024) // Would come from store
    
    const connectionStatus = computed(() => {
      const active = tools.value.some(t => t.status === 'active')
      if (active) {
        return {
          class: 'status-connected',
          icon: '✅',
          text: 'Connected',
          description: 'AI tools are ready to assist you'
        }
      }
      return {
        class: 'status-disconnected',
        icon: '⚠️',
        text: 'Not Connected',
        description: 'Connect your first AI tool to get started'
      }
    })
    
    const filteredTools = computed(() => {
      if (!searchQuery.value) return tools.value
      
      const query = searchQuery.value.toLowerCase()
      return tools.value.filter(tool => 
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.type.toLowerCase().includes(query)
      )
    })
    
    // Tool types
    const toolTypes = [
      {
        id: 'text',
        name: 'Text Generation',
        icon: '📝',
        provider: 'Various',
        models: ['gpt-4', 'gpt-3.5-turbo', 'claude-2', 'llama-2-70b']
      },
      {
        id: 'image',
        name: 'Image Generation',
        icon: '🖼️',
        provider: 'DALL·E, Stable Diffusion',
        models: ['dall-e-3', 'stable-diffusion-xl', 'midjourney']
      },
      {
        id: 'code',
        name: 'Code Assistant',
        icon: '💻',
        provider: 'GitHub Copilot, etc.',
        models: ['gpt-4-code', 'claude-code', 'star-coder']
      },
      {
        id: 'analysis',
        name: 'Data Analysis',
        icon: '📊',
        provider: 'Various',
        models: ['gpt-4-analysis', 'claude-analysis']
      }
    ]
    
    const isToolConfigValid = computed(() => {
      return selectedToolType.value && newToolName.value.trim() && 
             newToolApiKey.value.trim() && newToolModel.value
    })
    
    // Methods
    const formatFileSize = (bytes) => {
      if (bytes < 1024) return `${bytes} B`
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }
    
    const getStatusClass = (status) => {
      return {
        'active': 'status-active',
        'inactive': 'status-inactive',
        'error': 'status-error'
      }[status] || 'status-unknown'
    }
    
    const loadBridge = async () => {
      isLoading.value = true
      error.value = null
      try {
        await mcpStore.loadTools()
      } catch (err) {
        error.value = { message: err.message || 'Could not load MCP Bridge' }
      } finally {
        isLoading.value = false
      }
    }
    
    const reloadBridge = loadBridge
    
    const addNewTool = () => {
      selectedToolType.value = null
      newToolName.value = ''
      newToolApiKey.value = ''
      newToolModel.value = ''
      newToolDescription.value = ''
      showAddToolModal.value = true
    }
    
    const selectToolType = (type) => {
      selectedToolType.value = type
      newToolModel.value = type.models[0]
    }
    
    const connectNewTool = async () => {
      if (!isToolConfigValid.value) return
      
      isLoading.value = true
      try {
        await mcpStore.addTool({
          name: newToolName.value,
          type: selectedToolType.value.id,
          model: newToolModel.value,
          description: newToolDescription.value,
          apiKey: newToolApiKey.value,
          status: 'active'
        })
        showAddToolModal.value = false
        await loadBridge()
      } catch (err) {
        error.value = { message: err.message || 'Could not connect AI tool' }
      } finally {
        isLoading.value = false
      }
    }
    
    const configureTool = (tool) => {
      configuringTool.value = JSON.parse(JSON.stringify(tool))
    }
    
    const closeConfig = () => {
      configuringTool.value = null
    }
    
    const saveToolConfig = async () => {
      if (!configuringTool.value) return
      
      isLoading.value = true
      try {
        await mcpStore.saveTool(configuringTool.value)
        closeConfig()
        await loadBridge()
      } catch (err) {
        error.value = { message: err.message || 'Could not save tool configuration' }
      } finally {
        isLoading.value = false
      }
    }
    
    const testTool = (tool) => {
      testingTool.value = tool
      testPrompt.value = ''
      testResult.value = ''
    }
    
    const closeTest = () => {
      testingTool.value = null
    }
    
    const runTest = async () => {
      if (!testPrompt.value.trim() || !testingTool.value) return
      
      isTesting.value = true
      testResult.value = ''
      
      // Simulate AI response
      const startTime = Date.now()
      await new Promise(resolve => setTimeout(resolve, 1500))
      const endTime = Date.now()
      
      testDuration.value = endTime - startTime
      testTokens.value = Math.floor(testPrompt.value.length * 1.5)
      testResult.value = `<p><strong>Response from ${testingTool.value.name}:</strong></p>
      <p>This is a simulated response to your prompt: "${testPrompt.value}". In a real implementation, 
      this would be an actual AI response based on your input and the selected model's capabilities.</p>
      <p>The AI would analyze your request, generate a thoughtful response, and provide helpful information 
      or complete the task you asked for.</p>`
      
      isTesting.value = false
    }
    
    const disconnectTool = (tool) => {
      if (confirm(`Disconnect ${tool.name}? You'll need to reconnect to use it again.`)) {
        alert(`Would disconnect tool: ${tool.name}`)
      }
    }
    
    const getModelsForTool = (tool) => {
      const type = toolTypes.find(t => t.id === tool.type)
      return type?.models || []
    }
    
    const saveContextSettings = async () => {
      isLoading.value = true
      try {
        await mcpStore.saveContextSettings({
          rememberContext: rememberContext.value,
          shareVault: shareVault.value,
          shareContacts: shareContacts.value
        })
        alert('Context settings saved successfully!')
      } catch (err) {
        error.value = { message: err.message || 'Could not save context settings' }
      } finally {
        isLoading.value = false
      }
    }
    
    const searchTools = () => {
      // Handled by computed property
    }
    
    const clearSearch = () => {
      searchQuery.value = ''
    }
    
    // Load initial data
    loadBridge()
    
    return {
      isLoading,
      error,
      searchQuery,
      showAddToolModal,
      configuringTool,
      testingTool,
      testPrompt,
      testResult,
      isTesting,
      testDuration,
      testTokens,
      selectedToolType,
      newToolName,
      newToolApiKey,
      newToolModel,
      newToolDescription,
      rememberContext,
      shareVault,
      shareContacts,
      tools,
      totalTools,
      activeTools,
      totalRequests,
      totalTokens,
      connectionStatus,
      filteredTools,
      toolTypes,
      isToolConfigValid,
      formatFileSize,
      getStatusClass,
      reloadBridge,
      addNewTool,
      selectToolType,
      connectNewTool,
      configureTool,
      closeConfig,
      saveToolConfig,
      testTool,
      closeTest,
      runTest,
      disconnectTool,
      getModelsForTool,
      saveContextSettings,
      searchTools,
      clearSearch
    }
  }
}
</script>

<style scoped>
.mcp-surface {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.surface-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.surface-icon {
  margin-right: 0.5rem;
}

.surface-tagline {
  color: var(--text-secondary);
  margin: 0.5rem 0;
}

.surface-definition {
  color: var(--text-tertiary);
  font-size: 0.9rem;
  margin: 0;
}

.loading-state, .error-state {
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
}

.spinner, .error-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 1rem;
}

.main-content {
  margin-top: 1rem;
}

.connection-status {
  padding: 1rem;
  background: var(--surface-background);
  border-radius: 8px;
  margin-bottom: 1.5rem;
  text-align: center;
}

.status-indicator {
  font-size: 1.2rem;
  padding: 0.5rem;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.status-connected {
  background: var(--success-background);
  color: var(--success-color);
}

.status-disconnected {
  background: var(--warning-background);
  color: var(--warning-color);
}

.status-description {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 0;
}

.tools-section {
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header h2 {
  margin: 0;
  font-size: 1.2rem;
}

.search-bar {
  position: relative;
  margin-bottom: 1rem;
}

.search-bar input {
  width: 100%;
  padding: 0.75rem 2.5rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 1rem;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
}

.clear-search {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-tertiary);
}

.empty-state {
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
  background: var(--surface-background);
  border-radius: 8px;
}

.empty-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 1rem;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.tool-card {
  background: var(--surface-background);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.2s;
}

.tool-card:hover {
  background: var(--surface-hover);
  border-color: var(--primary-color);
}

.tool-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.tool-icon {
  font-size: 1.5rem;
}

.tool-name {
  margin: 0;
  font-size: 1.1rem;
}

.tool-status {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.status-active {
  background: var(--success-background);
  color: var(--success-color);
}

.status-inactive {
  background: var(--info-background);
  color: var(--info-color);
}

.status-error {
  background: var(--danger-background);
  color: var(--danger-color);
}

.tool-description {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}

.tool-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: var(--text-tertiary);
  margin-bottom: 0.75rem;
}

.tool-actions {
  display: flex;
  gap: 0.5rem;
}

.context-section {
  margin-bottom: 2rem;
}

.context-section h2 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.section-description {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.context-controls {
  background: var(--surface-background);
  padding: 1rem;
  border-radius: 8px;
}

.context-setting {
  margin-bottom: 1rem;
}

.context-setting label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.setting-description {
  font-size: 0.85rem;
  color: var(--text-tertiary);
  margin-left: 1.5rem;
  margin-top: 0.25rem;
}

.usage-stats {
  margin-top: 1rem;
}

.usage-stats h3 {
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  background: var(--surface-background);
  padding: 1rem;
  border-radius: 8px;
}

.stat-item {
  text-align: center;
  padding: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  display: block;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.add-tool-modal, .tool-config-modal, .tool-test-modal {
  background: var(--background);
  border-radius: 8px;
  padding: 1.5rem;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.tool-types {
  margin: 1rem 0;
}

.type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.5rem;
  margin: 1rem 0;
}

.type-card {
  background: var(--surface-background);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 0.75rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.type-card:hover {
  background: var(--surface-hover);
  border-color: var(--primary-color);
}

.type-icon {
  font-size: 1.5rem;
  display: block;
  margin-bottom: 0.25rem;
}

.tool-configuration {
  margin: 1rem 0;
  padding: 1rem;
  background: var(--surface-background);
  border-radius: 6px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 1rem;
}

.form-group textarea {
  resize: vertical;
  min-height: 60px;
}

.test-input {
  margin-bottom: 1rem;
}

.test-input textarea {
  width: 100%;
  min-height: 100px;
  margin-bottom: 0.5rem;
}

.test-loading {
  text-align: center;
  padding: 1rem;
}

.test-loading .spinner {
  font-size: 1.5rem;
}

.test-result {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--surface-background);
  border-radius: 6px;
}

.result-content {
  line-height: 1.6;
  margin: 1rem 0;
}

.result-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: var(--text-tertiary);
}

.modal-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

.config-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

button.primary {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

button.secondary {
  background: var(--surface-background);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

button.danger {
  background: var(--danger-background);
  color: var(--danger-color);
  border: 1px solid var(--danger-border);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

button.small {
  padding: 0.25rem 0.5rem;
  font-size: 0.85rem;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>