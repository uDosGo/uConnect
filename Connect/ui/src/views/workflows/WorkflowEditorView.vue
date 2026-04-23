<template>
  <section class="uv-view workflow-editor" :data-profile="'workflows.editor'">
    <form class="workflow-editor__top" @submit.prevent="save">
      <label>
        Rule name
        <input v-model="ruleName" required type="text" placeholder="e.g., High priority inbox" />
      </label>
      <label class="row">
        <input v-model="enabled" type="checkbox" />
        Enabled
      </label>
    </form>
    <section class="rule-section">
      <h3>WHEN (Trigger)</h3>
      <code>{{ trigger }}</code>
    </section>
    <section class="rule-section">
      <h3>IF (Conditions)</h3>
      <ul>
        <li v-for="(c, i) in conditions" :key="i">{{ c }}</li>
      </ul>
    </section>
    <section class="rule-section">
      <h3>THEN (Actions)</h3>
      <ul>
        <li v-for="(a, i) in actions" :key="i">{{ a }}</li>
      </ul>
    </section>
    <div class="workflow-editor__actions">
      <button type="button" class="btn" @click="$emit('saved', draft)">Test Run</button>
      <button type="button" class="btn primary" @click="save">Save Rule</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import "../styles/view-tokens.css";

defineProps<{
  workflowPath?: string;
}>();

const emit = defineEmits<{
  saved: [payload: Record<string, unknown>];
}>();

const ruleName = ref("High priority inbox");
const enabled = ref(true);
const trigger = "task.created";
const conditions = ref(["priority = high", "list = Inbox"]);
const actions = ref(['add_tag("urgent")', 'set_flag("red")']);

const draft = computed(() => ({
  ruleName: ruleName.value,
  enabled: enabled.value,
  trigger,
  conditions: conditions.value,
  actions: actions.value,
}));

function save() {
  emit("saved", draft.value);
}
</script>

<style scoped>
.workflow-editor__top {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}
.workflow-editor__top label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.82rem;
  color: var(--uv-muted, #9898a4);
}
.workflow-editor__top input[type="text"] {
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid var(--uv-border, #2e2e34);
  background: #25252a;
  color: inherit;
}
.workflow-editor__top label.row {
  flex-direction: row;
  align-items: center;
  gap: 8px;
}
.rule-section {
  background: var(--uv-surface, #1e1e22);
  border: 1px solid var(--uv-border, #2e2e34);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}
.rule-section h3 {
  margin: 0 0 8px;
  font-size: 0.85rem;
}
.rule-section code,
.rule-section li {
  font-size: 0.85rem;
}
.workflow-editor__actions {
  display: flex;
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
</style>
