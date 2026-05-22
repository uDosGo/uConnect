<template>
  <aside
    class="uv-view vault-picker"
    role="dialog"
    aria-labelledby="vault-picker-title"
    :data-profile="'vault.picker'"
  >
    <header class="vault-picker__head">
      <h2 id="vault-picker-title">Vault</h2>
    </header>
    <ul class="vault-picker__list">
      <li v-for="row in displayRows" :key="row.id">
        <button
          type="button"
          class="vault-picker__btn"
          @click="onSelect(row)"
        >
          <span class="vault-picker__t">{{ row.title }}</span>
          <span class="vault-picker__s">{{ row.updatedLabel }}</span>
        </button>
      </li>
    </ul>
  </aside>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { VaultFileRow } from "../types";
import { MOCK_VAULT_ROWS } from "../data/defaults";
import "../styles/view-tokens.css";

const props = withDefaults(
  defineProps<{
    vaultPath?: string;
    multiple?: boolean;
    rows?: VaultFileRow[];
  }>(),
  {
    vaultPath: "",
    multiple: false,
    rows: undefined,
  }
);

const emit = defineEmits<{
  selected: [row: VaultFileRow | VaultFileRow[]];
}>();

const displayRows = computed(() => props.rows ?? MOCK_VAULT_ROWS);

function onSelect(row: VaultFileRow) {
  emit("selected", row);
}
</script>

<style scoped>
.vault-picker {
  width: 100%;
  max-width: 420px;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  background: var(--uv-surface, #1e1e22);
  border: 1px solid var(--uv-border, #2e2e34);
  border-radius: var(--uv-radius, 8px);
}
.vault-picker__head {
  padding: 12px 14px;
  border-bottom: 1px solid var(--uv-border, #2e2e34);
}
.vault-picker__head h2 {
  margin: 0;
  font-size: 1rem;
}
.vault-picker__list {
  list-style: none;
  margin: 0;
  padding: 8px;
  flex: 1;
  overflow: auto;
}
.vault-picker__btn {
  width: 100%;
  text-align: left;
  padding: 10px 12px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.vault-picker__btn:hover {
  background: rgba(255, 255, 255, 0.06);
}
.vault-picker__t {
  font-weight: 600;
  font-size: 0.9rem;
}
.vault-picker__s {
  font-size: 0.78rem;
  color: var(--uv-muted, #9898a4);
}
</style>
