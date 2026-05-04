<template>
  <div
    class="sync-pill"
    :data-state="effectiveState"
    :data-profile="'sync.statusPill'"
    role="status"
  >
    <span class="sync-pill__icon" aria-hidden="true">{{ variant.icon }}</span>
    <span class="sync-pill__label">{{ variant.label }}</span>
    <span class="sync-pill__detail">{{ variant.detail }}</span>
    <span class="sync-pill__count">{{ sourcesCount }} sources</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { SyncPillState } from "../types";
import "../styles/view-tokens.css";

const props = withDefaults(
  defineProps<{
    state?: SyncPillState;
    label?: string;
    detail?: string;
    sourcesCount?: number;
  }>(),
  {
    state: "synced",
    label: "",
    detail: "",
    sourcesCount: 5,
  }
);

const presets: Record<
  SyncPillState,
  { icon: string; label: string; detail: string; color: string }
> = {
  synced: {
    icon: "✓",
    label: "Synced",
    detail: "Last activity 5 minutes ago",
    color: "green",
  },
  syncing: {
    icon: "↻",
    label: "Syncing",
    detail: "Sync in progress",
    color: "blue",
  },
  warning: {
    icon: "!",
    label: "Warning",
    detail: "1 source flagged",
    color: "orange",
  },
  error: {
    icon: "✕",
    label: "Error",
    detail: "1 source needs action",
    color: "red",
  },
  idle: {
    icon: "‖",
    label: "Idle",
    detail: "All sources paused",
    color: "gray",
  },
};

const effectiveState = computed(() => props.state);

const variant = computed(() => {
  const base = presets[props.state];
  return {
    icon: base.icon,
    label: props.label || base.label,
    detail: props.detail || base.detail,
    color: base.color,
  };
});
</script>

<style scoped>
.sync-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.82rem;
  border: 1px solid var(--uv-border, #2e2e34);
  background: var(--uv-surface, #1e1e22);
}
.sync-pill[data-state="synced"] {
  border-color: rgba(76, 175, 122, 0.4);
}
.sync-pill[data-state="syncing"] {
  border-color: rgba(91, 140, 255, 0.5);
}
.sync-pill[data-state="warning"] {
  border-color: rgba(230, 162, 60, 0.5);
}
.sync-pill[data-state="error"] {
  border-color: rgba(232, 93, 93, 0.5);
}
.sync-pill__detail,
.sync-pill__count {
  color: var(--uv-muted, #9898a4);
  font-size: 0.78rem;
}
.sync-pill__label {
  font-weight: 600;
}
</style>
