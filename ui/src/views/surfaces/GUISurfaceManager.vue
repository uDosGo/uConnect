<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { udosThemeVarsFor } from '../themes/udos-themes';
type UdosThemeId = 'github' | 'nes' | 'bedstead' | 'c64';

const route = useRoute();
const router = useRouter();

// Theme management
const currentTheme = ref<UdosThemeId>('github');
const themeVars = computed(() => udosThemeVarsFor(currentTheme.value));

// Surface state
const surfaces = ref<{id: string; title: string; path: string}[]>([]);
const activeSurface = ref<string | null>(null);

// Command execution
const commandOutput = ref<string>('');
const isExecuting = ref<boolean>(false);

async function execCommand(cmd: string) {
  isExecuting.value = true;
  commandOutput.value = `Executing: ${cmd}\n`;
  
  try {
    // Simulate command execution
    await new Promise(resolve => setTimeout(resolve, 500));
    commandOutput.value += `✅ Command completed: ${cmd}`;
  } catch (error) {
    commandOutput.value += `❌ Error: ${error}`;
  } finally {
    isExecuting.value = false;
  }
}

// Surface navigation
function navigateToSurface(surfaceId: string) {
  activeSurface.value = surfaceId;
  router.push(`/surface/${surfaceId}`);
}

// Initialize surfaces
onMounted(() => {
  surfaces.value = [
    { id: 'vibe', title: 'Vibe TUI', path: '/surface/vibe' },
    { id: 'vault', title: 'Vault Browser', path: '/surface/vault' },
    { id: 'github', title: 'GitHub Sync', path: '/surface/github' },
    { id: 'wordpress', title: 'WordPress Adaptor', path: '/surface/wordpress' },
    { id: 'usxd', title: 'USXD Renderer', path: '/surface/usxd' },
    { id: 'workflow', title: 'Workflow Engine', path: '/surface/workflow' },
    { id: 'mcp', title: 'MCP Bridge', path: '/surface/mcp' },
    { id: 'demos', title: 'Demo Surfaces', path: '/surface/demos' },
    { id: 'dev', title: 'Dev Mode Dashboard', path: '/surface/dev' },
    { id: 'browser', title: 'Browser Surface', path: '/surface/browser' },
    { id: 'story', title: 'Story Surface', path: '/surface/story' },
    { id: 'tools', title: 'MCP Tool Registry', path: '/surface/tools' },
    { id: 'dev-dashboard', title: 'Dev Mode Dashboard', path: '/surface/dev-dashboard' },
    { id: 'react-renderer', title: 'React Renderer', path: '/surface/react-renderer' },
  ];
});
</script>

<template>
  <div class="min-h-screen bg-gray-900 text-gray-100" :style="themeVars">
    <!-- Header -->
    <header class="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <h1 class="text-xl font-bold text-cyan-400">🎮 uDosConnect GUI</h1>
        <div class="flex items-center space-x-2">
          <span class="text-xs bg-gray-700 px-2 py-1 rounded">Vault: ~/vault</span>
          <span class="text-sm text-gray-400">Theme:</span>
          <select v-model="currentTheme" class="bg-gray-700 text-white px-2 py-1 rounded text-sm">
            <option value="github">GitHub</option>
            <option value="nes">NES</option>
            <option value="bedstead">Bedstead</option>
            <option value="c64">C64</option>
          </select>
        </div>
      </div>
      <div class="flex items-center space-x-2">
        <button @click="execCommand('udo status')" class="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
          🔄 Status
        </button>
        <button @click="execCommand('udo vibe')" class="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
          🌀 Vibe TUI
        </button>
      </div>
    </header>
    
    <!-- Main Content -->
    <div class="flex flex-1">
      <!-- Sidebar -->
      <aside class="w-64 bg-gray-800 border-r border-gray-700 p-4">
        <nav class="space-y-1">
          <router-link
            v-for="surface in surfaces"
            :key="surface.id"
            :to="surface.path"
            class="block px-3 py-2 rounded text-sm hover:bg-gray-700"
            :class="{ 'bg-gray-700': activeSurface === surface.id }"
            @click="navigateToSurface(surface.id)"
          >
            {{ surface.title }}
          </router-link>
        </nav>
        
        <div class="mt-6 pt-4 border-t border-gray-700">
          <h3 class="text-xs text-gray-400 uppercase tracking-wider mb-2">Quick Commands</h3>
          <div class="space-y-1 text-sm">
            <button @click="execCommand('udo list')" class="w-full text-left px-3 py-1 rounded hover:bg-gray-700">
              📁 udo list
            </button>
            <button @click="execCommand('udo github status')" class="w-full text-left px-3 py-1 rounded hover:bg-gray-700">
              🌐 udo github status
            </button>
            <button @click="execCommand('udo wp status')" class="w-full text-left px-3 py-1 rounded hover:bg-gray-700">
              🌍 udo wp status
            </button>
            <button @click="execCommand('udo usxd list')" class="w-full text-left px-3 py-1 rounded hover:bg-gray-700">
              🎨 udo usxd list
            </button>
            <button @click="execCommand('udo workflow list')" class="w-full text-left px-3 py-1 rounded hover:bg-gray-700">
              ⚙️ udo workflow list
            </button>
            <button @click="execCommand('udo dev status')" class="w-full text-left px-3 py-1 rounded hover:bg-gray-700">
              🔧 udo dev status
            </button>
            <button @click="execCommand('udo tools list')" class="w-full text-left px-3 py-1 rounded hover:bg-gray-700">
              🛠️ udo tools list
            </button>
            <button @click="execCommand('udo dev-dashboard')" class="w-full text-left px-3 py-1 rounded hover:bg-gray-700">
              🎮 udo dev-dashboard
            </button>
            <button @click="execCommand('udo react-renderer')" class="w-full text-left px-3 py-1 rounded hover:bg-gray-700">
              🌐 udo react-renderer
            </button>
          </div>
        </div>
        
        <div class="mt-6 pt-4 border-t border-gray-700">
          <h3 class="text-xs text-gray-400 uppercase tracking-wider mb-2">Localhost Services</h3>
          <div class="space-y-1 text-sm">
            <a href="http://localhost:5176" target="_blank" class="block px-3 py-1 rounded hover:bg-gray-700">
              🎮 GUI Dashboard (5176)
            </a>
            <a href="http://localhost:5175" target="_blank" class="block px-3 py-1 rounded hover:bg-gray-700">
              🔌 API Server (5175)
            </a>
            <a href="http://localhost:3000" target="_blank" class="block px-3 py-1 rounded hover:bg-gray-700">
              🎨 USXD Express (3000)
            </a>
            <a href="http://localhost:5173" target="_blank" class="block px-3 py-1 rounded hover:bg-gray-700">
              🌐 Vite Dev Server (5173)
            </a>
          </div>
        </div>
        
        <div class="mt-6 pt-4 border-t border-gray-700">
          <h3 class="text-xs text-gray-400 uppercase tracking-wider mb-2">USXD Surfaces</h3>
          <div class="space-y-1 text-sm">
            <a href="http://localhost:3000/surface/teletext-console" target="_blank" class="block px-3 py-1 rounded hover:bg-gray-700">
              📺 Teletext Console
            </a>
            <a href="http://localhost:3000/surface/github-theme" target="_blank" class="block px-3 py-1 rounded hover:bg-gray-700">
              🎨 GitHub Theme
            </a>
            <a href="http://localhost:3000/surface/nes-classic" target="_blank" class="block px-3 py-1 rounded hover:bg-gray-700">
              🎮 NES Classic
            </a>
            <a href="http://localhost:3000/surface/bedstead-modern" target="_blank" class="block px-3 py-1 rounded hover:bg-gray-700">
              🏠 Bedstead Modern
            </a>
          </div>
        </div>
      </aside>
      
      <!-- Main View -->
      <main class="flex-1 p-6">
        <router-view />
      </main>
    </div>
    
    <!-- Command Output Modal -->
    <div v-if="commandOutput" class="fixed bottom-4 right-4 w-80 bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-lg">
      <div class="flex items-center justify-between mb-2">
        <h4 class="text-sm font-semibold text-cyan-400">Command Output</h4>
        <button @click="commandOutput = ''" class="text-gray-400 hover:text-white">
          ✕
        </button>
      </div>
      <pre class="text-xs text-gray-300 overflow-auto max-h-40">{{ commandOutput }}</pre>
      <div v-if="isExecuting" class="mt-2 flex items-center space-x-2">
        <div class="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
        <span class="text-xs text-yellow-400">Executing...</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Surface transitions */
.router-link-exact-active {
  background-color: rgba(59, 130, 246, 0.2);
}

/* Theme-specific overrides */
:deep(.theme-github) {
  --uv-surface: #161b22;
}

:deep(.theme-nes) {
  --uv-surface: #5040a0;
}
</style>
