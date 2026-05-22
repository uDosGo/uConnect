<template>
  <section
    class="uv-view task-create sheet"
    role="dialog"
    aria-labelledby="task-create-title"
    :data-profile="'tasks.create'"
  >
    <h2 id="task-create-title">New Task</h2>
    <form class="task-create__form" @submit.prevent="submit">
      <label>
        Title
        <input v-model="form.title" required type="text" placeholder="Task title" />
      </label>
      <label>
        Description
        <textarea v-model="form.description" rows="3" placeholder="Optional details" />
      </label>
      <label>
        Priority
        <select v-model="form.priority">
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </label>
      <label>
        Due date
        <input v-model="form.dueDate" type="date" />
      </label>
      <label>
        Source
        <select v-model="form.source">
          <option value="Reminders">Reminders</option>
          <option value="Vault">Vault</option>
        </select>
      </label>
      <div class="task-create__actions">
        <button type="button" class="btn" @click="emit('dismiss')">Cancel</button>
        <button type="submit" class="btn primary">Create</button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import "../styles/view-tokens.css";

withDefaults(
  defineProps<{
    defaultList?: string;
  }>(),
  { defaultList: "Inbox" }
);

const emit = defineEmits<{
  created: [payload: Record<string, string>];
  dismiss: [];
}>();

const form = reactive({
  title: "",
  description: "",
  priority: "Medium",
  dueDate: "",
  source: "Vault",
});

function submit() {
  emit("created", { ...form });
}
</script>

<style scoped>
.sheet {
  max-width: 480px;
  background: var(--uv-surface, #1e1e22);
  border: 1px solid var(--uv-border, #2e2e34);
  border-radius: var(--uv-radius, 8px);
  padding: 16px;
}
.sheet h2 {
  margin: 0 0 16px;
  font-size: 1.1rem;
}
.task-create__form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.task-create__form label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.82rem;
  color: var(--uv-muted, #9898a4);
}
.task-create__form input,
.task-create__form textarea,
.task-create__form select {
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid var(--uv-border, #2e2e34);
  background: #25252a;
  color: inherit;
}
.task-create__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
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
</style>
