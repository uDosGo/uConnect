<template>
  <section class="uv-view tower-browser" :style="themeStyle">
    <header class="tower-browser__header">
      <h2 class="tower-browser__title">Tower of Knowledge</h2>
      <p class="uv-caption">
        Slots 0–7: Private → Global Knowledge Bank. Drag surfaces to move.
      </p>
    </header>

    <div class="tower-browser__slots">
      <article
        v-for="slot in slots"
        :key="slot.id"
        class="uv-panel tower-browser__slot"
        :class="`tower-browser__slot--${slot.color}`"
      >
        <h3 class="uv-panel__title">
          Slot {{ slot.id }}: {{ slot.name }}
          <span class="tower-browser__count">({{ slot.surfaces.length }})</span>
        </h3>
        <ul class="tower-browser__list">
          <li
            v-for="surface in slot.surfaces"
            :key="surface"
            class="tower-browser__surface"
            draggable="true"
            @dragstart="onDragStart($event, surface, slot.id)"
            @dragover.prevent
            @drop="onDrop($event, slot.id, surface)"
          >
            {{ surface }}
          </li>
          <li v-if="slot.surfaces.length === 0" class="uv-muted">
            No surfaces
          </li>
        </ul>
      </article>
    </div>

    <footer class="tower-browser__footer">
      <button type="button" class="tower-browser__button" @click="refresh">
        Refresh
      </button>
      <button type="button" class="tower-browser__button" @click="publishSelected">
        Publish to Slot 5
      </button>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import "../styles/view-tokens.css";
import {
  UDOS_THEME_PRESETS,
  type UdosThemeId,
  udosThemeVarsFor,
} from "../themes/udos-themes";

interface TowerSlot {
  id: number;
  name: string;
  color: string;
  surfaces: string[];
}

const props = withDefaults(
  defineProps<{
    theme?: UdosThemeId;
  }>(),
  {
    theme: "github-dark",
  }
);

const themes = UDOS_THEME_PRESETS;
const activeTheme = ref<UdosThemeId>(props.theme);
const themeStyle = computed(() => udosThemeVarsFor(activeTheme.value));

// Mock data — replace with API calls to uDos core
const slots = ref<TowerSlot[]>([
  { id: 0, name: "Private", color: "black", surfaces: ["my-notes", "draft-1"] },
  { id: 1, name: "Public Local", color: "green", surfaces: ["team-update"] },
  { id: 2, name: "Password Local", color: "yellow", surfaces: [] },
  { id: 3, name: "Group Local", color: "orange", surfaces: [] },
  { id: 4, name: "Unpublished Cloud", color: "white", surfaces: ["backup-2026"] },
  { id: 5, name: "Published Public", color: "blue", surfaces: ["udos-guide"] },
  { id: 6, name: "Password Cloud", color: "purple", surfaces: [] },
  { id: 7, name: "Group Cloud", color: "red", surfaces: [] },
]);

const draggedSurface = ref<{ name: string; fromSlot: number } | null>(null);

function onDragStart(event: DragEvent, surface: string, fromSlot: number) {
  if (event.dataTransfer) {
    event.dataTransfer.setData("text/plain", surface);
    draggedSurface.value = { name: surface, fromSlot };
  }
}

async function onDrop(event: DragEvent, toSlot: number, targetSurface?: string) {
  if (!draggedSurface.value || !event.dataTransfer) return;
  const { name, fromSlot } = draggedSurface.value;
  if (fromSlot === toSlot) return;

  // Remove from source slot
  const from = slots.value.find((s) => s.id === fromSlot);
  if (from) {
    from.surfaces = from.surfaces.filter((s) => s !== name);
  }

  // Add to target slot
  const to = slots.value.find((s) => s.id === toSlot);
  if (to) {
    to.surfaces.push(name);
  }

  // TODO: Call uDos core API: `udo tower move ${name} --to ${toSlot}`
  console.log(`Moved ${name} from slot ${fromSlot} to ${toSlot}`);
  draggedSurface.value = null;
}

function refresh() {
  // TODO: Fetch from uDos core
  console.log("Refreshing tower...");
}

function publishSelected() {
  // TODO: Publish first surface in slot 4 to slot 5
  const slot4 = slots.value.find((s) => s.id === 4);
  if (slot4?.surfaces.length) {
    const surface = slot4.surfaces[0];
    // Call `udo tower publish ${surface}`
    console.log(`Publishing ${surface} to slot 5`);
  }
}
</script>

<style scoped>
.tower-browser__header {
  margin-bottom: 12px;
}
.tower-browser__title {
  margin: 0;
}
.tower-browser__slots {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}
.tower-browser__slot {
  padding: 12px;
  border: 1px solid var(--uv-border);
}
.tower-browser__slot--black {
  border-color: color-mix(in srgb, var(--uv-accent) 20%, transparent);
}
.tower-browser__slot--green {
  border-color: color-mix(in srgb, #4ade80 30%, transparent);
}
.tower-browser__slot--yellow {
  border-color: color-mix(in srgb, #fbbf24 30%, transparent);
}
.tower-browser__slot--orange {
  border-color: color-mix(in srgb, #fb923c 30%, transparent);
}
.tower-browser__slot--white {
  border-color: color-mix(in srgb, var(--uv-text) 20%, transparent);
}
.tower-browser__slot--blue {
  border-color: color-mix(in srgb, #60a5fa 30%, transparent);
}
.tower-browser__slot--purple {
  border-color: color-mix(in srgb, #a78bfa 30%, transparent);
}
.tower-browser__slot--red {
  border-color: color-mix(in srgb, #fb7185 30%, transparent);
}
.tower-browser__count {
  color: var(--uv-muted);
  font-size: 0.8rem;
}
.tower-browser__list {
  list-style: none;
  margin: 8px 0;
  padding: 0;
}
.tower-browser__surface {
  padding: 6px 8px;
  margin: 4px 0;
  background: var(--uv-surface);
  border-radius: 4px;
  cursor: move;
}
.tower-browser__surface:hover {
  background: color-mix(in srgb, var(--uv-accent) 12%, transparent);
}
.tower-browser__footer {
  display: flex;
  gap: 8px;
}
.tower-browser__button {
  border: 1px solid var(--uv-border);
  border-radius: 6px;
  padding: 7px 10px;
  color: var(--uv-text);
  background: var(--uv-surface);
  cursor: pointer;
}
.tower-browser__button:hover {
  border-color: var(--uv-accent);
}
@media (max-width: 900px) {
  .tower-browser__slots {
    grid-template-columns: 1fr;
  }
}
</style>
