<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

const vaultItems = ref<{name: string; type: string; size: string; modified: string}[]>([]);
const isLoading = ref<boolean>(true);
const searchQuery = ref<string>('');

// Load actual vault contents
onMounted(() => {
  loadVaultContents();
});

async function loadVaultContents() {
  try {
    isLoading.value = true;
    
    // Try to load from actual vault via API
    const response = await fetch('http://localhost:5175/api/vault/list');
    if (response.ok) {
      const data = await response.json();
      vaultItems.value = data.map((item: any) => ({
        name: item.name,
        type: item.type || 'file',
        size: formatSize(item.size),
        modified: formatDate(item.modified)
      }));
    } else {
      // Fallback to default vault structure
      vaultItems.value = [
        { name: 'README.md', type: 'markdown', size: '2.4 KB', modified: '2026-04-17' },
        { name: 'config.json', type: 'json', size: '1.2 KB', modified: '2026-04-16' },
        { name: 'workflows/', type: 'directory', size: '-', modified: '2026-04-15' },
        { name: 'surfaces/', type: 'directory', size: '-', modified: '2026-04-14' },
        { name: 'templates/', type: 'directory', size: '-', modified: '2026-04-13' },
      ];
    }
  } catch (error) {
    console.error('Failed to load vault:', error);
    vaultItems.value = [
      { name: 'README.md', type: 'markdown', size: '2.4 KB', modified: '2026-04-17' },
      { name: 'config.json', type: 'json', size: '1.2 KB', modified: '2026-04-16' },
    ];
  } finally {
    isLoading.value = false;
  }
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '-';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  } catch {
    return 'Unknown';
  }
}

const filteredItems = computed(() => {
  if (!searchQuery.value) return vaultItems.value;
  return vaultItems.value.filter(item => 
    item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

async function openItem(item: any) {
  if (item.type === 'directory') {
    alert(`Opening directory: ${item.name}`);
  } else {
    alert(`Opening file: ${item.name}`);
  }
}

async function createDirectory() {
  const name = prompt('Enter directory name:');
  if (!name) return;
  
  try {
    const response = await fetch('http://localhost:5175/api/vault/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert(`Directory created: ${data.path}`);
      await loadVaultContents(); // Refresh list
    } else {
      alert(`Failed to create directory: ${data.error}`);
    }
  } catch (error) {
    alert(`Failed to create directory: ${error.message}`);
  }
}

async function syncVault() {
  try {
    const response = await fetch('http://localhost:5175/api/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: 'udo vault sync' })
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert(`Vault synced successfully:\n${data.output}`);
      await loadVaultContents(); // Refresh list
    } else {
      alert(`Vault sync failed:\n${data.error}`);
    }
  } catch (error) {
    alert(`Vault sync failed:\n${error.message}`);
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-cyan-400">📁 Vault Browser</h2>
      <div class="flex items-center space-x-2">
        <input
          v-model="searchQuery"
          placeholder="Search vault..."
          class="bg-gray-700 text-white px-3 py-1 rounded text-sm w-64"
        >
        <button class="px-3 py-1 bg-blue-600 text-white rounded text-sm">
          🔍 Search
        </button>
      </div>
    </div>
    
    <div v-if="isLoading" class="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
      <p class="mt-2 text-gray-400">Loading vault contents...</p>
    </div>
    
    <div v-else class="space-y-4">
      <div class="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-700">
            <tr>
              <th class="text-left p-3 text-sm text-gray-300">Name</th>
              <th class="text-left p-3 text-sm text-gray-300">Type</th>
              <th class="text-left p-3 text-sm text-gray-300">Size</th>
              <th class="text-left p-3 text-sm text-gray-300">Modified</th>
              <th class="text-left p-3 text-sm text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="item in filteredItems"
              :key="item.name"
              class="border-t border-gray-700 hover:bg-gray-700 transition-colors"
              @click="openItem(item)"
            >
              <td class="p-3">
                <div class="flex items-center space-x-2">
                  <span class="text-cyan-400">
                    {{ item.type === 'directory' ? '📁' : '📄' }}
                  </span>
                  <span>{{ item.name }}</span>
                </div>
              </td>
              <td class="p-3 text-sm text-gray-400">{{ item.type }}</td>
              <td class="p-3 text-sm text-gray-400">{{ item.size }}</td>
              <td class="p-3 text-sm text-gray-400">{{ item.modified }}</td>
              <td class="p-3">
                <button @click.stop="openItem(item)" class="text-blue-400 hover:text-blue-300">Open</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="grid grid-cols-3 gap-4">
        <button @click="createDirectory" class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded text-left">
          📁 Create Directory
        </button>
        <button class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded text-left">
          📄 Upload File
        </button>
        <button @click="syncVault" class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded text-left">
          🔄 Sync Vault
        </button>
      </div>
    </div>
  </div>
</template>
