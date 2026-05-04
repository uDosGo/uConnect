<template>
  <div class="task-filter-bar uv-stack uv-stack--h" :data-profile="'tasks.filterBar'">
    <label class="task-filter-bar__field">
      <span class="sr-only">Search</span>
      <input
        v-model="localQuery"
        type="search"
        class="task-filter-bar__search"
        placeholder="Search tasks..."
        @input="emitUpdate"
      />
    </label>
    <label class="task-filter-bar__field">
      Priority
      <select v-model="localPriority" class="task-filter-bar__select" @change="emitUpdate">
        <option v-for="p in priorities" :key="p" :value="p">{{ p }}</option>
      </select>
    </label>
    <label class="task-filter-bar__field">
      Status
      <select v-model="localStatus" class="task-filter-bar__select" @change="emitUpdate">
        <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
      </select>
    </label>
    <label class="task-filter-bar__field">
      Source
      <select v-model="localSource" class="task-filter-bar__select" @change="emitUpdate">
        <option v-for="so in sources" :key="so" :value="so">{{ so }}</option>
      </select>
    </label>
    <button type="button" class="task-filter-bar__clear" @click="clear">
      Clear filters
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import "../../styles/view-tokens.css";

const props = withDefaults(
  defineProps<{
    modelValue?: {
      query: string;
      priority: string;
      status: string;
      source: string;
    };
  }>(),
  {
    modelValue: () => ({
      query: "",
      priority: "All",
      status: "Active",
      source: "All",
    }),
  }
);

const emit = defineEmits<{
  "update:modelValue": [v: typeof props.modelValue];
  clearFilters: [];
}>();

const priorities = ["All", "High", "Medium", "Low"];
const statuses = ["All", "Active", "Completed"];
const sources = ["All", "Reminders", "Vault", "Calendar"];

const localQuery = ref(props.modelValue.query);
const localPriority = ref(props.modelValue.priority);
const localStatus = ref(props.modelValue.status);
const localSource = ref(props.modelValue.source);

watch(
  () => props.modelValue,
  (v) => {
    localQuery.value = v.query;
    localPriority.value = v.priority;
    localStatus.value = v.status;
    localSource.value = v.source;
  },
  { deep: true }
);

function emitUpdate() {
  emit("update:modelValue", {
    query: localQuery.value,
    priority: localPriority.value,
    status: localStatus.value,
    source: localSource.value,
  });
}

function clear() {
  localQuery.value = "";
  localPriority.value = "All";
  localStatus.value = "Active";
  localSource.value = "All";
  emitUpdate();
  emit("clearFilters");
}
</script>

<style scoped>
.task-filter-bar {
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 4px;
}
.task-filter-bar__search {
  width: 240px;
  max-width: 100%;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid var(--uv-border, #2e2e34);
  background: #25252a;
  color: inherit;
}
.task-filter-bar__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.72rem;
  color: var(--uv-muted, #9898a4);
}
.task-filter-bar__select {
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid var(--uv-border, #2e2e34);
  background: #25252a;
  color: inherit;
  min-width: 120px;
}
.task-filter-bar__clear {
  align-self: flex-end;
  padding: 6px 10px;
  font-size: 0.8rem;
  border-radius: 6px;
  border: 1px solid var(--uv-border, #2e2e34);
  background: transparent;
  color: inherit;
  cursor: pointer;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
</style>
