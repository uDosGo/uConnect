<template>
  <section class="uv-view activity-feed" :data-profile="'activity.feed'">
    <div class="uv-panel">
      <h2 class="uv-panel__title">Operational activity</h2>
      <ul class="activity-feed__list">
        <li v-for="(item, i) in items" :key="i" class="activity-feed__item">
          <span class="activity-feed__icon" :data-t="item.type">{{
            item.type === "rule" ? "⌁" : "↻"
          }}</span>
          <div>
            <div class="activity-feed__title">{{ item.title }}</div>
            <div class="activity-feed__detail">{{ item.detail }}</div>
            <div class="activity-feed__meta">
              <span>{{ item.timestamp }}</span>
              <span>{{ item.outcome }}</span>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ActivityFeedItem } from "../types";
import { MOCK_ACTIVITY } from "../data/defaults";
import "../styles/view-tokens.css";

const props = withDefaults(
  defineProps<{
    limit?: number;
    feed?: ActivityFeedItem[];
  }>(),
  {
    limit: 20,
    feed: undefined,
  }
);

const items = computed(() => {
  const src = props.feed ?? MOCK_ACTIVITY;
  return src.slice(0, props.limit);
});
</script>

<style scoped>
.activity-feed__list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.activity-feed__item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-bottom: 1px solid var(--uv-border, #2e2e34);
}
.activity-feed__item:last-child {
  border-bottom: none;
}
.activity-feed__icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #2e2e34;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.activity-feed__title {
  font-weight: 600;
  font-size: 0.9rem;
}
.activity-feed__detail {
  font-size: 0.82rem;
  color: var(--uv-muted, #9898a4);
  margin-top: 4px;
}
.activity-feed__meta {
  font-size: 0.72rem;
  color: var(--uv-muted, #9898a4);
  margin-top: 6px;
  display: flex;
  gap: 12px;
}
</style>
