<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Browser Surface State
const browserStatus = ref<'idle' | 'loading' | 'active' | 'error'>('idle');
const currentUrl = ref('');
const iframeKey = ref(0);
const historyStack = ref<string[]>([]);
const currentHistoryIndex = ref(-1);

// Available browser surfaces
const availableSurfaces = ref([
  { id: 'teletext-console', title: 'Teletext Console', url: 'http://localhost:3000/surface/teletext-console' },
  { id: 'github-theme', title: 'GitHub Theme', url: 'http://localhost:3000/surface/github-theme' },
  { id: 'nes-classic', title: 'NES Classic', url: 'http://localhost:3000/surface/nes-classic' },
  { id: 'bedstead-modern', title: 'Bedstead Modern', url: 'http://localhost:3000/surface/bedstead-modern' },
  { id: 'vault-browser', title: 'Vault Browser', url: 'http://localhost:5176/surface/vault' },
  { id: 'workflow-engine', title: 'Workflow Engine', url: 'http://localhost:5176/surface/workflow' },
  { id: 'mcp-bridge', title: 'MCP Bridge', url: 'http://localhost:5176/surface/mcp' },
  { id: 'dev-dashboard', title: 'Dev Dashboard', url: 'http://localhost:5176/surface/dev' }
]);

// Navigation functions
function navigateTo(url: string) {
  currentUrl.value = url;
  iframeKey.value++;
  
  // Update history
  if (currentHistoryIndex.value < historyStack.value.length - 1) {
    // If we're not at the end of history, truncate forward history
    historyStack.value = historyStack.value.slice(0, currentHistoryIndex.value + 1);
  }
  historyStack.value.push(url);
  currentHistoryIndex.value = historyStack.value.length - 1;
}

function goBack() {
  if (currentHistoryIndex.value > 0) {
    currentHistoryIndex.value--;
    currentUrl.value = historyStack.value[currentHistoryIndex.value];
    iframeKey.value++;
  }
}

function goForward() {
  if (currentHistoryIndex.value < historyStack.value.length - 1) {
    currentHistoryIndex.value++;
    currentUrl.value = historyStack.value[currentHistoryIndex.value];
    iframeKey.value++;
  }
}

function refresh() {
  iframeKey.value++;
}

// Surface selection
function openSurface(surfaceId: string) {
  const surface = availableSurfaces.value.find(s => s.id === surfaceId);
  if (surface) {
    navigateTo(surface.url);
  }
}

// Initialize
onMounted(() => {
  // Set default URL
  const defaultSurface = availableSurfaces.value[0];
  if (defaultSurface) {
    navigateTo(defaultSurface.url);
  }
  browserStatus.value = 'active';
});

// Computed properties
const canGoBack = computed(() => currentHistoryIndex.value > 0);
const canGoForward = computed(() => currentHistoryIndex.value < historyStack.value.length - 1);
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-cyan-400">🌐 Browser Surface</h2>
      <div class="flex items-center space-x-2">
        <span class="text-sm">Status:</span>
        <span
          class="px-2 py-1 rounded text-xs font-semibold"
          :class="{
            'bg-gray-600 text-gray-300': browserStatus === 'idle',
            'bg-yellow-600 text-yellow-100': browserStatus === 'loading',
            'bg-green-600 text-green-100': browserStatus === 'active',
            'bg-red-600 text-red-100': browserStatus === 'error'
          }"
        >
          {{ browserStatus.toUpperCase() }}
        </span>
      </div>
    </div>

    <!-- Navigation Controls -->
    <div class="bg-gray-800 border border-gray-700 rounded-lg p-3">
      <div class="flex items-center space-x-2">
        <button
          @click="goBack"
          :disabled="!canGoBack"
          class="p-2 bg-gray-700 rounded hover:bg-gray-600 disabled:bg-gray-600 disabled:opacity-50"
          title="Go Back"
        >
          ←
        </button>
        <button
          @click="goForward"
          :disabled="!canGoForward"
          class="p-2 bg-gray-700 rounded hover:bg-gray-600 disabled:bg-gray-600 disabled:opacity-50"
          title="Go Forward"
        >
          →
        </button>
        <button
          @click="refresh"
          class="p-2 bg-gray-700 rounded hover:bg-gray-600"
          title="Refresh"
        >
          🔄
        </button>
        <input
          type="text"
          v-model="currentUrl"
          @keyup.enter="navigateTo(currentUrl)"
          class="flex-1 bg-gray-700 text-white px-3 py-2 rounded border-none focus:ring-2 focus:ring-cyan-400 text-sm"
          placeholder="Enter URL..."
        >
        <button
          @click="navigateTo(currentUrl)"
          class="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          title="Go"
        >
          →
        </button>
      </div>
    </div>

    <!-- Browser Frame -->
    <div class="flex-1">
      <div class="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden" style="height: calc(100vh - 300px);">
        <iframe
          :key="iframeKey"
          :src="currentUrl"
          class="w-full h-full border-none"
          allowfullscreen
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        ></iframe>
      </div>
    </div>

    <!-- Surface Presets -->
    <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <h3 class="text-lg font-semibold text-cyan-400 mb-3">🎯 Surface Presets</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
        <button
          v-for="surface in availableSurfaces"
          :key="surface.id"
          @click="openSurface(surface.id)"
          class="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm text-left"
        >
          {{ surface.title }}
        </button>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-2 gap-4">
      <button
        @click="openSurface('teletext-console')"
        class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded text-left"
      >
        📺 Teletext Console
      </button>
      <button
        @click="openSurface('github-theme')"
        class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded text-left"
      >
        🎨 GitHub Theme
      </button>
      <button
        @click="openSurface('vault-browser')"
        class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded text-left"
      >
        🗄️ Vault Browser
      </button>
      <button
        @click="openSurface('dev-dashboard')"
        class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded text-left"
      >
        🔧 Dev Dashboard
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Iframe styling */
iframe {
  background: white;
}

/* Disabled button state */
button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>