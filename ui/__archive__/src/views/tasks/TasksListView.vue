<template>
  <section class="uv-view tasks-list" :data-profile="'tasks.list'">
    <TaskFilterBar v-model="filters" @clear-filters="onClear" />
    <ul class="tasks-list__ul">
      <li
        v-for="task in filtered"
        :key="task.id"
        class="tasks-list__li"
        @click="emit('task-selected', task)"
      >
        <input
          type="checkbox"
          :checked="task.completed"
          :aria-label="`Toggle ${task.title}`"
          @change.stop="toggle(task)"
          @click.stop
        />
        <div>
          <div class="tasks-list__title" :class="{ done: task.completed }">
            {{ task.title }}
          </div>
          <div class="tasks-list__meta">
            <span>{{ task.priority }}</span>
            <span v-if="task.dueDate">Due {{ task.dueDate }}</span>
            <span>{{ task.source }}</span>
          </div>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { TaskItem } from "../types";
import { MOCK_TASKS } from "../data/defaults";
import TaskFilterBar from "./components/TaskFilterBar.vue";
import "../styles/view-tokens.css";

const props = withDefaults(
  defineProps<{
    filter?: Record<string, unknown>;
    sort?: string;
    tasks?: TaskItem[];
  }>(),
  {
    filter: () => ({}),
    sort: "due",
    tasks: undefined,
  }
);

const emit = defineEmits<{
  "task-selected": [task: TaskItem];
  "task-updated": [task: TaskItem];
}>();

const localTasks = ref<TaskItem[]>([]);

watch(
  () => props.tasks,
  (t) => {
    const src = t ?? MOCK_TASKS;
    localTasks.value = src.map((x) => ({ ...x }));
  },
  { immediate: true }
);

const filters = ref({
  query: "",
  priority: "All",
  status: "Active",
  source: "All",
});

const filtered = computed(() => {
  return localTasks.value.filter((t) => {
    if (filters.value.query && !t.title.toLowerCase().includes(filters.value.query.toLowerCase())) {
      return false;
    }
    if (filters.value.priority !== "All" && t.priority !== filters.value.priority.toLowerCase()) {
      return false;
    }
    if (filters.value.status === "Active" && t.completed) return false;
    if (filters.value.status === "Completed" && !t.completed) return false;
    if (filters.value.source !== "All" && t.source !== filters.value.source.toLowerCase()) {
      return false;
    }
    return true;
  });
});

function toggle(task: TaskItem) {
  const next = { ...task, completed: !task.completed };
  const i = localTasks.value.findIndex((x) => x.id === task.id);
  if (i !== -1) localTasks.value[i] = next;
  emit("task-updated", next);
}

function onClear() {
  /* filters reset inside TaskFilterBar */
}
</script>

<style scoped>
.tasks-list__ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
.tasks-list__li {
  display: flex;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid var(--uv-border, #2e2e34);
  cursor: pointer;
}
.tasks-list__title {
  font-weight: 600;
}
.tasks-list__title.done {
  text-decoration: line-through;
  opacity: 0.65;
}
.tasks-list__meta {
  font-size: 0.78rem;
  color: var(--uv-muted, #9898a4);
  display: flex;
  gap: 10px;
  margin-top: 4px;
}
</style>
