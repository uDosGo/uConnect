<template>
  <section class="uv-view workflow-log" :data-profile="'workflows.log'">
    <article v-for="(entry, i) in entries" :key="i" class="log-entry">
      <header>
        <strong>{{ entry.ruleName }}</strong>
        <span class="outcome">{{ entry.outcome }}</span>
      </header>
      <time :datetime="entry.timestamp">{{ entry.timestamp }}</time>
      <ol>
        <li v-for="(s, j) in entry.steps" :key="j">{{ s }}</li>
      </ol>
    </article>
    <button type="button" class="btn clear" @click="$emit('clear')">Clear log</button>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { WorkflowLogEntry } from "../types";
import { MOCK_WORKFLOW_LOGS } from "../data/defaults";
import "../styles/view-tokens.css";

const props = defineProps<{
  workflowId?: string;
  logs?: WorkflowLogEntry[];
}>();

defineEmits<{
  clear: [];
}>();

const entries = computed(() => props.logs ?? MOCK_WORKFLOW_LOGS);
</script>

<style scoped>
.log-entry {
  background: var(--uv-surface, #1e1e22);
  border: 1px solid var(--uv-border, #2e2e34);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}
.log-entry header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
}
.outcome {
  font-size: 0.78rem;
  color: var(--uv-muted, #9898a4);
}
time {
  font-size: 0.72rem;
  color: var(--uv-muted, #9898a4);
}
.log-entry ol {
  margin: 8px 0 0;
  padding-left: 1.2rem;
  font-size: 0.85rem;
}
.btn.clear {
  padding: 6px 12px;
  font-size: 0.82rem;
  border-radius: 6px;
  border: 1px solid var(--uv-border, #2e2e34);
  background: transparent;
  color: inherit;
  cursor: pointer;
}
</style>
