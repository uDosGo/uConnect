<template>
  <div class="wordpress-surface">
    <!-- Surface Header with Definition -->
    <div class="surface-header">
      <h1><span class="surface-icon">🌐</span> WordPress Adaptor</h1>
      <p class="surface-tagline">Publish content from uDOS to WordPress. Edit here, update there.</p>
      <p class="surface-definition">
        <strong>What's an Adaptor?</strong> A connection that lets uDOS talk to WordPress.
        Create and edit posts in uDOS, then publish them to your WordPress site.
      </p>
    </div>
    
    <!-- Connection Status -->
    <div v-if="!isConnected" class="connection-panel">
      <div class="connection-icon">🔐</div>
      <h3>Connect to WordPress</h3>
      <p>Enter your WordPress site details to start publishing.</p>
      
      <div class="connection-form">
        <div class="form-group">
          <label for="site-url">Site URL</label>
          <input 
            id="site-url" 
            v-model="siteUrl" 
            type="url" 
            placeholder="https://your-site.com"
            required
          >
        </div>
        
        <div class="form-group">
          <label for="username">Username</label>
          <input 
            id="username" 
            v-model="username" 
            type="text" 
            placeholder="Your WordPress username"
            required
          >
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input 
            id="password" 
            v-model="password" 
            type="password" 
            placeholder="Application password (recommended)"
            required
          >
          <p class="helper-text">
            💡 Use an <a href="#" @click.prevent="toggleAppPasswordHelp">Application Password</a> for better security
          </p>
        </div>
        
        <button @click="connectToWordPress" class="primary" :disabled="!isFormValid">
          🔗 Connect to WordPress
        </button>
      </div>
    </div>
    
    <!-- Loading State -->
    <div v-else-if="isLoading" class="loading-state">
      <span class="spinner">⏳</span>
      <p>Connecting to WordPress…</p>
      <p class="helper-text">This usually takes a few seconds.</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <span class="error-icon">⚠️</span>
      <h3>Couldn't connect to WordPress</h3>
      <p>{{ error.message }}</p>
      <p class="helper-text">
        Try:
        <br>
        • Checking your site URL and credentials
        <br>
        • Making sure your WordPress site is accessible
        <br>
        • Using an Application Password instead of your main password
      </p>
      <div class="error-actions">
        <button @click="retryConnection" class="primary">
          🔄 Try Again
        </button>
        <button @click="disconnect" class="secondary">
          🔗 Disconnect
        </button>
      </div>
    </div>
    
    <!-- Connected State -->
    <div v-else class="connected-state">
      <!-- Site Info -->
      <div class="site-info">
        <div class="site-icon">🌐</div>
        <div class="site-details">
          <h3>{{ siteInfo.name }}</h3>
          <p class="site-url">{{ siteInfo.url }}</p>
          <p class="connection-status">
            ✅ Connected
            <button @click="disconnect" class="disconnect-button">
              🔗 Disconnect
            </button>
          </p>
        </div>
      </div>
      
      <!-- Content Tabs -->
      <div class="content-tabs">
        <button 
          @click="activeTab = 'posts'" 
          :class="['tab-button', { active: activeTab === 'posts' }]"
        >
          📝 Posts
        </button>
        <button 
          @click="activeTab = 'pages'" 
          :class="['tab-button', { active: activeTab === 'pages' }]"
        >
          📄 Pages
        </button>
        <button 
          @click="activeTab = 'media'" 
          :class="['tab-button', { active: activeTab === 'media' }]"
        >
          🖼️ Media
        </button>
        <button 
          @click="activeTab = 'settings'" 
          :class="['tab-button', { active: activeTab === 'settings' }]"
        >
          ⚙️ Settings
        </button>
      </div>
      
      <!-- Posts Tab -->
      <div v-if="activeTab === 'posts'" class="tab-content">
        <div class="content-header">
          <h2>Posts</h2>
          <button @click="createNewPost" class="primary">
            ➕ New Post
          </button>
        </div>
        
        <div v-if="isContentLoading" class="loading-state">
          <span class="spinner">⏳</span>
          <p>Loading posts…</p>
        </div>
        
        <div v-else-if="contentError" class="error-state">
          <span class="error-icon">⚠️</span>
          <p>{{ contentError }}</p>
          <button @click="loadPosts" class="secondary">
            🔄 Retry
          </button>
        </div>
        
        <div v-else-if="posts.length === 0" class="empty-state">
          <span class="empty-icon">📭</span>
          <p>No posts found</p>
          <button @click="createNewPost" class="primary">
            ➕ Create Your First Post
          </button>
        </div>
        
        <div v-else class="post-list">
          <div v-for="post in posts" :key="post.id" class="post-card">
            <div class="post-header">
              <h3>{{ post.title || 'Untitled Post' }}</h3>
              <span class="post-status" :class="post.status">
                {{ post.status }}
              </span>
            </div>
            
            <div class="post-meta">
              <span class="post-date">
                {{ formatRelativeTime(post.date) }}
              </span>
              <span class="post-author">
                by {{ post.author }}
              </span>
              <span v-if="post.categories.length" class="post-categories">
                in {{ post.categories.join(', ') }}
              </span>
            </div>
            
            <div class="post-actions">
              <button @click="editPost(post)" class="secondary small">
                ✏️ Edit
              </button>
              <button @click="viewPost(post)" class="secondary small">
                👁️ View
              </button>
              <button @click="publishPost(post)" class="primary small" v-if="post.status !== 'publish'">
                🚀 Publish
              </button>
              <button @click="updatePost(post)" class="primary small" v-else>
                🔄 Update
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Pages Tab -->
      <div v-if="activeTab === 'pages'" class="tab-content">
        <div class="content-header">
          <h2>Pages</h2>
          <button @click="createNewPage" class="primary">
            ➕ New Page
          </button>
        </div>
        
        <div class="page-list">
          <div v-for="page in pages" :key="page.id" class="page-card">
            <h3>{{ page.title || 'Untitled Page' }}</h3>
            <p class="page-url">{{ page.url }}</p>
            <div class="page-actions">
              <button @click="editPage(page)" class="secondary small">
                ✏️ Edit
              </button>
              <button @click="viewPage(page)" class="secondary small">
                👁️ View
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Media Tab -->
      <div v-if="activeTab === 'media'" class="tab-content">
        <div class="content-header">
          <h2>Media Library</h2>
          <button @click="uploadMedia" class="primary">
            📤 Upload Media
          </button>
        </div>
        
        <div class="media-grid">
          <div v-for="media in mediaItems" :key="media.id" class="media-item">
            <div class="media-preview">
              <img v-if="media.type === 'image'" :src="media.url" alt="Media preview">
              <div v-else class="media-icon">
                {{ getMediaIcon(media) }}
              </div>
            </div>
            <p class="media-name">{{ media.name }}</p>
            <div class="media-actions">
              <button @click="copyMediaUrl(media)" class="secondary tiny">
                🔗 Copy URL
              </button>
              <button @click="deleteMedia(media)" class="danger tiny">
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Settings Tab -->
      <div v-if="activeTab === 'settings'" class="tab-content">
        <div class="settings-section">
          <h2>Sync Settings</h2>
          <div class="setting-item">
            <label>
              <input type="checkbox" v-model="autoSync">
              Auto-sync changes to WordPress
            </label>
            <p class="setting-description">
              When enabled, changes made in uDOS will automatically sync to WordPress
            </p>
          </div>
          
          <div class="setting-item">
            <label>
              <input type="checkbox" v-model="syncMedia">
              Sync media files
            </label>
            <p class="setting-description">
              Upload media files from uDOS to WordPress media library
            </p>
          </div>
          
          <button @click="saveSettings" class="primary">
            💾 Save Settings
          </button>
        </div>
        
        <div class="settings-section">
          <h2>Connection</h2>
          <div class="connection-info">
            <p><strong>Site URL:</strong> {{ siteInfo.url }}</p>
            <p><strong>Connected as:</strong> {{ siteInfo.username }}</p>
            <p><strong>Connection status:</strong> 
              <span class="status-indicator connected">✅ Active</span>
            </p>
          </div>
          
          <button @click="testConnection" class="secondary">
            🔄 Test Connection
          </button>
          <button @click="disconnect" class="danger">
            🔗 Disconnect Site
          </button>
        </div>
      </div>
    </div>
    
    <!-- Application Password Help Modal -->
    <div v-if="showAppPasswordHelp" class="modal-overlay">
      <div class="help-modal">
        <h3>🔐 Application Passwords</h3>
        <p>Application Passwords are safer than using your main WordPress password.</p>
        
        <div class="help-steps">
          <h4>How to create one:</h4>
          <ol>
            <li>Go to your WordPress dashboard</li>
            <li>Navigate to Users → Your Profile</li>
            <li>Scroll down to "Application Passwords"</li>
            <li>Enter a name (e.g., "uDOS Connect")</li>
            <li>Click "Add New Application Password"</li>
            <li>Copy the generated password and use it here</li>
          </ol>
        </div>
        
        <button @click="showAppPasswordHelp = false" class="primary">
          Got it!
        </button>
      </div>
    </div>
    
    <!-- Media Upload Modal -->
    <div v-if="showMediaUpload" class="modal-overlay">
      <div class="upload-modal">
        <h3>📤 Upload Media</h3>
        <p>Add images, videos, or documents to your WordPress media library.</p>
        
        <div class="upload-area" @click="triggerMediaInput" @dragover.prevent @drop.prevent="handleMediaDrop">
          <span class="upload-icon">🖼️</span>
          <p>Drag media files here or click to browse</p>
          <p class="helper-text">
            Supported: Images, videos, PDFs, documents
          </p>
          <input 
            type="file" 
            ref="mediaInput" 
            multiple 
            accept="image/*,video/*,.pdf,.doc,.docx"
            @change="handleMediaSelect"
            style="display: none"
          >
        </div>
        
        <div class="modal-actions">
          <button @click="showMediaUpload = false" class="secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useWordPressStore } from '@/stores/wordpress'
import { formatDistanceToNow } from 'date-fns'

export default {
  name: 'WordPressSurface',
  setup() {
    const wordpressStore = useWordPressStore()
    
    // State
    const isLoading = ref(false)
    const error = ref(null)
    const isConnected = ref(false)
    const activeTab = ref('posts')
    const showAppPasswordHelp = ref(false)
    const showMediaUpload = ref(false)
    const isContentLoading = ref(false)
    const contentError = ref(null)
    
    // Connection form
    const siteUrl = ref('')
    const username = ref('')
    const password = ref('')
    
    // Settings
    const autoSync = ref(true)
    const syncMedia = ref(true)
    
    // Computed properties
    const isFormValid = computed(() => {
      return siteUrl.value && username.value && password.value
    })
    
    const siteInfo = computed(() => wordpressStore.siteInfo)
    const posts = computed(() => wordpressStore.posts)
    const pages = computed(() => wordpressStore.pages)
    const mediaItems = computed(() => wordpressStore.media)
    
    // Methods
    const formatRelativeTime = (dateString) => {
      if (!dateString) return 'Unknown'
      const date = new Date(dateString)
      return formatDistanceToNow(date, { addSuffix: true })
    }
    
    const connectToWordPress = async () => {
      if (!isFormValid.value) return
      
      isLoading.value = true
      error.value = null
      
      try {
        await wordpressStore.connect({
          url: siteUrl.value,
          username: username.value,
          password: password.value
        })
        isConnected.value = true
        await loadPosts()
      } catch (err) {
        error.value = { message: err.message || 'Connection failed. Please check your credentials.' }
      } finally {
        isLoading.value = false
      }
    }
    
    const disconnect = async () => {
      isLoading.value = true
      try {
        await wordpressStore.disconnect()
        isConnected.value = false
        siteUrl.value = ''
        username.value = ''
        password.value = ''
      } catch (err) {
        error.value = { message: 'Could not disconnect. Please refresh the page.' }
      } finally {
        isLoading.value = false
      }
    }
    
    const retryConnection = () => {
      error.value = null
      if (isConnected.value) {
        loadPosts()
      }
    }
    
    const loadPosts = async () => {
      isContentLoading.value = true
      contentError.value = null
      try {
        await wordpressStore.loadPosts()
      } catch (err) {
        contentError.value = err.message || 'Could not load posts'
      } finally {
        isContentLoading.value = false
      }
    }
    
    const createNewPost = () => {
      // Navigate to post editor
      alert('Would navigate to post editor')
    }
    
    const editPost = (post) => {
      alert(`Would edit post: ${post.title}`)
    }
    
    const viewPost = (post) => {
      window.open(post.link, '_blank')
    }
    
    const publishPost = (post) => {
      alert(`Would publish post: ${post.title}`)
    }
    
    const updatePost = (post) => {
      alert(`Would update post: ${post.title}`)
    }
    
    const createNewPage = () => {
      alert('Would navigate to page editor')
    }
    
    const editPage = (page) => {
      alert(`Would edit page: ${page.title}`)
    }
    
    const viewPage = (page) => {
      window.open(page.link, '_blank')
    }
    
    const uploadMedia = () => {
      showMediaUpload.value = true
    }
    
    const triggerMediaInput = () => {
      // Would trigger file input
    }
    
    const handleMediaDrop = (event) => {
      // Would handle file drop
    }
    
    const handleMediaSelect = (event) => {
      // Would handle file select
    }
    
    const copyMediaUrl = (media) => {
      navigator.clipboard.writeText(media.url)
      alert('URL copied to clipboard')
    }
    
    const deleteMedia = (media) => {
      if (confirm(`Delete ${media.name}? This cannot be undone.`)) {
        alert(`Would delete media: ${media.name}`)
      }
    }
    
    const getMediaIcon = (media) => {
      if (media.type === 'image') return '🖼️'
      if (media.type === 'video') return '🎥'
      if (media.type === 'pdf') return '📕'
      return '📄'
    }
    
    const saveSettings = () => {
      alert('Would save settings')
    }
    
    const testConnection = async () => {
      isLoading.value = true
      try {
        await wordpressStore.testConnection()
        alert('Connection test successful!')
      } catch (err) {
        error.value = { message: 'Connection test failed: ' + err.message }
      } finally {
        isLoading.value = false
      }
    }
    
    const toggleAppPasswordHelp = () => {
      showAppPasswordHelp.value = true
    }
    
    // Load initial data
    const loadInitialData = async () => {
      try {
        isLoading.value = true
        const status = await wordpressStore.checkConnection()
        isConnected.value = status.connected
        if (isConnected.value) {
          await loadPosts()
        }
      } catch (err) {
        // Not connected is fine
        isConnected.value = false
      } finally {
        isLoading.value = false
      }
    }
    
    loadInitialData()
    
    return {
      isLoading,
      error,
      isConnected,
      activeTab,
      showAppPasswordHelp,
      showMediaUpload,
      isContentLoading,
      contentError,
      siteUrl,
      username,
      password,
      isFormValid,
      siteInfo,
      posts,
      pages,
      mediaItems,
      formatRelativeTime,
      connectToWordPress,
      disconnect,
      retryConnection,
      loadPosts,
      createNewPost,
      editPost,
      viewPost,
      publishPost,
      updatePost,
      createNewPage,
      editPage,
      viewPage,
      uploadMedia,
      triggerMediaInput,
      handleMediaDrop,
      handleMediaSelect,
      copyMediaUrl,
      deleteMedia,
      getMediaIcon,
      saveSettings,
      testConnection,
      toggleAppPasswordHelp
    }
  }
}
</script>

<style scoped>
.wordpress-surface {
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

.connection-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 400px;
  margin: 0 auto;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: left;
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 1rem;
}

.helper-text {
  color: var(--text-tertiary);
  font-size: 0.85rem;
  margin-top: 0.25rem;
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

.connected-state {
  margin-top: 1rem;
}

.site-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--surface-background);
  border-radius: 8px;
  margin-bottom: 1rem;
}

.site-icon {
  font-size: 2rem;
}

.site-details h3 {
  margin: 0;
}

.site-url {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.disconnect-button {
  background: none;
  border: 1px solid var(--border-color);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
}

.content-tabs {
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

.post-list, .page-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.post-card, .page-card {
  padding: 1rem;
  background: var(--surface-background);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.post-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.post-status {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.post-status.publish {
  background: var(--success-background);
  color: var(--success-color);
}

.post-status.draft {
  background: var(--info-background);
  color: var(--info-color);
}

.post-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: var(--text-tertiary);
  margin-bottom: 0.75rem;
}

.post-actions {
  display: flex;
  gap: 0.5rem;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.media-item {
  background: var(--surface-background);
  border-radius: 8px;
  padding: 0.75rem;
  text-align: center;
}

.media-preview {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
  background: var(--background);
  border-radius: 4px;
}

.media-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.media-icon {
  font-size: 2rem;
}

.media-name {
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.5rem;
}

.media-actions {
  display: flex;
  gap: 0.25rem;
  justify-content: center;
}

.settings-section {
  margin-bottom: 2rem;
}

.settings-section h2 {
  font-size: 1.1rem;
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

.connection-info {
  background: var(--surface-background);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.status-indicator {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.status-indicator.connected {
  background: var(--success-background);
  color: var(--success-color);
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

.help-modal, .upload-modal {
  background: var(--background);
  border-radius: 8px;
  padding: 1.5rem;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.upload-area {
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  margin: 1rem 0;
}

.upload-area:hover {
  border-color: var(--primary-color);
  background: var(--surface-hover);
}

.upload-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.modal-actions {
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

button.tiny {
  padding: 0.15rem 0.3rem;
  font-size: 0.75rem;
}
</style>