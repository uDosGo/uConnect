<template>
  <div class="story-wizard">
    <!-- Surface Header -->
    <div class="surface-header">
      <div class="header-left">
        <SurfaceIcon name="book-open" class="header-icon" :size="24" />
        <div>
          <h1>Story Builder</h1>
          <p class="surface-tagline">Create interactive stories and narratives.</p>
          <p class="surface-definition">
            <strong>What's a Story?</strong> An interactive narrative experience that can be used for
            documentation, tutorials, or creative writing. Stories guide users through content with
            choices and branching paths.
          </p>
        </div>
      </div>
      <div class="header-right">
        <button class="btn-secondary btn-sm" @click="newStory">
          <SurfaceIcon name="plus" :size="16" />
          New Story
        </button>
        <button class="btn-primary btn-sm" @click="publishStory">
          <SurfaceIcon name="send" :size="16" />
          Publish
        </button>
      </div>
    </div>

    <!-- Info Banner -->
    <div class="info-banner">
      <SurfaceIcon name="info" :size="18" />
      <div>
        <strong>Story Format</strong>
        Create branching narratives with choices and paths.
        Perfect for interactive documentation and tutorials.
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading stories...</p>
      <p class="helper-text">This usually takes a few seconds.</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">
        <SurfaceIcon name="alert-circle" :size="48" />
      </div>
      <h3>Couldn't load stories</h3>
      <p>{{ error }}</p>
      <p class="helper-text">
        Try:
        <br>
        • Refreshing the page
        <br>
        • Checking your internet connection
        <br>
        • Making sure uDOS services are running
      </p>
      <div class="error-actions">
        <button @click="retryLoad" class="btn-primary">
          <SurfaceIcon name="refresh" :size="16" />
          Try Again
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="stories.length === 0" class="empty-state">
      <div class="empty-icon">
        <SurfaceIcon name="book-open" :size="48" />
      </div>
      <h3>No stories yet</h3>
      <p>Create your first interactive story!</p>
      <button class="btn-primary" @click="newStory">
        <SurfaceIcon name="plus" :size="16" />
        Create New Story
      </button>
      <p class="helper-text">
        <SurfaceIcon name="info" :size="14" />
        Stories can be used for documentation, tutorials, or creative writing
      </p>
    </div>

    <!-- Main Content -->
    <div v-else class="story-container">
      <div class="story-controls">
        <div class="story-search">
          <SurfaceIcon name="search" :size="16" class="search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search stories..."
            @input="filterStories"
            class="search-input"
          >
          <button v-if="searchQuery" class="btn-icon btn-sm" @click="clearSearch">
            <SurfaceIcon name="x" :size="14" />
          </button>
        </div>
        <button class="btn-secondary" @click="refreshStories">
          <SurfaceIcon name="refresh" :size="16" />
          Refresh
        </button>
        <button class="btn-primary" @click="newStory">
          <SurfaceIcon name="plus" :size="16" />
          New Story
        </button>
      </div>

      <div class="story-grid">
        <div
          v-for="story in filteredStories"
          :key="story.id"
          class="story-card"
          @click="openStory(story)"
        >
          <div class="story-header">
            <SurfaceIcon name="book-open" :size="20" class="story-icon" />
            <h3 class="story-name">{{ story.name }}</h3>
            <span class="story-type">{{ story.type }}</span>
          </div>

          <div class="story-meta">
            <span class="story-pages">{{ story.pages }} pages</span>
            <span class="story-updated">Updated {{ formatRelativeTime(story.updatedAt) }}</span>
          </div>

          <div class="story-description" v-if="story.description">
            {{ story.description }}
          </div>

          <div class="story-actions">
            <button
              class="btn-icon btn-sm"
              @click.stop="editStory(story)"
              title="Edit story"
            >
              <SurfaceIcon name="edit" :size="14" />
            </button>
            <button
              class="btn-icon btn-sm"
              @click.stop="previewStory(story)"
              title="Preview story"
            >
              <SurfaceIcon name="eye" :size="14" />
            </button>
            <button
              class="btn-icon btn-sm"
              @click.stop="deleteStory(story)"
              title="Delete story"
            >
              <SurfaceIcon name="trash" :size="14" />
            </button>
          </div>
        </div>
      </div>

      <!-- Story Statistics -->
      <div class="story-stats">
        <span>{{ filteredStories.length }} stories</span>
        <span>{{ totalPages }} pages</span>
        <span>{{ publishedStories }} published</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { formatDistanceToNow } from 'date-fns'
import SurfaceIcon from '@/components/SurfaceIcons.vue'

export default {
  name: 'StoryWizard',
  components: {
    SurfaceIcon
  },
  setup() {
    // State
    const isLoading = ref(false)
    const error = ref(null)
    const stories = ref([])
    const searchQuery = ref('')

    // Computed
    const totalPages = computed(() => stories.value.reduce((sum, story) => sum + story.pages, 0))
    const publishedStories = computed(() => stories.value.filter(s => s.published).length)

    const filteredStories = computed(() => {
      if (!searchQuery.value) return stories.value

      const query = searchQuery.value.toLowerCase()
      return stories.value.filter(story =>
        story.name.toLowerCase().includes(query) ||
        (story.description && story.description.toLowerCase().includes(query))
      )
    })

    // Methods
    const loadStories = async () => {
      isLoading.value = true
      error.value = null
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500))

        // Mock data
        stories.value = [
          {
            id: 1,
            name: 'Getting Started Guide',
            description: 'Interactive tutorial for new users',
            type: 'tutorial',
            pages: 8,
            published: true,
            updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
          },
          {
            id: 2,
            name: 'API Documentation',
            description: 'Interactive API reference with examples',
            type: 'documentation',
            pages: 15,
            published: true,
            updatedAt: new Date(Date.now() - 86400000 * 1).toISOString()
          },
          {
            id: 3,
            name: 'Product Demo',
            description: 'Interactive product demonstration',
            type: 'demo',
            pages: 5,
            published: false,
            updatedAt: new Date(Date.now() - 86400000 * 5).toISOString()
          },
          {
            id: 4,
            name: 'User Manual',
            description: 'Comprehensive user guide with branching paths',
            type: 'manual',
            pages: 22,
            published: true,
            updatedAt: new Date(Date.now() - 86400000 * 3).toISOString()
          }
        ]
      } catch (err) {
        error.value = err.message || 'Failed to load stories'
      } finally {
        isLoading.value = false
      }
    }

    const newStory = () => {
      alert('Creating new story...')
    }

    const openStory = (story) => {
      alert(`Opening story: ${story.name}`)
    }

    const editStory = (story) => {
      alert(`Editing story: ${story.name}`)
    }

    const previewStory = (story) => {
      alert(`Previewing story: ${story.name}`)
    }

    const deleteStory = (story) => {
      if (confirm(`Delete "${story.name}"?`)) {
        stories.value = stories.value.filter(s => s.id !== story.id)
        alert('Story deleted')
      }
    }

    const publishStory = () => {
      alert('Publishing story feature coming soon!')
    }

    const refreshStories = () => {
      loadStories()
    }

    const retryLoad = () => {
      error.value = null
      loadStories()
    }

    const clearSearch = () => {
      searchQuery.value = ''
    }

    const filterStories = () => {
      // Handled by computed property
    }

    const formatRelativeTime = (dateString) => {
      const date = new Date(dateString)
      return formatDistanceToNow(date, { addSuffix: true })
    }

    // Load on mount
    onMounted(() => {
      loadStories()
    })

    return {
      isLoading,
      error,
      stories,
      searchQuery,
      filteredStories,
      totalPages,
      publishedStories,
      loadStories,
      newStory,
      openStory,
      editStory,
      previewStory,
      deleteStory,
      publishStory,
      refreshStories,
      retryLoad,
      clearSearch,
      filterStories,
      formatRelativeTime
    }
  }
}
</script>

<style>
/* CSS Custom Properties */
.story-wizard {
  --background: #ffffff;
  --text-primary: #1a1a2e;
  --text-secondary: #6b6b6b;
  --text-tertiary: #b0b0b0;
  --border-color: #e9e9e7;
  --surface-background: #f7f6f3;
  --surface-hover: #e9e9e7;
  --primary-color: #2e7d64;
  --primary-hover: #236b54;
  --danger-color: #eb5757;
  --success-color: #2e7d64;
  --warning-color: #f57c00;
  --info-color: #1565c0;
}

.ucode3-dark .story-wizard {
  --background: #1a1a2e;
  --text-primary: #e0e0e0;
  --text-secondary: #a0a0c0;
  --text-tertiary: #6b6b8a;
  --border-color: #2a2a4a;
  --surface-background: #16213e;
  --surface-hover: #2a2a4a;
  --primary-color: #2e7d64;
  --primary-hover: #236b54;
  --danger-color: #eb5757;
  --success-color: #7dcea0;
  --warning-color: #f57c00;
  --info-color: #7db0e0;
}
</style>

<style scoped>
.story-wizard {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--background);
  color: var(--text-primary);
}

/* Header */
.surface-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
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

/* Info Banner */
.info-banner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--info-background);
  border-radius: 8px;
  margin: 1rem;
  color: var(--info-color);
}

/* Story Controls */
.story-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--surface-background);
}

.story-search {
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

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 0.875rem;
  color: var(--text-primary);
  outline: none;
}

.search-input::placeholder {
  color: var(--text-tertiary);
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

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 4rem 2rem;
  color: var(--text-secondary);
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

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 4rem 2rem;
  text-align: center;
}

.error-icon {
  margin-bottom: 1.5rem;
  color: var(--danger-color);
}

.error-state h3 {
  margin-bottom: 0.5rem;
}

.error-state p {
  margin-bottom: 1.5rem;
}

.error-actions {
  display: flex;
  gap: 0.5rem;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-icon {
  margin-bottom: 1.5rem;
  color: var(--text-tertiary);
}

.empty-state h3 {
  margin-bottom: 0.5rem;
}

.empty-state p {
  margin-bottom: 1.5rem;
}

/* Story Container */
.story-container {
  flex: 1;
  overflow-y: auto;
}

/* Story Grid */
.story-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.story-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--surface-background);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.story-card:hover {
  background: var(--surface-hover);
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.story-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.story-icon {
  color: var(--primary-color);
}

.story-name {
  flex: 1;
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
}

.story-type {
  padding: 0.25rem 0.75rem;
  background: var(--surface-hover);
  border-radius: 12px;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.story-meta {
  display: flex;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.story-pages {
  font-weight: 500;
}

.story-updated {
  margin-left: auto;
}

.story-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.story-actions {
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.story-card:hover .story-actions {
  opacity: 1;
}

/* Story Statistics */
.story-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  padding: 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  border-top: 1px solid var(--border-color);
}
</style>