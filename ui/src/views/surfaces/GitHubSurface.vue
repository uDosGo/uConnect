<template>
  <div class="github-surface">
    <!-- Surface Header with Definition -->
    <div class="surface-header">
      <div class="header-left">
        <SurfaceIcon name="github" class="header-icon" :size="24" />
        <div>
          <h1>GitHub Bridge</h1>
          <p class="surface-tagline">Connect your GitHub repos. Keep code in sync between uDOS and GitHub.</p>
          <p class="surface-definition">
            <strong>What's a Bridge?</strong> A connection from uDOS to another service. This one talks to GitHub—where many developers store their code.
          </p>
        </div>
      </div>
      <div class="header-right">
        <button class="btn-secondary btn-sm" @click="reloadRepositories" v-if="isConnected">
          <SurfaceIcon name="refresh" :size="16" />
          Refresh
        </button>
        <button class="btn-primary btn-sm" @click="initiateOAuth" v-if="!isConnected">
          <SurfaceIcon name="github" :size="16" />
          Sign in with GitHub
        </button>
      </div>
    </div>

    <!-- Connection Status -->
    <div v-if="!isConnected" class="connection-panel">
      <div class="connection-icon">
        <SurfaceIcon name="lock" :size="48" />
      </div>
      <h3>Sign in to GitHub</h3>
      <p>To sync code, you'll need to sign in to GitHub first.</p>
      <button class="btn-primary" @click="initiateOAuth">
        <SurfaceIcon name="github" :size="16" />
        Sign in with GitHub
      </button>
      <p class="helper-text">
        <SurfaceIcon name="info" :size="14" />
        We'll never see your password. GitHub handles the security.
      </p>
    </div>

    <!-- Loading State -->
    <div v-else-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading your repositories…</p>
      <p class="helper-text">This usually takes a few seconds.</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">
        <SurfaceIcon name="alert-circle" :size="48" />
      </div>
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
        <button class="btn-primary" @click="retryConnection">
          <SurfaceIcon name="refresh" :size="16" />
          Try Again
        </button>
        <button class="btn-secondary" @click="signOut">
          <SurfaceIcon name="log-out" :size="16" />
          Sign Out
        </button>
      </div>
    </div>

    <!-- Empty State (Connected but no repos) -->
    <div v-else-if="repositories.length === 0" class="empty-state">
      <div class="empty-icon">
        <SurfaceIcon name="folder" :size="48" />
      </div>
      <h3>No repositories found</h3>
      <p>You're signed in, but we don't see any repositories.</p>
      <p class="helper-text">
        → Create a repo on GitHub first, then come back here.
        <br>
        → Or check that you have access to the right account.
      </p>
      <button class="btn-primary" @click="reloadRepositories">
        <SurfaceIcon name="refresh" :size="16" />
        Refresh
      </button>
    </div>

    <!-- Main Content: Repository List -->
    <div v-else class="repo-list">
      <div class="repo-controls">
        <div class="repo-search">
          <SurfaceIcon name="search" :size="16" class="search-icon" />
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search repositories…"
            @input="filterRepositories"
          >
          <button v-if="searchQuery" class="btn-icon btn-sm" @click="clearSearch">
            <SurfaceIcon name="x" :size="14" />
          </button>
        </div>
        <button class="btn-secondary" @click="reloadRepositories">
          <SurfaceIcon name="refresh" :size="16" />
          Refresh
        </button>
      </div>

      <div class="repo-grid">
        <div
          v-for="repo in filteredRepos"
          :key="repo.id"
          class="repo-card"
        >
          <div class="repo-header">
            <SurfaceIcon name="folder" :size="20" class="repo-icon" />
            <h3 class="repo-name">{{ repo.name }}</h3>
            <span class="repo-visibility">
              <SurfaceIcon :name="repo.private ? 'lock' : 'globe'" :size="16" />
            </span>
          </div>

          <div class="repo-meta">
            <span class="repo-branch">
              <SurfaceIcon name="git-branch" :size="14" />
              {{ repo.defaultBranch }}
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
              class="btn-primary"
              @click="openRepository(repo)"
              title="Open this repository in uDOS"
            >
              <SurfaceIcon name="folder-open" :size="14" />
              Open
            </button>
            <button
              class="btn-secondary"
              @click="viewOnGitHub(repo)"
              title="View on GitHub website"
            >
              <SurfaceIcon name="external-link" :size="14" />
              GitHub
            </button>
          </div>

          <div class="sync-status" v-if="repo.syncStatus">
            <span v-if="repo.syncStatus === 'synced'" class="status-synced">
              <SurfaceIcon name="check-circle" :size="14" />
              Synced
            </span>
            <span v-else-if="repo.syncStatus === 'syncing'" class="status-syncing">
              <SurfaceIcon name="refresh" :size="14" />
              Syncing…
            </span>
            <span v-else class="status-error">
              <SurfaceIcon name="alert-circle" :size="14" />
              Sync error
            </span>
          </div>
        </div>
      </div>

      <div class="repo-stats">
        <p>
          <SurfaceIcon name="database" :size="14" />
          {{ filteredRepos.length }} of {{ repositories.length }} repositories shown
        </p>
      </div>
    </div>

    <!-- Repository Detail Modal -->
    <div v-if="selectedRepo" class="modal-overlay" @click="closeRepoDetail">
      <div class="repo-detail-modal" @click.stop>
        <div class="modal-header">
          <div class="header-left">
            <SurfaceIcon name="folder" :size="20" />
            <h2>{{ selectedRepo.name }}</h2>
          </div>
          <button class="btn-icon btn-sm" @click="closeRepoDetail" title="Close">
            <SurfaceIcon name="x" :size="16" />
          </button>
        </div>

        <div class="repo-detail-content">
          <div class="repo-meta-detail">
            <div class="meta-item">
              <strong>Owner:</strong> {{ selectedRepo.owner }}
            </div>
            <div class="meta-item">
              <strong>Visibility:</strong>
              <span v-if="selectedRepo.private">
                <SurfaceIcon name="lock" :size="14" />
                Private
              </span>
              <span v-else>
                <SurfaceIcon name="globe" :size="14" />
                Public
              </span>
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
              <SurfaceIcon name="check-circle" :size="16" />
              All changes synced
              <p class="sync-time">
                Last synced {{ formatRelativeTime(selectedRepo.lastSynced) }}
              </p>
            </div>
            <div v-else-if="selectedRepo.syncStatus === 'syncing'" class="sync-status syncing">
              <SurfaceIcon name="refresh" :size="16" />
              Syncing changes…
            </div>
            <div v-else class="sync-status error">
              <SurfaceIcon name="alert-circle" :size="16" />
              Sync error
              <p class="error-message">
                {{ selectedRepo.syncError || 'Could not sync changes' }}
              </p>
              <button class="btn-secondary btn-sm" @click="retrySync">
                <SurfaceIcon name="refresh" :size="14" />
                Retry Sync
              </button>
            </div>

            <button class="btn-primary" @click="syncRepository(selectedRepo)">
              <SurfaceIcon name="refresh" :size="16" />
              Sync Now
            </button>
          </div>

          <div class="repo-actions-detail">
            <button class="btn-primary" @click="openInVault(selectedRepo)">
              <SurfaceIcon name="folder" :size="14" />
              Open in Vault
            </button>
            <button class="btn-secondary" @click="viewOnGitHub(selectedRepo)">
              <SurfaceIcon name="external-link" :size="14" />
              View on GitHub
            </button>
            <button class="btn-secondary" @click="disconnectRepository(selectedRepo)">
              <SurfaceIcon name="link-off" :size="14" />
              Disconnect
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- OAuth Callback Handler -->
    <div v-if="showOAuthCallback" class="modal-overlay">
      <div class="oauth-modal">
        <div class="spinner"></div>
        <h3>Connecting to GitHub…</h3>
        <p>Please wait while we set up your connection.</p>
        <p class="helper-text">
          <SurfaceIcon name="info" :size="14" />
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
import SurfaceIcon from '@/components/SurfaceIcons.vue'

export default {
  name: 'GitHubSurface',
  components: {
    SurfaceIcon
  },
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
      if (bytes < 1024 * 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
      return `${(bytes / (1024 * 1024 * 1024 * 1024)).toFixed(1)} TB`
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

<style>
/* CSS Custom Properties */
.github-surface {
  --background: #ffffff;
  --text-primary: #1a1a2e;
  --text-secondary: #6b6b6b;
  --text-tertiary: #b0b0b0;
  --border-color: #e9e9e7;
  --surface-background: #f7f6f3;
  --surface-hover: #e9e9e7;
  --primary-color: #2e7d64;
  --primary-hover: #236b54;
  --code-background: #1e1e1e;
  --info-background: #e3f2fd;
  --info-color: #1565c0;
  --success-background: #e8f5e9;
  --success-color: #2e7d64;
  --danger-background: #fce4e4;
  --danger-color: #eb5757;
  --danger-border: #eb5757;
  --warning-background: #fff3e0;
  --warning-color: #f57c00;
  --error-color: #eb5757;
}

.ucode3-dark .github-surface {
  --background: #1a1a2e;
  --text-primary: #e0e0e0;
  --text-secondary: #a0a0c0;
  --text-tertiary: #6b6b8a;
  --border-color: #2a2a4a;
  --surface-background: #16213e;
  --surface-hover: #2a2a4a;
  --primary-color: #2e7d64;
  --primary-hover: #236b54;
  --code-background: #1e1e1e;
  --info-background: #1a2a3e;
  --info-color: #7db0e0;
  --success-background: #1a3a2e;
  --success-color: #7dcea0;
  --danger-background: #3a1a1a;
  --danger-color: #eb5757;
  --danger-border: #eb5757;
  --warning-background: #3a2a1a;
  --warning-color: #f57c00;
  --error-color: #eb5757;
}
</style>

<style scoped>
.github-surface {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.surface-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 1.5rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-icon {
  color: var(--primary-color);
}

.surface-header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
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

.header-right {
  display: flex;
  gap: 0.5rem;
}

/* Connection Panel */
.connection-panel {
  text-align: center;
  padding: 2rem;
  background: var(--surface-background);
  border-radius: 8px;
  margin-bottom: 1rem;
}

.connection-icon {
  margin-bottom: 1rem;
}

/* Loading/Error/Empty States */
.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 4rem 2rem;
  text-align: center;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-icon,
.empty-icon {
  margin-bottom: 1.5rem;
}

.error-icon {
  color: var(--error-color);
}

.empty-icon {
  color: var(--text-tertiary);
}

.error-state h3,
.empty-state h3 {
  margin-bottom: 0.5rem;
}

.error-state p,
.empty-state p {
  margin-bottom: 1.5rem;
  color: var(--text-secondary);
}

.error-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 1rem;
}

/* Main Content */
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
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--background);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  max-width: 400px;
}

.search-icon {
  color: var(--text-tertiary);
}

.repo-search input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 0.875rem;
  color: var(--text-primary);
  outline: none;
}

.repo-search input::placeholder {
  color: var(--text-tertiary);
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
  cursor: pointer;
}

.repo-card:hover {
  background: var(--surface-hover);
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.repo-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.repo-icon {
  flex-shrink: 0;
}

.repo-name {
  margin: 0;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 1rem;
  font-weight: 600;
}

.repo-visibility {
  color: var(--text-secondary);
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

/* Buttons */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: var(--primary-hover);
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--surface-background);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: var(--surface-hover);
  border-color: var(--primary-color);
}

.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-secondary);
}

.btn-icon:hover {
  background: var(--surface-hover);
  border-color: var(--primary-color);
  color: var(--text-primary);
}

.btn-sm {
  padding: 0.25rem 0.75rem;
  font-size: 0.8125rem;
  height: auto;
}

.btn-icon.btn-sm {
  width: 1.75rem;
  height: 1.75rem;
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

/* Modal */
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

.repo-detail-modal,
.oauth-modal {
  background: var(--background);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.repo-detail-content {
  padding: 1.5rem;
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

.helper-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-tertiary);
  margin-top: 1rem;
}
</style>