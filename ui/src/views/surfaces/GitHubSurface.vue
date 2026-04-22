<template>
  <div class="github-surface">
    <!-- Surface Header with Definition -->
    <div class="surface-header">
      <h1><span class="surface-icon">🔗</span> GitHub Bridge</h1>
      <p class="surface-tagline">Connect your GitHub repos. Keep code in sync between uDOS and GitHub.</p>
      <p class="surface-definition">
        <strong>What's a Bridge?</strong> A connection from uDOS to another service. This one talks to GitHub—where many developers store their code.
      </p>
    </div>
    
    <!-- Connection Status -->
    <div v-if="!isConnected" class="connection-panel">
      <div class="connection-icon">🔐</div>
      <h3>Sign in to GitHub</h3>
      <p>To sync code, you'll need to sign in to GitHub first.</p>
      <button class="primary" @click="initiateOAuth">
        🔐 Sign in with GitHub
      </button>
      <p class="helper-text">
        ✨ We'll never see your password. GitHub handles the security.
      </p>
    </div>
    
    <!-- Loading State -->
    <div v-else-if="isLoading" class="loading-state">
      <span class="spinner">⏳</span>
      <p>Loading your repositories…</p>
      <p class="helper-text">This usually takes a few seconds.</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <span class="error-icon">⚠️</span>
      <h3>Couldn't connect to GitHub</h3>
      <p>We tried to reach GitHub, but the connection failed.</p>
      <p class="helper-text">
        Try:
        <br>
        • Signing out and back in
        <br>
        • Checking your internet connection
        <br>
        • Making sure GitHub isn't down
      </p>
      <div class="error-actions">
        <button class="primary" @click="retryConnection">
          🔄 Try Again
        </button>
        <button class="secondary" @click="signOut">
          🔐 Sign Out
        </button>
      </div>
    </div>
    
    <!-- Empty State (Connected but no repos) -->
    <div v-else-if="repositories.length === 0" class="empty-state">
      <span class="empty-icon">📭</span>
      <h3>No repositories found</h3>
      <p>You're signed in, but we don't see any repositories.</p>
      <p class="helper-text">
        → Create a repo on GitHub first, then come back here.
        <br>
        → Or check that you have access to the right account.
      </p>
      <button class="primary" @click="reloadRepositories">
        🔄 Refresh
      </button>
    </div>
    
    <!-- Main Content: Repository List -->
    <div v-else class="repo-list">
      <div class="repo-controls">
        <div class="repo-search">
          <span class="search-icon">🔍</span>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search repositories…" 
            @input="filterRepositories"
          >
          <button v-if="searchQuery" class="clear-search" @click="clearSearch">
            ✕
          </button>
        </div>
        <button class="secondary" @click="reloadRepositories">
          🔄 Refresh
        </button>
      </div>
      
      <div class="repo-grid">
        <div 
          v-for="repo in filteredRepos" 
          :key="repo.id" 
          class="repo-card"
        >
          <div class="repo-header">
            <span class="repo-icon">📦</span>
            <h3 class="repo-name">{{ repo.name }}</h3>
            <span class="repo-visibility">
              {{ repo.private ? '🔒' : '🌍' }}
            </span>
          </div>
          
          <div class="repo-meta">
            <span class="repo-branch">
              🌿 {{ repo.defaultBranch }}
            </span>
            <span class="repo-updated">
              Updated {{ formatRelativeTime(repo.updatedAt) }}
            </span>
          </div>
          
          <div class="repo-description" v-if="repo.description">
            {{ repo.description }}
          </div>
          
          <div class="repo-actions">
            <button 
              class="primary" 
              @click="openRepository(repo)" 
              title="Open this repository in uDOS"
            >
              Open →
            </button>
            <button 
              class="secondary" 
              @click="viewOnGitHub(repo)" 
              title="View on GitHub website"
            >
              🌐 GitHub
            </button>
          </div>
          
          <div class="sync-status" v-if="repo.syncStatus">
            <span v-if="repo.syncStatus === 'synced'" class="status-synced">
              ✅ Synced
            </span>
            <span v-else-if="repo.syncStatus === 'syncing'" class="status-syncing">
              ⏳ Syncing…
            </span>
            <span v-else class="status-error">
              ⚠️ Sync error
            </span>
          </div>
        </div>
      </div>
      
      <div class="repo-stats">
        <p>
          📊 {{ filteredRepos.length }} of {{ repositories.length }} repositories shown
        </p>
      </div>
    </div>
    
    <!-- Repository Detail Modal -->
    <div v-if="selectedRepo" class="modal-overlay">
      <div class="repo-detail-modal">
        <div class="modal-header">
          <h2>
            <span class="repo-icon">📦</span> 
            {{ selectedRepo.name }}
          </h2>
          <button class="close-modal" @click="closeRepoDetail" title="Close">
            ✕
          </button>
        </div>
        
        <div class="repo-detail-content">
          <div class="repo-meta-detail">
            <div class="meta-item">
              <strong>Owner:</strong> {{ selectedRepo.owner }}
            </div>
            <div class="meta-item">
              <strong>Visibility:</strong> {{ selectedRepo.private ? 'Private 🔒' : 'Public 🌍' }}
            </div>
            <div class="meta-item">
              <strong>Default Branch:</strong> {{ selectedRepo.defaultBranch }}
            </div>
            <div class="meta-item">
              <strong>Last Updated:</strong> {{ formatFullDate(selectedRepo.updatedAt) }}
            </div>
          </div>
          
          <div class="repo-description-detail" v-if="selectedRepo.description">
            <h4>Description</h4>
            <p>{{ selectedRepo.description }}</p>
          </div>
          
          <div class="repo-sync-section">
            <h4>Sync Status</h4>
            <div v-if="selectedRepo.syncStatus === 'synced'" class="sync-status synced">
              ✅ All changes synced
              <p class="sync-time">
                Last synced {{ formatRelativeTime(selectedRepo.lastSynced) }}
              </p>
            </div>
            <div v-else-if="selectedRepo.syncStatus === 'syncing'" class="sync-status syncing">
              ⏳ Syncing changes…
              <progress-bar :progress="syncProgress" />
            </div>
            <div v-else class="sync-status error">
              ⚠️ Sync error
              <p class="error-message">
                {{ selectedRepo.syncError || 'Could not sync changes' }}
              </p>
              <button class="secondary small" @click="retrySync">
                🔄 Retry Sync
              </button>
            </div>
            
            <button class="primary" @click="syncRepository(selectedRepo)">
              🔄 Sync Now
            </button>
          </div>
          
          <div class="repo-actions-detail">
            <button class="primary" @click="openInVault(selectedRepo)">
              📁 Open in Vault
            </button>
            <button class="secondary" @click="viewOnGitHub(selectedRepo)">
              🌐 View on GitHub
            </button>
            <button class="secondary" @click="disconnectRepository(selectedRepo)">
              🔗 Disconnect
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- OAuth Callback Handler -->
    <div v-if="showOAuthCallback" class="modal-overlay">
      <div class="oauth-modal">
        <div class="spinner">⏳</div>
        <h3>Connecting to GitHub…</h3>
        <p>Please wait while we set up your connection.</p>
        <p class="helper-text">
          You can close this window if it takes too long.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useGitHubStore } from '@/stores/github'
import { formatDistanceToNow, format } from 'date-fns'

export default {
  name: 'GitHubSurface',
  setup() {
    const githubStore = useGitHubStore()
    
    // State
    const isLoading = ref(false)
    const error = ref(null)
    const searchQuery = ref('')
    const selectedRepo = ref(null)
    const showOAuthCallback = ref(false)
    const syncProgress = ref(0)
    
    // Computed properties
    const isConnected = computed(() => githubStore.isConnected)
    const repositories = computed(() => githubStore.repositories)
    const userInfo = computed(() => githubStore.userInfo)
    
    const filteredRepos = computed(() => {
      if (!searchQuery.value) return repositories.value
      
      const query = searchQuery.value.toLowerCase()
      return repositories.value.filter(repo => 
        repo.name.toLowerCase().includes(query) ||
        repo.description.toLowerCase().includes(query)
      )
    })
    
    // Methods
    const initiateOAuth = async () => {
      try {
        isLoading.value = true
        error.value = null
        showOAuthCallback.value = true
        
        // In a real implementation, this would redirect to GitHub OAuth
        await githubStore.initiateOAuth()
        
        // After successful OAuth, load repositories
        await loadRepositories()
      } catch (err) {
        error.value = err.message
      } finally {
        isLoading.value = false
        showOAuthCallback.value = false
      }
    }
    
    const loadRepositories = async () => {
      try {
        isLoading.value = true
        error.value = null
        await githubStore.loadRepositories()
      } catch (err) {
        error.value = err.message
      } finally {
        isLoading.value = false
      }
    }
    
    const reloadRepositories = loadRepositories
    
    const openRepository = (repo) => {
      selectedRepo.value = repo
    }
    
    const closeRepoDetail = () => {
      selectedRepo.value = null
    }
    
    const syncRepository = async (repo) => {
      try {
        isLoading.value = true
        await githubStore.syncRepository(repo.id)
        // In a real implementation, you'd track sync progress
        syncProgress.value = 0
        const interval = setInterval(() => {
          syncProgress.value += 10
          if (syncProgress.value >= 100) clearInterval(interval)
        }, 200)
      } catch (err) {
        error.value = `Sync failed: ${err.message}`
      } finally {
        isLoading.value = false
      }
    }
    
    const retrySync = () => {
      if (selectedRepo.value) {
        syncRepository(selectedRepo.value)
      }
    }
    
    const retryConnection = loadRepositories
    
    const signOut = async () => {
      try {
        await githubStore.signOut()
        // Clear repositories after sign out
        await loadRepositories()
      } catch (err) {
        error.value = `Sign out failed: ${err.message}`
      }
    }
    
    const viewOnGitHub = (repo) => {
      window.open(`https://github.com/${repo.owner}/${repo.name}`, '_blank')
    }
    
    const openInVault = (repo) => {
      // In a real implementation, this would navigate to the Vault
      // with the repository content loaded
      alert(`Would open ${repo.name} in Vault`)
    }
    
    const disconnectRepository = (repo) => {
      if (confirm(`Disconnect ${repo.name}? You'll need to reconnect to sync again.`)) {
        githubStore.disconnectRepository(repo.id)
      }
    }
    
    const filterRepositories = () => {
      // Handled by computed property
    }
    
    const clearSearch = () => {
      searchQuery.value = ''
    }
    
    // Helper functions
    const formatFileSize = (bytes) => {
      if (bytes < 1024) return `${bytes} B`
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
      if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
    }
    
    const formatRelativeTime = (dateString) => {
      const date = new Date(dateString)
      return formatDistanceToNow(date, { addSuffix: true })
    }
    
    const formatFullDate = (dateString) => {
      const date = new Date(dateString)
      return format(date, 'MMMM d, yyyy h:mm a')
    }
    
    // Load initial data
    const loadInitialData = async () => {
      try {
        isLoading.value = true
        if (isConnected.value) {
          await loadRepositories()
        }
      } catch (err) {
        error.value = err.message
      } finally {
        isLoading.value = false
      }
    }
    
    loadInitialData()
    
    return {
      isLoading,
      error,
      searchQuery,
      selectedRepo,
      showOAuthCallback,
      syncProgress,
      isConnected,
      repositories,
      userInfo,
      filteredRepos,
      initiateOAuth,
      loadRepositories,
      reloadRepositories,
      openRepository,
      closeRepoDetail,
      syncRepository,
      retrySync,
      retryConnection,
      signOut,
      viewOnGitHub,
      openInVault,
      disconnectRepository,
      filterRepositories,
      clearSearch,
      formatFileSize,
      formatRelativeTime,
      formatFullDate
    }
  }
}
</script>

<style scoped>
.github-surface {
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

.connection-panel {
  text-align: center;
  padding: 2rem;
  background: var(--surface-background);
  border-radius: 8px;
  margin-bottom: 1rem;
}

.connection-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.loading-state, .error-state, .empty-state {
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
}

.spinner, .error-icon, .empty-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 1rem;
}

.error-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 1rem;
}

.repo-list {
  margin-top: 1rem;
}

.repo-controls {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  align-items: center;
}

.repo-search {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 0.5rem;
  background: var(--surface-background);
  border-radius: 6px;
  border: 1px solid var(--border-color);
}

.repo-search input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 0.5rem;
  font-size: 1rem;
}

.repo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.repo-card {
  background: var(--surface-background);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.2s;
}

.repo-card:hover {
  background: var(--surface-hover);
  border-color: var(--primary-color);
}

.repo-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.repo-icon {
  font-size: 1.2rem;
}

.repo-name {
  margin: 0;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.repo-visibility {
  font-size: 1.2rem;
}

.repo-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: var(--text-tertiary);
  margin-bottom: 0.5rem;
}

.repo-description {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
  line-height: 1.4;
}

.repo-actions {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.sync-status {
  font-size: 0.85rem;
  text-align: right;
}

.status-synced {
  color: var(--success-color);
}

.status-syncing {
  color: var(--info-color);
}

.status-error {
  color: var(--error-color);
}

.repo-stats {
  text-align: right;
  color: var(--text-tertiary);
  font-size: 0.85rem;
  padding: 0.5rem;
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

.repo-detail-modal, .oauth-modal {
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

.close-modal {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.repo-detail-content {
  margin-bottom: 1rem;
}

.repo-meta-detail {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.meta-item {
  margin-bottom: 0.5rem;
}

.repo-description-detail {
  margin-bottom: 1rem;
}

.repo-sync-section {
  margin-bottom: 1rem;
  padding: 1rem;
  background: var(--surface-background);
  border-radius: 6px;
}

.repo-actions-detail {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
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

button.primary:hover {
  background: var(--primary-hover);
}

button.secondary:hover {
  background: var(--surface-hover);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

button.small {
  padding: 0.25rem 0.5rem;
  font-size: 0.85rem;
}
</style>