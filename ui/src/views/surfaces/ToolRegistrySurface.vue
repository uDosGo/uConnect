<template>
  <div class="tool-registry-surface">
    <!-- Surface Header with Definition -->
    <div class="surface-header">
      <h1><span class="surface-icon">🔧</span> Tool Registry</h1>
      <p class="surface-tagline">Manage MCP tools and extensions. Extend uDOS functionality.</p>
      <p class="surface-definition">
        <strong>What's the Tool Registry?</strong> A collection of tools and extensions that add new capabilities to uDOS.
        Browse available tools, install new ones, and manage your extensions.
      </p>
    </div>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <span class="spinner">⏳</span>
      <p>Loading tool registry…</p>
      <p class="helper-text">This usually takes a few seconds.</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <span class="error-icon">⚠️</span>
      <h3>Couldn't load tool registry</h3>
      <p>{{ error.message }}</p>
      <p class="helper-text">
        Try:
        <br>
        • Refreshing the page
        <br>
        • Checking your internet connection
        <br>
        • Making sure the registry service is available
      </p>
      <button @click="reloadRegistry" class="primary">
        🔄 Try Again
      </button>
    </div>
    
    <!-- Main Content -->
    <div v-else class="main-content">
      <!-- Registry Tabs -->
      <div class="registry-tabs">
        <button 
          @click="activeTab = 'installed'" 
          :class="['tab-button', { active: activeTab === 'installed' }]"
        >
          📦 Installed ({{ installedTools.length }})
        </button>
        <button 
          @click="activeTab = 'available'" 
          :class="['tab-button', { active: activeTab === 'available' }]"
        >
          🔍 Available ({{ availableTools.length }})
        </button>
        <button 
          @click="activeTab = 'settings'" 
          :class="['tab-button', { active: activeTab === 'settings' }]"
        >
          ⚙️ Settings
        </button>
      </div>
      
      <!-- Installed Tools Tab -->
      <div v-if="activeTab === 'installed'" class="tab-content">
        <div class="content-header">
          <h2>Installed Tools</h2>
          <div class="header-actions">
            <button @click="checkForUpdates" class="secondary">
              🔄 Check for Updates
            </button>
            <button @click="showInstallFromUrl = true" class="secondary">
              🔗 Install from URL
            </button>
          </div>
        </div>
        
        <!-- Search Bar -->
        <div class="search-bar">
          <span class="search-icon">🔍</span>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search installed tools…" 
            @input="searchTools"
          >
          <button v-if="searchQuery" @click="clearSearch" class="clear-search">
            ✕
          </button>
        </div>
        
        <!-- Empty State -->
        <div v-if="filteredInstalledTools.length === 0" class="empty-state">
          <span class="empty-icon">📦</span>
          <h3>No tools installed</h3>
          <p>Browse available tools to extend uDOS functionality</p>
          <button @click="activeTab = 'available'" class="primary">
            🔍 Browse Tools
          </button>
        </div>
        
        <!-- Tools Grid -->
        <div v-else class="tools-grid">
          <div 
            v-for="tool in filteredInstalledTools" 
            :key="tool.id" 
            class="tool-card"
          >
            <div class="tool-header">
              <span class="tool-icon">{{ tool.icon || '🔧' }}</span>
              <h3 class="tool-name">{{ tool.name }}</h3>
              <span class="tool-version">v{{ tool.version }}</span>
            </div>
            
            <p class="tool-description">{{ tool.description }}</p>
            
            <div class="tool-meta">
              <span class="tool-author">by {{ tool.author }}</span>
              <span class="tool-category">{{ tool.category }}</span>
              <span v-if="tool.updateAvailable" class="tool-update">⏫ Update available</span>
            </div>
            
            <div class="tool-actions">
              <button @click="configureTool(tool)" class="secondary small">
                ⚙️ Configure
              </button>
              <button @click="toggleTool(tool)" class="small" :class="tool.enabled ? 'danger' : 'primary'">
                {{ tool.enabled ? '🔌 Disable' : '▶️ Enable' }}
              </button>
              <button @click="uninstallTool(tool)" class="danger small">
                🗑️ Uninstall
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Available Tools Tab -->
      <div v-if="activeTab === 'available'" class="tab-content">
        <div class="content-header">
          <h2>Available Tools</h2>
          <div class="header-actions">
            <button @click="refreshAvailableTools" class="secondary">
              🔄 Refresh List
            </button>
          </div>
        </div>
        
        <!-- Categories Filter -->
        <div class="categories-filter">
          <button 
            v-for="category in categories" 
            :key="category" 
            @click="selectCategory(category)" 
            :class="['category-button', { active: selectedCategory === category }]"
          >
            {{ category }}
          </button>
        </div>
        
        <!-- Tools Grid -->
        <div class="tools-grid">
          <div 
            v-for="tool in filteredAvailableTools" 
            :key="tool.id" 
            class="tool-card available"
          >
            <div class="tool-header">
              <span class="tool-icon">{{ tool.icon || '🔧' }}</span>
              <h3 class="tool-name">{{ tool.name }}</h3>
              <span class="tool-version">v{{ tool.version }}</span>
            </div>
            
            <p class="tool-description">{{ tool.description }}</p>
            
            <div class="tool-meta">
              <span class="tool-author">by {{ tool.author }}</span>
              <span class="tool-category">{{ tool.category }}</span>
              <span class="tool-rating">⭐ {{ tool.rating || 'New' }}</span>
            </div>
            
            <div class="tool-actions">
              <button @click="viewToolDetails(tool)" class="secondary small">
                📄 Details
              </button>
              <button @click="installTool(tool)" class="primary small">
                ⬇️ Install
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Settings Tab -->
      <div v-if="activeTab === 'settings'" class="tab-content">
        <div class="settings-section">
          <h2>Registry Settings</h2>
          
          <div class="setting-item">
            <label>
              <input type="checkbox" v-model="autoUpdate">
              Auto-check for updates
            </label>
            <p class="setting-description">
              Automatically check for tool updates on startup
            </p>
          </div>
          
          <div class="setting-item">
            <label>
              <input type="checkbox" v-model="betaTools">
              Show beta tools
            </label>
            <p class="setting-description">
              Include pre-release and experimental tools in available list
            </p>
          </div>
          
          <div class="setting-item">
            <label for="registry-url">Custom Registry URL</label>
            <input 
              id="registry-url" 
              v-model="customRegistryUrl" 
              type="url" 
              placeholder="https://your-registry.com"
            >
            <p class="setting-description">
              Use a custom tool registry instead of the default
            </p>
          </div>
          
          <button @click="saveSettings" class="primary">
            💾 Save Settings
          </button>
        </div>
        
        <div class="settings-section">
          <h2>Tool Permissions</h2>
          <p class="section-description">
            Manage what installed tools can access
          </p>
          
          <div class="permission-item">
            <label>
              <input type="checkbox" v-model="allowVaultAccess">
              Allow Vault access
            </label>
            <p class="setting-description">
              Tools can read and write files in your Vault
            </p>
          </div>
          
          <div class="permission-item">
            <label>
              <input type="checkbox" v-model="allowNetworkAccess">
              Allow network access
            </label>
            <p class="setting-description">
              Tools can make network requests
            </p>
          </div>
          
          <div class="permission-item">
            <label>
              <input type="checkbox" v-model="allowSystemAccess">
              Allow system access
            </label>
            <p class="setting-description">
              Tools can access system information and settings
            </p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Install from URL Modal -->
    <div v-if="showInstallFromUrl" class="modal-overlay">
      <div class="install-url-modal">
        <h3>🔗 Install Tool from URL</h3>
        <p>Enter the URL of a tool manifest or package</p>
        
        <div class="form-group">
          <label for="tool-url">Tool URL</label>
          <input 
            id="tool-url" 
            v-model="installUrl" 
            type="url" 
            placeholder="https://example.com/tool-manifest.json"
          >
        </div>
        
        <div class="form-group">
          <label>
            <input type="checkbox" v-model="trustSource">
            I trust this source
          </label>
          <p class="warning-text">
            ⚠️ Only install tools from sources you trust
          </p>
        </div>
        
        <div class="modal-actions">
          <button @click="installFromUrl" class="primary" :disabled="!installUrl || !trustSource">
            ⬇️ Install Tool
          </button>
          <button @click="showInstallFromUrl = false" class="secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
    
    <!-- Tool Details Modal -->
    <div v-if="viewingTool" class="modal-overlay">
      <div class="tool-details-modal">
        <div class="details-header">
          <h2>{{ viewingTool.name }}</h2>
          <button @click="closeToolDetails" class="secondary small">
            ✕ Close
          </button>
        </div>
        
        <div class="details-content">
          <div class="tool-info">
            <div class="info-row">
              <span class="info-label">Version:</span>
              <span class="info-value">v{{ viewingTool.version }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Author:</span>
              <span class="info-value">{{ viewingTool.author }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Category:</span>
              <span class="info-value">{{ viewingTool.category }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">License:</span>
              <span class="info-value">{{ viewingTool.license || 'MIT' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Rating:</span>
              <span class="info-value">⭐ {{ viewingTool.rating || 'New' }}</span>
            </div>
          </div>
          
          <div class="tool-description-full">
            <h3>Description</h3>
            <p>{{ viewingTool.description }}</p>
          </div>
          
          <div v-if="viewingTool.features.length" class="tool-features">
            <h3>Features</h3>
            <ul>
              <li v-for="feature in viewingTool.features" :key="feature">
                {{ feature }}
              </li>
            </ul>
          </div>
          
          <div v-if="viewingTool.screenshots.length" class="tool-screenshots">
            <h3>Screenshots</h3>
            <div class="screenshot-grid">
              <img 
                v-for="(screenshot, index) in viewingTool.screenshots" 
                :key="index" 
                :src="screenshot" 
                alt="Screenshot"
                class="screenshot"
              >
            </div>
          </div>
        </div>
        
        <div class="details-actions">
          <button @click="installTool(viewingTool)" class="primary">
            ⬇️ Install Tool
          </button>
          <button @click="viewDocumentation" class="secondary">
            📖 Documentation
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
            <label>
              <input type="checkbox" v-model="configuringTool.enabled">
              Enable this tool
            </label>
          </div>
          
          <div v-if="configuringTool.settings" class="tool-settings">
            <h3>Tool Settings</h3>
            <div v-for="setting in configuringTool.settings" :key="setting.key" class="setting-item">
              <label :for="`setting-${setting.key}`">{{ setting.label }}</label>
              <input 
                :id="`setting-${setting.key}`" 
                v-model="setting.value" 
                :type="setting.type || 'text'" 
                :placeholder="setting.placeholder"
              >
              <p v-if="setting.description" class="setting-description">
                {{ setting.description }}
              </p>
            </div>
          </div>
          
          <div class="config-permissions">
            <h3>Permissions</h3>
            <div v-for="permission in configuringTool.permissions" :key="permission.key" class="permission-item">
              <label>
                <input type="checkbox" v-model="permission.granted">
                {{ permission.label }}
              </label>
              <p class="permission-description">
                {{ permission.description }}
              </p>
            </div>
          </div>
        </div>
        
        <div class="config-actions">
          <button @click="saveToolConfig" class="primary">
            💾 Save Configuration
          </button>
          <button @click="resetToDefaults" class="secondary">
            🔄 Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useToolRegistryStore } from '@/stores/toolRegistry'

export default {
  name: 'ToolRegistrySurface',
  setup() {
    const toolRegistryStore = useToolRegistryStore()
    
    // State
    const isLoading = ref(false)
    const error = ref(null)
    const activeTab = ref('installed')
    const searchQuery = ref('')
    const selectedCategory = ref('All')
    const showInstallFromUrl = ref(false)
    const viewingTool = ref(null)
    const configuringTool = ref(null)
    const installUrl = ref('')
    const trustSource = ref(false)
    
    // Settings
    const autoUpdate = ref(true)
    const betaTools = ref(false)
    const customRegistryUrl = ref('')
    const allowVaultAccess = ref(true)
    const allowNetworkAccess = ref(true)
    const allowSystemAccess = ref(false)
    
    // Computed properties
    const installedTools = computed(() => toolRegistryStore.installedTools)
    const availableTools = computed(() => toolRegistryStore.availableTools)
    
    const categories = computed(() => {
      const allCats = ['All', ...new Set(availableTools.value.map(tool => tool.category))]
      return Array.from(allCats)
    })
    
    const filteredInstalledTools = computed(() => {
      if (!searchQuery.value) return installedTools.value
      
      const query = searchQuery.value.toLowerCase()
      return installedTools.value.filter(tool => 
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.category.toLowerCase().includes(query)
      )
    })
    
    const filteredAvailableTools = computed(() => {
      let tools = availableTools.value
      
      // Filter by category
      if (selectedCategory.value !== 'All') {
        tools = tools.filter(tool => tool.category === selectedCategory.value)
      }
      
      // Filter by search query
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        tools = tools.filter(tool => 
          tool.name.toLowerCase().includes(query) ||
          tool.description.toLowerCase().includes(query) ||
          tool.category.toLowerCase().includes(query)
        )
      }
      
      return tools
    })
    
    // Methods
    const loadRegistry = async () => {
      isLoading.value = true
      error.value = null
      try {
        await toolRegistryStore.loadRegistry()
      } catch (err) {
        error.value = { message: err.message || 'Could not load tool registry' }
      } finally {
        isLoading.value = false
      }
    }
    
    const reloadRegistry = loadRegistry
    
    const checkForUpdates = async () => {
      isLoading.value = true
      try {
        await toolRegistryStore.checkForUpdates()
        alert('Update check complete!')
      } catch (err) {
        error.value = { message: err.message || 'Could not check for updates' }
      } finally {
        isLoading.value = false
      }
    }
    
    const refreshAvailableTools = async () => {
      isLoading.value = true
      try {
        await toolRegistryStore.refreshAvailableTools()
      } catch (err) {
        error.value = { message: err.message || 'Could not refresh available tools' }
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
    
    const selectCategory = (category) => {
      selectedCategory.value = category
    }
    
    const installTool = (tool) => {
      if (confirm(`Install ${tool.name}? Make sure you trust this tool.`)) {
        alert(`Would install tool: ${tool.name}`)
      }
    }
    
    const uninstallTool = (tool) => {
      if (confirm(`Uninstall ${tool.name}? This cannot be undone.`)) {
        alert(`Would uninstall tool: ${tool.name}`)
      }
    }
    
    const toggleTool = (tool) => {
      const action = tool.enabled ? 'disable' : 'enable'
      if (confirm(`${tool.enabled ? 'Disable' : 'Enable'} ${tool.name}?`)) {
        alert(`Would ${action} tool: ${tool.name}`)
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
        await toolRegistryStore.saveToolConfig(configuringTool.value)
        closeConfig()
        await loadRegistry()
      } catch (err) {
        error.value = { message: err.message || 'Could not save tool configuration' }
      } finally {
        isLoading.value = false
      }
    }
    
    const resetToDefaults = () => {
      if (confirm('Reset all settings to defaults?')) {
        alert('Would reset to defaults')
      }
    }
    
    const viewToolDetails = (tool) => {
      viewingTool.value = tool
    }
    
    const closeToolDetails = () => {
      viewingTool.value = null
    }
    
    const viewDocumentation = () => {
      alert('Would open documentation')
    }
    
    const saveSettings = async () => {
      isLoading.value = true
      try {
        await toolRegistryStore.saveSettings({
          autoUpdate: autoUpdate.value,
          betaTools: betaTools.value,
          customRegistryUrl: customRegistryUrl.value,
          permissions: {
            vault: allowVaultAccess.value,
            network: allowNetworkAccess.value,
            system: allowSystemAccess.value
          }
        })
        alert('Settings saved successfully!')
      } catch (err) {
        error.value = { message: err.message || 'Could not save settings' }
      } finally {
        isLoading.value = false
      }
    }
    
    const installFromUrl = () => {
      if (!installUrl.value || !trustSource.value) return
      
      if (confirm(`Install tool from ${installUrl.value}? Make sure you trust this source.`)) {
        alert(`Would install from URL: ${installUrl.value}`)
        showInstallFromUrl.value = false
        installUrl.value = ''
        trustSource.value = false
      }
    }
    
    // Load initial data
    loadRegistry()
    
    return {
      isLoading,
      error,
      activeTab,
      searchQuery,
      selectedCategory,
      showInstallFromUrl,
      viewingTool,
      configuringTool,
      installUrl,
      trustSource,
      autoUpdate,
      betaTools,
      customRegistryUrl,
      allowVaultAccess,
      allowNetworkAccess,
      allowSystemAccess,
      installedTools,
      availableTools,
      categories,
      filteredInstalledTools,
      filteredAvailableTools,
      reloadRegistry,
      checkForUpdates,
      refreshAvailableTools,
      searchTools,
      clearSearch,
      selectCategory,
      installTool,
      uninstallTool,
      toggleTool,
      configureTool,
      closeConfig,
      saveToolConfig,
      resetToDefaults,
      viewToolDetails,
      closeToolDetails,
      viewDocumentation,
      saveSettings,
      installFromUrl
    }
  }
}
</script>

<style scoped>
.tool-registry-surface {
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

.registry-tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 1rem;
}

.tab-button {
  padding: 0.5rem 1rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text-secondary);
  border-bottom: 2px solid transparent;
}

.tab-button.active {
  color: var(--text-primary);
  border-bottom-color: var(--primary-color);
}

.tab-content {
  padding: 1rem 0;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.content-header h2 {
  margin: 0;
  font-size: 1.2rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
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

.categories-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.category-button {
  padding: 0.25rem 0.75rem;
  background: var(--surface-background);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
}

.category-button.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
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

.tool-card.available {
  opacity: 0.9;
}

.tool-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.tool-icon {
  font-size: 1.5rem;
}

.tool-name {
  margin: 0;
  font-size: 1.1rem;
  flex: 1;
}

.tool-version {
  color: var(--text-tertiary);
  font-size: 0.8rem;
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

.tool-update {
  color: var(--warning-color);
  font-weight: 600;
}

.tool-actions {
  display: flex;
  gap: 0.5rem;
}

.settings-section {
  margin-bottom: 2rem;
}

.settings-section h2 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.setting-item {
  margin-bottom: 1rem;
}

.setting-item label {
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

.permission-item {
  margin-bottom: 1rem;
}

.permission-item label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.permission-description {
  font-size: 0.85rem;
  color: var(--text-tertiary);
  margin-left: 1.5rem;
  margin-top: 0.25rem;
}

.section-description {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
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

.install-url-modal, .tool-details-modal, .tool-config-modal {
  background: var(--background);
  border-radius: 8px;
  padding: 1.5rem;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.details-header, .config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 1rem;
}

.warning-text {
  color: var(--warning-color);
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.tool-info {
  margin-bottom: 1.5rem;
}

.info-row {
  display: flex;
  margin-bottom: 0.5rem;
}

.info-label {
  font-weight: 600;
  width: 80px;
  color: var(--text-secondary);
}

.info-value {
  flex: 1;
}

.tool-description-full {
  margin-bottom: 1.5rem;
}

.tool-features {
  margin-bottom: 1.5rem;
}

.tool-features ul {
  padding-left: 1.5rem;
}

.tool-screenshots {
  margin-bottom: 1.5rem;
}

.screenshot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.5rem;
}

.screenshot {
  width: 100%;
  height: auto;
  border-radius: 4px;
  border: 1px solid var(--border-color);
}

.tool-settings, .config-permissions {
  margin: 1rem 0;
  padding: 1rem;
  background: var(--surface-background);
  border-radius: 6px;
}

.setting-item, .permission-item {
  margin-bottom: 1rem;
}

.modal-actions, .details-actions, .config-actions {
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