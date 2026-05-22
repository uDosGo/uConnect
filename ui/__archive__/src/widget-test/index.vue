<template>
  <main class="widget-test">
    <h1>Widget Integration Test Bed</h1>
    <p>Sandbox for evaluating external widget integration patterns in A1.</p>
    <section class="uv-view widget-skin-preview" :data-skin="skin">
      <label class="widget-skin-preview__label">
        Skin:
        <select v-model="skin">
          <option v-for="option in skins" :key="option" :value="option">{{ option }}</option>
        </select>
      </label>
      <p class="uv-caption">USXD skin token preview for browser surfaces.</p>
      <div class="uv-panel">
        <h3 class="uv-panel__title">Tailwind lane preview card</h3>
        <div class="widget-skin-preview__body">
          <span class="chip chip--accent">accent</span>
          <span class="chip chip--success">success</span>
          <span class="chip chip--warning">warning</span>
        </div>
      </div>
    </section>
    <ProseSurfaceView :entries="surfaceEntries" @export-preview="handleExportPreview" />
    <section v-if="exportPreview" class="uv-view">
      <p class="uv-caption">Jekyll export preview from Prose surface</p>
      <pre class="export-preview">{{ exportPreview }}</pre>
    </section>
    <EditTFWidget />
    <NextChatWidget />
  </main>
</template>

<script setup lang="ts">
import { ref } from "vue";
import "../views/styles/view-tokens.css";
import ProseSurfaceView from "../views/surfaces/ProseSurfaceView.vue";
import EditTFWidget from "./EditTFWidget.vue";
import NextChatWidget from "./NextChatWidget.vue";

const skins = ["default", "terminal", "nord", "amber"] as const;
const skin = ref<(typeof skins)[number]>("default");
const exportPreview = ref("");
const surfaceEntries = [
  {
    id: "vault-post-1",
    title: "Default Prose Surface",
    content:
      "This surface is a real browser-facing baseline for cards, panel layout, and markdown-compatible publishing.",
    tags: ["surface", "vault", "jekyll"],
    updatedAt: "2026-04-16",
  },
  {
    id: "vault-post-2",
    title: "Theme remap standard",
    content:
      "USXD token remap allows NES.css, Bedstead, and C64 forks to target one shared view contract.",
    tags: ["usxd", "obf", "theme"],
    updatedAt: "2026-04-16",
  },
];

function handleExportPreview(markdown: string) {
  exportPreview.value = markdown;
}
</script>

<style scoped>
.widget-test {
  display: grid;
  gap: 16px;
  padding: 16px;
}
.widget-skin-preview__label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.widget-skin-preview__body {
  display: flex;
  gap: 8px;
  padding: 12px;
}
.chip {
  border-radius: 999px;
  padding: 4px 10px;
  border: 1px solid var(--uv-border);
  background: var(--uv-surface);
  color: var(--uv-text);
  font-size: 0.75rem;
}
.chip--accent {
  border-color: var(--uv-accent);
}
.chip--success {
  border-color: var(--uv-success);
}
.chip--warning {
  border-color: var(--uv-warning);
}
.export-preview {
  margin: 0;
  border: 1px solid var(--uv-border);
  border-radius: 8px;
  padding: 12px;
  background: var(--uv-surface);
  color: var(--uv-text);
  white-space: pre-wrap;
}
</style>
