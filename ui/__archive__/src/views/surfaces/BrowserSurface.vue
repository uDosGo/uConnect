<template>
  <div class="browser-surface">
    <!-- Surface Header with Definition -->
    <div class="surface-header">
      <h1><span class="surface-icon">🌐</span> Browser Surface</h1>
      <p class="surface-tagline">Browse websites inside uDOS. Safe and integrated web experience.</p>
      <p class="surface-definition">
        <strong>What's the Browser Surface?</strong> A secure web browser built into uDOS.
        Browse websites without leaving your workflow.
      </p>
    </div>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <span class="spinner">⏳</span>
      <p>Loading browser…</p>
      <p class="helper-text">This usually takes a few seconds.</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <span class="error-icon">⚠️</span>
      <h3>Couldn't load browser</h3>
      <p>{{ error.message }}</p>
      <p class="helper-text">
        Try:
        <br>
        • Refreshing the page
        <br>
        • Checking your internet connection
        <br>
        • Making sure the browser service is available
      </p>
      <button @click="reloadBrowser" class="primary">
        🔄 Try Again
      </button>
    </div>
    
    <!-- Main Content -->
    <div v-else class="main-content">
      <!-- Browser Controls -->
      <div class="browser-controls">
        <div class="control-group">
          <button @click="goBack" :disabled="!canGoBack" class="control-button">
            ←
          </button>
          <button @click="goForward" :disabled="!canGoForward" class="control-button">
            →
          </button>
          <button @click="refreshPage" class="control-button">
            🔄
          </button>
          <button @click="goHome" class="control-button">
            🏠
          </button>
        </div>
        
        <div class="address-bar">
          <span class="address-icon">🔒</span>
          <input 
            v-model="currentUrl" 
            type="url" 
            placeholder="https://example.com" 
            @keyup.enter="navigateToUrl"
          >
          <button @click="navigateToUrl" class="go-button">
            ▶️
          </button>
        </div>
        
        <div class="control-group">
          <button @click="showBookmarks" class="control-button">
            ⭐
          </button>
          <button @click="showHistory" class="control-button">
            🕒
          </button>
          <button @click="showSettings" class="control-button">
            ⚙️
          </button>
        </div>
      </div>
      
      <!-- Browser View -->
      <div class="browser-view">
        <div v-if="!currentUrl" class="browser-welcome">
          <span class="welcome-icon">🌐</span>
          <h2>Welcome to uDOS Browser</h2>
          <p>Start browsing by entering a URL above</p>
          <div class="quick-links">
            <button @click="navigateTo('https://github.com')" class="quick-link">
              📦 GitHub
            </button>
            <button @click="navigateTo('https://wordpress.org')" class="quick-link">
              🌐 WordPress
            </button>
            <button @click="navigateTo('https://udosconnect.com')" class="quick-link">
              🎮 uDOS
            </button>
          </div>
        </div>
        
        <div v-else class="web-content">
          <!-- In a real implementation, this would be an iframe or webview -->
          <div class="web-content-placeholder">
            <h3>Web Content Would Appear Here</h3>
            <p>URL: {{ currentUrl }}</p>
            <p>Status: {{ pageStatus }}</p>
            <div class="placeholder-content">
              <p>This is a placeholder for the actual web content.</p>
              <p>In a real implementation, this area would display the website from {{ currentUrl }}.</p>
              <p>The browser would have full navigation, security features, and integration with uDOS.</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Browser Statistics -->
      <div class="browser-stats">
        <p>
          📊 {{ pageCount }} pages visited • 
          {{ bookmarkCount }} bookmarks • 
          {{ historyCount }} history items
        </p>
      </div>
    </div>
    
    <!-- Bookmarks Modal -->
    <div v-if="showBookmarksModal" class="modal-overlay">
      <div class="bookmarks-modal">
        <div class="modal-header">
          <h3>⭐ Bookmarks</h3>
          <button @click="closeBookmarks" class="close-button">
            ✕
          </button>
        </div>
        
        <div class="bookmarks-content">
          <div class="bookmark-list">
            <div v-for="bookmark in bookmarks" :key="bookmark.id" class="bookmark-item">
              <div class="bookmark-info">
                <span class="bookmark-icon">🔗</span>
                <span class="bookmark-title">{{ bookmark.title }}</span>
                <span class="bookmark-url">{{ bookmark.url }}</span>
              </div>
              <div class="bookmark-actions">
                <button @click="navigateTo(bookmark.url)" class="small">
                  ▶️ Open
                </button>
                <button @click="removeBookmark(bookmark.id)" class="small danger">
                  🗑️ Remove
                </button>
              </div>
            </div>
          </div>
          
          <div class="bookmark-form">
            <h4>Add New Bookmark</h4>
            <div class="form-group">
              <input 
                v-model="newBookmarkTitle" 
                type="text" 
                placeholder="Bookmark title"
              >
              <input 
                v-model="newBookmarkUrl" 
                type="url" 
                placeholder="https://example.com"
              >
              <button @click="addBookmark" class="primary small" :disabled="!newBookmarkTitle || !newBookmarkUrl">
                ➕ Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- History Modal -->
    <div v-if="showHistoryModal" class="modal-overlay">
      <div class="history-modal">
        <div class="modal-header">
          <h3>🕒 Browsing History</h3>
          <button @click="closeHistory" class="close-button">
            ✕
          </button>
        </div>
        
        <div class="history-content">
          <div class="history-controls">
            <button @click="clearHistory" class="danger small">
              🗑️ Clear History
            </button>
          </div>
          
          <div class="history-list">
            <div v-for="item in history" :key="item.id" class="history-item">
              <div class="history-info">
                <span class="history-time">{{ formatTime(item.timestamp) }}</span>
                <span class="history-title">{{ item.title }}</span>
                <span class="history-url">{{ item.url }}</span>
              </div>
              <div class="history-actions">
                <button @click="navigateTo(item.url)" class="small">
                  ▶️ Open
                </button>
                <button @click="removeHistoryItem(item.id)" class="small danger">
                  🗑️ Remove
                </button>
              </div>
            </div>
          </div>
          
          <div v-if="history.length === 0" class="empty-history">
            <p>No history yet. Start browsing to see your history here.</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Settings Modal -->
    <div v-if="showSettingsModal" class="modal-overlay">
      <div class="settings-modal">
        <div class="modal-header">
          <h3>⚙️ Browser Settings</h3>
          <button @click="closeSettings" class="close-button">
            ✕
          </button>
        </div>
        
        <div class="settings-content">
          <div class="settings-section">
            <h4>Privacy & Security</h4>
            
            <div class="setting-item">
              <label>
                <input type="checkbox" v-model="blockTrackers">
                Block trackers
              </label>
              <p class="setting-description">
                Prevent websites from tracking your activity
              </p>
            </div>
            
            <div class="setting-item">
              <label>
                <input type="checkbox" v-model="blockAds">
                Block ads
              </label>
              <p class="setting-description">
                Hide advertisements on websites
              </p>
            </div>
            
            <div class="setting-item">
              <label>
                <input type="checkbox" v-model="httpsOnly">
                HTTPS-only mode
              </label>
              <p class="setting-description">
                Only connect to secure websites
              </p>
            </div>
          </div>
          
          <div class="settings-section">
            <h4>Content Settings</h4>
            
            <div class="setting-item">
              <label>
                <input type="checkbox" v-model="allowCookies">
                Allow cookies
              </label>
              <p class="setting-description">
                Websites can store cookies for sessions
              </p>
            </div>
            
            <div class="setting-item">
              <label>
                <input type="checkbox" v-model="allowJavaScript">
                Allow JavaScript
              </label>
              <p class="setting-description">
                Enable JavaScript for interactive content
              </p>
            </div>
          </div>
          
          <div class="settings-section">
            <h4>Integration</h4>
            
            <div class="setting-item">
              <label>
                <input type="checkbox" v-model="integrateWithVault">
                Integrate with Vault
              </label>
              <p class="setting-description">
                Save downloads and bookmarks to your Vault
              </p>
            </div>
            
            <div class="setting-item">
              <label>
                <input type="checkbox" v-model="openExternal">
                Open external links in system browser
              </label>
              <p class="setting-description">
                Links that open new windows use your default browser
              </p>
            </div>
          </div>
          
          <button @click="saveBrowserSettings" class="primary">
            💾 Save Settings
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useBrowserStore } from '@/stores/browser'

export default {
  name: 'BrowserSurface',
  setup() {
    const browserStore = useBrowserStore()
    
    // State
    const isLoading = ref(false)
    const error = ref(null)
    const currentUrl = ref('')
    const pageStatus = ref('Ready')
    const showBookmarksModal = ref(false)
    const showHistoryModal = ref(false)
    const showSettingsModal = ref(false)
    
    // Form state
    const newBookmarkTitle = ref('')
    const newBookmarkUrl = ref('')
    
    // Settings
    const blockTrackers = ref(true)
    const blockAds = ref(true)
    const httpsOnly = ref(true)
    const allowCookies = ref(true)
    const allowJavaScript = ref(true)
    const integrateWithVault = ref(true)
    const openExternal = ref(false)
    
    // Computed properties
    const bookmarks = computed(() => browserStore.bookmarks)
    const history = computed(() => browserStore.history)
    const pageCount = computed(() => browserStore.pageCount)
    const bookmarkCount = computed(() => bookmarks.value.length)
    const historyCount = computed(() => history.value.length)
    const canGoBack = computed(() => browserStore.canGoBack)
    const canGoForward = computed(() => browserStore.canGoForward)
    
    // Methods
    const formatTime = (timestamp) => {
      const date = new Date(timestamp)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    
    const loadBrowser = async () => {
      isLoading.value = true
      error.value = null
      try {
        await browserStore.loadBrowser()
      } catch (err) {
        error.value = { message: err.message || 'Could not load browser' }
      } finally {
        isLoading.value = false
      }
    }
    
    const reloadBrowser = loadBrowser
    
    const navigateTo = (url) => {
      if (!url) return
      
      // Add http:// if missing
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url
      }
      
      currentUrl.value = url
      pageStatus.value = 'Loading...'
      
      // Simulate loading
      setTimeout(() => {
        pageStatus.value = 'Loaded'
        browserStore.addToHistory({
          id: Date.now().toString(),
          title: 'Website Title',
          url: url,
          timestamp: Date.now()
        })
      }, 1000)
    }
    
    const navigateToUrl = () => {
      navigateTo(currentUrl.value)
    }
    
    const goBack = () => {
      if (!canGoBack.value) return
      pageStatus.value = 'Going back...'
      // Would go back in history
    }
    
    const goForward = () => {
      if (!canGoForward.value) return
      pageStatus.value = 'Going forward...'
      // Would go forward in history
    }
    
    const refreshPage = () => {
      if (!currentUrl.value) return
      pageStatus.value = 'Refreshing...'
      setTimeout(() => {
        pageStatus.value = 'Loaded'
      }, 500)
    }
    
    const goHome = () => {
      navigateTo('https://udosconnect.com')
    }
    
    const showBookmarks = () => {
      showBookmarksModal.value = true
    }
    
    const closeBookmarks = () => {
      showBookmarksModal.value = false
    }
    
    const showHistory = () => {
      showHistoryModal.value = true
    }
    
    const closeHistory = () => {
      showHistoryModal.value = false
    }
    
    const showSettings = () => {
      showSettingsModal.value = true
    }
    
    const closeSettings = () => {
      showSettingsModal.value = false
    }
    
    const addBookmark = () => {
      if (!newBookmarkTitle.value.trim() || !newBookmarkUrl.value.trim()) return
      
      // Add http:// if missing
      let url = newBookmarkUrl.value
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url
      }
      
      browserStore.addBookmark({
        id: Date.now().toString(),
        title: newBookmarkTitle.value,
        url: url
      })
      
      newBookmarkTitle.value = ''
      newBookmarkUrl.value = ''
    }
    
    const removeBookmark = (id) => {
      if (confirm('Remove this bookmark?')) {
        browserStore.removeBookmark(id)
      }
    }
    
    const clearHistory = () => {
      if (confirm('Clear all browsing history? This cannot be undone.')) {
        browserStore.clearHistory()
      }
    }
    
    const removeHistoryItem = (id) => {
      if (confirm('Remove this history item?')) {
        browserStore.removeHistoryItem(id)
      }
    }
    
    const saveBrowserSettings = async () => {
      isLoading.value = true
      try {
        await browserStore.saveSettings({
          privacy: {
            blockTrackers: blockTrackers.value,
            blockAds: blockAds.value,
            httpsOnly: httpsOnly.value
          },
          content: {
            allowCookies: allowCookies.value,
            allowJavaScript: allowJavaScript.value
          },
          integration: {
            integrateWithVault: integrateWithVault.value,
            openExternal: openExternal.value
          }
        })
        alert('Browser settings saved successfully!')
      } catch (err) {
        error.value = { message: err.message || 'Could not save browser settings' }
      } finally {
        isLoading.value = false
      }
    }
    
    // Load initial data
    loadBrowser()
    
    return {
      isLoading,
      error,
      currentUrl,
      pageStatus,
      showBookmarksModal,
      showHistoryModal,
      showSettingsModal,
      newBookmarkTitle,
      newBookmarkUrl,
      blockTrackers,
      blockAds,
      httpsOnly,
      allowCookies,
      allowJavaScript,
      integrateWithVault,
      openExternal,
      bookmarks,
      history,
      pageCount,
      bookmarkCount,
      historyCount,
      canGoBack,
      canGoForward,
      formatTime,
      reloadBrowser,
      navigateTo,
      navigateToUrl,
      goBack,
      goForward,
      refreshPage,
      goHome,
      showBookmarks,
      closeBookmarks,
      showHistory,
      closeHistory,
      showSettings,
      closeSettings,
      addBookmark,
      removeBookmark,
      clearHistory,
      removeHistoryItem,
      saveBrowserSettings
    }
  }
}
</script>

<style scoped>
.browser-surface {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 100px);
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
  font-size: var(--wf-font-sm);
  margin: 0;
}

.loading-state, .error-state {
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.spinner, .error-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 1rem;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-top: 1rem;
}

.browser-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: var(--surface-background);
  border-radius: 8px;
}

.control-group {
  display: flex;
  gap: 0.5rem;
}

.control-button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-background);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
}

.control-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.address-bar {
  flex: 1;
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 0 0.5rem;
}

.address-icon {
  color: var(--success-color);
  margin-right: 0.5rem;
}

.address-bar input {
  flex: 1;
  border: none;
  padding: var(--wf-spacing-2);
  font-size: var(--wf-font-md);
}

.address-bar input:focus {
  outline: none;
}

.go-button {
  background: var(--primary-color);
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  cursor: pointer;
}

.browser-view {
  flex: 1;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.browser-welcome {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
}

.welcome-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.browser-welcome h2 {
  margin: 0;
  font-size: var(--wf-font-xl);
  margin-bottom: 0.5rem;
}

.quick-links {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.quick-link {
  padding: 0.5rem 1rem;
  background: var(--surface-background);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
}

.web-content {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}

.web-content-placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--text-tertiary);
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  padding: 2rem;
}

.placeholder-content {
  margin-top: 1rem;
  line-height: 1.6;
}

.browser-stats {
  text-align: right;
  color: var(--text-tertiary);
  font-size: var(--wf-font-xs);
  padding: var(--wf-spacing-2);
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

.bookmarks-modal, .history-modal, .settings-modal {
  background: var(--background);
  border-radius: 8px;
  padding: 1.5rem;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.modal-header h3 {
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  font-size: var(--wf-font-xl);
  cursor: pointer;
}

.bookmark-list, .history-list {
  margin: 1rem 0;
}

.bookmark-item, .history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--surface-background);
  border-radius: 6px;
  margin-bottom: 0.5rem;
}

.bookmark-info, .history-info {
  flex: 1;
}

.bookmark-title, .history-title {
  font-weight: 600;
  margin-right: 0.5rem;
}

.bookmark-url, .history-url {
  color: var(--text-tertiary);
  font-size: 0.85rem;
}

.history-time {
  color: var(--text-tertiary);
  font-size: 0.85rem;
  margin-right: 0.5rem;
}

.bookmark-actions, .history-actions {
  display: flex;
  gap: 0.5rem;
}

.settings-content {
  margin: 1rem 0;
}

.settings-section {
  margin-bottom: 1.5rem;
}

.settings-section h4 {
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
  font-size: var(--wf-font-xs);
  color: var(--text-tertiary);
  margin-left: var(--wf-spacing-4);
  margin-top: var(--wf-spacing-1);
}

.bookmark-form {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.form-group {
  display: flex;
  gap: 0.5rem;
}

.form-group input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.empty-history {
  text-align: center;
  padding: 2rem;
  color: var(--text-tertiary);
}

.history-controls {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

button.primary {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: var(--wf-spacing-2) var(--wf-spacing-4);
  border-radius: 6px;
  cursor: pointer;
  font-size: var(--wf-font-sm);
}

button.secondary {
  background: var(--surface-background);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: var(--wf-spacing-2) var(--wf-spacing-4);
  border-radius: 6px;
  cursor: pointer;
  font-size: var(--wf-font-sm);
}

button.danger {
  background: var(--danger-background);
  color: var(--danger-color);
  border: 1px solid var(--danger-border);
  padding: var(--wf-spacing-2) var(--wf-spacing-4);
  border-radius: 6px;
  cursor: pointer;
  font-size: var(--wf-font-sm);
}

button.small {
  padding: var(--wf-spacing-1) var(--wf-spacing-2);
  font-size: var(--wf-font-xs);
}
</style>