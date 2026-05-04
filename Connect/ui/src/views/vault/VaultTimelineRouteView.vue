<template>
  <section class="uv-view vault-timeline" :data-profile="'vault.timeline'">
    <p class="uv-caption">
      Vertical timeline — subtitle carries last-scan relative times when indexing from disk.
    </p>
    <ol class="vault-timeline__list">
      <li
        v-for="row in displayRows"
        :key="row.id"
        class="vault-timeline__item"
        @click="emitSelect(row)"
      >
        <div class="vault-timeline__marker" aria-hidden="true" />
        <div class="vault-timeline__body">
          <div class="vault-timeline__title">{{ row.title }}</div>
          <div class="vault-timeline__sub">{{ row.updatedLabel }}</div>
          <time
            v-if="row.timestamp"
            class="vault-timeline__time"
            :datetime="row.timestamp"
          >{{ row.timestamp }}</time>
        </div>
      </li>
    </ol>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { VaultFileRow } from "../types";
import { MOCK_VAULT_ROWS } from "../data/defaults";
import "../styles/view-tokens.css";

const props = withDefaults(
  defineProps<{
    vaultPath?: string;
    days?: number;
    rows?: VaultFileRow[];
  }>(),
  {
    vaultPath: "",
    days: 30,
    rows: undefined,
  }
);

const emit = defineEmits<{
  "file-selected": [row: VaultFileRow];
}>();

const displayRows = computed(() => props.rows ?? MOCK_VAULT_ROWS);

function emitSelect(row: VaultFileRow) {
  emit("file-selected", row);
}
</script>

<style scoped>
.vault-timeline__list {
  list-style: none;
  margin: 0;
  padding: 0;
  border-left: 2px solid var(--uv-border, #2e2e34);
  margin-left: 8px;
}
.vault-timeline__item {
  position: relative;
  padding: 0 0 16px 20px;
  cursor: pointer;
}
.vault-timeline__item:last-child {
  padding-bottom: 0;
}
.vault-timeline__marker {
  position: absolute;
  left: -7px;
  top: 4px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--uv-accent, #5b8cff);
  border: 2px solid var(--uv-bg, #161618);
}
.vault-timeline__title {
  font-weight: 600;
  font-size: 0.95rem;
}
.vault-timeline__sub {
  font-size: 0.82rem;
  color: var(--uv-muted, #9898a4);
  margin-top: 2px;
}
.vault-timeline__time {
  display: block;
  font-size: 0.72rem;
  color: var(--uv-muted, #9898a4);
  margin-top: 4px;
}
</style>
