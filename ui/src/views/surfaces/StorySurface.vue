<template>
  <div class="story-surface">
    <!-- Surface Header with Definition -->
    <div class="surface-header">
      <h1><span class="surface-icon">📖</span> Story Surface</h1>
      <p class="surface-tagline">Create step-by-step guides. Perfect for onboarding or surveys.</p>
      <p class="surface-definition">
        <strong>What's a Story?</strong> A guided walkthrough that helps users complete tasks step by step.
        Create interactive guides, tutorials, or surveys.
      </p>
    </div>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <span class="spinner">⏳</span>
      <p>Loading stories…</p>
      <p class="helper-text">This usually takes a few seconds.</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <span class="error-icon">⚠️</span>
      <h3>Couldn't load stories</h3>
      <p>{{ error.message }}</p>
      <p class="helper-text">
        Try:
        <br>
        • Refreshing the page
        <br>
        • Checking your internet connection
        <br>
        • Making sure the story service is available
      </p>
      <button @click="reloadStories" class="primary">
        🔄 Try Again
      </button>
    </div>
    
    <!-- Main Content -->
    <div v-else class="main-content">
      <!-- Stories List -->
      <div class="stories-list">
        <div class="list-header">
          <h2>Your Stories</h2>
          <div class="list-actions">
            <button @click="createNewStory" class="primary">
              ➕ New Story
            </button>
            <button @click="showTemplates" class="secondary">
              📚 Templates
            </button>
          </div>
        </div>
        
        <!-- Search Bar -->
        <div class="search-bar">
          <span class="search-icon">🔍</span>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search stories…" 
            @input="searchStories"
          >
          <button v-if="searchQuery" @click="clearSearch" class="clear-search">
            ✕
          </button>
        </div>
        
        <!-- Empty State -->
        <div v-if="filteredStories.length === 0" class="empty-state">
          <span class="empty-icon">📭</span>
          <h3>No stories found</h3>
          <p>Create your first guided walkthrough</p>
          <button @click="createNewStory" class="primary">
            ➕ New Story
          </button>
          <p class="helper-text">
            💡 Stories can guide users through complex tasks step by step
          </p>
        </div>
        
        <!-- Stories Grid -->
        <div v-else class="stories-grid">
          <div 
            v-for="story in filteredStories" 
            :key="story.id" 
            class="story-card"
          >
            <div class="story-header">
              <h3>{{ story.title }}</h3>
              <span class="story-status" :class="getStatusClass(story.status)">
                {{ story.status }}
              </span>
            </div>
            
            <p class="story-description">{{ story.description || 'No description' }}</p>
            
            <div class="story-meta">
              <span class="story-steps">
                📍 {{ story.steps.length }} steps
              </span>
              <span class="story-views">
                👁️ {{ story.views }} views
              </span>
              <span class="story-completions">
                ✅ {{ story.completions }} completions
              </span>
            </div>
            
            <div class="story-actions">
              <button @click="editStory(story)" class="secondary small">
                ✏️ Edit
              </button>
              <button @click="previewStory(story)" class="secondary small">
                👁️ Preview
              </button>
              <button @click="publishStory(story)" class="primary small" v-if="story.status !== 'published'">
                🚀 Publish
              </button>
              <button @click="unpublishStory(story)" class="danger small" v-else>
                🔒 Unpublish
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Story Statistics -->
      <div class="story-stats">
        <p>
          📊 {{ stories.length }} stories • 
          {{ publishedStories }} published • 
          {{ totalViews }} total views
        </p>
      </div>
    </div>
    
    <!-- New Story Modal -->
    <div v-if="showNewStoryModal" class="modal-overlay">
      <div class="new-story-modal">
        <h3>📝 Create New Story</h3>
        
        <div class="form-group">
          <label for="story-title">Story Title</label>
          <input 
            id="story-title" 
            v-model="newStoryTitle" 
            type="text" 
            placeholder="My Guided Walkthrough"
          >
        </div>
        
        <div class="form-group">
          <label for="story-description">Description</label>
          <textarea 
            id="story-description" 
            v-model="newStoryDescription" 
            placeholder="What does this story guide users through?"
            rows="3"
          ></textarea>
        </div>
        
        <div class="form-group">
          <label for="story-type">Story Type</label>
          <select id="story-type" v-model="newStoryType">
            <option value="guide">User Guide</option>
            <option value="onboarding">Onboarding</option>
            <option value="survey">Survey</option>
            <option value="tutorial">Tutorial</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        
        <div class="modal-actions">
          <button @click="createStory" class="primary">
            ✅ Create Story
          </button>
          <button @click="showNewStoryModal = false" class="secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
    
    <!-- Story Editor Modal -->
    <div v-if="editingStory" class="modal-overlay">
      <div class="story-editor">
        <div class="editor-header">
          <h2>Editing: {{ editingStory.title }}</h2>
          <div class="editor-actions">
            <button @click="saveStory" class="primary small">
              💾 Save
            </button>
            <button @click="closeEditor" class="secondary small">
              ✕ Close
            </button>
          </div>
        </div>
        
        <div class="editor-content">
          <div class="story-info">
            <div class="form-group">
              <label>Title</label>
              <input v-model="editingStory.title" type="text">
            </div>
            
            <div class="form-group">
              <label>Description</label>
              <textarea v-model="editingStory.description" rows="2"></textarea>
            </div>
            
            <div class="form-group">
              <label>Type</label>
              <select v-model="editingStory.type">
                <option value="guide">User Guide</option>
                <option value="onboarding">Onboarding</option>
                <option value="survey">Survey</option>
                <option value="tutorial">Tutorial</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Status</label>
              <select v-model="editingStory.status">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
          
          <div class="steps-editor">
            <h3>Steps</h3>
            <div class="step-list">
              <div v-for="(step, index) in editingStory.steps" :key="index" class="step-item">
                <div class="step-header">
                  <span class="step-number">{{ index + 1 }}</span>
                  <span class="step-name">{{ step.title }}</span>
                  <div class="step-actions">
                    <button @click="editStep(index)" class="action-icon">
                      ✏️
                    </button>
                    <button @click="moveStepUp(index)" class="action-icon" :disabled="index === 0">
                      ↑
                    </button>
                    <button @click="moveStepDown(index)" class="action-icon" :disabled="index === editingStory.steps.length - 1">
                      ↓
                    </button>
                    <button @click="removeStep(index)" class="action-icon danger">
                      ✕
                    </button>
                  </div>
                </div>
                <p class="step-description">{{ step.content }}</p>
                <div v-if="step.options.length > 0" class="step-options">
                  <span v-for="option in step.options" :key="option.id" class="option-badge">
                    {{ option.text }}
                  </span>
                </div>
              </div>
            </div>
            
            <button @click="addStep" class="secondary">
              ➕ Add Step
            </button>
          </div>
        </div>
        
        <div class="editor-footer">
          <button @click="previewStory(editingStory)" class="secondary">
            👁️ Preview Story
          </button>
        </div>
      </div>
    </div>
    
    <!-- Step Editor Modal -->
    <div v-if="editingStep !== null" class="modal-overlay">
      <div class="step-editor-modal">
        <h3>{{ editingStepIndex !== null ? 'Edit' : 'Add' }} Step</h3>
        
        <div class="form-group">
          <label for="step-title">Step Title</label>
          <input id="step-title" v-model="editingStep.title" type="text">
        </div>
        
        <div class="form-group">
          <label for="step-content">Content</label>
          <textarea 
            id="step-content" 
            v-model="editingStep.content" 
            placeholder="What should happen in this step?"
            rows="5"
          ></textarea>
        </div>
        
        <div class="form-group">
          <label>Step Type</label>
          <select v-model="editingStep.type">
            <option value="information">Information</option>
            <option value="question">Question</option>
            <option value="action">Action Required</option>
            <option value="decision">Decision Point</option>
          </select>
        </div>
        
        <div v-if="editingStep.type === 'question' || editingStep.type === 'decision'" class="options-editor">
          <h4>Options</h4>
          <div v-for="(option, optIndex) in editingStep.options" :key="optIndex" class="option-item">
            <input v-model="option.text" type="text" placeholder="Option text">
            <input v-model="option.value" type="text" placeholder="Option value">
            <button @click="removeOption(optIndex)" class="danger small">
              ✕ Remove
            </button>
          </div>
          <button @click="addOption" class="secondary small">
            ➕ Add Option
          </button>
        </div>
        
        <div class="modal-actions">
          <button @click="saveStep" class="primary">
            💾 Save Step
          </button>
          <button @click="cancelStep" class="secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
    
    <!-- Story Preview Modal -->
    <div v-if="previewingStory" class="modal-overlay">
      <div class="story-preview">
        <div class="preview-header">
          <h2>{{ previewingStory.title }}</h2>
          <button @click="closePreview" class="secondary small">
            ✕ Close
          </button>
        </div>
        
        <div class="preview-content">
          <div class="story-progress">
            <div 
              class="progress-bar" 
              :style="{ width: currentStepProgress + '%' }"
            ></div>
            <span class="progress-text">
              Step {{ currentStep + 1 }} of {{ previewingStory.steps.length }}
            </span>
          </div>
          
          <div class="current-step">
            <h3>{{ currentStepData.title }}</h3>
            <div class="step-content" v-html="currentStepData.content"></div>
            
            <div v-if="currentStepData.options.length > 0" class="step-options">
              <button 
                v-for="option in currentStepData.options" 
                :key="option.id" 
                @click="handleOptionSelect(option)" 
                class="option-button"
              >
                {{ option.text }}
              </button>
            </div>
            
            <div class="step-navigation">
              <button @click="previousStep" class="secondary" :disabled="currentStep === 0">
                ← Previous
              </button>
              <button @click="nextStep" class="primary" :disabled="currentStep === previewingStory.steps.length - 1">
                {{ currentStep === previewingStory.steps.length - 1 ? 'Finish' : 'Next →' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Story Templates Modal -->
    <div v-if="showTemplatesModal" class="modal-overlay">
      <div class="templates-modal">
        <h3>📚 Story Templates</h3>
        <p>Start with a pre-built story template</p>
        
        <div class="template-grid">
          <div v-for="template in storyTemplates" :key="template.id" class="template-card">
            <h4>{{ template.name }}</h4>
            <p>{{ template.description }}</p>
            <button @click="useTemplate(template)" class="secondary small">
              Use Template
            </button>
          </div>
        </div>
        
        <div class="modal-actions">
          <button @click="showTemplatesModal = false" class="secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useStoryStore } from '@/stores/story'

export default {
  name: 'StorySurface',
  setup() {
    const storyStore = useStoryStore()
    
    // State
    const isLoading = ref(false)
    const error = ref(null)
    const searchQuery = ref('')
    const showNewStoryModal = ref(false)
    const showTemplatesModal = ref(false)
    const editingStory = ref(null)
    const editingStep = ref(null)
    const editingStepIndex = ref(null)
    const previewingStory = ref(null)
    const currentStep = ref(0)
    
    // New story form
    const newStoryTitle = ref('')
    const newStoryDescription = ref('')
    const newStoryType = ref('guide')
    
    // Computed properties
    const stories = computed(() => storyStore.stories)
    const publishedStories = computed(() => {
      return stories.value.filter(s => s.status === 'published').length
    })
    const totalViews = computed(() => {
      return stories.value.reduce((sum, s) => sum + s.views, 0)
    })
    
    const filteredStories = computed(() => {
      if (!searchQuery.value) return stories.value
      
      const query = searchQuery.value.toLowerCase()
      return stories.value.filter(story => 
        story.title.toLowerCase().includes(query) ||
        story.description.toLowerCase().includes(query)
      )
    })
    
    const currentStepData = computed(() => {
      return previewingStory.value?.steps[currentStep.value] || {}
    })
    
    const currentStepProgress = computed(() => {
      if (!previewingStory.value || previewingStory.value.steps.length === 0) return 0
      return ((currentStep.value + 1) / previewingStory.value.steps.length) * 100
    })
    
    // Story templates
    const storyTemplates = [
      {
        id: 'onboarding',
        name: 'User Onboarding',
        description: 'Guide new users through your product',
        type: 'onboarding',
        steps: [
          { title: 'Welcome', content: 'Welcome to our product! Let us show you around.', type: 'information' },
          { title: 'Setup Profile', content: 'Please fill in your profile information.', type: 'action' },
          { title: 'Tour Features', content: 'Here are the main features you should know about.', type: 'information' },
          { title: 'Get Started', content: 'Youre ready to start using our product!', type: 'information' }
        ]
      },
      {
        id: 'survey',
        name: 'Customer Survey',
        description: 'Collect feedback from your users',
        type: 'survey',
        steps: [
          { 
            title: 'How satisfied are you?', 
            content: 'Please rate your overall satisfaction.', 
            type: 'question',
            options: [
              { id: '1', text: 'Very satisfied', value: '5' },
              { id: '2', text: 'Satisfied', value: '4' },
              { id: '3', text: 'Neutral', value: '3' },
              { id: '4', text: 'Dissatisfied', value: '2' },
              { id: '5', text: 'Very dissatisfied', value: '1' }
            ]
          },
          { 
            title: 'What can we improve?', 
            content: 'Please tell us what we can do better.', 
            type: 'question'
          },
          { 
            title: 'Thank you!', 
            content: 'Thanks for your feedback!', 
            type: 'information'
          }
        ]
      },
      {
        id: 'tutorial',
        name: 'Feature Tutorial',
        description: 'Teach users how to use a specific feature',
        type: 'tutorial',
        steps: [
          { title: 'Introduction', content: 'Welcome to this feature tutorial.', type: 'information' },
          { title: 'Step 1', content: 'First, do this...', type: 'action' },
          { title: 'Step 2', content: 'Then, do that...', type: 'action' },
          { title: 'Step 3', content: 'Finally, do this!', type: 'action' },
          { title: 'Completion', content: 'Congratulations! Youve completed the tutorial.', type: 'information' }
        ]
      }
    ]
    
    // Methods
    const getStatusClass = (status) => {
      return {
        'draft': 'status-draft',
        'published': 'status-published',
        'archived': 'status-archived'
      }[status] || 'status-unknown'
    }
    
    const loadStories = async () => {
      isLoading.value = true
      error.value = null
      try {
        await storyStore.loadStories()
      } catch (err) {
        error.value = { message: err.message || 'Could not load stories' }
      } finally {
        isLoading.value = false
      }
    }
    
    const reloadStories = loadStories
    
    const createNewStory = () => {
      newStoryTitle.value = ''
      newStoryDescription.value = ''
      newStoryType.value = 'guide'
      showNewStoryModal.value = true
    }
    
    const createStory = async () => {
      if (!newStoryTitle.value.trim()) return
      
      isLoading.value = true
      try {
        await storyStore.createStory({
          title: newStoryTitle.value,
          description: newStoryDescription.value,
          type: newStoryType.value,
          status: 'draft',
          steps: []
        })
        showNewStoryModal.value = false
        await loadStories()
      } catch (err) {
        error.value = { message: err.message || 'Could not create story' }
      } finally {
        isLoading.value = false
      }
    }
    
    const editStory = (story) => {
      editingStory.value = JSON.parse(JSON.stringify(story))
    }
    
    const closeEditor = () => {
      editingStory.value = null
    }
    
    const saveStory = async () => {
      if (!editingStory.value) return
      
      isLoading.value = true
      try {
        await storyStore.saveStory(editingStory.value)
        closeEditor()
        await loadStories()
      } catch (err) {
        error.value = { message: err.message || 'Could not save story' }
      } finally {
        isLoading.value = false
      }
    }
    
    const addStep = () => {
      if (!editingStory.value) return
      
      editingStep.value = {
        title: 'New Step',
        content: 'Describe what happens in this step',
        type: 'information',
        options: []
      }
      editingStepIndex.value = null
    }
    
    const editStep = (index) => {
      if (!editingStory.value) return
      
      editingStep.value = JSON.parse(JSON.stringify(editingStory.value.steps[index]))
      editingStepIndex.value = index
    }
    
    const saveStep = () => {
      if (!editingStory.value || !editingStep.value) return
      
      if (editingStepIndex.value !== null) {
        // Update existing step
        editingStory.value.steps[editingStepIndex.value] = editingStep.value
      } else {
        // Add new step
        editingStory.value.steps.push(editingStep.value)
      }
      
      editingStep.value = null
      editingStepIndex.value = null
    }
    
    const cancelStep = () => {
      editingStep.value = null
      editingStepIndex.value = null
    }
    
    const removeStep = (index) => {
      if (!editingStory.value || !confirm('Remove this step?')) return
      editingStory.value.steps.splice(index, 1)
    }
    
    const moveStepUp = (index) => {
      if (!editingStory.value || index === 0) return
      const step = editingStory.value.steps[index]
      editingStory.value.steps.splice(index, 1)
      editingStory.value.steps.splice(index - 1, 0, step)
    }
    
    const moveStepDown = (index) => {
      if (!editingStory.value || index === editingStory.value.steps.length - 1) return
      const step = editingStory.value.steps[index]
      editingStory.value.steps.splice(index, 1)
      editingStory.value.steps.splice(index + 1, 0, step)
    }
    
    const addOption = () => {
      if (!editingStep.value) return
      editingStep.value.options.push({
        id: Date.now().toString(),
        text: 'New Option',
        value: 'new-option'
      })
    }
    
    const removeOption = (index) => {
      if (!editingStep.value) return
      editingStep.value.options.splice(index, 1)
    }
    
    const previewStory = (story) => {
      previewingStory.value = story
      currentStep.value = 0
    }
    
    const closePreview = () => {
      previewingStory.value = null
      currentStep.value = 0
    }
    
    const nextStep = () => {
      if (!previewingStory.value || currentStep.value >= previewingStory.value.steps.length - 1) return
      currentStep.value++
    }
    
    const previousStep = () => {
      if (!previewingStory.value || currentStep.value <= 0) return
      currentStep.value--
    }
    
    const handleOptionSelect = (option) => {
      alert(`User selected: ${option.text} (value: ${option.value})`)
      nextStep()
    }
    
    const publishStory = (story) => {
      if (confirm(`Publish ${story.title}? It will be available to all users.`)) {
        alert(`Would publish story: ${story.title}`)
      }
    }
    
    const unpublishStory = (story) => {
      if (confirm(`Unpublish ${story.title}? It will no longer be available to users.`)) {
        alert(`Would unpublish story: ${story.title}`)
      }
    }
    
    const showTemplates = () => {
      showTemplatesModal.value = true
    }
    
    const useTemplate = (template) => {
      newStoryTitle.value = template.name
      newStoryDescription.value = template.description
      newStoryType.value = template.type
      showTemplatesModal.value = false
      showNewStoryModal.value = true
    }
    
    const searchStories = () => {
      // Handled by computed property
    }
    
    const clearSearch = () => {
      searchQuery.value = ''
    }
    
    // Load initial data
    loadStories()
    
    return {
      isLoading,
      error,
      searchQuery,
      showNewStoryModal,
      showTemplatesModal,
      editingStory,
      editingStep,
      editingStepIndex,
      previewingStory,
      currentStep,
      newStoryTitle,
      newStoryDescription,
      newStoryType,
      stories,
      publishedStories,
      totalViews,
      filteredStories,
      storyTemplates,
      currentStepData,
      currentStepProgress,
      getStatusClass,
      reloadStories,
      createNewStory,
      createStory,
      editStory,
      closeEditor,
      saveStory,
      addStep,
      editStep,
      saveStep,
      cancelStep,
      removeStep,
      moveStepUp,
      moveStepDown,
      addOption,
      removeOption,
      previewStory,
      closePreview,
      nextStep,
      previousStep,
      handleOptionSelect,
      publishStory,
      unpublishStory,
      showTemplates,
      useTemplate,
      searchStories,
      clearSearch
    }
  }
}
</script>

<style scoped>
.story-surface {
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

.stories-list {
  margin-bottom: 1rem;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.list-header h2 {
  margin: 0;
  font-size: 1.2rem;
}

.list-actions {
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

.stories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.story-card {
  background: var(--surface-background);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.2s;
}

.story-card:hover {
  background: var(--surface-hover);
  border-color: var(--primary-color);
}

.story-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.story-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.story-status {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.status-draft {
  background: var(--info-background);
  color: var(--info-color);
}

.status-published {
  background: var(--success-background);
  color: var(--success-color);
}

.status-archived {
  background: var(--warning-background);
  color: var(--warning-color);
}

.story-description {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}

.story-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: var(--text-tertiary);
  margin-bottom: 0.75rem;
}

.story-actions {
  display: flex;
  gap: 0.5rem;
}

.story-stats {
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

.new-story-modal, .templates-modal {
  background: var(--background);
  border-radius: 8px;
  padding: 1.5rem;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.story-editor, .step-editor-modal, .story-preview {
  background: var(--background);
  border-radius: 8px;
  padding: 1.5rem;
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.editor-header, .preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.editor-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.story-info {
  border-right: 1px solid var(--border-color);
  padding-right: 1rem;
}

.steps-editor {
  padding-left: 1rem;
}

.step-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.step-item {
  background: var(--surface-background);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 0.75rem;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.step-number {
  background: var(--primary-color);
  color: white;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 0.8rem;
}

.step-actions {
  margin-left: auto;
  display: flex;
  gap: 0.25rem;
}

.action-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
}

.action-icon.danger {
  color: var(--danger-color);
}

.step-description {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.step-options {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
  margin-top: 0.25rem;
}

.option-badge {
  background: var(--surface-background);
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

.options-editor {
  margin: 1rem 0;
  padding: 0.75rem;
  background: var(--surface-background);
  border-radius: 6px;
}

.option-item {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.option-item input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.editor-footer, .preview-footer {
  display: flex;
  justify-content: flex-end;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
}

.template-card {
  background: var(--surface-background);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
}

.story-progress {
  margin-bottom: 1rem;
  height: 6px;
  background: var(--surface-background);
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: var(--primary-color);
  transition: width 0.3s;
}

.progress-text {
  font-size: 0.85rem;
  color: var(--text-tertiary);
  margin-top: 0.25rem;
  display: block;
}

.current-step {
  padding: 1rem;
  background: var(--surface-background);
  border-radius: 8px;
}

.current-step h3 {
  margin-top: 0;
}

.step-content {
  line-height: 1.6;
  margin: 1rem 0;
}

.step-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 1rem 0;
}

.option-button {
  padding: 0.75rem;
  background: var(--surface-background);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.option-button:hover {
  background: var(--surface-hover);
  border-color: var(--primary-color);
}

.step-navigation {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
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
</style>