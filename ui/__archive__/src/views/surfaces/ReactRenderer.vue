<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// React Renderer State
const renderer = ref({
  url: 'about:blank',
  history: [] as string[],
  currentIndex: -1,
  iframeKey: 0,
  surfaces: [
    { id: 'vibe', url: 'http://localhost:5176/surface/vibe' },
    { id: 'vault', url: 'http://localhost:5176/surface/vault' },
    { id: 'github', url: 'http://localhost:5176/surface/github' },
    { id: 'wordpress', url: 'http://localhost:5176/surface/wordpress' },
    { id: 'usxd', url: 'http://localhost:5176/surface/usxd' },
    { id: 'workflow', url: 'http://localhost:5176/surface/workflow' },
    { id: 'mcp', url: 'http://localhost:5176/surface/mcp' },
    { id: 'demos', url: 'http://localhost:5176/surface/demos' },
    { id: 'dev', url: 'http://localhost:5176/surface/dev' },
    { id: 'browser', url: 'http://localhost:5176/surface/browser' },
    { id: 'story', url: 'http://localhost:5176/surface/story' },
    { id: 'tools', url: 'http://localhost:5176/surface/tools' }
  ]
})

// Navigation functions
function navigateTo(url: string) {
  renderer.value.history.push(url)
  renderer.value.currentIndex = renderer.value.history.length - 1
  renderer.value.url = url
  renderer.value.iframeKey++
}

function goBack() {
  if (renderer.value.currentIndex > 0) {
    renderer.value.currentIndex--
    renderer.value.url = renderer.value.history[renderer.value.currentIndex]
    renderer.value.iframeKey++
  }
}

function goForward() {
  if (renderer.value.currentIndex < renderer.value.history.length - 1) {
    renderer.value.currentIndex++
    renderer.value.url = renderer.value.history[renderer.value.currentIndex]
    renderer.value.iframeKey++
  }
}

function refresh() {
  renderer.value.iframeKey++
}

// Lifecycle
onMounted(() => {
  // Set default URL
  if (renderer.value.surfaces.length > 0) {
    navigateTo(renderer.value.surfaces[0].url)
  }
})

onUnmounted(() => {
  // Cleanup
})
</script>

<template>
  <div class="react-renderer">
    <!-- Header -->
    <header class="renderer-header">
      <h1>🌐 React Renderer</h1>
      <div class="renderer-controls">
        <button @click="goBack" :disabled="renderer.currentIndex <= 0" class="control-btn">
          ← Back
        </button>
        <button @click="goForward" :disabled="renderer.currentIndex >= renderer.history.length - 1" class="control-btn">
          → Forward
        </button>
        <button @click="refresh" class="control-btn">
          🔄 Refresh
        </button>
      </div>
    </header>

    <!-- Browser Frame -->
    <div class="browser-frame">
      <iframe
        :key="renderer.iframeKey"
        :src="renderer.url"
        class="browser-iframe"
        allowfullscreen
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
      ></iframe>
    </div>

    <!-- Surface Presets -->
    <div class="surface-presets">
      <h3>Surface Presets</h3>
      <div class="preset-grid">
        <button
          v-for="surface in renderer.surfaces"
          :key="surface.id"
          @click="navigateTo(surface.url)"
          class="preset-btn"
        >
          {{ surface.id }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.react-renderer {
  min-height: 100vh;
  padding: 1rem;
  background: #0a0a0a;
  color: #e2e8f0;
  font-family: 'Monaspace', 'SF Mono', monospace;
}

.renderer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #1e293b;
}

.renderer-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #60a5fa;
}

.renderer-controls {
  display: flex;
  gap: 0.5rem;
}

.control-btn {
  padding: 0.5rem 1rem;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 0.25rem;
  color: #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.control-btn:hover:not(:disabled) {
  background: #334155;
  border-color: #475569;
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.browser-frame {
  height: calc(100vh - 200px);
  margin-bottom: 1rem;
  border: 1px solid #334155;
  border-radius: 0.5rem;
  overflow: hidden;
}

.browser-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: white;
}

.surface-presets {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 0.5rem;
  padding: 1rem;
}

.surface-presets h3 {
  margin-bottom: 1rem;
  color: #9ca3af;
  font-size: 0.875rem;
  text-transform: uppercase;
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.5rem;
}

.preset-btn {
  padding: 0.5rem;
  background: #334155;
  border: 1px solid #475569;
  border-radius: 0.25rem;
  color: #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.preset-btn:hover {
  background: #475569;
  border-color: #64748b;
}
</style>