<template>
  <div class="settings-surface">
    <div class="settings-header">
      <h2 class="settings-title">Settings</h2>
      <p class="settings-subtitle">Configure your uDos experience</p>
    </div>
    <FontSettings />
  </div>
</template>

<script setup lang="ts">
import FontSettings from '../../components/FontSettings.vue'
</script>

<style scoped>
.settings-surface {
  background: var(--usx-bg-primary, #0f172a);
  color: var(--usx-text-primary, #e2e8f0);
  min-height: 100%;
  padding: 1rem;
}

.settings-header {
  padding: 1rem 1.5rem 0;
}

.settings-title {
  font-family: var(--usx-font-heading);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--usx-text-heading, #f8fafc);
  margin-bottom: 0.25rem;
}

.settings-subtitle {
  font-family: var(--usx-font-body);
  font-size: 0.875rem;
  color: var(--usx-text-secondary, #64748b);
}
</style>
