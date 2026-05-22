<template>
  <section class="uv-view vault-board" :data-profile="'vault.board'">
    <p class="uv-caption">
      Board columns are illustrative; card data comes from the same vault index as Table/List.
    </p>
    <div class="vault-board__columns">
      <div v-for="col in columns" :key="col.id" class="vault-board__column">
        <h3 class="vault-board__col-title">{{ col.title }}</h3>
        <div class="vault-board__cards">
          <button
            v-for="row in col.rows"
            :key="row.id"
            type="button"
            class="vault-board__card"
            @click="emitSelect(row)"
          >
            <span class="vault-board__card-title">{{ row.title }}</span>
            <span class="vault-board__card-sub">{{ row.updatedLabel }}</span>
          </button>
        </div>
      </div>
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
    groupBy?: "status" | "column";
    rows?: VaultFileRow[];
  }>(),
  {
    vaultPath: "",
    groupBy: "column",
    rows: undefined,
  }
);

const emit = defineEmits<{
  "file-selected": [row: VaultFileRow];
}>();

const displayRows = computed(() => props.rows ?? MOCK_VAULT_ROWS);

const columns = computed(() => {
  const rows = displayRows.value;
  const inbox = rows.filter((r) => r.boardColumn === "inbox" || !r.boardColumn);
  const doing = rows.filter((r) => r.boardColumn === "doing");
  const done = rows.filter((r) => r.boardColumn === "done");
  return [
    { id: "inbox", title: "Inbox", rows: inbox.length ? inbox : rows.slice(0, 2) },
    { id: "doing", title: "Doing", rows: doing.length ? doing : rows.slice(1, 2) },
    { id: "done", title: "Done", rows: done.length ? done : rows.slice(2) },
  ];
});

function emitSelect(row: VaultFileRow) {
  emit("file-selected", row);
}
</script>

<style scoped>
.vault-board__columns {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.vault-board__column {
  flex: 1;
  min-width: 180px;
  background: var(--uv-surface, #1e1e22);
  border: 1px solid var(--uv-border, #2e2e34);
  border-radius: var(--uv-radius, 8px);
  padding: 10px;
}
.vault-board__col-title {
  margin: 0 0 10px;
  font-size: 0.85rem;
  font-weight: 600;
}
.vault-board__cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.vault-board__card {
  text-align: left;
  background: #25252a;
  border: 1px solid var(--uv-border, #2e2e34);
  border-radius: 6px;
  padding: 8px 10px;
  cursor: pointer;
  color: inherit;
}
.vault-board__card:hover {
  border-color: var(--uv-accent, #5b8cff);
}
.vault-board__card-title {
  display: block;
  font-weight: 600;
  font-size: 0.88rem;
}
.vault-board__card-sub {
  font-size: 0.75rem;
  color: var(--uv-muted, #9898a4);
}
</style>
