<template>
  <section class="uv-view vault-list" :data-profile="'vault.list'">
    <p class="uv-caption">
      Compact list — selection still tracks the sidebar / Typo route.
    </p>
    <div class="uv-panel">
      <h2 class="uv-panel__title">Vault files</h2>
      <ul class="vault-list__ul">
        <li
          v-for="row in displayRows"
          :key="row.id"
          class="vault-list__item"
          @click="emitSelect(row)"
        >
          <span class="vault-list__icon" aria-hidden="true">📄</span>
          <div>
            <div class="vault-list__title">{{ row.title }}</div>
            <div class="vault-list__sub">{{ row.updatedLabel }}</div>
          </div>
        </li>
      </ul>
    </div>
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
    compact?: boolean;
    rows?: VaultFileRow[];
  }>(),
  {
    vaultPath: "",
    compact: true,
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
.vault-list__ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
.vault-list__item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 10px 12px;
  cursor: pointer;
  border-bottom: 1px solid var(--uv-border, #2e2e34);
}
.vault-list__item:last-child {
  border-bottom: none;
}
.vault-list__item:hover {
  background: rgba(255, 255, 255, 0.04);
}
.vault-list__title {
  font-weight: 600;
  font-size: 0.92rem;
}
.vault-list__sub {
  font-size: 0.8rem;
  color: var(--uv-muted, #9898a4);
  margin-top: 2px;
}
</style>
