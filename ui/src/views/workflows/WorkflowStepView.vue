<template>
  <article class="uv-view workflow-step" :data-profile="'workflows.step'">
    <div class="workflow-step__inner">
      <div class="workflow-step__num" :data-status="step.status">{{ index + 1 }}</div>
      <div>
        <div class="workflow-step__title">{{ step.title }}</div>
        <div class="workflow-step__sub">{{ step.subtitle }}</div>
      </div>
      <div class="workflow-step__menu">
        <button type="button" aria-label="Step menu" @click="$emit('updated', step)">⋯</button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import "../styles/view-tokens.css";

defineProps<{
  step: {
    title: string;
    subtitle: string;
    status?: "active" | "done" | "pending";
  };
  index: number;
}>();

defineEmits<{
  updated: [step: Record<string, unknown>];
}>();
</script>

<style scoped>
.workflow-step {
  padding: 12px;
  border-radius: var(--uv-radius, 8px);
  border: 1px solid var(--uv-border, #2e2e34);
  background: var(--uv-surface, #1e1e22);
}
.workflow-step__inner {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.workflow-step__num {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
  flex-shrink: 0;
}
.workflow-step__num[data-status="active"] {
  background: var(--uv-accent, #5b8cff);
}
.workflow-step__title {
  font-weight: 600;
  font-size: 0.92rem;
}
.workflow-step__sub {
  font-size: 0.8rem;
  color: var(--uv-muted, #9898a4);
  margin-top: 2px;
}
.workflow-step__menu button {
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-size: 1.2rem;
  line-height: 1;
}
</style>
