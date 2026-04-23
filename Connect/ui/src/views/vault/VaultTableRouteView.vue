<template>
  <section class="uv-view vault-table" :data-profile="'vault.table'">
    <p class="uv-caption">
      Rows mirror the vault index (seed or scanned .md under Settings → vault path).
    </p>
    <div class="uv-panel">
      <h2 class="uv-panel__title">Vault entries</h2>
      <table class="vault-table__grid">
        <thead>
          <tr>
            <th class="left">Title</th>
            <th class="right">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in displayRows"
            :key="row.id"
            class="vault-table__row"
            @click="emitSelect(row)"
          >
            <td class="semibold">{{ row.title }}</td>
            <td class="right caption">{{ row.status }}</td>
          </tr>
        </tbody>
      </table>
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
    fileTypes?: string[];
    rows?: VaultFileRow[];
  }>(),
  {
    vaultPath: "",
    fileTypes: () => [".md"],
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
.vault-table__grid {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}
.vault-table__grid th {
  text-align: left;
  padding: 8px 12px;
  color: var(--uv-muted, #9898a4);
  font-weight: 600;
  border-bottom: 1px solid var(--uv-border, #2e2e34);
}
.vault-table__grid th.right,
.vault-table__grid td.right {
  text-align: right;
}
.vault-table__grid td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--uv-border, #2e2e34);
}
.vault-table__row {
  cursor: pointer;
}
.vault-table__row:hover {
  background: rgba(255, 255, 255, 0.04);
}
.semibold {
  font-weight: 600;
}
.caption {
  font-size: 0.82rem;
  color: var(--uv-muted, #9898a4);
}
</style>
