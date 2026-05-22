<template>
  <div class="markdown-file-view">
    <!-- Loading Overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>Loading document...</p>
    </div>
    
    <!-- Notification Banner -->
    <div v-if="error" class="notification-banner" :class="{
      'notification-banner--error': error.includes('Failed') || error.includes('Error'),
      'notification-banner--success': !error.includes('Failed') && !error.includes('Error') && !error.includes('Please')
    }">
      <p>{{ error }}</p>
      <button @click="error = null" class="notification-dismiss">×</button>
    </div>
    
    <!-- Auto-save Status -->
    <div v-if="isSaving" class="auto-save-status">
      <span class="auto-save-icon">💾</span>
      <span class="auto-save-text">Saving...</span>
    </div>
    
    <!-- Header with file info and actions -->
    <div class="file-header">
      <div class="file-info">
        <button @click="goBack" class="back-button">
          ← Back to Files
        </button>
        <h2 class="file-title">
          <span class="file-icon">📄</span>
          {{ fileName || 'Untitled.md' }}
        </h2>
        <div class="file-meta">
          <span class="file-path">{{ filePath || 'No path' }}</span>
          <span class="file-separator">•</span>
          <span class="file-modified">{{ lastModified || 'Not saved yet' }}</span>
          <span v-if="wordCount > 0" class="file-word-count">• {{ wordCount }} words</span>
        </div>
      </div>
      
      <div class="file-actions">
        <button @click="showFilePicker = true" class="file-action-button">
          📁 Open File
        </button>
        <button @click="saveFile" class="file-action-button file-action-button--primary" :disabled="isSaving">
          {{ isSaving ? 'Saving...' : '💾 Save' }}
        </button>
        <button @click="exportFile" class="file-action-button">
          📥 Export
        </button>
      </div>
    </div>
    
    <!-- File Picker Modal -->
    <div v-if="showFilePicker" class="file-picker-modal">
      <div class="file-picker-overlay" @click="showFilePicker = false"></div>
      <div class="file-picker-container">
        <FilePicker
          title="Select Markdown File"
          :files="mockFiles"
          :multiple="false"
          @selected="openFile"
          @close="showFilePicker = false"
        />
      </div>
    </div>
    
    <!-- Milkdown Editor -->
    <div class="editor-container">
      <MilkdownEditor
        v-model="content"
        @save="saveFile"
        :fullscreen="fullscreen"
        @content-change="handleContentChange"
      />
    </div>
    
    <!-- File attachments section -->
    <div class="file-attachments">
      <h3 class="attachments-title">Attachments</h3>
      <div class="attachments-list">
        <div v-for="attachment in attachments" :key="attachment.id" class="attachment-item">
          <span class="attachment-icon">📎</span>
          <span class="attachment-name">{{ attachment.name }}</span>
          <button @click="removeAttachment(attachment.id)" class="attachment-remove" :disabled="isSaving">×</button>
        </div>
        <button @click="showAttachmentPicker = true" class="add-attachment-button" :disabled="isSaving">
          + Add Attachment
        </button>
      </div>
    </div>
    
    <!-- Attachment Picker Modal -->
    <div v-if="showAttachmentPicker" class="file-picker-modal">
      <div class="file-picker-overlay" @click="showAttachmentPicker = false"></div>
      <div class="file-picker-container">
        <FilePicker
          title="Select Files to Attach"
          :files="mockFiles"
          :multiple="true"
          @selected="addAttachments"
          @close="showAttachmentPicker = false"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import MilkdownEditor from '../../components/MilkdownEditor.vue';
import FilePicker from '../../components/FilePicker.vue';

const router = useRouter();

// Production environment detection
const isProduction = import.meta.env.PROD;
const API_TIMEOUT = isProduction ? 15000 : 8000;

// State management
const isLoading = ref(false);
const error = ref(null);
const isSaving = ref(false);

// File state
const fileName = ref('Untitled.md');
const filePath = ref('/documents');
const lastModified = ref('Not saved yet');
const content = ref('# Hello, uDos!\n\nThis is a markdown file with **rich editing** capabilities.');
const fullscreen = ref(false);

// Auto-save timer
let autoSaveTimer: number | null = null;
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

// Word count
const wordCount = computed(() => {
  return content.value.split(/\s+/).filter(word => word.length > 0).length;
});

// Attachments
const attachments = ref([]);

// File picker state
const showFilePicker = ref(false);
const showAttachmentPicker = ref(false);

// Mock files for demonstration
const mockFiles = ref([
  {
    id: '1',
    name: 'README.md',
    type: 'file',
    path: '/documents',
    size: '2.4 KB',
    date: 'Apr 15, 2026'
  },
  {
    id: '2',
    name: 'notes',
    type: 'folder',
    path: '/documents',
    date: 'Apr 10, 2026'
  },
  {
    id: '3',
    name: 'design-docs.md',
    type: 'file',
    path: '/documents/notes',
    size: '1.8 KB',
    date: 'Apr 12, 2026'
  }
]);

// Setup auto-save
onMounted(() => {
  setupAutoSave();
});

onUnmounted(() => {
  cleanupAutoSave();
});

function setupAutoSave() {
  autoSaveTimer = window.setInterval(() => {
    if (!isSaving.value && content.value.trim()) {
      saveFile(true); // Auto-save with silent mode
    }
  }, AUTO_SAVE_INTERVAL);
}

function cleanupAutoSave() {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer);
    autoSaveTimer = null;
  }
}

function handleContentChange(newContent: string) {
  // Update word count when content changes
  // Word count is computed, so no need to do anything here
}

// File operations with production-ready error handling
async function saveFile(silent = false) {
  if (isSaving.value) return;
  
  try {
    isSaving.value = true;
    
    if (!silent && isProduction) {
      error.value = null;
    }
    
    // Simulate API call with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
    
    // In a real app, this would save to the vault
    await new Promise(resolve => setTimeout(resolve, isProduction ? 800 : 200));
    
    clearTimeout(timeoutId);
    
    lastModified.value = new Date().toLocaleString();
    
    if (!silent && isProduction) {
      error.value = 'Document saved successfully!';
      setTimeout(() => error.value = null, 3000);
    }
    
  } catch (err) {
    console.error('Failed to save file:', err);
    
    if (isProduction) {
      error.value = 'Failed to save document. Changes stored locally.';
      setTimeout(() => error.value = null, 5000);
    }
    
  } finally {
    isSaving.value = false;
  }
}

async function exportFile() {
  try {
    isSaving.value = true;
    error.value = null;
    
    // Simulate export operation
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
    
    await new Promise(resolve => setTimeout(resolve, isProduction ? 600 : 150));
    
    clearTimeout(timeoutId);
    
    // In a real app, this would export the file
    const blob = new Blob([content.value], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.value;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    if (isProduction) {
      error.value = 'Document exported successfully!';
      setTimeout(() => error.value = null, 3000);
    }
    
  } catch (err) {
    console.error('Failed to export file:', err);
    
    if (isProduction) {
      error.value = 'Failed to export document. Please try again.';
      setTimeout(() => error.value = null, 5000);
    }
    
  } finally {
    isSaving.value = false;
  }
}

async function openFile(file: any) {
  try {
    isLoading.value = true;
    error.value = null;
    
    // Simulate file loading
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
    
    await new Promise(resolve => setTimeout(resolve, isProduction ? 500 : 100));
    
    clearTimeout(timeoutId);
    
    fileName.value = file.name;
    filePath.value = file.path;
    lastModified.value = file.date || 'Just now';
    
    // In a real app, you would load the file content from the vault
    content.value = `# ${file.name.replace('.md', '')}\n\nFile loaded from: ${file.path}\n\n${content.value}`;
    
    showFilePicker.value = false;
    
  } catch (err) {
    console.error('Failed to open file:', err);
    
    if (isProduction) {
      error.value = 'Failed to open file. Please try again.';
      setTimeout(() => error.value = null, 5000);
    }
    
  } finally {
    isLoading.value = false;
  }
}

async function addAttachments(files: any | any[]) {
  try {
    isSaving.value = true;
    error.value = null;
    
    // Simulate API call
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
    
    await new Promise(resolve => setTimeout(resolve, isProduction ? 400 : 100));
    
    clearTimeout(timeoutId);
    
    if (Array.isArray(files)) {
      files.forEach(file => {
        attachments.value.push({
          id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
          name: file.name,
          path: file.path,
          type: file.type
        });
      });
    } else {
      attachments.value.push({
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        name: files.name,
        path: files.path,
        type: files.type
      });
    }
    
    showAttachmentPicker.value = false;
    
    if (isProduction) {
      error.value = 'Attachments added successfully!';
      setTimeout(() => error.value = null, 2000);
    }
    
  } catch (err) {
    console.error('Failed to add attachments:', err);
    
    if (isProduction) {
      error.value = 'Failed to add attachments. Please try again.';
      setTimeout(() => error.value = null, 5000);
    }
    
  } finally {
    isSaving.value = false;
  }
}

async function removeAttachment(attachmentId: string) {
  try {
    isSaving.value = true;
    error.value = null;
    
    // Simulate API call
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
    
    await new Promise(resolve => setTimeout(resolve, isProduction ? 300 : 80));
    
    clearTimeout(timeoutId);
    
    attachments.value = attachments.value.filter(att => att.id !== attachmentId);
    
    if (isProduction) {
      error.value = 'Attachment removed successfully!';
      setTimeout(() => error.value = null, 2000);
    }
    
  } catch (err) {
    console.error('Failed to remove attachment:', err);
    
    if (isProduction) {
      error.value = 'Failed to remove attachment. Please try again.';
      setTimeout(() => error.value = null, 5000);
    }
    
  } finally {
    isSaving.value = false;
  }
}

function goBack() {
  router.push('/files');
}

function toggleFullscreen() {
  fullscreen.value = !fullscreen.value;
}
</script>

<style scoped>
.markdown-file-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
}

/* Loading Overlay */
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
  z-index: 3000;
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

/* Notification Banner */
.notification-banner {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 2000;
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

/* Auto-save Status */
.auto-save-status {
  position: fixed;
  bottom: 80px;
  right: 20px;
  padding: 8px 12px;
  background: rgba(59, 130, 246, 0.9);
  color: white;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.3s ease-out;
}

.auto-save-icon {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* File Header */
.file-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.file-info {
  flex: 1;
}

.back-button {
  background: #f3f4f6;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 8px;
}

.back-button:hover {
  background: #e5e7eb;
}

.file-title {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-icon {
  font-size: 1.2em;
}

.file-meta {
  font-size: 0.9rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  flex-wrap: wrap;
}

.file-separator {
  color: #9ca3af;
}

.file-word-count {
  color: #6b7280;
}

.file-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.file-action-button {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.file-action-button:hover {
  background: #f3f4f6;
}

.file-action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.file-action-button--primary {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.file-action-button--primary:hover:not(:disabled) {
  background: #2563eb;
}

.editor-container {
  flex: 1;
}

.file-attachments {
  margin-top: 20px;
}

.attachments-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 12px;
}

.attachments-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f3f4f6;
  padding: 6px 12px;
  border-radius: 6px;
}

.attachment-icon {
  font-size: 1.1em;
}

.attachment-name {
  font-size: 0.9rem;
  color: #374151;
}

.attachment-remove {
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  font-size: 16px;
  padding: 0;
  margin-left: 6px;
}

.attachment-remove:hover {
  color: #ef4444;
}

.attachment-remove:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.add-attachment-button {
  background: #f9fafb;
  border: 1px dashed #d1d5db;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #6b7280;
}

.add-attachment-button:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.add-attachment-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Modal Styles */
.file-picker-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
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
  z-index: 2001;
}

/* Animations */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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