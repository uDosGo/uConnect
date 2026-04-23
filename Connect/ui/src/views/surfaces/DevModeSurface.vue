<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Dev Mode State
const devModeEnabled = ref<boolean>(false);
const devModeStatus = ref<'idle' | 'loading' | 'active' | 'error'>('idle');
const devModeConfig = ref<any>(null);
const isUpdatingConfig = ref<boolean>(false);

// UI Settings
const uiSettings = ref({
  show_mcp_tools_editor: false,
  show_rate_limits_panel: false,
  show_mistral_dev_chat: false,
  show_webhook_config: false,
  show_advanced_sections: false,
  dev_mode_badge: false
});

// Dangerous Actions Settings
const dangerousActions = ref({
  require_confirmation: true,
  log_actions: true
});

// Mistral Chat Configuration
const mistralConfig = ref({
  general_chat: {
    system_prompt: 'You are a helpful assistant for uDosConnect.',
    model: 'mistral',
    context_window: 4096
  },
  dev_chat: {
    system_prompt: 'You are a dev assistant for uDosConnect with access to advanced tools.',
    model: 'mistral',
    context_window: 8192
  }
});

// Load Dev Mode Configuration
async function loadDevConfig() {
  devModeStatus.value = 'loading';
  try {
    const response = await fetch('/dev_mode_config.json');
    if (response.ok) {
      devModeConfig.value = await response.json();
      uiSettings.value = devModeConfig.value.dev_mode.ui_settings;
      dangerousActions.value = devModeConfig.value.dev_mode.dangerous_actions;
      mistralConfig.value = devModeConfig.value.mistral_chat;
      devModeEnabled.value = devModeConfig.value.dev_mode.enabled;
      devModeStatus.value = 'active';
    } else {
      devModeStatus.value = 'error';
      console.error('Failed to load dev mode config');
    }
  } catch (error) {
    devModeStatus.value = 'error';
    console.error('Error loading dev mode config:', error);
  }
}

// Save Dev Mode Configuration
async function saveDevConfig() {
  isUpdatingConfig.value = true;
  try {
    const updatedConfig = {
      ...devModeConfig.value,
      dev_mode: {
        ...devModeConfig.value.dev_mode,
        enabled: devModeEnabled.value,
        ui_settings: uiSettings.value,
        dangerous_actions: dangerousActions.value
      },
      mistral_chat: mistralConfig.value
    };

    // In a real implementation, this would save to the server
    console.log('Saving dev config:', updatedConfig);
    
    // For now, we'll just update the local state
    devModeConfig.value = updatedConfig;
    
    // Show success message
    alert('✅ Dev Mode configuration saved successfully!');
  } catch (error) {
    console.error('Error saving dev config:', error);
    alert('❌ Error saving configuration: ' + error.message);
  } finally {
    isUpdatingConfig.value = false;
  }
}

// Toggle Dev Mode
async function toggleDevMode() {
  const newState = !devModeEnabled.value;
  
  if (newState) {
    // Enable Dev Mode
    const confirm = window.confirm('⚠️ Are you sure you want to enable Dev Mode? This will show all advanced features.');
    if (!confirm) return;
  } else {
    // Disable Dev Mode
    const confirm = window.confirm('🔒 Are you sure you want to disable Dev Mode? This will hide all advanced features.');
    if (!confirm) return;
  }
  
  devModeEnabled.value = newState;
  
  // Update UI settings based on dev mode state
  const newUiSettings = {
    show_mcp_tools_editor: newState,
    show_rate_limits_panel: newState,
    show_mistral_dev_chat: newState,
    show_webhook_config: newState,
    show_advanced_sections: newState,
    dev_mode_badge: newState
  };
  
  uiSettings.value = newUiSettings;
  
  await saveDevConfig();
}

// Execute Dev Command
async function execDevCommand(cmd: string) {
  try {
    const response = await fetch('http://localhost:5175/api/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: cmd })
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert(`✅ Command executed successfully:\n\n${data.output}`);
    } else {
      alert(`❌ Error executing command:\n\n${data.error || 'Unknown error'}`);
    }
  } catch (error) {
    alert(`❌ Error: ${error.message}`);
  }
}

// Initialize
onMounted(() => {
  loadDevConfig();
});

// Watch for changes in UI settings
watch(uiSettings, (newSettings) => {
  if (devModeConfig.value) {
    saveDevConfig();
  }
}, { deep: true });

watch(dangerousActions, (newActions) => {
  if (devModeConfig.value) {
    saveDevConfig();
  }
}, { deep: true });

watch(mistralConfig, (newConfig) => {
  if (devModeConfig.value) {
    saveDevConfig();
  }
}, { deep: true });
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-cyan-400">🔧 Dev Mode Dashboard</h2>
      <div class="flex items-center space-x-2">
        <span class="text-sm">Dev Mode:</span>
        <button
          @click="toggleDevMode"
          class="relative inline-flex items-center h-6 rounded-full w-11 focus:outline-none"
          :class="{
            'bg-green-500': devModeEnabled,
            'bg-gray-600': !devModeEnabled
          }"
        >
          <span
            class="inline-block w-4 h-4 transform bg-white rounded-full transition-transform"
            :class="{
              'translate-x-6': devModeEnabled,
              'translate-x-1': !devModeEnabled
            }"
          />
        </button>
        <span class="text-sm font-semibold" :class="{
          'text-green-400': devModeEnabled,
          'text-gray-400': !devModeEnabled
        }">
          {{ devModeEnabled ? 'ON' : 'OFF' }}
        </span>
        <span v-if="devModeEnabled" class="bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">
          ⚠️ DEV MODE ACTIVE
        </span>
      </div>
    </div>

    <!-- Status -->
    <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <div class="flex items-center space-x-2 mb-2">
        <span class="text-gray-400">Status:</span>
        <span
          class="px-2 py-1 rounded text-xs font-semibold"
          :class="{
            'bg-gray-600 text-gray-300': devModeStatus === 'idle',
            'bg-yellow-600 text-yellow-100': devModeStatus === 'loading',
            'bg-green-600 text-green-100': devModeStatus === 'active',
            'bg-red-600 text-red-100': devModeStatus === 'error'
          }"
        >
          {{ devModeStatus.toUpperCase() }}
        </span>
      </div>
      <div v-if="devModeStatus === 'active'" class="text-sm text-gray-300">
        Configuration loaded successfully
      </div>
      <div v-if="devModeStatus === 'error'" class="text-sm text-red-400">
        Failed to load configuration
      </div>
    </div>

    <!-- UI Settings Panel -->
    <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <h3 class="text-lg font-semibold text-cyan-400 mb-4">🎨 UI Settings</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex items-center justify-between">
          <label class="text-sm text-gray-300">MCP Tools Editor</label>
          <input
            type="checkbox"
            v-model="uiSettings.show_mcp_tools_editor"
            class="rounded focus:ring-cyan-400"
            :disabled="!devModeEnabled"
          >
        </div>
        
        <div class="flex items-center justify-between">
          <label class="text-sm text-gray-300">Rate Limits Panel</label>
          <input
            type="checkbox"
            v-model="uiSettings.show_rate_limits_panel"
            class="rounded focus:ring-cyan-400"
            :disabled="!devModeEnabled"
          >
        </div>
        
        <div class="flex items-center justify-between">
          <label class="text-sm text-gray-300">Mistral Dev Chat</label>
          <input
            type="checkbox"
            v-model="uiSettings.show_mistral_dev_chat"
            class="rounded focus:ring-cyan-400"
            :disabled="!devModeEnabled"
          >
        </div>
        
        <div class="flex items-center justify-between">
          <label class="text-sm text-gray-300">Webhook Configuration</label>
          <input
            type="checkbox"
            v-model="uiSettings.show_webhook_config"
            class="rounded focus:ring-cyan-400"
            :disabled="!devModeEnabled"
          >
        </div>
        
        <div class="flex items-center justify-between">
          <label class="text-sm text-gray-300">Advanced Sections</label>
          <input
            type="checkbox"
            v-model="uiSettings.show_advanced_sections"
            class="rounded focus:ring-cyan-400"
            :disabled="!devModeEnabled"
          >
        </div>
        
        <div class="flex items-center justify-between">
          <label class="text-sm text-gray-300">Dev Mode Badge</label>
          <input
            type="checkbox"
            v-model="uiSettings.dev_mode_badge"
            class="rounded focus:ring-cyan-400"
            :disabled="!devModeEnabled"
          >
        </div>
      </div>
    </div>

    <!-- Dangerous Actions Panel -->
    <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <h3 class="text-lg font-semibold text-cyan-400 mb-4">⚠️ Dangerous Actions</h3>
      
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <label class="text-sm text-gray-300">Require Confirmation</label>
            <p class="text-xs text-gray-400">Prompt before executing dangerous actions</p>
          </div>
          <input
            type="checkbox"
            v-model="dangerousActions.require_confirmation"
            class="rounded focus:ring-cyan-400"
            :disabled="!devModeEnabled"
          >
        </div>
        
        <div class="flex items-center justify-between">
          <div>
            <label class="text-sm text-gray-300">Log Actions</label>
            <p class="text-xs text-gray-400">Record dangerous actions to log file</p>
          </div>
          <input
            type="checkbox"
            v-model="dangerousActions.log_actions"
            class="rounded focus:ring-cyan-400"
            :disabled="!devModeEnabled"
          >
        </div>
      </div>
    </div>

    <!-- Mistral Chat Configuration -->
    <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <h3 class="text-lg font-semibold text-cyan-400 mb-4">🤖 Mistral Chat Configuration</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- General Chat -->
        <div class="bg-gray-700 rounded-lg p-3">
          <h4 class="text-sm font-semibold text-blue-400 mb-2">General Chat</h4>
          <div class="space-y-2">
            <div>
              <label class="text-xs text-gray-400 block mb-1">System Prompt</label>
              <textarea
                v-model="mistralConfig.general_chat.system_prompt"
                class="w-full bg-gray-600 text-white px-2 py-1 rounded text-xs"
                rows="2"
                :disabled="!devModeEnabled"
              ></textarea>
            </div>
            <div>
              <label class="text-xs text-gray-400 block mb-1">Model</label>
              <select
                v-model="mistralConfig.general_chat.model"
                class="w-full bg-gray-600 text-white px-2 py-1 rounded text-xs"
                :disabled="!devModeEnabled"
              >
                <option value="mistral">mistral</option>
                <option value="mistral-large">mistral-large</option>
                <option value="claude-3-opus">claude-3-opus</option>
              </select>
            </div>
            <div>
              <label class="text-xs text-gray-400 block mb-1">Context Window</label>
              <input
                type="number"
                v-model="mistralConfig.general_chat.context_window"
                class="w-full bg-gray-600 text-white px-2 py-1 rounded text-xs"
                :disabled="!devModeEnabled"
              >
            </div>
          </div>
        </div>
        
        <!-- Dev Chat -->
        <div class="bg-gray-700 rounded-lg p-3">
          <h4 class="text-sm font-semibold text-green-400 mb-2">Dev Chat</h4>
          <div class="space-y-2">
            <div>
              <label class="text-xs text-gray-400 block mb-1">System Prompt</label>
              <textarea
                v-model="mistralConfig.dev_chat.system_prompt"
                class="w-full bg-gray-600 text-white px-2 py-1 rounded text-xs"
                rows="2"
                :disabled="!devModeEnabled"
              ></textarea>
            </div>
            <div>
              <label class="text-xs text-gray-400 block mb-1">Model</label>
              <select
                v-model="mistralConfig.dev_chat.model"
                class="w-full bg-gray-600 text-white px-2 py-1 rounded text-xs"
                :disabled="!devModeEnabled"
              >
                <option value="mistral">mistral</option>
                <option value="mistral-large">mistral-large</option>
                <option value="claude-3-opus">claude-3-opus</option>
              </select>
            </div>
            <div>
              <label class="text-xs text-gray-400 block mb-1">Context Window</label>
              <input
                type="number"
                v-model="mistralConfig.dev_chat.context_window"
                class="w-full bg-gray-600 text-white px-2 py-1 rounded text-xs"
                :disabled="!devModeEnabled"
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-2 gap-4">
      <button
        @click="execDevCommand('udo dev status')"
        class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded text-left"
        :disabled="!devModeEnabled"
      >
        🔍 Check Dev Status
      </button>
      <button
        @click="execDevCommand('udo dev exec mistral-prompt-edit --tool=custom_parser')"
        class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded text-left"
        :disabled="!devModeEnabled"
      >
        ✏️ Edit Mistral Prompt
      </button>
      <button
        @click="execDevCommand('udo gui demos')"
        class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded text-left"
        :disabled="!devModeEnabled"
      >
        🎨 Show USXD Demos
      </button>
      <button
        @click="execDevCommand('udo publish preview')"
        class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded text-left"
        :disabled="!devModeEnabled"
      >
        📄 Publish Preview
      </button>
    </div>

    <!-- Save Button -->
    <div class="flex justify-end">
      <button
        @click="saveDevConfig"
        :disabled="isUpdatingConfig"
        class="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-600"
      >
        <span v-if="isUpdatingConfig">🔄 Saving...</span>
        <span v-else>💾 Save Configuration</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Toggle switch animation */
.translate-x-6 {
  transform: translateX(1.5rem);
}

.translate-x-1 {
  transform: translateX(0.25rem);
}

/* Disabled state */
input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

textarea:disabled, select:disabled, input:disabled {
  background-color: #4a5568 !important;
  cursor: not-allowed;
}
</style>