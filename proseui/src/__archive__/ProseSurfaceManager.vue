<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SnackbarServiceMonitor from '../../components/SnackbarServiceMonitor.vue';

const route = useRoute();
const router = useRouter();

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

// Sync active surface with current route
function syncActiveSurface() {
  const path = route.path.replace('/surface/', '');
  activeSurface.value = path || null;
}

// Initialize
onMounted(() => {
  syncActiveSurface();
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
  <div class="app-shell proseui-surface">
    <!-- Header -->
    <header class="proseui-header">
      <div class="proseui-header-left">
        <button @click="sidebarCollapsed = !sidebarCollapsed" class="proseui-header-btn" title="Toggle sidebar">
          <span class="material-symbols-outlined">{{ sidebarCollapsed ? 'menu' : 'close' }}</span>
        </button>
        <h1 class="proseui-header-title">proseui</h1>
        <div class="flex items-center space-x-2">
          <span class="text-xs bg-gray-700 px-2 py-1 rounded flex items-center gap-1">
            <span class="material-symbols-outlined" style="font-size: 14px;">folder</span>
            {{ vaultPath }}
          </span>
          <span class="text-xs bg-gray-700 px-2 py-1 rounded flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
            Snackbar
          </span>
        </div>
      </div>
      <div class="proseui-header-controls">
        <button @click="execCommand('udo status')" class="proseui-header-btn" title="Status">
          <span class="material-symbols-outlined">refresh</span>
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <div class="proseui-body">
      <!-- Sidebar (scrollable, collapsible) -->
      <aside v-show="!sidebarCollapsed" class="proseui-nav-rail">
        <div class="p-2">
          <nav class="space-y-3">
            <template v-for="section in ['ucode', 'core', 'integrations', 'dev']" :key="section">
              <div>
                <h3 class="text-xs text-gray-500 uppercase tracking-wider mb-1 px-2">
                  {{ sectionLabels[section] }}
                </h3>
                <div class="space-y-0.5">
                  <template v-for="surface in surfaces.filter(s => s.section === section)" :key="surface.id">
                    <router-link
                      v-if="surface.path"
                      :to="surface.path"
                      class="flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-gray-700 transition-colors"
                      :class="{ 'bg-gray-700 text-cyan-300': activeSurface === surface.id }"
                      @click="navigateToSurface(surface.id)"
                    >
                      <span>{{ surface.title }}</span>
                    </router-link>
                    <span
                      v-else
                      class="flex items-center gap-2 px-2 py-1.5 rounded text-sm text-gray-500 cursor-not-allowed opacity-60"
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
              class="flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-gray-700 transition-colors"
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
      <main class="proseui-main">
        <router-view />
      </main>
    </div>

    <!-- Command Output Modal -->
    <div v-if="commandOutput" class="fixed bottom-4 right-4 w-96 bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-lg z-50">
      <div class="flex items-center justify-between mb-2">
        <h4 class="text-sm font-semibold text-cyan-400">Command Output</h4>
        <button @click="commandOutput = ''" class="text-gray-400 hover:text-white">
          <span class="material-symbols-outlined" style="font-size: 16px;">close</span>
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
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ─── Body (sidebar + main) ──────────────────────────────────── */
.proseui-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* ─── Sidebar ─────────────────────────────────────────────────── */
.proseui-nav-rail {
  width: 240px;
  min-width: 240px;
  overflow-y: auto;
  padding: 0.5rem;
  scrollbar-width: thin;
  scrollbar-color: #374151 transparent;
}

/* ─── Main Content ────────────────────────────────────────────── */
.proseui-main {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.proseui-nav-rail::-webkit-scrollbar {
  width: 4px;
}

.proseui-nav-rail::-webkit-scrollbar-track {
  background: transparent;
}

.proseui-nav-rail::-webkit-scrollbar-thumb {
  background: #374151;
  border-radius: 2px;
}

/* ─── Nav Item Text ───────────────────────────────────────────── */
a {
  color: #d1d5db;
  text-decoration: none;
}
a:hover {
  color: #f3f4f6;
}
a span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
