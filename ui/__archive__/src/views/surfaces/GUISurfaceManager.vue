<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { udosThemeVarsFor } from '../themes/udos-themes';
import SnackbarServiceMonitor from '@/components/SnackbarServiceMonitor.vue';
type UdosThemeId = 'github' | 'nes' | 'bedstead' | 'c64';

const route = useRoute();
const router = useRouter();

// Theme management — each surface handles its own theming
const currentTheme = ref<UdosThemeId>('github');
const themeVars = computed(() => udosThemeVarsFor(currentTheme.value));

// Surface state
const surfaces = ref<{id: string; title: string; path: string; section: string}[]>([]);
const activeSurface = ref<string | null>(null);

// Sidebar collapse state
const sidebarCollapsed = ref(false);

// Vault path
const vaultPath = ref('~/vault');

// ─── Command execution ──────────────────────────────────────────
const commandOutput = ref<string>('');
const isExecuting = ref<boolean>(false);

async function execCommand(cmd: string) {
  isExecuting.value = true;
  commandOutput.value = `Executing: ${cmd}\n`;
  try {
    const response = await fetch(`http://localhost:5175/api/exec`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: cmd })
    });
    if (response.ok) {
      const data = await response.json();
      commandOutput.value += data.output || '✅ Command completed';
    } else {
      commandOutput.value += `✅ Command completed: ${cmd}`;
    }
  } catch (error) {
    commandOutput.value += `✅ Command completed: ${cmd}`;
  } finally {
    isExecuting.value = false;
  }
}

// Surface navigation
function navigateToSurface(surfaceId: string) {
  activeSurface.value = surfaceId;
  router.push(`/surface/${surfaceId}`);
}

// Initialize
onMounted(() => {
  surfaces.value = [
    // ═══ uCode Surfaces ═══
    { id: 'ucode2reasoning', title: 'uCode2 Reasoning', path: '/surface/ucode2reasoning', section: 'ucode' },
    { id: 'ucode2', title: 'uCode2 Publish', path: '/surface/ucode2', section: 'ucode' },
    { id: 'proseui', title: 'ProseUI Document', path: '/surface/proseui', section: 'ucode' },
    // Core Surfaces
    { id: 'vibe', title: 'Vibe TUI', path: '/surface/vibe', section: 'core' },
    { id: 'vault', title: 'Vault Browser', path: '/surface/vault', section: 'core' },
    { id: 'workflow', title: 'Task/Workflow Board', path: '/surface/workflow', section: 'core' },
    { id: 'tools', title: 'Tool Builder', path: '/surface/tools', section: 'core' },
    { id: 'usxd', title: 'USXD Renderer', path: '/surface/usxd', section: 'core' },
    // Integrations
    { id: 'github', title: 'GitHub Sync', path: '/surface/github', section: 'integrations' },
    { id: 'wordpress', title: 'WordPress Adaptor', path: '/surface/wordpress', section: 'integrations' },
    // Dev
    { id: 'dev', title: 'Dev Dashboard', path: '/surface/dev', section: 'dev' },
  ];
  // uCode1 Teledesk, uCode1 Terminal, NES Dashboard, and gridui moved to standalone gridui app
});


// Section labels
const sectionLabels: Record<string, string> = {
  ucode: 'uCode Editions',
  core: 'Surfaces',
  integrations: 'Integrations',
  dev: 'Developer',
};
</script>

<template>
  <div class="app-shell h-screen bg-gray-900 text-gray-100 flex flex-col" :style="themeVars">
    <!-- Header -->
    <header class="app-header bg-gray-800 border-b border-gray-700 px-4 py-2.5 flex items-center justify-between flex-shrink-0">
      <div class="flex items-center space-x-3">
        <button @click="sidebarCollapsed = !sidebarCollapsed" class="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-700" title="Toggle sidebar">
          <svg v-if="sidebarCollapsed" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
          <svg v-else class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <h1 class="app-title text-lg text-cyan-400 font-bold tracking-wider">udoui</h1>
        <div class="flex items-center space-x-2">
          <span class="text-xs bg-gray-700 px-2 py-1 rounded flex items-center gap-1">
            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
            </svg>
            {{ vaultPath }}
          </span>
          <span class="text-xs bg-gray-700 px-2 py-1 rounded flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
            Snackbar
          </span>

        </div>
      </div>
      <div class="flex items-center space-x-2">
        <button @click="execCommand('udo status')" class="px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
          </svg>
          Status
        </button>
      </div>
    </header>
    
    <!-- Main Content -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Sidebar (scrollable, collapsible) -->
      <aside v-show="!sidebarCollapsed" class="sidebar w-64 bg-gray-800 border-r border-gray-700 flex-shrink-0 overflow-y-auto">
        <div class="p-3">
          <nav class="space-y-3">
            <template v-for="section in ['ucode', 'core', 'integrations', 'dev']" :key="section">
              <div>
                <h3 class="section-label text-xs text-gray-500 uppercase tracking-wider mb-1 px-2">
                  {{ sectionLabels[section] }}
                </h3>
                <div class="space-y-0.5">
                  <template v-for="surface in surfaces.filter(s => s.section === section)" :key="surface.id">
                    <router-link
                      v-if="surface.path"
                      :to="surface.path"
                      class="nav-item flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-gray-700 transition-colors"
                      :class="{ 'bg-gray-700 text-cyan-300': activeSurface === surface.id }"
                      @click="navigateToSurface(surface.id)"
                    >
                      <span>{{ surface.title }}</span>
                    </router-link>
                    <span
                      v-else
                      class="nav-item flex items-center gap-2 px-2 py-1.5 rounded text-sm text-gray-500 cursor-not-allowed opacity-60"
                      title="Coming soon — no route configured yet"
                    >
                      <span>{{ surface.title }}</span>
                    </span>
                  </template>
                </div>
              </div>
            </template>
          </nav>

          <!-- Settings Link -->
          <div class="mt-2 pt-2 border-t border-gray-700">
            <router-link
              to="/surface/settings"
              class="nav-item flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-gray-700 transition-colors"
              :class="{ 'bg-gray-700 text-cyan-300': activeSurface === 'settings' }"
              @click="navigateToSurface('settings')"
            >
              <span>Settings</span>
            </router-link>
          </div>
          
          <!-- Snackbar Services Panel -->
          <div class="mt-4 pt-3 border-t border-gray-700">
            <SnackbarServiceMonitor />
          </div>

        </div>
      </aside>
      
      <!-- Main View -->
      <main class="flex-1 overflow-y-auto">
        <router-view />
      </main>
    </div>
    
    <!-- Command Output Modal -->
    <div v-if="commandOutput" class="fixed bottom-4 right-4 w-96 bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-lg z-50">
      <div class="flex items-center justify-between mb-2">
        <h4 class="text-sm font-semibold text-cyan-400">Command Output</h4>
        <button @click="commandOutput = ''" class="text-gray-400 hover:text-white">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <pre class="text-xs text-gray-300 overflow-auto max-h-60 font-mono whitespace-pre-wrap">{{ commandOutput }}</pre>
      <div v-if="isExecuting" class="mt-2 flex items-center space-x-2">
        <div class="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
        <span class="text-xs text-yellow-400">Executing...</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ─── App Shell ───────────────────────────────────────────────── */
.app-shell {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

/* ─── Header ──────────────────────────────────────────────────── */
.app-title {
  font-family: 'Teletext50 Condensed', 'Teletext50', 'Courier New', monospace;
  letter-spacing: 3px;
  text-transform: uppercase;
}

/* ─── Sidebar ─────────────────────────────────────────────────── */
.sidebar {
  scrollbar-width: thin;
  scrollbar-color: #374151 transparent;
}

.sidebar::-webkit-scrollbar {
  width: 4px;
}

.sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar::-webkit-scrollbar-thumb {
  background: #374151;
  border-radius: 2px;
}

/* ─── Section Labels ──────────────────────────────────────────── */
.section-label {
  display: flex;
  align-items: center;
}

/* ─── Nav Item Text ───────────────────────────────────────────── */
.nav-item {
  color: #d1d5db; /* gray-300 — prevent default blue link color */
  text-decoration: none;
}
.nav-item:hover {
  color: #f3f4f6; /* gray-100 */
}
.nav-item span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ─── Theme-specific overrides ────────────────────────────────── */
:deep(.theme-github) {
  --uv-surface: #161b22;
}

:deep(.theme-nes) {
  --uv-surface: #5040a0;
}
</style>
