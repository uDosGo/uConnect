<template>
  <div class="story-surface">
    <!-- Surface Header -->
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
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <span class="error-icon">⚠️</span>
      <h3>Couldn't load stories</h3>
      <p>{{ error }}</p>
      <button @click="reloadStories" class="primary">🔄 Try Again</button>
    </div>

    <!-- Story Player (when a story is being played) -->
    <div v-else-if="activeStory" class="story-player">
      <div class="player-header">
        <button @click="exitStory" class="back-btn">← Back to Index</button>
        <h2>{{ activeStory.title }}</h2>
        <span class="story-type-badge">{{ typeLabel(activeStory.type) }}</span>
      </div>

      <!-- Progress Bar -->
      <div class="progress-section">
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" :style="{ width: currentStepProgress + '%' }"></div>
        </div>
        <span class="progress-text">Step {{ currentStep + 1 }} of {{ activeStory.steps.length }}</span>
      </div>

      <!-- Current Step -->
      <div class="step-card">
        <div class="step-header">
          <span class="step-number">Step {{ currentStep + 1 }}</span>
          <h3>{{ currentStepData.title }}</h3>
        </div>

        <div class="step-content" v-html="renderedContent"></div>

        <!-- Presentation step (just click continue) -->
        <div v-if="currentStepData.type === 'presentation'" class="step-action">
          <button @click="nextStep" class="primary">
            {{ currentStep === activeStory.steps.length - 1 ? 'Finish →' : 'Continue →' }}
          </button>
        </div>

        <!-- Text Input step -->
        <div v-else-if="currentStepData.type === 'input'" class="step-action">
          <textarea
            v-if="currentStepData.field === 'textarea'"
            v-model="stepInput"
            :placeholder="'Type your answer here...'"
            rows="4"
            class="step-textarea"
          ></textarea>
          <input
            v-else
            v-model="stepInput"
            type="text"
            :placeholder="'Type your answer here...'"
            class="step-input"
            @keyup.enter="submitInput"
          />
          <button @click="submitInput" class="primary" :disabled="currentStepData.required && !stepInput.trim()">
            {{ currentStep === activeStory.steps.length - 1 ? 'Finish →' : 'Next →' }}
          </button>
        </div>

        <!-- Single Choice step -->
        <div v-else-if="currentStepData.type === 'single_choice'" class="step-action">
          <div class="options-list">
            <button
              v-for="option in currentStepData.options"
              :key="option.id"
              class="option-btn"
              :class="{ selected: selectedOption === option.id, correct: showFeedback && option.correct, incorrect: showFeedback && selectedOption === option.id && !option.correct }"
              @click="selectOption(option)"
              :disabled="showFeedback"
            >
              <span class="option-text">{{ option.text }}</span>
              <span v-if="showFeedback && option.id === selectedOption" class="option-feedback-icon">
                {{ option.correct ? '✅' : '❌' }}
              </span>
            </button>
          </div>
          <div v-if="showFeedback && feedbackText" class="feedback-box" :class="isCorrect ? 'feedback-correct' : 'feedback-incorrect'">
            {{ feedbackText }}
          </div>
          <button v-if="showFeedback" @click="advanceAfterChoice" class="primary">
            {{ isLastStep ? 'Finish →' : 'Continue →' }}
          </button>
        </div>

        <!-- Multi Choice step -->
        <div v-else-if="currentStepData.type === 'multi_choice'" class="step-action">
          <div class="options-list">
            <button
              v-for="option in currentStepData.options"
              :key="option.id"
              class="option-btn multi"
              :class="{ selected: selectedMulti.includes(option.id) }"
              @click="toggleMultiOption(option.id)"
            >
              <span class="checkbox">{{ selectedMulti.includes(option.id) ? '☑' : '☐' }}</span>
              <span class="option-text">{{ option.text }}</span>
            </button>
          </div>
          <button @click="submitMultiChoice" class="primary">
            {{ currentStep === activeStory.steps.length - 1 ? 'Finish →' : 'Next →' }}
          </button>
        </div>

        <!-- Stars step -->
        <div v-else-if="currentStepData.type === 'stars'" class="step-action">
          <div class="stars-row">
            <button
              v-for="n in (currentStepData.max || 5)"
              :key="n"
              class="star-btn"
              :class="{ active: starRating >= n }"
              @click="starRating = n"
            >
              {{ starRating >= n ? '⭐' : '☆' }}
            </button>
          </div>
          <button @click="submitStars" class="primary">
            {{ currentStep === activeStory.steps.length - 1 ? 'Finish →' : 'Next →' }}
          </button>
        </div>

        <!-- Scale step -->
        <div v-else-if="currentStepData.type === 'scale'" class="step-action">
          <div class="scale-row">
            <span class="scale-min">{{ currentStepData.min || 1 }}</span>
            <button
              v-for="n in scaleRange"
              :key="n"
              class="scale-btn"
              :class="{ active: scaleValue === n }"
              @click="scaleValue = n"
            >
              {{ n }}
            </button>
            <span class="scale-max">{{ currentStepData.max || 5 }}</span>
          </div>
          <button @click="submitScale" class="primary">
            {{ currentStep === activeStory.steps.length - 1 ? 'Finish →' : 'Next →' }}
          </button>
        </div>

        <!-- Information / Question / Action / Decision (fallback) -->
        <div v-else class="step-action">
          <button @click="nextStep" class="primary">
            {{ currentStep === activeStory.steps.length - 1 ? 'Finish →' : 'Continue →' }}
          </button>
        </div>
      </div>

      <!-- Navigation -->
      <div class="step-nav">
        <button @click="previousStep" class="secondary" :disabled="currentStep === 0">
          ← Previous
        </button>
      </div>
    </div>

    <!-- Story Index (default view) -->
    <div v-else class="story-index">
      <!-- Stats Bar -->
      <div class="stats-bar">
        <div class="stat-item">
          <span class="stat-icon">📚</span>
          <span class="stat-value">{{ stories.length }}</span>
          <span class="stat-label">Stories</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">📢</span>
          <span class="stat-value">{{ publishedStories }}</span>
          <span class="stat-label">Published</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">👁️</span>
          <span class="stat-value">{{ totalViews }}</span>
          <span class="stat-label">Views</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">✅</span>
          <span class="stat-value">{{ totalCompletions }}</span>
          <span class="stat-label">Completions</span>
        </div>
      </div>

      <!-- Search & Actions -->
      <div class="index-toolbar">
        <div class="search-bar">
          <span class="search-icon">🔍</span>
          <input v-model="searchQuery" type="text" placeholder="Search stories…" />
          <button v-if="searchQuery" @click="searchQuery = ''" class="clear-search">✕</button>
        </div>
        <div class="toolbar-actions">
          <button @click="showNewStoryModal = true" class="primary">➕ New Story</button>
          <button @click="showTemplatesModal = true" class="secondary">📚 Templates</button>
        </div>
      </div>

      <!-- Stories Grid -->
      <div v-if="filteredStories.length === 0" class="empty-state">
        <span class="empty-icon">📭</span>
        <h3>No stories found</h3>
        <p v-if="searchQuery">No stories match "{{ searchQuery }}"</p>
        <p v-else>Create your first guided walkthrough</p>
        <button v-if="!searchQuery" @click="showNewStoryModal = true" class="primary">➕ New Story</button>
      </div>

      <div v-else class="stories-grid">
        <div v-for="story in filteredStories" :key="story.id" class="story-card" @click="playStory(story)">
          <div class="story-card-header">
            <h3>{{ story.title }}</h3>
            <span class="story-status" :class="'status-' + story.status">{{ story.status }}</span>
          </div>
          <p class="story-description">{{ story.description }}</p>
          <div class="story-meta">
            <span class="meta-type">{{ typeLabel(story.type) }}</span>
            <span class="meta-steps">📍 {{ story.steps.length }} steps</span>
            <span class="meta-views">👁️ {{ story.views }}</span>
            <span class="meta-completions">✅ {{ story.completions }}</span>
          </div>
          <div class="story-card-actions" @click.stop>
            <button class="play-btn" @click="playStory(story)">▶ Play</button>
            <button class="edit-btn" @click="editStory(story)">✏️ Edit</button>
            <button v-if="story.status !== 'published'" class="publish-btn" @click="publishStory(story)">🚀 Publish</button>
            <button v-else class="unpublish-btn" @click="unpublishStory(story)">🔒 Unpublish</button>
          </div>
        </div>
      </div>
    </div>

    <!-- New Story Modal -->
    <div v-if="showNewStoryModal" class="modal-overlay" @click.self="showNewStoryModal = false">
      <div class="modal new-story-modal">
        <h3>📝 Create New Story</h3>
        <div class="form-group">
          <label>Story Title</label>
          <input v-model="newStoryTitle" type="text" placeholder="My Guided Walkthrough" />
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea v-model="newStoryDescription" placeholder="What does this story guide users through?" rows="3"></textarea>
        </div>
        <div class="form-group">
          <label>Story Type</label>
          <select v-model="newStoryType">
            <option value="guide">User Guide</option>
            <option value="onboarding">Onboarding</option>
            <option value="survey">Survey</option>
            <option value="tutorial">Tutorial</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        <div class="modal-actions">
          <button @click="createStory" class="primary">✅ Create Story</button>
          <button @click="showNewStoryModal = false" class="secondary">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Story Editor Modal -->
    <div v-if="editingStory" class="modal-overlay" @click.self="closeEditor">
      <div class="modal story-editor">
        <div class="editor-header">
          <h2>Editing: {{ editingStory.title }}</h2>
          <button @click="closeEditor" class="secondary small">✕ Close</button>
        </div>
        <div class="editor-body">
          <div class="editor-info">
            <div class="form-group">
              <label>Title</label>
              <input v-model="editingStory.title" type="text" />
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea v-model="editingStory.description" rows="2"></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Type</label>
                <select v-model="editingStory.type">
                  <option value="guide">User Guide</option>
                  <option value="onboarding">Onboarding</option>
                  <option value="survey">Survey</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="interactive-narrative">Interactive Narrative</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div class="form-group">
                <label>Status</label>
                <select v-model="editingStory.status">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>
          <div class="steps-editor">
            <h3>Steps ({{ editingStory.steps.length }})</h3>
            <div class="step-list">
              <div v-for="(step, index) in editingStory.steps" :key="index" class="step-item">
                <div class="step-item-header">
                  <span class="step-num">{{ index + 1 }}</span>
                  <span class="step-title">{{ step.title }}</span>
                  <span class="step-type-badge">{{ step.type }}</span>
                  <div class="step-item-actions">
                    <button @click="editStep(index)" class="icon-btn" title="Edit step">✏️</button>
                    <button @click="moveStepUp(index)" class="icon-btn" :disabled="index === 0" title="Move up">↑</button>
                    <button @click="moveStepDown(index)" class="icon-btn" :disabled="index === editingStory.steps.length - 1" title="Move down">↓</button>
                    <button @click="removeStep(index)" class="icon-btn danger" title="Remove step">✕</button>
                  </div>
                </div>
              </div>
            </div>
            <button @click="addStep" class="secondary">➕ Add Step</button>
          </div>
        </div>
        <div class="editor-footer">
          <button @click="saveStory" class="primary">💾 Save Story</button>
        </div>
      </div>
    </div>

    <!-- Step Editor Modal -->
    <div v-if="editingStep !== null" class="modal-overlay" @click.self="cancelStep">
      <div class="modal step-editor-modal">
        <h3>{{ editingStepIndex !== null ? 'Edit Step' : 'Add Step' }}</h3>
        <div class="form-group">
          <label>Step Title</label>
          <input v-model="editingStep.title" type="text" />
        </div>
        <div class="form-group">
          <label>Content</label>
          <textarea v-model="editingStep.content" placeholder="What should happen in this step?" rows="5"></textarea>
        </div>
        <div class="form-group">
          <label>Step Type</label>
          <select v-model="editingStep.type">
            <option value="presentation">Presentation</option>
            <option value="information">Information</option>
            <option value="input">Text Input</option>
            <option value="single_choice">Single Choice</option>
            <option value="multi_choice">Multi Choice</option>
            <option value="stars">Star Rating</option>
            <option value="scale">Scale</option>
            <option value="question">Question</option>
            <option value="action">Action Required</option>
            <option value="decision">Decision Point</option>
          </select>
        </div>
        <div v-if="editingStep.type === 'input'" class="form-group">
          <label>Input Field Type</label>
          <select v-model="editingStep.field">
            <option value="text">Single Line</option>
            <option value="textarea">Multi Line</option>
          </select>
        </div>
        <div v-if="editingStep.type === 'input'" class="form-group">
          <label>
            <input type="checkbox" v-model="editingStep.required" /> Required
          </label>
        </div>
        <div v-if="editingStep.type === 'stars'" class="form-group">
          <label>Maximum Stars</label>
          <input v-model.number="editingStep.max" type="number" min="1" max="10" />
        </div>
        <div v-if="editingStep.type === 'scale'" class="form-row">
          <div class="form-group">
            <label>Min</label>
            <input v-model.number="editingStep.min" type="number" />
          </div>
          <div class="form-group">
            <label>Max</label>
            <input v-model.number="editingStep.max" type="number" />
          </div>
        </div>
        <div v-if="editingStep.type === 'single_choice' || editingStep.type === 'multi_choice' || editingStep.type === 'question' || editingStep.type === 'decision'" class="options-editor">
          <h4>Options</h4>
          <div v-for="(option, optIndex) in editingStep.options" :key="optIndex" class="option-row">
            <input v-model="option.text" type="text" placeholder="Option text" class="opt-text" />
            <input v-model="option.value" type="text" placeholder="Value" class="opt-value" />
            <button @click="removeOption(optIndex)" class="danger small">✕</button>
          </div>
          <button @click="addOption" class="secondary small">➕ Add Option</button>
        </div>
        <div class="modal-actions">
          <button @click="saveStep" class="primary">💾 Save Step</button>
          <button @click="cancelStep" class="secondary">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Templates Modal -->
    <div v-if="showTemplatesModal" class="modal-overlay" @click.self="showTemplatesModal = false">
      <div class="modal templates-modal">
        <h3>📚 Story Templates</h3>
        <p>Start with a pre-built story template</p>
        <div class="template-grid">
          <div v-for="template in storyTemplates" :key="template.id" class="template-card">
            <h4>{{ template.name }}</h4>
            <p>{{ template.description }}</p>
            <button @click="useTemplate(template)" class="secondary small">Use Template</button>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="showTemplatesModal = false" class="secondary">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStoryStore, type Story, type StoryStep, type StoryOption } from '@/stores/story'

const storyStore = useStoryStore()

// ─── State ──────────────────────────────────────────────────────
const isLoading = ref(false)
const error = ref<string | null>(null)
const searchQuery = ref('')
const showNewStoryModal = ref(false)
const showTemplatesModal = ref(false)
const editingStory = ref<Story | null>(null)
const editingStep = ref<StoryStep | null>(null)
const editingStepIndex = ref<number | null>(null)

// Story player state
const activeStory = ref<Story | null>(null)
const currentStep = ref(0)
const stepInput = ref('')
const selectedOption = ref<string | null>(null)
const selectedMulti = ref<string[]>([])
const starRating = ref(0)
const scaleValue = ref(0)
const showFeedback = ref(false)
const feedbackText = ref('')
const isCorrect = ref(false)

// New story form
const newStoryTitle = ref('')
const newStoryDescription = ref('')
const newStoryType = ref('guide')

// ─── Computed ───────────────────────────────────────────────────
const stories = computed(() => storyStore.stories)
const publishedStories = computed(() => storyStore.publishedStories.length)
const totalViews = computed(() => storyStore.totalViews)
const totalCompletions = computed(() => storyStore.totalCompletions)

const filteredStories = computed(() => {
  if (!searchQuery.value) return stories.value
  const q = searchQuery.value.toLowerCase()
  return stories.value.filter(s =>
    s.title.toLowerCase().includes(q) ||
    s.description.toLowerCase().includes(q)
  )
})

const currentStepData = computed(() => {
  return activeStory.value?.steps[currentStep.value] || {} as StoryStep
})

const currentStepProgress = computed(() => {
  if (!activeStory.value || activeStory.value.steps.length === 0) return 0
  return ((currentStep.value + 1) / activeStory.value.steps.length) * 100
})

const isLastStep = computed(() => {
  return activeStory.value ? currentStep.value >= activeStory.value.steps.length - 1 : false
})

const scaleRange = computed(() => {
  const min = currentStepData.value.min || 1
  const max = currentStepData.value.max || 5
  const range: number[] = []
  for (let i = min; i <= max; i++) range.push(i)
  return range
})

const renderedContent = computed(() => {
  const content = currentStepData.value.content || ''
  // Convert newlines to <br> and highlight [[wiki-links]]
  return content
    .replace(/\n/g, '<br>')
    .replace(/\[\[([^\]]+)\]\]/g, '<span class="wiki-link">[[$1]]</span>')
})

// ─── Templates ──────────────────────────────────────────────────
const storyTemplates = [
  {
    id: 'onboarding',
    name: 'User Onboarding',
    description: 'Guide new users through your product',
    type: 'onboarding',
    steps: [
      { title: 'Welcome', content: 'Welcome to our product! Let us show you around.', type: 'presentation' },
      { title: 'Setup Profile', content: 'Please fill in your profile information.', type: 'input', field: 'text', required: true },
      { title: 'Tour Features', content: 'Here are the main features you should know about.', type: 'presentation' },
      { title: 'Get Started', content: 'You\'re ready to start using our product!', type: 'presentation' },
    ]
  },
  {
    id: 'survey',
    name: 'Customer Survey',
    description: 'Collect feedback from your users',
    type: 'survey',
    steps: [
      { title: 'How satisfied are you?', content: 'Please rate your overall satisfaction.', type: 'stars', max: 5 },
      { title: 'What can we improve?', content: 'Please tell us what we can do better.', type: 'input', field: 'textarea' },
      { title: 'Thank you!', content: 'Thanks for your feedback!', type: 'presentation' },
    ]
  },
  {
    id: 'tutorial',
    name: 'Feature Tutorial',
    description: 'Teach users how to use a specific feature',
    type: 'tutorial',
    steps: [
      { title: 'Introduction', content: 'Welcome to this feature tutorial.', type: 'presentation' },
      { title: 'Step 1', content: 'First, do this...', type: 'action' },
      { title: 'Step 2', content: 'Then, do that...', type: 'action' },
      { title: 'Completion', content: 'Congratulations! You\'ve completed the tutorial.', type: 'presentation' },
    ]
  },
]

// ─── Type labels ────────────────────────────────────────────────
function typeLabel(type: string): string {
  const labels: Record<string, string> = {
    'guide': '📋 Guide',
    'onboarding': '🚀 Onboarding',
    'survey': '📊 Survey',
    'tutorial': '🎓 Tutorial',
    'interactive-narrative': '📖 Narrative',
    'custom': '🔧 Custom',
  }
  return labels[type] || type
}

// ─── Story Player ───────────────────────────────────────────────
function playStory(story: Story) {
  activeStory.value = story
  currentStep.value = 0
  resetStepState()
}

function exitStory() {
  activeStory.value = null
  currentStep.value = 0
  resetStepState()
}

function resetStepState() {
  stepInput.value = ''
  selectedOption.value = null
  selectedMulti.value = []
  starRating.value = 0
  scaleValue.value = 0
  showFeedback.value = false
  feedbackText.value = ''
  isCorrect.value = false
}

function nextStep() {
  if (activeStory.value && currentStep.value < activeStory.value.steps.length - 1) {
    currentStep.value++
    resetStepState()
  } else if (isLastStep.value) {
    // Show completion
    const completion = activeStory.value?.completion
    if (completion) {
      alert(`${completion.title}\n\n${completion.message}`)
    }
    exitStory()
  }
}

function previousStep() {
  if (currentStep.value > 0) {
    currentStep.value--
    resetStepState()
  }
}

// ─── Input step ─────────────────────────────────────────────────
function submitInput() {
  if (currentStepData.value.required && !stepInput.value.trim()) return
  nextStep()
}

// ─── Single Choice ──────────────────────────────────────────────
function selectOption(option: StoryOption) {
  if (showFeedback.value) return
  selectedOption.value = option.id
  showFeedback.value = true
  isCorrect.value = !!option.correct
  feedbackText.value = option.feedback || (option.correct ? 'Correct!' : 'Incorrect.')
}

function advanceAfterChoice() {
  const option = currentStepData.value.options?.find(o => o.id === selectedOption.value)
  if (option?.next === null || isLastStep.value) {
    // End of story or explicit null next
    const completion = activeStory.value?.completion
    if (completion) {
      alert(`${completion.title}\n\n${completion.message}`)
    }
    exitStory()
  } else if (option?.next && activeStory.value) {
    // Navigate to a specific step by id
    const stepIndex = activeStory.value.steps.findIndex(s => s.id === option.next)
    if (stepIndex >= 0) {
      currentStep.value = stepIndex
      resetStepState()
    } else {
      nextStep()
    }
  } else {
    nextStep()
  }
}

// ─── Multi Choice ───────────────────────────────────────────────
function toggleMultiOption(id: string) {
  const idx = selectedMulti.value.indexOf(id)
  if (idx >= 0) {
    selectedMulti.value.splice(idx, 1)
  } else {
    selectedMulti.value.push(id)
  }
}

function submitMultiChoice() {
  nextStep()
}

// ─── Stars ──────────────────────────────────────────────────────
function submitStars() {
  nextStep()
}

// ─── Scale ──────────────────────────────────────────────────────
function submitScale() {
  nextStep()
}

// ─── Story CRUD ─────────────────────────────────────────────────
async function createStory() {
  if (!newStoryTitle.value.trim()) return
  isLoading.value = true
  try {
    await storyStore.createStory({
      title: newStoryTitle.value,
      description: newStoryDescription.value,
      type: newStoryType.value as any,
    })
    showNewStoryModal.value = false
    newStoryTitle.value = ''
    newStoryDescription.value = ''
    newStoryType.value = 'guide'
  } catch (err: any) {
    error.value = err.message || 'Could not create story'
  } finally {
    isLoading.value = false
  }
}

function editStory(story: Story) {
  editingStory.value = JSON.parse(JSON.stringify(story))
}

function closeEditor() {
  editingStory.value = null
  editingStep.value = null
  editingStepIndex.value = null
}

async function saveStory() {
  if (!editingStory.value) return
  isLoading.value = true
  try {
    await storyStore.saveStory(editingStory.value)
    closeEditor()
  } catch (err: any) {
    error.value = err.message || 'Could not save story'
  } finally {
    isLoading.value = false
  }
}

// ─── Step editing ───────────────────────────────────────────────
function addStep() {
  editingStep.value = {
    id: `step-${Date.now()}`,
    title: 'New Step',
    content: 'Describe what happens in this step',
    type: 'presentation',
    options: [],
  }
  editingStepIndex.value = null
}

function editStep(index: number) {
  if (!editingStory.value) return
  editingStep.value = JSON.parse(JSON.stringify(editingStory.value.steps[index]))
  editingStepIndex.value = index
}

function saveStep() {
  if (!editingStory.value || !editingStep.value) return
  const step = { ...editingStep.value, id: editingStep.value.id || `step-${Date.now()}` }
  if (editingStepIndex.value !== null) {
    editingStory.value.steps[editingStepIndex.value] = step
  } else {
    editingStory.value.steps.push(step)
  }
  editingStep.value = null
  editingStepIndex.value = null
}

function cancelStep() {
  editingStep.value = null
  editingStepIndex.value = null
}

function removeStep(index: number) {
  if (!editingStory.value) return
  editingStory.value.steps.splice(index, 1)
}

function moveStepUp(index: number) {
  if (!editingStory.value || index === 0) return
  const step = editingStory.value.steps[index]
  editingStory.value.steps.splice(index, 1)
  editingStory.value.steps.splice(index - 1, 0, step)
}

function moveStepDown(index: number) {
  if (!editingStory.value || index === editingStory.value.steps.length - 1) return
  const step = editingStory.value.steps[index]
  editingStory.value.steps.splice(index, 1)
  editingStory.value.steps.splice(index + 1, 0, step)
}

function addOption() {
  if (!editingStep.value) return
  editingStep.value.options = editingStep.value.options || []
  editingStep.value.options.push({
    id: `opt-${Date.now()}`,
    text: 'New Option',
    value: 'new-option',
  })
}

function removeOption(index: number) {
  if (!editingStep.value?.options) return
  editingStep.value.options.splice(index, 1)
}

// ─── Publish / Unpublish ────────────────────────────────────────
function publishStory(story: Story) {
  story.status = 'published'
  storyStore.saveStory(story)
}

function unpublishStory(story: Story) {
  story.status = 'draft'
  storyStore.saveStory(story)
}

// ─── Templates ──────────────────────────────────────────────────
function useTemplate(template: any) {
  newStoryTitle.value = template.name
  newStoryDescription.value = template.description
  newStoryType.value = template.type
  showTemplatesModal.value = false
  showNewStoryModal.value = true
}

// ─── Load ───────────────────────────────────────────────────────
async function reloadStories() {
  isLoading.value = true
  error.value = null
  try {
    await storyStore.loadStories()
  } catch (err: any) {
    error.value = err.message || 'Could not load stories'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  reloadStories()
})
</script>

<style scoped>
.story-surface {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
  color: #e2e8f0;
}

.surface-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #334155;
}

.surface-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: #f8fafc;
}

.surface-tagline {
  color: #94a3b8;
  margin: 0.5rem 0;
}

.surface-definition {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0;
}

/* Loading / Error */
.loading-state, .error-state {
  padding: 3rem;
  text-align: center;
  color: #94a3b8;
}

.spinner, .error-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 1rem;
}

/* Stats Bar */
.stats-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-icon { font-size: 1.5rem; }
.stat-value { font-size: 1.5rem; font-weight: 700; color: #f8fafc; }
.stat-label { font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; }

/* Toolbar */
.index-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.search-bar {
  position: relative;
  flex: 1;
}

.search-bar input {
  width: 100%;
  padding: 0.6rem 2.5rem;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 6px;
  color: #e2e8f0;
  font-size: 0.9rem;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
}

.clear-search {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 0.9rem;
}

.toolbar-actions {
  display: flex;
  gap: 0.5rem;
}

/* Buttons */
.primary {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background 0.2s;
}

.primary:hover { background: #2563eb; }
.primary:disabled { opacity: 0.5; cursor: not-allowed; }

.secondary {
  background: #334155;
  color: #e2e8f0;
  border: 1px solid #475569;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.secondary:hover { background: #475569; }
.secondary:disabled { opacity: 0.5; cursor: not-allowed; }
.secondary.small, .primary.small { padding: 0.3rem 0.6rem; font-size: 0.8rem; }

.danger { color: #ef4444; }
.danger.small {
  background: none;
  border: 1px solid #ef4444;
  color: #ef4444;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.2rem 0.4rem;
  color: #94a3b8;
  transition: color 0.2s;
}

.icon-btn:hover { color: #e2e8f0; }
.icon-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.icon-btn.danger:hover { color: #ef4444; }

/* Stories Grid */
.stories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}

.story-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 1.25rem;
  cursor: pointer;
  transition: border-color 0.2s, transform 0.2s;
}

.story-card:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
}

.story-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.story-card-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #f8fafc;
}

.story-status {
  font-size: 0.7rem;
  padding: 0.15rem 0.5rem;
  border-radius: 10px;
  text-transform: uppercase;
  font-weight: 600;
}

.status-published { background: #065f46; color: #6ee7b7; }
.status-draft { background: #1e3a5f; color: #93c5fd; }
.status-archived { background: #451a03; color: #fdba74; }

.story-description {
  color: #94a3b8;
  font-size: 0.85rem;
  margin: 0.5rem 0;
  line-height: 1.4;
}

.story-meta {
  display: flex;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: #64748b;
  margin: 0.75rem 0;
}

.story-card-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #334155;
}

.play-btn, .edit-btn, .publish-btn, .unpublish-btn {
  background: none;
  border: 1px solid #475569;
  color: #cbd5e1;
  padding: 0.3rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
}

.play-btn { border-color: #3b82f6; color: #60a5fa; }
.play-btn:hover { background: #3b82f6; color: white; }
.edit-btn:hover { background: #475569; }
.publish-btn { border-color: #10b981; color: #34d399; }
.publish-btn:hover { background: #10b981; color: white; }
.unpublish-btn { border-color: #f59e0b; color: #fbbf24; }
.unpublish-btn:hover { background: #f59e0b; color: white; }

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #94a3b8;
}

.empty-icon { font-size: 3rem; display: block; margin-bottom: 1rem; }

/* Story Player */
.story-player {
  max-width: 700px;
  margin: 0 auto;
}

.player-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.player-header h2 {
  margin: 0;
  font-size: 1.3rem;
  flex: 1;
}

.back-btn {
  background: none;
  border: 1px solid #475569;
  color: #94a3b8;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
}

.back-btn:hover { background: #334155; color: #e2e8f0; }

.story-type-badge {
  font-size: 0.75rem;
  background: #1e3a5f;
  color: #93c5fd;
  padding: 0.2rem 0.6rem;
  border-radius: 10px;
}

/* Progress */
.progress-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.progress-bar-bg {
  flex: 1;
  height: 6px;
  background: #334155;
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.8rem;
  color: #94a3b8;
  white-space: nowrap;
}

/* Step Card */
.step-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.step-header {
  margin-bottom: 1rem;
}

.step-number {
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.step-header h3 {
  margin: 0.25rem 0;
  font-size: 1.2rem;
  color: #f8fafc;
}

.step-content {
  color: #cbd5e1;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

.wiki-link {
  color: #60a5fa;
  background: #1e3a5f;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
  font-family: monospace;
}

/* Step Actions */
.step-action {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.step-input, .step-textarea {
  width: 100%;
  padding: 0.75rem;
  background: #0f172a;
  border: 1px solid #475569;
  border-radius: 6px;
  color: #e2e8f0;
  font-size: 0.95rem;
  box-sizing: border-box;
}

.step-textarea {
  resize: vertical;
  min-height: 80px;
}

.step-input:focus, .step-textarea:focus {
  outline: none;
  border-color: #3b82f6;
}

/* Options List */
.options-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.option-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  color: #e2e8f0;
  cursor: pointer;
  text-align: left;
  font-size: 0.9rem;
  transition: all 0.2s;
  white-space: pre-wrap;
}

.option-btn:hover { border-color: #3b82f6; background: #1e293b; }
.option-btn.selected { border-color: #3b82f6; background: #1e3a5f; }
.option-btn.correct { border-color: #10b981; background: #064e3b; }
.option-btn.incorrect { border-color: #ef4444; background: #450a0a; }
.option-btn:disabled { cursor: default; }

.option-text { flex: 1; }
.option-feedback-icon { font-size: 1.1rem; }

.checkbox { font-size: 1.1rem; }

/* Feedback */
.feedback-box {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  line-height: 1.4;
}

.feedback-correct {
  background: #064e3b;
  border: 1px solid #10b981;
  color: #6ee7b7;
}

.feedback-incorrect {
  background: #450a0a;
  border: 1px solid #ef4444;
  color: #fca5a5;
}

/* Stars */
.stars-row {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  padding: 1rem 0;
}

.star-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  transition: transform 0.2s;
  filter: grayscale(1);
}

.star-btn.active { filter: grayscale(0); transform: scale(1.2); }
.star-btn:hover { transform: scale(1.3); }

/* Scale */
.scale-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
  padding: 1rem 0;
}

.scale-min, .scale-max {
  font-size: 0.8rem;
  color: #64748b;
  min-width: 1.5rem;
  text-align: center;
}

.scale-btn {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: #0f172a;
  border: 1px solid #334155;
  color: #e2e8f0;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.scale-btn:hover { border-color: #3b82f6; }
.scale-btn.active { background: #3b82f6; border-color: #3b82f6; color: white; }

/* Step Nav */
.step-nav {
  display: flex;
  justify-content: flex-start;
}

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 1.5rem;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal h3 {
  margin: 0 0 1rem;
  color: #f8fafc;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-size: 0.85rem;
  color: #94a3b8;
  margin-bottom: 0.3rem;
}

.form-group input[type="text"],
.form-group input[type="number"],
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.6rem;
  background: #0f172a;
  border: 1px solid #475569;
  border-radius: 6px;
  color: #e2e8f0;
  font-size: 0.9rem;
  box-sizing: border-box;
}

.form-group input[type="checkbox"] {
  margin-right: 0.5rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-row .form-group {
  flex: 1;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

/* Story Editor */
.story-editor { max-width: 800px; }

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.editor-header h2 {
  margin: 0;
  font-size: 1.2rem;
  color: #f8fafc;
}

.editor-body {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.editor-footer {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #334155;
  display: flex;
  justify-content: flex-end;
}

/* Steps Editor */
.steps-editor h3 {
  margin: 0 0 0.75rem;
  font-size: 1rem;
  color: #e2e8f0;
}

.step-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.step-item {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
}

.step-item-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.step-num {
  width: 1.5rem;
  height: 1.5rem;
  background: #334155;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
}

.step-title {
  flex: 1;
  font-size: 0.85rem;
  color: #e2e8f0;
}

.step-type-badge {
  font-size: 0.7rem;
  background: #1e3a5f;
  color: #93c5fd;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
}

.step-item-actions {
  display: flex;
  gap: 0.25rem;
}

/* Step Editor Modal */
.step-editor-modal { max-width: 500px; }

.options-editor {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #334155;
}

.options-editor h4 {
  margin: 0 0 0.5rem;
  font-size: 0.9rem;
  color: #e2e8f0;
}

.option-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  align-items: center;
}

.opt-text { flex: 2; }
.opt-value { flex: 1; }

.option-row input {
  padding: 0.4rem;
  background: #0f172a;
  border: 1px solid #475569;
  border-radius: 4px;
  color: #e2e8f0;
  font-size: 0.85rem;
}

/* Templates */
.templates-modal { max-width: 500px; }

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;
  margin: 1rem 0;
}

.template-card {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 1rem;
}

.template-card h4 {
  margin: 0 0 0.25rem;
  font-size: 0.95rem;
  color: #e2e8f0;
}

.template-card p {
  margin: 0 0 0.75rem;
  font-size: 0.8rem;
  color: #94a3b8;
}

/* Responsive */
@media (max-width: 768px) {
  .stats-bar {
    grid-template-columns: repeat(2, 1fr);
  }

  .index-toolbar {
    flex-direction: column;
  }

  .stories-grid {
    grid-template-columns: 1fr;
  }

  .player-header {
    flex-wrap: wrap;
  }

  .form-row {
    flex-direction: column;
    gap: 0;
  }
}
</style>
