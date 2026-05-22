<template>
  <section class="uv-view prose-surface-route">
    <p class="uv-caption">
      Route wrapper for the default Prose browser surface (cards/buttons/panels + vault publish bridge).
    </p>
    <ProseSurfaceView :entries="entries" @export-preview="lastExport = $event" />
    <article v-if="lastExport" class="uv-panel prose-surface-route__export">
      <h3 class="uv-panel__title">Latest export preview</h3>
      <pre>{{ lastExport }}</pre>
    </article>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import "../styles/view-tokens.css";
import ProseSurfaceView from "./ProseSurfaceView.vue";

const lastExport = ref("");
const entries = [
  {
    id: "route-entry-1",
    title: "Universal Device Operating Surface baseline",
    content: "Use this route as the default prose-first browser shell for vault-backed content.",
    tags: ["udos", "surface", "vault"],
    updatedAt: "2026-04-16",
  },
];
</script>

<style scoped>
.prose-surface-route {
  display: grid;
  gap: 12px;
}
.prose-surface-route__export {
  overflow: auto;
}
.prose-surface-route__export pre {
  margin: 0;
  padding: 12px;
  white-space: pre-wrap;
}
</style>

