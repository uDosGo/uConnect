<template>
  <article class="uv-view task-detail" :data-profile="'tasks.detail'">
    <p v-if="taskPath" class="task-detail__path uv-caption">{{ taskPath }}</p>
    <header class="task-detail__header">
      <span aria-hidden="true">✓</span>
      <h1>{{ display.title }}</h1>
    </header>
    <dl class="task-detail__props">
      <div v-for="p in properties" :key="p.label" class="task-detail__row">
        <dt>{{ p.label }}</dt>
        <dd>
          <span :class="['val', p.type]">{{ p.value }}</span>
        </dd>
      </div>
    </dl>
    <hr class="task-detail__hr" />
    <p class="task-detail__body">{{ display.body }}</p>
    <div class="task-detail__actions">
      <button type="button" class="btn primary" @click="emit('updated', display)">
        Mark Complete
      </button>
      <button type="button" class="btn" @click="emit('updated', display)">Edit</button>
      <button type="button" class="btn danger" @click="emit('deleted')">Delete</button>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";
import "../styles/view-tokens.css";

withDefaults(
  defineProps<{
    taskPath?: string;
  }>(),
  { taskPath: "" }
);

const emit = defineEmits<{
  updated: [payload: Record<string, unknown>];
  deleted: [];
}>();

const display = computed(() => ({
  title: "Review sync health dashboard",
  body:
    "Check each source adapter health status and run probes for any that show errors.",
  status: "In progress",
  priority: "High",
  due: "Apr 16, 2026",
  source: "Reminders",
}));

const properties = computed(() => [
  { label: "Status", value: display.value.status, type: "badge" },
  { label: "Priority", value: display.value.priority, type: "badge red" },
  { label: "Due", value: display.value.due, type: "date" },
  { label: "Source", value: display.value.source, type: "text" },
]);
</script>

<style scoped>
.task-detail__header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}
.task-detail__header h1 {
  margin: 0;
  font-size: 1.25rem;
}
.task-detail__props {
  display: grid;
  gap: 8px;
  margin: 0;
}
.task-detail__row {
  display: flex;
  gap: 12px;
  align-items: center;
}
.task-detail__row dt {
  width: 88px;
  color: var(--uv-muted, #9898a4);
  font-size: 0.85rem;
}
.task-detail__row dd {
  margin: 0;
}
.val.badge {
  background: rgba(255, 255, 255, 0.08);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
}
.val.red {
  background: rgba(232, 93, 93, 0.2);
}
.task-detail__hr {
  border: none;
  border-top: 1px solid var(--uv-border, #2e2e34);
  margin: 16px 0;
}
.task-detail__body {
  line-height: 1.5;
  margin: 0 0 20px;
}
.task-detail__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.btn {
  padding: 8px 14px;
  border-radius: 6px;
  border: 1px solid var(--uv-border, #2e2e34);
  background: #2a2a30;
  color: inherit;
  cursor: pointer;
}
.btn.primary {
  background: var(--uv-accent, #5b8cff);
  border-color: transparent;
}
.btn.danger {
  color: #f0a0a0;
  border-color: rgba(232, 93, 93, 0.5);
}
</style>
