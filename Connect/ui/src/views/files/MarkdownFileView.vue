<template>
  <div class="markdown-file-view">
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
        </div>
      </div>
      
      <div class="file-actions">
        <button @click="showFilePicker = true" class="file-action-button">
          📁 Open File
        </button>
        <button @click="saveFile" class="file-action-button file-action-button--primary">
          💾 Save
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
      />
    </div>
    
    <!-- File attachments section -->
    <div class="file-attachments">
      <h3 class="attachments-title">Attachments</h3>
      <div class="attachments-list">
        <div v-for="attachment in attachments" :key="attachment.id" class="attachment-item">
          <span class="attachment-icon">📎</span>
          <span class="attachment-name">{{ attachment.name }}</span>
          <button @click="removeAttachment(attachment.id)" class="attachment-remove">×</button>
        </div>
        <button @click="showAttachmentPicker = true" class="add-attachment-button">
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import MilkdownEditor from '../../components/MilkdownEditor.vue';
import FilePicker from '../../components/FilePicker.vue';

const router = useRouter();

// File state
const fileName = ref('Untitled.md');
const filePath = ref('/documents');
const lastModified = ref('Not saved yet');
const content = ref('# Hello, uDos!\n\nThis is a markdown file with **rich editing** capabilities.\n\n- Task lists
- Code blocks
- Images and links
- And much more!');
const fullscreen = ref(false);

// Attachments
const attachments = ref([
  {
    id: '1',
    name: 'project-brief.pdf',
    path: '/attachments',
    type: 'file'
  }
]);

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
  },
  {
    id: '4',
    name: 'api-spec.md',
    type: 'file',
    path: '/documents',
    size: '3.2 KB',
    date: 'Apr 18, 2026'
  }
]);

// Methods
function goBack() {
  router.push('/files');
}

function openFile(file: any) {
  fileName.value = file.name;
  filePath.value = file.path;
  lastModified.value = file.date || 'Just now';
  
  // In a real app, you would load the file content from the vault
  // For demo purposes, we'll just show a placeholder
  content.value = `# ${file.name.replace('.md', '')}\n\nFile loaded from: ${file.path}\n\nEdit this markdown document...`;
  
  showFilePicker.value = false;
}

function saveFile() {
  lastModified.value = new Date().toLocaleString();
  // In a real app, this would save to the vault
  console.log('Saving file:', fileName.value, 'Content length:', content.value.length);
}

function addAttachments(files: any | any[]) {
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
}

function removeAttachment(attachmentId: string) {
  attachments.value = attachments.value.filter(att => att.id !== attachmentId);
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
}

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
}

.file-separator {
  color: #9ca3af;
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
}

.file-action-button:hover {
  background: #f3f4f6;
}

.file-action-button--primary {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.file-action-button--primary:hover {
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
</style>