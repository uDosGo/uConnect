<template>
  <article
    class="task-card"
    :data-profile="'tasks.card'"
    @click="$emit('click', $event)"
  >
    <div class="task-card__row">
      <input
        :checked="checked"
        type="checkbox"
        :aria-label="`Complete ${title}`"
        @change="$emit('toggleComplete')"
        @click.stop
      />
      <div class="task-card__main">
        <div class="task-card__title">{{ title }}</div>
        <div class="task-card__badges">
          <span v-if="priority" class="badge badge--red">{{ priorityLabel }}</span>
          <span v-if="due" class="badge badge--gray">{{ due }}</span>
          <span v-if="sourceLabel" class="badge badge--outline">{{ sourceLabel }}</span>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";
import "../../styles/view-tokens.css";

const props = withDefaults(
  defineProps<{
    title: string;
    checked?: boolean;
    priority?: "high" | "medium" | "low" | null;
    due?: string;
    source?: "reminders" | "vault" | "calendar" | null;
  }>(),
  {
    checked: false,
    priority: null,
    due: "",
    source: null,
  }
);

defineEmits<{
  toggleComplete: [];
  click: [MouseEvent];
}>();

const priorityLabel = computed(() => {
  if (!props.priority) return "";
  return props.priority.charAt(0).toUpperCase() + props.priority.slice(1);
});

const sourceLabel = computed(() => {
  if (!props.source) return "";
  return props.source.charAt(0).toUpperCase() + props.source.slice(1);
});
</script>

<style scoped>
.task-card {
  padding: 12px;
  border-radius: var(--uv-radius, 8px);
  border: 1px solid var(--uv-border, #2e2e34);
  background: var(--uv-surface, #1e1e22);
  cursor: pointer;
}
.task-card:hover {
  border-color: var(--uv-accent, #5b8cff);
}
.task-card__row {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}
.task-card__title {
  font-weight: 600;
  font-size: 0.92rem;
}
.task-card__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}
.badge {
  font-size: 0.68rem;
  padding: 2px 6px;
  border-radius: 4px;
}
.badge--red {
  background: rgba(232, 93, 93, 0.2);
  color: #f0a0a0;
}
.badge--gray {
  background: rgba(255, 255, 255, 0.08);
  color: var(--uv-muted, #9898a4);
}
.badge--outline {
  border: 1px solid rgba(91, 140, 255, 0.4);
  color: #9db8ff;
  background: transparent;
}
</style>
