<template>
  <section class="uv-view settings-view" :data-profile="'settings.shell'">
    <h1 class="settings-view__title">Settings</h1>
    <p class="uv-caption">
      Vault path and sync preferences. OSXSync writes health to
      <code>~/vault/.osxsync-health</code>; views read from the vault root you set here.
    </p>
    <div class="settings-view__sections">
      <section class="settings-view__card">
        <h2>Vault</h2>
        <VaultPathPicker
          :model-value="vaultPath"
          @update:model-value="onPath"
          @browse="$emit('browse-vault')"
        />
      </section>
      <section class="settings-view__card">
        <h2>Sync</h2>
        <p class="muted">Configure sources in OSXSync; status appears on the dashboard.</p>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import VaultPathPicker from "./VaultPathPicker.vue";
import "../styles/view-tokens.css";

withDefaults(
  defineProps<{
    vaultPath?: string;
  }>(),
  { vaultPath: "~/vault" }
);

const emit = defineEmits<{
  "update:vaultPath": [path: string];
  "browse-vault": [];
}>();

function onPath(p: string) {
  emit("update:vaultPath", p);
}
</script>

<style scoped>
.settings-view__title {
  margin: 0 0 8px;
  font-size: 1.35rem;
}
.settings-view__sections {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
}
.settings-view__card {
  padding: 16px;
  border-radius: var(--uv-radius, 8px);
  border: 1px solid var(--uv-border, #2e2e34);
  background: var(--uv-surface, #1e1e22);
}
.settings-view__card h2 {
  margin: 0 0 12px;
  font-size: 1rem;
}
.muted {
  margin: 0;
  font-size: 0.88rem;
  color: var(--uv-muted, #9898a4);
}
</style>
