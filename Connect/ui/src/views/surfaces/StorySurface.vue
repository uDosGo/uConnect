<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Story State
const storyStatus = ref<'idle' | 'loading' | 'active' | 'completed' | 'error'>('idle');
const currentStep = ref(0);
const storyData = ref<any>(null);
const userResponses = ref<Record<string, any>>({});
const isSubmitting = ref(false);

// Example story data (onboarding flow)
const exampleStory = {
  open_box: {
    id: "onboarding-story",
    type: "application/vnd.usxd.story",
    usxd_version: "v0.2.0-alpha.1"
  },
  story: {
    title: "Welcome to uDos Connect",
    steps: [
      {
        type: "presentation",
        title: "Welcome!",
        content: "# Welcome to uDos Connect\n\nLet's get you set up with a quick onboarding flow.",
        next_action: "enter"
      },
      {
        type: "input",
        id: "workspace_name",
        title: "Workspace Setup",
        label: "What would you like to name your workspace?",
        field: "text",
        placeholder: "My Workspace",
        required: true
      },
      {
        type: "single_choice",
        id: "experience_level",
        title: "Experience Level",
        label: "How familiar are you with uDos?",
        options: [
          { value: "beginner", label: "Beginner - Just getting started" },
          { value: "intermediate", label: "Intermediate - Used it a few times" },
          { value: "advanced", label: "Advanced - Power user" }
        ]
      },
      {
        type: "multi_choice",
        id: "features",
        title: "Feature Selection",
        label: "Which features are you interested in?",
        options: [
          { value: "vault", label: "Vault Management" },
          { value: "github", label: "GitHub Integration" },
          { value: "wordpress", label: "WordPress Sync" },
          { value: "workflow", label: "Workflow Automation" }
        ]
      },
      {
        type: "stars",
        id: "satisfaction",
        title: "Feedback",
        label: "How satisfied are you with the setup process?",
        max: 5,
        value: 0
      },
      {
        type: "scale",
        id: "complexity",
        title: "Complexity Rating",
        label: "On a scale of 1-5, how complex was this setup?",
        min: 1,
        max: 5,
        value: 3
      },
      {
        type: "presentation",
        title: "Summary",
        content: "## Review Your Choices\n\nLet's review your selections before finalizing.",
        next_action: "enter"
      },
      {
        type: "presentation",
        title: "Completion",
        content: "## All Done!\n\nYour workspace is ready. Click Continue to start using uDos Connect.",
        next_action: "enter"
      }
    ],
    navigation: {
      back: true,
      cancel: true,
      progress: "visible",
      enter_to_continue: true
    }
  }
};

// Load story
async function loadStory() {
  storyStatus.value = 'loading';
  try {
    // In a real implementation, this would load from an API or file
    // For now, we'll use the example story
    storyData.value = exampleStory;
    storyStatus.value = 'active';
  } catch (error) {
    storyStatus.value = 'error';
    console.error('Failed to load story:', error);
  }
}

// Navigation functions
function goToStep(stepIndex: number) {
  if (stepIndex >= 0 && stepIndex < storyData.value.story.steps.length) {
    currentStep.value = stepIndex;
  }
}

function goBack() {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
}

function goForward() {
  if (currentStep.value < storyData.value.story.steps.length - 1) {
    currentStep.value++;
  }
}

function handleContinue() {
  const currentStepData = storyData.value.story.steps[currentStep.value];
  
  // Validate required fields
  if (currentStepData.type === 'input' && currentStepData.required) {
    const response = userResponses.value[currentStepData.id];
    if (!response || response.trim() === '') {
      alert('This field is required');
      return;
    }
  }
  
  // Save response for input steps
  if (currentStepData.type === 'input' && currentStepData.id) {
    userResponses.value[currentStepData.id] = document.getElementById(currentStepData.id)?.value || '';
  }
  
  // Move to next step
  if (currentStep.value < storyData.value.story.steps.length - 1) {
    currentStep.value++;
  } else {
    // Last step - complete the story
    completeStory();
  }
}

function handleChoiceSelection(optionValue: string, stepId: string) {
  userResponses.value[stepId] = optionValue;
}

function handleMultiChoiceToggle(optionValue: string, stepId: string) {
  if (!userResponses.value[stepId]) {
    userResponses.value[stepId] = [];
  }
  
  const index = userResponses.value[stepId].indexOf(optionValue);
  if (index === -1) {
    userResponses.value[stepId].push(optionValue);
  } else {
    userResponses.value[stepId].splice(index, 1);
  }
}

function handleStarRating(rating: number, stepId: string) {
  userResponses.value[stepId] = rating;
}

function handleScaleRating(rating: number, stepId: string) {
  userResponses.value[stepId] = rating;
}

function completeStory() {
  isSubmitting.value = true;
  storyStatus.value = 'completed';
  
  // In a real implementation, this would submit the responses to an API
  console.log('Story completed with responses:', userResponses.value);
  
  setTimeout(() => {
    isSubmitting.value = false;
    alert('✅ Story completed! Your responses have been saved.');
  }, 1000);
}

function cancelStory() {
  if (confirm('Are you sure you want to cancel this story? Your progress will be lost.')) {
    router.push('/surface/vibe');
  }
}

// Computed properties
const currentStepData = computed(() => {
  return storyData.value?.story.steps[currentStep.value] || null;
});

const totalSteps = computed(() => {
  return storyData.value?.story.steps.length || 0;
});

const progressText = computed(() => {
  return `Step ${currentStep.value + 1} / ${totalSteps.value}`;
});

const progressPercentage = computed(() => {
  return ((currentStep.value + 1) / totalSteps.value) * 100;
});

const showBackButton = computed(() => {
  return storyData.value?.story.navigation.back && currentStep.value > 0;
});

const showCancelButton = computed(() => {
  return storyData.value?.story.navigation.cancel;
});

const showProgress = computed(() => {
  return storyData.value?.story.navigation.progress === 'visible';
});

// Initialize
onMounted(() => {
  loadStory();
});

// Keyboard navigation
function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    handleContinue();
  } else if (event.key === 'Escape' && showCancelButton.value) {
    cancelStory();
  }
}

// Add keyboard event listener
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

// Clean up event listener
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <div class="space-y-6" @keydown="handleKeyDown" tabindex="0">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-cyan-400">📖 Story Surface</h2>
      <div class="flex items-center space-x-2">
        <span class="text-sm">Status:</span>
        <span
          class="px-2 py-1 rounded text-xs font-semibold"
          :class="{
            'bg-gray-600 text-gray-300': storyStatus === 'idle',
            'bg-yellow-600 text-yellow-100': storyStatus === 'loading',
            'bg-green-600 text-green-100': storyStatus === 'active',
            'bg-blue-600 text-blue-100': storyStatus === 'completed',
            'bg-red-600 text-red-100': storyStatus === 'error'
          }"
        >
          {{ storyStatus.toUpperCase() }}
        </span>
      </div>
    </div>

    <!-- Progress -->
    <div v-if="showProgress && storyData" class="bg-gray-800 border border-gray-700 rounded-lg p-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-400">Progress:</span>
          <span class="text-sm font-semibold text-cyan-400">{{ progressText }}</span>
        </div>
        <div class="w-full max-w-xs ml-4">
          <div class="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              class="h-full bg-cyan-400 rounded-full"
              :style="{ width: progressPercentage + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Story Content -->
    <div v-if="storyData && currentStepData" class="bg-gray-800 border border-gray-700 rounded-lg p-6 min-h-96">
      <!-- Presentation Step -->
      <div v-if="currentStepData.type === 'presentation'" class="space-y-4">
        <h3 class="text-xl font-bold text-white">{{ currentStepData.title }}</h3>
        <div class="prose prose-invert max-w-none">
          <div v-html="markdownToHtml(currentStepData.content)"></div>
        </div>
      </div>

      <!-- Input Step -->
      <div v-if="currentStepData.type === 'input'" class="space-y-4">
        <h3 class="text-xl font-bold text-white">{{ currentStepData.title }}</h3>
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-300">{{ currentStepData.label }}</label>
          <input
            :id="currentStepData.id"
            type="text"
            :placeholder="currentStepData.placeholder || ''"
            class="w-full bg-gray-700 text-white px-3 py-2 rounded border-none focus:ring-2 focus:ring-cyan-400"
            :required="currentStepData.required"
          >
          <p v-if="currentStepData.required" class="text-xs text-gray-400">* Required</p>
        </div>
      </div>

      <!-- Single Choice Step -->
      <div v-if="currentStepData.type === 'single_choice'" class="space-y-4">
        <h3 class="text-xl font-bold text-white">{{ currentStepData.title }}</h3>
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-300">{{ currentStepData.label }}</label>
          <div class="space-y-2">
            <button
              v-for="option in currentStepData.options"
              :key="option.value"
              @click="handleChoiceSelection(option.value, currentStepData.id)"
              class="w-full text-left p-3 rounded border border-gray-600 hover:border-cyan-400"
              :class="{
                'border-cyan-400 bg-gray-700': userResponses[currentStepData.id] === option.value,
                'border-gray-600 bg-gray-800': userResponses[currentStepData.id] !== option.value
              }"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- Multi Choice Step -->
      <div v-if="currentStepData.type === 'multi_choice'" class="space-y-4">
        <h3 class="text-xl font-bold text-white">{{ currentStepData.title }}</h3>
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-300">{{ currentStepData.label }}</label>
          <p class="text-xs text-gray-400">Press Space to toggle, Enter to continue</p>
          <div class="space-y-2">
            <button
              v-for="option in currentStepData.options"
              :key="option.value"
              @click="handleMultiChoiceToggle(option.value, currentStepData.id)"
              class="w-full text-left p-3 rounded border border-gray-600 hover:border-cyan-400"
              :class="{
                'border-cyan-400 bg-gray-700': userResponses[currentStepData.id] && userResponses[currentStepData.id].includes(option.value),
                'border-gray-600 bg-gray-800': !userResponses[currentStepData.id] || !userResponses[currentStepData.id].includes(option.value)
              }"
            >
              <span class="flex items-center">
                <span class="mr-2">
                  <span v-if="userResponses[currentStepData.id] && userResponses[currentStepData.id].includes(option.value)">✓</span>
                  <span v-else>▢</span>
                </span>
                {{ option.label }}
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Stars Step -->
      <div v-if="currentStepData.type === 'stars'" class="space-y-4">
        <h3 class="text-xl font-bold text-white">{{ currentStepData.title }}</h3>
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-300">{{ currentStepData.label }}</label>
          <div class="flex space-x-1">
            <button
              v-for="star in Array(currentStepData.max).fill(0)"
              :key="star"
              @click="handleStarRating(star + 1, currentStepData.id)"
              class="text-2xl"
              :class="{
                'text-yellow-400': (userResponses[currentStepData.id] || 0) >= star + 1,
                'text-gray-400': (userResponses[currentStepData.id] || 0) < star + 1
              }"
            >
              ★
            </button>
          </div>
          <p class="text-xs text-gray-400">Use Left/Right arrows to select, Enter to confirm</p>
        </div>
      </div>

      <!-- Scale Step -->
      <div v-if="currentStepData.type === 'scale'" class="space-y-4">
        <h3 class="text-xl font-bold text-white">{{ currentStepData.title }}</h3>
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-300">{{ currentStepData.label }}</label>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-400">{{ currentStepData.min }}</span>
            <div class="flex-1">
              <input
                type="range"
                :min="currentStepData.min"
                :max="currentStepData.max"
                v-model="userResponses[currentStepData.id]"
                @input="handleScaleRating(parseInt($event.target.value), currentStepData.id)"
                class="w-full"
              >
            </div>
            <span class="text-sm text-gray-400">{{ currentStepData.max }}</span>
          </div>
          <div class="text-center">
            <span class="text-lg font-semibold">{{ userResponses[currentStepData.id] || currentStepData.value || currentStepData.min }}</span>
          </div>
          <p class="text-xs text-gray-400">Use Left/Right arrows to select, Enter to confirm</p>
        </div>
      </div>
    </div>

    <!-- Action Row -->
    <div class="flex justify-between items-center">
      <div>
        <button
          v-if="showBackButton"
          @click="goBack"
          class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
        >
          ← Back
        </button>
      </div>
      <div class="flex space-x-2">
        <button
          v-if="showCancelButton && storyStatus !== 'completed'"
          @click="cancelStory"
          class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Cancel
        </button>
        <button
          @click="handleContinue"
          :disabled="isSubmitting"
          class="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-600"
        >
          <span v-if="storyStatus === 'completed'">✅ Complete</span>
          <span v-else-if="currentStep.value === totalSteps - 1">Continue</span>
          <span v-else>Continue →</span>
        </button>
      </div>
    </div>

    <!-- Keyboard Hints -->
    <div class="bg-gray-800 border border-gray-700 rounded-lg p-3">
      <h4 class="text-sm font-semibold text-gray-400 mb-2">Keyboard Controls</h4>
      <div class="flex space-x-4 text-xs text-gray-400">
        <span>Enter: Continue</span>
        <span v-if="showCancelButton">Esc: Cancel</span>
        <span v-if="currentStepData?.type === 'multi_choice'">Space: Toggle</span>
        <span v-if="['stars', 'scale'].includes(currentStepData?.type)">←/→: Select</span>
      </div>
    </div>

    <!-- Debug Info (for development) -->
    <div v-if="false" class="bg-gray-800 border border-gray-700 rounded-lg p-3 text-xs">
      <h4 class="font-semibold text-gray-400 mb-2">Debug Info</h4>
      <pre class="text-gray-500 overflow-auto">{{ userResponses }}</pre>
    </div>
  </div>
</template>

<script lang="ts">
// Simple markdown to HTML converter for presentation content
export function markdownToHtml(markdown: string): string {
  if (!markdown) return '';
  
  // Convert headers
  let html = markdown
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
    .replace(/^##### (.*$)/gm, '<h5>$1</h5>')
    .replace(/^###### (.*$)/gm, '<h6>$1</h6>');
  
  // Convert paragraphs (lines separated by blank lines)
  html = html.replace(/([^\n])\n\n/g, '$1</p><p>');
  html = html.replace(/^([^\n]+)$/gm, '<p>$1</p>');
  
  // Convert bold and italic
  html = html
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    .replace(/___(.*?)___/g, '<strong><em>$1</em></strong>');
  
  // Convert links
  html = html.replace(/\\[([^\]]+)\]\\(([^\)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
  
  // Convert code blocks
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Convert lists
  html = html.replace(/^\* (.*$)/gm, '<li>$1</li>');
  html = html.replace(/^\- (.*$)/gm, '<li>$1</li>');
  html = html.replace(/^\d\. (.*$)/gm, '<li>$1</li>');
  // html = html.replace(/<li>(.*?)<\/li>/g, '<li>$1</li>');
  // html = html.replace(/((<li>.*<\/li>)+)/g, '<ul>$1</ul>');
  
  return html;
}

// Keyboard navigation cleanup
function onUnmounted() {
  window.removeEventListener('keydown', handleKeyDown);
}
</script>

<style scoped>
/* Step transitions */
.slide-enter-active, .slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Input focus styles */
input:focus, textarea:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.5);
}

/* Button hover effects */
button:hover:not(:disabled) {
  transform: translateY(-1px);
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* Star rating */
.star-rating {
  font-size: 2rem;
}

/* Range input styling */
input[type="range"] {
  -webkit-appearance: none;
  width: 100%;
  height: 6px;
  background: #4a5568;
  border-radius: 3px;
  outline: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: #3b82f6;
  border-radius: 50%;
  cursor: pointer;
}

/* Progress bar */
.progress-bar {
  height: 6px;
  background: #4a5568;
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: #3b82f6;
  transition: width 0.3s ease;
}
</style>