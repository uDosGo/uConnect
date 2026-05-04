<template>
  <section class="uv-view dashboard-tower" :data-profile="'dashboard.tower'">
    <div class="dashboard-tower__grid">
      <article
        v-for="card in cards"
        :key="card.title"
        class="dash-card"
        :data-accent="card.accent"
      >
        <div class="dash-card__icon" aria-hidden="true">{{ card.icon }}</div>
        <h3>{{ card.title }}</h3>
        <p>{{ card.detail }}</p>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import "../styles/view-tokens.css";

const cards = [
  {
    title: "System Health",
    detail: "4 sources connected, 1 sync in progress",
    accent: "green",
    icon: "✓",
  },
  {
    title: "Active Rules",
    detail: "12 enabled · 1 warning · 0 failed",
    accent: "blue",
    icon: "⌁",
  },
  {
    title: "Recent Events",
    detail: "task.updated · reminders.synced · calendar.ingested",
    accent: "orange",
    icon: "◷",
  },
  {
    title: "Conflicts",
    detail: "2 unresolved entities need operator action",
    accent: "red",
    icon: "!",
  },
];
</script>

<style scoped>
.dashboard-tower__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}
.dash-card {
  padding: 14px;
  border-radius: var(--uv-radius, 8px);
  border: 1px solid var(--uv-border, #2e2e34);
  background: var(--uv-surface, #1e1e22);
}
.dash-card[data-accent="green"] {
  border-left: 3px solid var(--uv-success, #4caf7a);
}
.dash-card[data-accent="blue"] {
  border-left: 3px solid var(--uv-accent, #5b8cff);
}
.dash-card[data-accent="orange"] {
  border-left: 3px solid var(--uv-warning, #e6a23c);
}
.dash-card[data-accent="red"] {
  border-left: 3px solid var(--uv-danger, #e85d5d);
}
.dash-card__icon {
  font-size: 1.2rem;
  margin-bottom: 6px;
}
.dash-card h3 {
  margin: 0 0 6px;
  font-size: 0.95rem;
}
.dash-card p {
  margin: 0;
  font-size: 0.82rem;
  color: var(--uv-muted, #9898a4);
  line-height: 1.4;
}
</style>
