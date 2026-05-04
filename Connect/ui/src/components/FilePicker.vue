<template>
  <div class="file-picker" :data-profile="dataProfile">
    <div class="file-picker__header">
      <h3>{{ title }}</h3>
      <button v-if="showClose" @click="close" class="file-picker__close">
        &times;
      </button>
    </div>
    
    <div v-if="showSearch" class="file-picker__search">
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="searchPlaceholder"
        @input="filterFiles"
        class="file-picker__search-input"
      />
    </div>
    
    <div class="file-picker__breadcrumbs">
      <span v-for="(crumb, index) in breadcrumbs" :key="index" class="file-picker__crumb">
        <button @click="navigateTo(crumb.path)" class="file-picker__crumb-btn">
          {{ crumb.name }}
        </button>
        <span v-if="index < breadcrumbs.length - 1" class="file-picker__crumb-sep">
          /
        </span>
      </span>
    </div>
    
    <ul class="file-picker__list">
      <li
        v-for="file in filteredFiles"
        :key="file.id"
        class="file-picker__item"
        :class="{
          'file-picker__item--selected': selectedFiles.includes(file.id),
          'file-picker__item--folder': file.type === 'folder'
        }"
        @click="selectFile(file)"
      >
        <div class="file-picker__icon">
          <span v-if="file.type === 'folder'" class="file-picker__folder-icon">📁</span>
          <span v-else class="file-picker__file-icon">📄</span>
        </div>
        <div class="file-picker__name">{{ file.name }}</div>
        <div v-if="file.type !== 'folder'" class="file-picker__size">{{ file.size }}</div>
        <div class="file-picker__date">{{ file.date }}</div>
      </li>
    </ul>
    
    <div v-if="multiple" class="file-picker__actions">
      <button @click="confirmSelection" class="file-picker__confirm-btn">
        Select {{ selectedFiles.length }} files
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";

interface FilePickerFile {
  id: string;
  name: string;
  type: "file" | "folder";
  path: string;
  size?: string;
  date?: string;
  [key: string]: any;
}

interface Breadcrumb {
  name: string;
  path: string;
}

const props = withDefaults(
  defineProps<{
    title?: string;
    files?: FilePickerFile[];
    multiple?: boolean;
    showSearch?: boolean;
    showClose?: boolean;
    searchPlaceholder?: string;
    dataProfile?: string;
  }>(),
  {
    title: "Select Files",
    files: () => [],
    multiple: false,
    showSearch: true,
    showClose: true,
    searchPlaceholder: "Search files...",
    dataProfile: "file.picker",
  }
);

const emit = defineEmits<{
  selected: [files: FilePickerFile | FilePickerFile[]];
  close: [];
}>();

const searchQuery = ref("");
const selectedFiles = ref<string[]>([]);
const currentPath = ref("/");

const filteredFiles = computed(() => {
  const query = searchQuery.value.toLowerCase();
  return props.files.filter((file) => 
    file.name.toLowerCase().includes(query) &&
    file.path.startsWith(currentPath.value)
  );
});

const breadcrumbs = computed(() => {
  const parts = currentPath.value.split("/").filter(Boolean);
  const crumbs: Breadcrumb[] = [{ name: "Root", path: "/" }];
  
  let path = "";
  for (const part of parts) {
    path += `/${part}`;
    crumbs.push({ name: part, path });
  }
  
  return crumbs;
});

const selectFile = (file: FilePickerFile) => {
  if (file.type === "folder") {
    currentPath.value = file.path;
    return;
  }
  
  if (props.multiple) {
    const index = selectedFiles.value.indexOf(file.id);
    if (index === -1) {
      selectedFiles.value.push(file.id);
    } else {
      selectedFiles.value.splice(index, 1);
    }
  } else {
    emit("selected", file);
    if (props.showClose) {
      close();
    }
  }
};

const confirmSelection = () => {
  const selected = props.files.filter((file) => 
    selectedFiles.value.includes(file.id)
  );
  emit("selected", selected);
  close();
};

const close = () => {
  emit("close");
};

const navigateTo = (path: string) => {
  currentPath.value = path;
};

const filterFiles = () => {
  // Filtering is handled by computed property
};

watch(currentPath, () => {
  selectedFiles.value = [];
});
</script>

<style scoped>
.file-picker {
  width: 100%;
  max-width: 600px;
  background: var(--uv-surface, #1e1e22);
  border: 1px solid var(--uv-border, #2e2e34);
  border-radius: var(--uv-radius, 8px);
  color: var(--uv-text, #e5e5e5);
  display: flex;
  flex-direction: column;
  max-height: 80vh;
  overflow: hidden;
}

.file-picker__header {
  padding: 14px 16px;
  border-bottom: 1px solid var(--uv-border, #2e2e34);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.file-picker__header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.file-picker__close {
  background: none;
  border: none;
  color: var(--uv-muted, #9898a4);
  cursor: pointer;
  font-size: 1.2rem;
  padding: 4px;
}

.file-picker__close:hover {
  color: var(--uv-text, #e5e5e5);
}

.file-picker__search {
  padding: 12px 16px;
}

.file-picker__search-input {
  width: 100%;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid var(--uv-border, #2e2e34);
  background: #25252a;
  color: var(--uv-text, #e5e5e5);
  box-sizing: border-box;
}

.file-picker__search-input:focus {
  outline: none;
  border-color: #58a6ff;
}

.file-picker__breadcrumbs {
  padding: 8px 16px;
  font-size: 0.85rem;
  color: var(--uv-muted, #9898a4);
}

.file-picker__crumb-btn {
  background: none;
  border: none;
  color: var(--uv-muted, #9898a4);
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
}

.file-picker__crumb-btn:hover {
  color: var(--uv-text, #e5e5e5);
  background: rgba(255, 255, 255, 0.05);
}

.file-picker__crumb-sep {
  margin: 0 4px;
}

.file-picker__list {
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
  overflow-y: auto;
}

.file-picker__item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  border-left: 3px solid transparent;
}

.file-picker__item:hover {
  background: rgba(255, 255, 255, 0.03);
}

.file-picker__item--selected {
  background: rgba(59, 130, 246, 0.2);
  border-left-color: #58a6ff;
}

.file-picker__item--folder {
  font-weight: 600;
}

.file-picker__icon {
  width: 24px;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-picker__name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-picker__size {
  width: 80px;
  text-align: right;
  font-size: 0.85rem;
  color: var(--uv-muted, #9898a4);
  margin-right: 16px;
}

.file-picker__date {
  width: 120px;
  text-align: right;
  font-size: 0.85rem;
  color: var(--uv-muted, #9898a4);
}

.file-picker__actions {
  padding: 12px 16px;
  border-top: 1px solid var(--uv-border, #2e2e34);
  text-align: right;
}

.file-picker__confirm-btn {
  padding: 8px 16px;
  background: #58a6ff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.file-picker__confirm-btn:hover {
  background: #4d94e6;
}
</style>