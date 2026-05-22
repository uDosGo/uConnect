<template>
  <section class="uv-view prose-surface" :style="themeStyle">
    <header class="prose-surface__header">
      <div>
        <h2 class="prose-surface__title">Prose Surface</h2>
        <p class="uv-caption">
          GitHub-style default surface with cards, panels, markdown prose, and vault publish bridge.
        </p>
      </div>
      <label class="prose-surface__theme-picker">
        Theme
        <select v-model="activeTheme">
          <option v-for="theme in themes" :key="theme.id" :value="theme.id">
            {{ theme.label }}
          </option>
        </select>
      </label>
    </header>

    <div class="prose-surface__grid">
      <aside class="uv-panel prose-surface__panel">
        <h3 class="uv-panel__title">Vault entries</h3>
        <ul class="prose-surface__list">
          <li
            v-for="entry in entries"
            :key="entry.id"
            :class="['prose-surface__entry', { 'is-active': entry.id === selectedEntry?.id }]"
            @click="selectedId = entry.id"
          >
            <strong>{{ entry.title }}</strong>
            <span>{{ entry.updatedAt }}</span>
          </li>
        </ul>
      </aside>

      <main class="prose-surface__main">
        <article class="uv-panel prose-surface__prose">
          <h3 class="uv-panel__title">{{ selectedEntry?.title ?? "No entry selected" }}</h3>
          <div class="prose-surface__markdown">
            <p>{{ selectedEntry?.content ?? "" }}</p>
          </div>
        </article>

        <section class="prose-surface__cards">
          <article class="uv-panel prose-surface__card">
            <h4>USXD/OBF theme remap</h4>
            <p class="uv-muted">
              `UDOS_THEME_PRESETS` maps external styles (NES/Bedstead/C64) to shared `--uv-*` tokens.
            </p>
            <button type="button" class="prose-surface__button">Open token map</button>
          </article>
          <article class="uv-panel prose-surface__card">
            <h4>Vault publish</h4>
            <p class="uv-muted">
              Use `toJekyllMarkdown()` to export vault entries into frontmatter-based posts.
            </p>
            <button type="button" class="prose-surface__button" @click="emitExport">
              Preview Jekyll export
            </button>
          </article>
        </section>
      </main>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import "../styles/view-tokens.css";
import {
  UDOS_THEME_PRESETS,
  type UdosThemeId,
  udosThemeVarsFor,
} from "../themes/udos-themes";
import { toJekyllMarkdown } from "../themes/usxd-publish";

interface SurfaceEntry {
  id: string;
  title: string;
  content: string;
  tags: string[];
  updatedAt: string;
}

const props = withDefaults(
  defineProps<{
    entries?: SurfaceEntry[];
    theme?: UdosThemeId;
  }>(),
  {
    entries: () => [
      {
        id: "surface-1",
        title: "uDos Prose Surface Baseline",
        content: "Bridge markdown, USXD tokens, and vault publishing through one real browser surface.",
        tags: ["usxd", "surface"],
        updatedAt: "2026-04-16",
      },
    ],
    theme: "github-dark",
  }
);

const emit = defineEmits<{
  "export-preview": [markdown: string];
}>();

const themes = UDOS_THEME_PRESETS;
const activeTheme = ref<UdosThemeId>(props.theme);
const selectedId = ref<string>(props.entries[0]?.id ?? "");

const selectedEntry = computed(() => props.entries.find((entry) => entry.id === selectedId.value));
const themeStyle = computed(() => udosThemeVarsFor(activeTheme.value));

function emitExport() {
  if (!selectedEntry.value) {
    return;
  }
  emit(
    "export-preview",
    toJekyllMarkdown(selectedEntry.value, {
      layout: "vault-entry",
      permalinkBase: "/udos",
    })
  );
}
</script>

<style scoped>
.prose-surface__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}
.prose-surface__title {
  margin: 0;
}
.prose-surface__theme-picker {
  display: grid;
  gap: 6px;
  font-size: 0.8rem;
}
.prose-surface__theme-picker select {
  background: var(--uv-surface);
  color: var(--uv-text);
  border: 1px solid var(--uv-border);
  border-radius: 6px;
  padding: 6px 8px;
}
.prose-surface__grid {
  display: grid;
  grid-template-columns: minmax(220px, 280px) 1fr;
  gap: 12px;
}
.prose-surface__panel {
  height: fit-content;
}
.prose-surface__list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.prose-surface__entry {
  border-bottom: 1px solid var(--uv-border);
  padding: 10px 12px;
  display: grid;
  gap: 4px;
  cursor: pointer;
}
.prose-surface__entry.is-active {
  background: color-mix(in srgb, var(--uv-accent) 14%, transparent);
}
.prose-surface__entry span {
  color: var(--uv-muted);
  font-size: 0.75rem;
}
.prose-surface__main {
  display: grid;
  gap: 12px;
}
.prose-surface__prose {
  padding-bottom: 12px;
}
.prose-surface__markdown {
  padding: 12px;
  line-height: 1.55;
}
.prose-surface__cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.prose-surface__card {
  padding: 12px;
}
.prose-surface__card h4 {
  margin-top: 0;
}
.prose-surface__button {
  border: 1px solid var(--uv-border);
  border-radius: 6px;
  padding: 7px 10px;
  color: var(--uv-text);
  background: var(--uv-surface);
  cursor: pointer;
}
.prose-surface__button:hover {
  border-color: var(--uv-accent);
}
@media (max-width: 900px) {
  .prose-surface__grid {
    grid-template-columns: 1fr;
  }
  .prose-surface__cards {
    grid-template-columns: 1fr;
  }
}
</style>

