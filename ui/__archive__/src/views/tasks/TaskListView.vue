<template>
  <div class="task-list-view">
    <!-- Sync Status Indicator -->
    <div class="sync-status" :class="`sync-status--${syncStatus}`">
      <span class="sync-status__icon">
        {{ syncStatus === 'connected' ? '✓' : syncStatus === 'connecting' ? '…' : syncStatus === 'error' ? '!' : '⚠' }}
      </span>
      <span class="sync-status__text">
        {{ syncStatus === 'connected' ? 'Connected to Vault' : 
           syncStatus === 'connecting' ? 'Connecting to Vault...' : 
           syncStatus === 'error' ? 'Connection Error' : 'Offline Mode' }}
      </span>
    </div>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>Loading tasks from vault...</p>
    </div>
    
    <!-- Notification Banner (for errors and success messages) -->
    <div v-if="error" class="notification-banner" :class="{
      'notification-banner--error': error.includes('Failed') || error.includes('Error'),
      'notification-banner--success': !error.includes('Failed') && !error.includes('Error') && !error.includes('Please')
    }">
      <p>{{ error }}</p>
      <button @click="error = null" class="notification-dismiss">×</button>
    </div>
    
    <!-- Table Header -->
    <div class="table-header">
      <div class="header-cell">
        <input type="checkbox" v-model="selectAll" @change="toggleSelectAll" />
      </div>
      <div class="header-cell" @click="sortBy('title')">
        Title
        <span class="sort-icon">{{ sortField === 'title' ? (sortDirection === 'asc' ? '↑' : '↓') : '' }}</span>
      </div>
      <div class="header-cell" @click="sortBy('status')">
        Status
        <span class="sort-icon">{{ sortField === 'status' ? (sortDirection === 'asc' ? '↑' : '↓') : '' }}</span>
      </div>
      <div class="header-cell" @click="sortBy('dueDate')">
        Due Date
        <span class="sort-icon">{{ sortField === 'dueDate' ? (sortDirection === 'asc' ? '↑' : '↓') : '' }}</span>
      </div>
      <div class="header-cell" @click="sortBy('tags')">
        Tags
        <span class="sort-icon">{{ sortField === 'tags' ? (sortDirection === 'asc' ? '↑' : '↓') : '' }}</span>
      </div>
      <div class="header-cell">
        <button @click="addProperty" class="add-property-btn">+ Add Property</button>
      </div>
    </div>

    <!-- Table Body -->
    <div class="table-body">
      <div v-for="task in sortedTasks" :key="task.id" class="table-row" :class="{ 'selected': selectedTaskId === task.id }" @click="selectTask(task.id)">
        <div class="row-cell checkbox-cell">
          <input type="checkbox" v-model="task.selected" @change="toggleTaskSelection(task.id)" />
        </div>
        <div class="row-cell" contenteditable @blur="updateTaskField(task.id, 'title', $event.target.textContent)">
          {{ task.title }}
        </div>
        <div class="row-cell">
          <select v-model="task.status" @change="updateTaskField(task.id, 'status', $event.target.value)">
            <option value="todo">Todo</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
        <div class="row-cell">
          <input type="date" v-model="task.dueDate" @change="updateTaskField(task.id, 'dueDate', $event.target.value)" />
        </div>
        <div class="row-cell">
          <span v-for="tag in task.tags" :key="tag" class="tag">
            {{ tag }}
          </span>
        </div>
        <div class="row-cell actions-cell">
          <button @click.stop="deleteTask(task.id)" class="delete-btn">🗑️</button>
        </div>
      </div>
    </div>

    <!-- Add New Task Button -->
    <button @click="addNewTask" class="add-task-btn">
      + New Task
    </button>

    <!-- File Picker Modal -->
    <div v-if="showFilePicker && selectedTask" class="file-picker-modal">
      <div class="file-picker-overlay" @click="showFilePicker = false"></div>
      <div class="file-picker-container">
        <FilePicker
          title="Select Files to Attach"
          :files="mockFiles"
          :multiple="true"
          @selected="(files) => {
            if (Array.isArray(files)) {
              files.forEach(file => addAttachment(file));
            } else {
              addAttachment(files);
            }
            showFilePicker = false;
          }"
          @close="showFilePicker = false"
        />
      </div>
    </div>
    
    <!-- Task Sidebar -->
    <div v-if="selectedTask" class="task-sidebar">
      <div class="sidebar-header">
        <h3>Task Details</h3>
        <button @click="closeSidebar" class="close-btn">×</button>
      </div>
      <div class="sidebar-section">
        <label>Title</label>
        <input v-model="selectedTask.title" @change="updateTaskField(selectedTask.id, 'title', selectedTask.title)" />
      </div>
      <div class="sidebar-section">
        <label>Status</label>
        <select v-model="selectedTask.status" @change="updateTaskField(selectedTask.id, 'status', selectedTask.status)">
          <option value="todo">Todo</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>
      <div class="sidebar-section">
        <label>Due Date</label>
        <input type="date" v-model="selectedTask.dueDate" @change="updateTaskField(selectedTask.id, 'dueDate', selectedTask.dueDate)" />
      </div>
      <div class="sidebar-section">
        <label>Tags</label>
        <input v-model="tagInput" @keyup.enter="addTag" placeholder="Add a tag and press Enter" />
        <div class="tags-list">
          <span v-for="tag in selectedTask.tags" :key="tag" class="tag">
            {{ tag }}
            <button @click="removeTag(tag)" class="tag-remove">×</button>
          </span>
        </div>
      </div>
      <div class="sidebar-section">
        <label>Notes</label>
        <textarea v-model="selectedTask.notes" @change="updateTaskField(selectedTask.id, 'notes', selectedTask.notes)"></textarea>
      </div>
      <div class="sidebar-section">
        <label>Attachments</label>
        <div class="attachments-list">
          <div v-for="attachment in selectedTask.attachments" :key="attachment.id" class="attachment-item">
            <span class="attachment-name">{{ attachment.name }}</span>
            <button @click="removeAttachment(attachment.id)" class="attachment-remove">×</button>
          </div>
          <button @click="showFilePicker = true" class="add-attachment-btn">
            + Add Attachment
          </button>
        </div>
      </div>
      <div class="sidebar-section">
        <label>Custom Properties</label>
        <div v-for="(value, key) in selectedTask.properties" :key="key" class="property-row">
          <span class="property-key">{{ key }}:</span>
          <span class="property-value">{{ value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import FilePicker from '../../components/FilePicker.vue';
import { 
  getTasks, 
  createTask, 
  updateTask, 
  deleteTask,
  uploadAttachment,
  removeAttachment as apiRemoveAttachment,
  setupRealTimeSync 
} from '../../services/api';

export default {
  name: 'TaskListView',
  components: {
    FilePicker
  },
  setup() {
    // Production environment detection
    const isProduction = import.meta.env.PROD;
    const API_TIMEOUT = isProduction ? 10000 : 5000; // 10s timeout in production
    // Task data - now loaded from API
    const tasks = ref([]);
    const isLoading = ref(true);
    const error = ref(null);
    const syncStatus = ref('connecting'); // 'connecting', 'connected', 'error', 'offline'
    const syncErrorCount = ref(0);
    const maxRetries = isProduction ? 3 : 1;
    let cleanupSync: (() => void) | null = null;

    // Load tasks from API on component mount
    onMounted(async () => {
      try {
        // Add timeout for production API calls
        const loadTasks = async () => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
          
          try {
            const result = await Promise.race([
              getTasks(),
              new Promise((_, reject) => setTimeout(() => reject(new Error('API timeout')), API_TIMEOUT))
            ]);
            clearTimeout(timeoutId);
            return result;
          } catch (err) {
            clearTimeout(timeoutId);
            throw err;
          }
        };
        
        tasks.value = await loadTasks();
        
        // Add selected property to each task for UI selection
        tasks.value = tasks.value.map(task => ({
          ...task,
          selected: false
        }));
        
        // Setup real-time sync with error handling
        cleanupSync = setupRealTimeSync((updatedTasks) => {
          try {
            // Merge updates with local changes (preserve UI state like selection)
            const updatedTasksMap = new Map(updatedTasks.map(task => [task.id, task]));
            
            tasks.value = tasks.value.map(localTask => {
              const updatedTask = updatedTasksMap.get(localTask.id);
              if (updatedTask) {
                return {
                  ...updatedTask,
                  selected: localTask.selected // Preserve UI state
                };
              }
              return localTask;
            });
            
            // Add new tasks from server
            updatedTasks.forEach(updatedTask => {
              if (!tasks.value.some(t => t.id === updatedTask.id)) {
                tasks.value.push({
                  ...updatedTask,
                  selected: false
                });
              }
            });
            
            syncStatus.value = 'connected';
            syncErrorCount.value = 0; // Reset error count on successful sync
          } catch (syncErr) {
            console.error('Sync error:', syncErr);
            syncErrorCount.value++;
            if (syncErrorCount.value >= maxRetries) {
              syncStatus.value = 'error';
              error.value = 'Failed to sync with vault. Working offline.';
            }
          }
        });
        
      } catch (err) {
        console.error('Failed to load tasks:', err);
        error.value = isProduction 
          ? 'Failed to load tasks. Please check your connection.' 
          : 'Failed to load tasks. Using fallback data.';
        syncStatus.value = 'error';
        
        // Fallback to mock data if API fails completely
        if (!isProduction) { // Only use mock data in development
          tasks.value = [
            {
              id: '1',
              title: 'Implement Task List View',
              status: 'in-progress',
              dueDate: '2026-04-20',
              tags: ['frontend', 'vue'],
              notes: 'Create a Notion-like table view for tasks',
              properties: {},
              attachments: [],
              selected: false
            },
            {
              id: '2',
              title: 'Add Inline Editing',
              status: 'todo',
              dueDate: '2026-04-21',
              tags: ['frontend', 'ux'],
              notes: 'Allow editing task fields directly in the table',
              properties: {},
              attachments: [],
              selected: false
            },
            {
              id: '3',
              title: 'Integrate with uDOS Vault',
              status: 'todo',
              dueDate: '2026-04-22',
              tags: ['backend', 'api'],
              notes: 'Connect the task list to the uDOS Vault data layer',
              properties: {},
              attachments: [],
              selected: false
            }
          ];
        }
      } finally {
        isLoading.value = false;
      }
    });
    
    // Cleanup on unmount
    onUnmounted(() => {
      if (cleanupSync) {
        cleanupSync();
      }
    });

    // Sorting
    const sortField = ref('title');
    const sortDirection = ref('asc');

    // Selected task for sidebar
    const selectedTaskId = ref(null);
    const selectedTask = computed(() => {
      return tasks.value.find(task => task.id === selectedTaskId.value) || null;
    });

    // Tag input for sidebar
    const tagInput = ref('');

    // Sort tasks
    const sortedTasks = computed(() => {
      return [...tasks.value].sort((a, b) => {
        const aValue = a[sortField.value];
        const bValue = b[sortField.value];
        
        if (aValue < bValue) return sortDirection.value === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection.value === 'asc' ? 1 : -1;
        return 0;
      });
    });

    // Select all tasks
    const selectAll = computed({
      get: () => tasks.value.every(task => task.selected),
      set: (value) => {
        tasks.value.forEach(task => {
          task.selected = value;
        });
      }
    });

    // Methods
    const toggleSelectAll = () => {
      selectAll.value = !selectAll.value;
    };

    const toggleTaskSelection = (taskId) => {
      const task = tasks.value.find(t => t.id === taskId);
      if (task) {
        task.selected = !task.selected;
      }
    };

    const selectTask = (taskId) => {
      selectedTaskId.value = taskId;
    };

    const closeSidebar = () => {
      selectedTaskId.value = null;
    };

    const sortBy = (field) => {
      if (sortField.value === field) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
      } else {
        sortField.value = field;
        sortDirection.value = 'asc';
      }
    };

    const addNewTask = async () => {
      const newTask = {
        title: 'New Task',
        status: 'todo',
        dueDate: '',
        tags: [],
        notes: '',
        properties: {},
        attachments: []
      };
      
      try {
        // Add timeout for production API calls
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
        
        const createdTask = await Promise.race([
          createTask(newTask),
          new Promise((_, reject) => setTimeout(() => reject(new Error('API timeout')), API_TIMEOUT))
        ]);
        
        clearTimeout(timeoutId);
        
        tasks.value.unshift({
          ...createdTask,
          selected: false
        });
        
        // Show success feedback in production
        if (isProduction) {
          error.value = 'Task created successfully!';
          setTimeout(() => error.value = null, 3000);
        }
        
      } catch (error) {
        console.error('Failed to create task:', error);
        
        // Show user-friendly error in production
        if (isProduction) {
          error.value = syncStatus.value === 'connected' 
            ? 'Failed to create task. Please try again.' 
            : 'Task created locally (offline mode).';
          setTimeout(() => error.value = null, 5000);
        }
        
        // Fallback to local creation if API fails
        tasks.value.unshift({
          id: Date.now().toString(),
          ...newTask,
          selected: false
        });
      }
    };

    const deleteTask = async (taskId) => {
      try {
        // Add timeout for production API calls
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
        
        const success = await Promise.race([
          deleteTask(taskId),
          new Promise((_, reject) => setTimeout(() => reject(new Error('API timeout')), API_TIMEOUT))
        ]);
        
        clearTimeout(timeoutId);
        
        if (success) {
          const index = tasks.value.findIndex(task => task.id === taskId);
          if (index !== -1) {
            tasks.value.splice(index, 1);
          }
          
          // Show success feedback in production
          if (isProduction) {
            error.value = 'Task deleted successfully!';
            setTimeout(() => error.value = null, 3000);
          }
        }
      } catch (error) {
        console.error('Failed to delete task:', error);
        
        // Show user-friendly error in production
        if (isProduction) {
          error.value = syncStatus.value === 'connected' 
            ? 'Failed to delete task. Please try again.' 
            : 'Task deleted locally (offline mode).';
          setTimeout(() => error.value = null, 5000);
        }
        
        // Fallback to local deletion if API fails
        const index = tasks.value.findIndex(task => task.id === taskId);
        if (index !== -1) {
          tasks.value.splice(index, 1);
        }
      }
    };

    const updateTaskField = async (taskId, field, value) => {
      try {
        // Add timeout for production API calls
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
        
        const updates = { [field]: value };
        const updatedTask = await Promise.race([
          updateTask(taskId, updates),
          new Promise((_, reject) => setTimeout(() => reject(new Error('API timeout')), API_TIMEOUT))
        ]);
        
        clearTimeout(timeoutId);
        
        // Update local state with API response
        const taskIndex = tasks.value.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
          tasks.value[taskIndex] = {
            ...tasks.value[taskIndex],
            ...updatedTask
          };
        }
        
        // Show success feedback for important updates in production
        if (isProduction && ['status', 'dueDate'].includes(field)) {
          error.value = 'Task updated successfully!';
          setTimeout(() => error.value = null, 2000);
        }
        
      } catch (error) {
        console.error('Failed to update task:', error);
        
        // Show user-friendly error in production for critical updates
        if (isProduction && ['status', 'dueDate'].includes(field)) {
          error.value = syncStatus.value === 'connected' 
            ? 'Failed to update task. Changes saved locally.' 
            : 'Update saved locally (offline mode).';
          setTimeout(() => error.value = null, 4000);
        }
        
        // Fallback to local update if API fails
        const task = tasks.value.find(t => t.id === taskId);
        if (task) {
          task[field] = value;
        }
      }
    };

    const addTag = () => {
      if (tagInput.value.trim() && selectedTask.value) {
        selectedTask.value.tags.push(tagInput.value.trim());
        tagInput.value = '';
      }
    };

    const removeTag = (tag) => {
      if (selectedTask.value) {
        selectedTask.value.tags = selectedTask.value.tags.filter(t => t !== tag);
      }
    };

    const addProperty = () => {
      // Implement property addition logic
      console.log('Add property');
    };

    const removeAttachment = async (attachmentId) => {
      if (selectedTask.value) {
        try {
          // Add timeout for production API calls
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
          
          const success = await Promise.race([
            apiRemoveAttachment(selectedTask.value.id, attachmentId),
            new Promise((_, reject) => setTimeout(() => reject(new Error('API timeout')), API_TIMEOUT))
          ]);
          
          clearTimeout(timeoutId);
          
          if (success) {
            selectedTask.value.attachments = selectedTask.value.attachments.filter(
              attachment => attachment.id !== attachmentId
            );
            
            // Show success feedback in production
            if (isProduction) {
              error.value = 'Attachment removed successfully!';
              setTimeout(() => error.value = null, 2000);
            }
          }
        } catch (error) {
          console.error('Failed to remove attachment:', error);
          
          // Show user-friendly error in production
          if (isProduction) {
            error.value = syncStatus.value === 'connected' 
              ? 'Failed to remove attachment. Please try again.' 
              : 'Attachment removed locally (offline mode).';
            setTimeout(() => error.value = null, 4000);
          }
          
          // Fallback to local removal if API fails
          selectedTask.value.attachments = selectedTask.value.attachments.filter(
            attachment => attachment.id !== attachmentId
          );
        }
      }
    };

    const addAttachment = async (file) => {
      if (selectedTask.value) {
        try {
          // Create a mock file object for the API
          const fileToUpload = new File([], file.name, { type: file.type });
          
          // Add timeout for production API calls
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
          
          const attachment = await Promise.race([
            uploadAttachment(fileToUpload, selectedTask.value.id),
            new Promise((_, reject) => setTimeout(() => reject(new Error('API timeout')), API_TIMEOUT))
          ]);
          
          clearTimeout(timeoutId);
          
          // Update the task with the new attachment
          const updatedTask = await updateTask(selectedTask.value.id, {
            attachments: [...selectedTask.value.attachments, attachment]
          });
          
          // Update local state
          selectedTask.value.attachments = updatedTask.attachments;
          
          // Show success feedback in production
          if (isProduction) {
            error.value = 'Attachment added successfully!';
            setTimeout(() => error.value = null, 2000);
          }
          
        } catch (error) {
          console.error('Failed to add attachment:', error);
          
          // Show user-friendly error in production
          if (isProduction) {
            error.value = syncStatus.value === 'connected' 
              ? 'Failed to add attachment. Please try again.' 
              : 'Attachment added locally (offline mode).';
            setTimeout(() => error.value = null, 4000);
          }
          
          // Fallback to local addition if API fails
          selectedTask.value.attachments.push({
            id: Date.now().toString(),
            name: file.name,
            path: file.path,
            type: file.type
          });
        }
      }
    };

    const showFilePicker = ref(false);

    const mockFiles = ref([
      {
        id: '1',
        name: 'project-brief.pdf',
        type: 'file',
        path: '/documents',
        size: '2.4 MB',
        date: 'Apr 15, 2026'
      },
      {
        id: '2',
        name: 'design-mockups',
        type: 'folder',
        path: '/design',
        date: 'Apr 10, 2026'
      },
      {
        id: '3',
        name: 'api-spec.md',
        type: 'file',
        path: '/documents',
        size: '12 KB',
        date: 'Apr 12, 2026'
      },
      {
        id: '4',
        name: 'meeting-notes.txt',
        type: 'file',
        path: '/notes',
        size: '4 KB',
        date: 'Apr 18, 2026'
      }
    ]);

    return {
      tasks,
      sortedTasks,
      selectAll,
      toggleSelectAll,
      toggleTaskSelection,
      selectTask,
      closeSidebar,
      sortBy,
      sortField,
      sortDirection,
      selectedTaskId,
      selectedTask,
      tagInput,
      addNewTask,
      deleteTask,
      updateTaskField,
      addTag,
      removeTag,
      addProperty,
      removeAttachment,
      addAttachment,
      showFilePicker,
      mockFiles,
      isLoading,
      error,
      syncStatus
    };
  }
};
</script>

<style scoped>
.task-list-view {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.table-header {
  display: grid;
  grid-template-columns: 50px 2fr 1fr 1fr 1fr 1fr;
  padding: 10px 0;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
  color: #374151;
  background-color: #f9fafb;
}

.header-cell {
  padding: 0 10px;
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.header-cell:hover {
  background-color: #f3f4f6;
}

.sort-icon {
  margin-left: 5px;
  font-size: 0.8em;
}

.table-body {
  display: grid;
  grid-template-columns: 50px 2fr 1fr 1fr 1fr 1fr;
}

.table-row {
  padding: 10px 0;
  border-bottom: 1px solid #e5e7eb;
  cursor: pointer;
}

.table-row:hover {
  background-color: #f9fafb;
}

.table-row.selected {
  background-color: #e5e7eb;
}

.row-cell {
  padding: 0 10px;
  display: flex;
  align-items: center;
  word-break: break-word;
}

.checkbox-cell {
  justify-content: center;
}

.actions-cell {
  justify-content: flex-end;
}

.add-task-btn {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
}

.add-task-btn:hover {
  background-color: #2563eb;
}

.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #ef4444;
  font-size: 16px;
}

.delete-btn:hover {
  color: #dc2626;
}

.task-sidebar {
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

.tag {
  display: inline-block;
  background-color: #e5e7eb;
  color: #111827;
  padding: 4px 8px;
  border-radius: 4px;
  margin-right: 5px;
  margin-bottom: 5px;
  font-size: 12px;
}

.tag-remove {
  background: none;
  border: none;
  cursor: pointer;
  margin-left: 5px;
  font-size: 12px;
  color: #6b7280;
}

.tag-remove:hover {
  color: #ef4444;
}

.property-row {
  display: flex;
  margin-bottom: 5px;
  font-size: 14px;
}

.property-key {
  font-weight: 600;
  margin-right: 5px;
  color: #6b7280;
}

.add-property-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #3b82f6;
  font-size: 14px;
}

.add-property-btn:hover {
  text-decoration: underline;
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

/* Loading and Error States */
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

/* Sync Status Indicator */
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

.sync-status--connecting {
  background: #fef3c7;
  color: #92400e;
}

.sync-status--connected {
  background: #d1fae5;
  color: #065f46;
}

.sync-status--error {
  background: #fee2e2;
  color: #991b1b;
}

.sync-status--offline {
  background: #e5e7eb;
  color: #374151;
}

.sync-status__icon {
  font-weight: 600;
}
</style>