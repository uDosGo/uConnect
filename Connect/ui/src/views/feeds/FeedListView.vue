<template>
  <div class="feed-list-view">
    <!-- Loading Overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>Loading feeds...</p>
    </div>
    
    <!-- Notification Banner -->
    <div v-if="error" class="notification-banner" :class="{
      'notification-banner--error': error.includes('Failed') || error.includes('Error'),
      'notification-banner--success': !error.includes('Failed') && !error.includes('Error') && !error.includes('Please')
    }">
      <p>{{ error }}</p>
      <button @click="error = null" class="notification-dismiss">×</button>
    </div>
    
    <!-- Sync Status Indicator -->
    <div class="sync-status" :class="`sync-status--${syncStatus}`">
      <span class="sync-status__icon">
        {{ syncStatus === 'success' ? '✓' : syncStatus === 'syncing' ? '…' : syncStatus === 'error' ? '!' : '⚠' }}
      </span>
      <span class="sync-status__text">
        {{ syncStatus === 'success' ? 'Synced' : 
           syncStatus === 'syncing' ? 'Syncing...' : 
           syncStatus === 'error' ? 'Sync Error' : 'Idle' }}
      </span>
    </div>
    
    <!-- Feed Header -->
    <div class="feed-header">
      <h2>Feeds</h2>
      <div class="feed-actions">
        <button @click="showFilePicker = true" class="add-feed-btn">
          + Add Feed
        </button>
        <button @click="refreshFeeds" class="refresh-btn">
          🔄 Refresh
        </button>
      </div>
    </div>

    <!-- Feed List -->
    <div class="feed-list">
      <div v-for="feed in feeds" :key="feed.id" class="feed-item" :class="{ 'feed-item--selected': selectedFeedId === feed.id }" @click="selectFeed(feed.id)">
        <div class="feed-item__header">
          <h3 class="feed-item__title">{{ feed.title }}</h3>
          <span class="feed-item__type" :class="`feed-item__type--${feed.type}`">{{ feed.type }}</span>
        </div>
        <div class="feed-item__meta">
          <span class="feed-item__url">{{ feed.url }}</span>
          <span class="feed-item__updated">{{ feed.updated }}</span>
        </div>
        <div class="feed-item__actions">
          <button @click.stop="editFeed(feed.id)" class="feed-item__edit">Edit</button>
          <button @click.stop="deleteFeed(feed.id)" class="feed-item__delete">Delete</button>
        </div>
      </div>
    </div>

    <!-- File Picker Modal -->
    <div v-if="showFilePicker" class="file-picker-modal">
      <div class="file-picker-overlay" @click="showFilePicker = false"></div>
      <div class="file-picker-container">
        <FilePicker
          title="Select Feed File"
          :files="mockFiles"
          :multiple="false"
          @selected="addFeedFromFile"
          @close="showFilePicker = false"
        />
      </div>
    </div>

    <!-- Feed Editor Sidebar -->
    <div v-if="selectedFeed" class="feed-sidebar">
      <div class="sidebar-header">
        <h3>Feed Details</h3>
        <button @click="closeSidebar" class="close-btn">×</button>
      </div>
      <div class="sidebar-section">
        <label>Title</label>
        <input v-model="selectedFeed.title" @change="updateFeedField(selectedFeed.id, 'title', selectedFeed.title)" />
      </div>
      <div class="sidebar-section">
        <label>Type</label>
        <select v-model="selectedFeed.type" @change="updateFeedField(selectedFeed.id, 'type', selectedFeed.type)">
          <option value="rss">RSS</option>
          <option value="atom">Atom</option>
          <option value="json">JSON</option>
        </select>
      </div>
      <div class="sidebar-section">
        <label>URL</label>
        <input v-model="selectedFeed.url" @change="updateFeedField(selectedFeed.id, 'url', selectedFeed.url)" />
      </div>
      <div class="sidebar-section">
        <label>Attachments</label>
        <div class="attachments-list">
          <div v-for="attachment in selectedFeed.attachments" :key="attachment.id" class="attachment-item">
            <span class="attachment-name">{{ attachment.name }}</span>
            <button @click="removeAttachment(attachment.id)" class="attachment-remove">×</button>
          </div>
          <button @click="showFilePicker = true" class="add-attachment-btn">
            + Add Attachment
          </button>
        </div>
      </div>
      <div class="sidebar-section">
        <label>Description</label>
        <textarea v-model="selectedFeed.description" @change="updateFeedField(selectedFeed.id, 'description', selectedFeed.description)"></textarea>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import FilePicker from '../../components/FilePicker.vue';
import { useRouter } from 'vue-router';

export default {
  name: 'FeedListView',
  components: {
    FilePicker
  },
  setup() {
    const router = useRouter();
    const isProduction = import.meta.env.PROD;
    const API_TIMEOUT = isProduction ? 10000 : 5000;
    
    // State management
    const isLoading = ref(false);
    const error = ref(null);
    const syncStatus = ref('idle'); // 'idle', 'syncing', 'success', 'error'
    // Feed data - would be loaded from API in production
    const feeds = ref([]);
    
    // Load feeds from API or use mock data
    const loadFeeds = async () => {
      try {
        isLoading.value = true;
        error.value = null;
        syncStatus.value = 'syncing';
        
        // Simulate API call with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
        
        // In a real app, this would be an actual API call
        // const response = await fetch(`${API_BASE_URL}/feeds`, { signal: controller.signal });
        // const data = await response.json();
        
        // Simulate API response
        await new Promise(resolve => setTimeout(resolve, isProduction ? 500 : 100));
        
        clearTimeout(timeoutId);
        
        // Mock data for demonstration
        feeds.value = [
          {
            id: 1,
            title: 'Tech News',
            type: 'rss',
            url: 'https://example.com/tech-feed.rss',
            updated: '2 hours ago',
            description: 'Latest technology news and updates',
            attachments: [],
            items: []
          },
          {
            id: 2,
            title: 'Design Blog',
            type: 'atom',
            url: 'https://example.com/design-feed.atom',
            updated: '1 day ago',
            description: 'Design inspiration and tutorials',
            attachments: [],
            items: []
          },
          {
            id: 3,
            title: 'uDos Dev Log',
            type: 'json',
            url: 'https://udos.example.com/dev-log.json',
            updated: '3 hours ago',
            description: 'uDos development updates',
            attachments: [],
            items: []
          }
        ];
        
        syncStatus.value = 'success';
        
      } catch (err) {
        console.error('Failed to load feeds:', err);
        error.value = isProduction 
          ? 'Failed to load feeds. Please check your connection.' 
          : 'Failed to load feeds. Using mock data.';
        syncStatus.value = 'error';
        
        // Fallback to mock data in development
        if (!isProduction) {
          feeds.value = [
            {
              id: 1,
              title: 'Tech News',
              type: 'rss',
              url: 'https://example.com/tech-feed.rss',
              updated: '2 hours ago',
              description: 'Latest technology news and updates',
              attachments: [],
              items: []
            },
            {
              id: 2,
              title: 'Design Blog',
              type: 'atom',
              url: 'https://example.com/design-feed.atom',
              updated: '1 day ago',
              description: 'Design inspiration and tutorials',
              attachments: [],
              items: []
            },
            {
              id: 3,
              title: 'uDos Dev Log',
              type: 'json',
              url: 'https://udos.example.com/dev-log.json',
              updated: '3 hours ago',
              description: 'uDos development updates',
              attachments: [],
              items: []
            }
          ];
        }
      } finally {
        isLoading.value = false;
      }
    };
    
    // Load feeds on component mount
    onMounted(loadFeeds);

    // Selected feed for sidebar
    const selectedFeedId = ref(null);
    const selectedFeed = computed(() => {
      return feeds.value.find(feed => feed.id === selectedFeedId.value) || null;
    });

    // File picker state
    const showFilePicker = ref(false);

    const mockFiles = ref([
      {
        id: '1',
        name: 'tech-feed.rss',
        type: 'file',
        path: '/feeds',
        size: '12 KB',
        date: 'Apr 15, 2026'
      },
      {
        id: '2',
        name: 'design-feed.atom',
        type: 'file',
        path: '/feeds',
        size: '8 KB',
        date: 'Apr 14, 2026'
      },
      {
        id: '3',
        name: 'dev-log.json',
        type: 'file',
        path: '/feeds',
        size: '15 KB',
        date: 'Apr 18, 2026'
      },
      {
        id: '4',
        name: 'all-feeds',
        type: 'folder',
        path: '/feeds',
        date: 'Apr 10, 2026'
      }
    ]);

    // Methods
    const selectFeed = (feedId) => {
      selectedFeedId.value = feedId;
    };

    const closeSidebar = () => {
      selectedFeedId.value = null;
    };

    const refreshFeeds = async () => {
      try {
        syncStatus.value = 'syncing';
        error.value = null;
        
        // Simulate API refresh with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
        
        // In a real app, this would refresh from the actual API
        await new Promise(resolve => setTimeout(resolve, isProduction ? 800 : 200));
        
        clearTimeout(timeoutId);
        
        // Update timestamps to simulate refresh
        feeds.value = feeds.value.map(feed => ({
          ...feed,
          updated: 'Just now'
        }));
        
        syncStatus.value = 'success';
        
        // Show success feedback in production
        if (isProduction) {
          error.value = 'Feeds refreshed successfully!';
          setTimeout(() => error.value = null, 3000);
        }
        
      } catch (err) {
        console.error('Failed to refresh feeds:', err);
        error.value = isProduction 
          ? 'Failed to refresh feeds. Please try again.' 
          : 'Failed to refresh feeds.';
        syncStatus.value = 'error';
        setTimeout(() => error.value = null, 5000);
      }
    };

    const editFeed = (feedId) => {
      selectedFeedId.value = feedId;
    };

    const deleteFeed = (feedId) => {
      const index = feeds.value.findIndex(feed => feed.id === feedId);
      if (index !== -1) {
        feeds.value.splice(index, 1);
        if (selectedFeedId.value === feedId) {
          closeSidebar();
        }
      }
    };

    const updateFeedField = (feedId, field, value) => {
      const feed = feeds.value.find(f => f.id === feedId);
      if (feed) {
        feed[field] = value;
      }
    };

    const addFeedFromFile = async (file) => {
      try {
        syncStatus.value = 'syncing';
        error.value = null;
        
        // Simulate API call with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
        
        // In a real app, this would create the feed via API
        await new Promise(resolve => setTimeout(resolve, isProduction ? 600 : 150));
        
        clearTimeout(timeoutId);
        
        const newFeed = {
          id: feeds.value.length + 1,
          title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
          type: file.name.split('.').pop() || 'rss',
          url: `/vault${file.path}/${file.name}`,
          updated: 'Just now',
          description: `Feed imported from ${file.name}`,
          attachments: [{
            id: Date.now().toString(),
            name: file.name,
            path: file.path,
            type: file.type
          }],
          items: []
        };
        feeds.value.unshift(newFeed);
        showFilePicker.value = false;
        
        syncStatus.value = 'success';
        
        // Show success feedback in production
        if (isProduction) {
          error.value = 'Feed created successfully!';
          setTimeout(() => error.value = null, 3000);
        }
        
      } catch (err) {
        console.error('Failed to create feed:', err);
        error.value = isProduction 
          ? 'Failed to create feed. Please try again.' 
          : 'Failed to create feed.';
        syncStatus.value = 'error';
        setTimeout(() => error.value = null, 5000);
      }
    };

    const removeAttachment = async (attachmentId) => {
      if (selectedFeed.value) {
        try {
          syncStatus.value = 'syncing';
          error.value = null;
          
          // Simulate API call with timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
          
          // In a real app, this would remove the attachment via API
          await new Promise(resolve => setTimeout(resolve, isProduction ? 400 : 100));
          
          clearTimeout(timeoutId);
          
          selectedFeed.value.attachments = selectedFeed.value.attachments.filter(
            attachment => attachment.id !== attachmentId
          );
          
          syncStatus.value = 'success';
          
          // Show success feedback in production
          if (isProduction) {
            error.value = 'Attachment removed successfully!';
            setTimeout(() => error.value = null, 2000);
          }
          
        } catch (err) {
          console.error('Failed to remove attachment:', err);
          
          // Show user-friendly error in production
          if (isProduction) {
            error.value = syncStatus.value === 'connected' 
              ? 'Failed to remove attachment. Please try again.' 
              : 'Attachment removed locally (offline mode).';
            setTimeout(() => error.value = null, 4000);
          }
          
          // Fallback to local removal if API fails
          selectedFeed.value.attachments = selectedFeed.value.attachments.filter(
            attachment => attachment.id !== attachmentId
          );
        }
      }
    };

    return {
      feeds,
      selectedFeedId,
      selectedFeed,
      showFilePicker,
      mockFiles,
      selectFeed,
      closeSidebar,
      refreshFeeds,
      editFeed,
      deleteFeed,
      updateFeedField,
      addFeedFromFile,
      removeAttachment,
      isLoading,
      error,
      syncStatus
    };
  }
};
</script>

<style scoped>
.feed-list-view {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.feed-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.feed-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
}

.feed-actions {
  display: flex;
  gap: 10px;
}

.add-feed-btn {
  padding: 8px 16px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.add-feed-btn:hover {
  background-color: #2563eb;
}

.refresh-btn {
  padding: 8px 12px;
  background-color: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.refresh-btn:hover {
  background-color: #e5e7eb;
}

.feed-list {
  display: grid;
  gap: 12px;
}

.feed-item {
  padding: 16px;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.feed-item:hover {
  border-color: #d1d5db;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.feed-item--selected {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.feed-item__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.feed-item__title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
}

.feed-item__type {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.feed-item__type--rss {
  background-color: #dbeafe;
  color: #1e40af;
}

.feed-item__type--atom {
  background-color: #fef3c7;
  color: #92400e;
}

.feed-item__type--json {
  background-color: #fce7f3;
  color: #9f1239;
}

.feed-item__meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 0.875rem;
  color: #6b7280;
}

.feed-item__url {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 70%;
}

.feed-item__actions {
  display: flex;
  gap: 8px;
}

.feed-item__edit {
  padding: 4px 8px;
  background: #f3f4f6;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.feed-item__edit:hover {
  background: #e5e7eb;
}

.feed-item__delete {
  padding: 4px 8px;
  background: #fee2e2;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  color: #991b1b;
}

.feed-item__delete:hover {
  background: #fecaca;
}

/* File Picker Modal Styles */
.file-picker-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-picker-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.file-picker-container {
  position: relative;
  z-index: 1001;
}

/* Feed Sidebar */
.feed-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: 100%;
  background-color: white;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
  overflow-y: auto;
  padding: 20px;
  box-sizing: border-box;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e5e7eb;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 24px;
  color: #6b7280;
}

.close-btn:hover {
  color: #374151;
}

.sidebar-section {
  margin-bottom: 20px;
}

.sidebar-section label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #111827;
  font-size: 14px;
}

.sidebar-section input,
.sidebar-section select,
.sidebar-section textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
}

.sidebar-section input:focus,
.sidebar-section select:focus,
.sidebar-section textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.sidebar-section textarea {
  min-height: 100px;
  resize: vertical;
}

/* Attachments Styles */
.attachments-list {
  margin-top: 8px;
}

.attachment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  background: #f3f4f6;
  border-radius: 4px;
  margin-bottom: 4px;
}

.attachment-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
}

.attachment-remove {
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  font-size: 16px;
  margin-left: 8px;
}

.attachment-remove:hover {
  color: #ef4444;
}

.add-attachment-btn {
  width: 100%;
  padding: 8px;
  background: #f9fafb;
  border: 1px dashed #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  text-align: center;
  color: #6b7280;
  font-size: 14px;
  margin-top: 8px;
}

.add-attachment-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

/* Loading and Notification Styles */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.notification-banner {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 1000;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.3s ease-out;
}

.notification-banner--error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
}

.notification-banner--success {
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  color: #065f46;
}

.notification-dismiss {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  margin-left: 8px;
  flex-shrink: 0;
}

.notification-dismiss:hover {
  opacity: 0.7;
}

.sync-status {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.sync-status--idle {
  background: #e5e7eb;
  color: #374151;
}

.sync-status--syncing {
  background: #fef3c7;
  color: #92400e;
}

.sync-status--success {
  background: #d1fae5;
  color: #065f46;
}

.sync-status--error {
  background: #fee2e2;
  color: #991b1b;
}

.sync-status__icon {
  font-weight: 600;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>