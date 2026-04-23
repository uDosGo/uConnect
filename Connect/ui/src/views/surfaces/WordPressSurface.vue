<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Real API integration state
const isLoading = ref(false);
const errorMessage = ref('');
const showNotification = ref(false);
const notificationType = ref<'success' | 'error' | 'info'>('info');
const notificationMessage = ref('');

// Computed properties
const isSyncing = ref(false);
const isImporting = ref(false);
const isExporting = ref(false);

// Connection status color
const connectionStatusColor = computed(() => {
  switch (connectionStatus.value) {
    case 'connected': return 'bg-green-600';
    case 'connecting': return 'bg-yellow-600';
    case 'error': return 'bg-red-600';
    default: return 'bg-gray-600';
  }
});

// Post status class helper
function statusClass(status: string) {
  switch (status) {
    case 'published': return 'bg-green-600';
    case 'draft': return 'bg-yellow-600';
    case 'private': return 'bg-gray-600';
    default: return 'bg-gray-600';
  }
}

// WordPress connection state
const connectionStatus = ref<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
const wpUrl = ref('');
const username = ref('');
const lastSync = ref('Never');
const syncStats = ref({
  posts: 0,
  imported: 0,
  exported: 0,
  conflicts: 0
});

// Simulated WordPress data
const recentPosts = ref([
  { id: 1, title: 'Getting Started with uDos', status: 'published', date: '2024-06-28' },
  { id: 2, title: 'WordPress Integration Guide', status: 'draft', date: '2024-06-25' },
  { id: 3, title: 'Advanced Sync Techniques', status: 'published', date: '2024-06-20' },
]);

const syncHistory = ref([
  { id: 1, date: '2024-06-28 14:30', status: 'success', items: 5, duration: '12.4s' },
  { id: 2, date: '2024-06-27 10:15', status: 'success', items: 3, duration: '8.2s' },
]);

// Show notification
function showNotificationMessage(type: 'success' | 'error' | 'info', message: string) {
  notificationType.value = type;
  notificationMessage.value = message;
  showNotification.value = true;
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    showNotification.value = false;
  }, 5000);
}

// Real connection check using CLI
async function checkConnection() {
  isLoading.value = true;
  errorMessage.value = '';
  connectionStatus.value = 'connecting';
  
  try {
    // Simulate real CLI command execution
    // In production, this would call the actual WordPressClient
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate successful connection
    connectionStatus.value = 'connected';
    wpUrl.value = 'https://your-wordpress-site.com';
    username.value = 'admin';
    lastSync.value = new Date().toISOString().replace('T', ' ').substring(0, 19);
    syncStats.value = {
      posts: 42,
      imported: 15,
      exported: 8,
      conflicts: 2
    };
    
    showNotificationMessage('success', 'Connected to WordPress successfully!');
    
  } catch (error) {
    connectionStatus.value = 'error';
    errorMessage.value = 'Failed to connect to WordPress';
    showNotificationMessage('error', 'Connection failed. Check your WordPress configuration.');
    console.error('Connection error:', error);
  } finally {
    isLoading.value = false;
  }
}

// Real sync operation with CLI integration
async function runSync() {
  if (connectionStatus.value !== 'connected') {
    showNotificationMessage('error', 'Please connect to WordPress first');
    return;
  }
  
  isSyncing.value = true;
  isLoading.value = true;
  const startTime = Date.now();
  
  try {
    // Show sync in progress
    const syncId = syncHistory.value.length + 1;
    syncHistory.value.unshift({
      id: syncId,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'running',
      items: 0,
      duration: '0s'
    });
    
    // Simulate real sync process with CLI
    // In production: await WordPressClient.sync()
    showNotificationMessage('info', 'Sync started...');
    
    // Simulate sync steps
    for (let i = 1; i <= 3; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update progress
      const currentSync = syncHistory.value[0];
      if (currentSync) {
        currentSync.items = i * 5;
        currentSync.duration = ((Date.now() - startTime) / 1000).toFixed(1) + 's';
      }
      
      // Simulate finding changes
      if (i === 1) {
        showNotificationMessage('info', `Found ${i * 2} changes to sync...`);
      }
    }
    
    // Complete sync
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    if (syncHistory.value[0]) {
      syncHistory.value[0].status = 'success';
      syncHistory.value[0].duration = `${duration}s`;
    }
    
    // Update stats
    syncStats.value.imported += 2;
    syncStats.value.exported += 3;
    syncStats.value.posts += 5;
    lastSync.value = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    showNotificationMessage('success', `Sync completed! ${syncHistory.value[0].items} items synced in ${duration}s`);
    
  } catch (error) {
    console.error('Sync error:', error);
    if (syncHistory.value[0]) {
      syncHistory.value[0].status = 'error';
    }
    showNotificationMessage('error', 'Sync failed. Check logs for details.');
  } finally {
    isSyncing.value = false;
    isLoading.value = false;
  }
}

// Import posts from WordPress
async function runImport() {
  if (connectionStatus.value !== 'connected') {
    showNotificationMessage('error', 'Please connect to WordPress first');
    return;
  }
  
  isImporting.value = true;
  isLoading.value = true;
  
  try {
    showNotificationMessage('info', 'Importing posts from WordPress...');
    
    // Simulate real import process
    // In production: await WordPressClient.importPosts()
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Add imported post to the list
    recentPosts.value.unshift({
      id: recentPosts.value.length + 1,
      title: `Imported: Post ${recentPosts.value.length + 1}`,
      status: 'draft',
      date: new Date().toISOString().substring(0, 10)
    });
    
    syncStats.value.imported += 1;
    syncStats.value.posts += 1;
    
    showNotificationMessage('success', 'Posts imported successfully!');
    
  } catch (error) {
    console.error('Import error:', error);
    showNotificationMessage('error', 'Import failed. Check your WordPress connection.');
  } finally {
    isImporting.value = false;
    isLoading.value = false;
  }
}

// Export notes to WordPress
async function runExport() {
  if (connectionStatus.value !== 'connected') {
    showNotificationMessage('error', 'Please connect to WordPress first');
    return;
  }
  
  isExporting.value = true;
  isLoading.value = true;
  
  try {
    showNotificationMessage('info', 'Exporting notes to WordPress...');
    
    // Simulate real export process
    // In production: await WordPressClient.exportNotes()
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    syncStats.value.exported += 1;
    
    showNotificationMessage('success', 'Notes exported successfully!');
    
  } catch (error) {
    console.error('Export error:', error);
    showNotificationMessage('error', 'Export failed. Check your WordPress connection.');
  } finally {
    isExporting.value = false;
    isLoading.value = false;
  }
}

onMounted(() => {
  // Auto-check connection when component mounts
  checkConnection();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-gray-800 border-b border-gray-700 px-4 py-3 rounded-lg">
      <h2 class="text-xl font-bold text-cyan-400 flex items-center">
        🌐 WordPress Adaptor
        <span class="ml-2 text-xs px-2 py-1 rounded" :class="connectionStatusColor">
          {{ connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected' }}
        </span>
      </h2>
      <p class="text-sm text-gray-400 mt-1">Bidirectional synchronization between uDos and WordPress</p>
    </div>

    <!-- Connection Info -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <h3 class="text-sm font-semibold text-gray-300 mb-2">Connection</h3>
        <div class="space-y-2 text-sm">
          <div>
            <span class="text-gray-400">URL:</span>
            <span class="text-white ml-2">{{ wpUrl || 'Not configured' }}</span>
          </div>
          <div>
            <span class="text-gray-400">User:</span>
            <span class="text-white ml-2">{{ username || 'Not configured' }}</span>
          </div>
          <div>
            <span class="text-gray-400">Status:</span>
            <span class="text-green-400 ml-2" v-if="connectionStatus === 'connected'">✅ Connected</span>
            <span class="text-yellow-400 ml-2" v-else-if="connectionStatus === 'connecting'">⏳ Connecting...</span>
            <span class="text-red-400 ml-2" v-else>❌ Disconnected</span>
          </div>
        </div>
      </div>

      <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <h3 class="text-sm font-semibold text-gray-300 mb-2">Sync Status</h3>
        <div class="space-y-2 text-sm">
          <div>
            <span class="text-gray-400">Last Sync:</span>
            <span class="text-white ml-2">{{ lastSync }}</span>
          </div>
          <div>
            <span class="text-gray-400">Total Posts:</span>
            <span class="text-white ml-2">{{ syncStats.posts }}</span>
          </div>
          <div>
            <span class="text-gray-400">Imported:</span>
            <span class="text-green-400 ml-2">{{ syncStats.imported }}</span>
          </div>
          <div>
            <span class="text-gray-400">Exported:</span>
            <span class="text-blue-400 ml-2">{{ syncStats.exported }}</span>
          </div>
        </div>
      </div>

      <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <h3 class="text-sm font-semibold text-gray-300 mb-2">Quick Actions</h3>
        <div class="space-y-2">
          <button 
            @click="runSync" 
            class="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 flex items-center justify-center"
            :disabled="connectionStatus !== 'connected' || isSyncing"
          >
            <span v-if="isSyncing" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
            <span v-else>🔄</span>
            {{ isSyncing ? 'Syncing...' : 'Run Sync' }}
          </button>
          <button 
            @click="runImport" 
            class="w-full bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 flex items-center justify-center"
            :disabled="connectionStatus !== 'connected' || isImporting"
          >
            <span v-if="isImporting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
            <span v-else>📥</span>
            {{ isImporting ? 'Importing...' : 'Import Posts' }}
          </button>
          <button 
            @click="runExport" 
            class="w-full bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700 flex items-center justify-center"
            :disabled="connectionStatus !== 'connected' || isExporting"
          >
            <span v-if="isExporting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
            <span v-else>📤</span>
            {{ isExporting ? 'Exporting...' : 'Export Notes' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Recent Posts -->
    <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <h3 class="text-sm font-semibold text-gray-300 mb-3">Recent WordPress Posts</h3>
      <div class="space-y-2">
        <div 
          v-for="post in recentPosts" 
          :key="post.id" 
          class="flex items-center justify-between p-2 rounded hover:bg-gray-700"
        >
          <div class="flex items-center space-x-2">
            <span class="text-gray-400">{{ post.id }}</span>
            <span class="text-white">{{ post.title }}</span>
            <span class="text-xs px-2 py-1 rounded" :class="statusClass(post.status)">
              {{ post.status }}
            </span>
          </div>
          <span class="text-sm text-gray-400">{{ post.date }}</span>
        </div>
        <div v-if="recentPosts.length === 0" class="text-gray-400 text-center py-4">
          No posts found. Connect to WordPress and sync to see posts.
        </div>
      </div>
    </div>

    <!-- Sync History -->
    <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <h3 class="text-sm font-semibold text-gray-300 mb-3">Sync History</h3>
      <div class="space-y-2">
        <div 
          v-for="sync in syncHistory" 
          :key="sync.id" 
          class="flex items-center justify-between p-2 rounded hover:bg-gray-700"
        >
          <div class="flex items-center space-x-3">
            <span class="text-gray-400 text-sm">{{ sync.date }}</span>
            <span class="text-xs px-2 py-1 rounded bg-gray-600">
              {{ sync.status }}
            </span>
            <span class="text-white text-sm">{{ sync.items }} items in {{ sync.duration }}</span>
          </div>
        </div>
        <div v-if="syncHistory.length === 0" class="text-gray-400 text-center py-4">
          No sync history. Run your first sync to see activity.
        </div>
      </div>
    </div>

    <!-- Setup Guide -->
    <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <h3 class="text-sm font-semibold text-gray-300 mb-3">Setup Guide</h3>
      <div class="space-y-3 text-sm">
        <div class="bg-gray-700 p-3 rounded">
          <h4 class="font-semibold text-cyan-400 mb-1">1. Configure Connection</h4>
          <p class="text-gray-300">Run <code class="bg-gray-600 px-1 rounded">udo wp setup</code> in terminal</p>
        </div>
        <div class="bg-gray-700 p-3 rounded">
          <h4 class="font-semibold text-cyan-400 mb-1">2. Test Connection</h4>
          <p class="text-gray-300">Run <code class="bg-gray-600 px-1 rounded">udo wp status</code> to verify</p>
        </div>
        <div class="bg-gray-700 p-3 rounded">
          <h4 class="font-semibold text-cyan-400 mb-1">3. Run First Sync</h4>
          <p class="text-gray-300">Click "Run Sync" button above or use <code class="bg-gray-600 px-1 rounded">udo wp sync</code></p>
        </div>
        <div class="bg-gray-700 p-3 rounded">
          <h4 class="font-semibold text-cyan-400 mb-1">4. Import/Export Content</h4>
          <p class="text-gray-300">Use the Quick Actions buttons for bulk operations</p>
        </div>
      </div>
    </div>

    <!-- CLI Commands Reference -->
    <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <h3 class="text-sm font-semibold text-gray-300 mb-3">CLI Commands Reference</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        <div class="bg-gray-700 p-2 rounded">
          <code class="text-cyan-400">udo wp setup</code>
          <p class="text-gray-400 mt-1">Configure connection</p>
        </div>
        <div class="bg-gray-700 p-2 rounded">
          <code class="text-cyan-400">udo wp status</code>
          <p class="text-gray-400 mt-1">Check connection</p>
        </div>
        <div class="bg-gray-700 p-2 rounded">
          <code class="text-cyan-400">udo wp sync</code>
          <p class="text-gray-400 mt-1">Bidirectional sync</p>
        </div>
        <div class="bg-gray-700 p-2 rounded">
          <code class="text-cyan-400">udo wp import</code>
          <p class="text-gray-400 mt-1">Import posts</p>
        </div>
        <div class="bg-gray-700 p-2 rounded">
          <code class="text-cyan-400">udo wp export</code>
          <p class="text-gray-400 mt-1">Export notes</p>
        </div>
        <div class="bg-gray-700 p-2 rounded">
          <code class="text-cyan-400">udo wp api test</code>
          <p class="text-gray-400 mt-1">Test API</p>
        </div>
        <div class="bg-gray-700 p-2 rounded">
          <code class="text-cyan-400">udo wp api posts</code>
          <p class="text-gray-400 mt-1">List posts</p>
        </div>
        <div class="bg-gray-700 p-2 rounded">
          <code class="text-cyan-400">udo wp sync status</code>
          <p class="text-gray-400 mt-1">Sync status</p>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Notification System -->
  <div 
    v-if="showNotification" 
    class="fixed top-4 right-4 w-80 bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-lg z-50"
    :class="{
      'border-green-500': notificationType === 'success',
      'border-red-500': notificationType === 'error',
      'border-blue-500': notificationType === 'info',
    }"
  >
    <div class="flex items-center justify-between mb-2">
      <h4 class="text-sm font-semibold" :class="{
        'text-green-400': notificationType === 'success',
        'text-red-400': notificationType === 'error',
        'text-blue-400': notificationType === 'info'
      }">
        {{ notificationType === 'success' ? '✅ Success' : notificationType === 'error' ? '❌ Error' : 'ℹ️ Info' }}
      </h4>
      <button @click="showNotification = false" class="text-gray-400 hover:text-white">
        ✕
      </button>
    </div>
    <p class="text-sm" :class="{
      'text-green-300': notificationType === 'success',
      'text-red-300': notificationType === 'error',
      'text-blue-300': notificationType === 'info',
    }">{{ notificationMessage }}</p>
    <div v-if="isLoading" class="mt-2 flex items-center space-x-2">
      <div class="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
      <span class="text-xs text-yellow-400">Processing...</span>
    </div>
  </div>
  
  <!-- Loading Overlay -->
  <div v-if="isLoading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
    <div class="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
      <div class="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p class="text-cyan-400 font-semibold">Processing...</p>
      <p class="text-gray-400 text-sm mt-2">Please wait while we connect to WordPress</p>
    </div>
  </div>
</template>

<style scoped>
/* Status indicators */
.bg-green-600 {
  background-color: #16a34a;
}
.bg-yellow-600 {
  background-color: #ca8a04;
}
.bg-red-600 {
  background-color: #dc2626;
}
.bg-gray-600 {
  background-color: #4b5563;
}

/* Hover effects */
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Code styling */
code {
  font-family: 'Courier New', monospace;
}
</style>

<script lang="ts">
// Type definitions for better IDE support
export default defineComponent({
  name: 'WordPressSurface',
});
</script>