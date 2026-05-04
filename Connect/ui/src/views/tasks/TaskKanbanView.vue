<template>
  <section class="uv-view task-kanban" :data-profile="'tasks.kanban'">
    <div class="task-kanban__columns">
      <div v-for="col in columns" :key="col.id" class="task-kanban__column">
        <h3>{{ col.title }} <span class="count">{{ col.tasks.length }}</span></h3>
        <div class="task-kanban__cards">
          <div
            v-for="task in col.tasks"
            :key="task.id"
            class="task-kanban__card"
            draggable="true"
            @click="emit('task-selected', task)"
            @dragstart="onDrag(task, col.id)"
          >
            <div class="task-kanban__card-title">{{ task.title }}</div>
            <div class="task-kanban__card-meta">
              <span>{{ task.priority }}</span>
              <span v-if="task.dueDate">Due {{ fmtDue(task.dueDate) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { TaskItem } from "../types";
import { MOCK_TASKS } from "../data/defaults";
import "../styles/view-tokens.css";

const props = withDefaults(
  defineProps<{
    lists?: string[];
    tasks?: TaskItem[];
  }>(),
  {
    lists: () => ["todo", "in_progress", "done"],
    tasks: undefined,
  }
);

const emit = defineEmits<{
  "task-selected": [task: TaskItem];
  "task-moved": [payload: { taskId: string; from: string; to: string }];
}>();

const base = computed(() => props.tasks ?? MOCK_TASKS);

const columns = computed(() => {
  const todo = base.value.filter((t) => !t.completed && t.priority !== "low");
  const prog = base.value.filter((t) => t.priority === "high" && !t.completed);
  const done = base.value.filter((t) => t.completed || t.priority === "low");
  return [
    { id: "todo", title: "To Do", tasks: todo.length ? todo : base.value.slice(0, 2) },
    { id: "in_progress", title: "In Progress", tasks: prog.length ? prog : base.value.slice(0, 1) },
    { id: "done", title: "Done", tasks: done.length ? done : base.value.slice(2) },
  ];
});

function fmtDue(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function onDrag(task: TaskItem, colId: string) {
  emit("task-moved", { taskId: task.id, from: colId, to: colId });
}
</script>

<style scoped>
.task-kanban__columns {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
.task-kanban__column {
  flex: 1;
  min-width: 200px;
  background: var(--uv-surface, #1e1e22);
  border: 1px solid var(--uv-border, #2e2e34);
  border-radius: var(--uv-radius, 8px);
  padding: 10px;
}
.task-kanban__column h3 {
  margin: 0 0 10px;
  font-size: 0.9rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.count {
  font-size: 0.75rem;
  color: var(--uv-muted, #9898a4);
}
.task-kanban__cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.task-kanban__card {
  padding: 10px;
  border-radius: 6px;
  background: #25252a;
  border: 1px solid var(--uv-border, #2e2e34);
  cursor: pointer;
}
.task-kanban__card-title {
  font-weight: 600;
  font-size: 0.88rem;
}
.task-kanban__card-meta {
  font-size: 0.72rem;
  color: var(--uv-muted, #9898a4);
  margin-top: 6px;
  display: flex;
  gap: 8px;
}
</style>
