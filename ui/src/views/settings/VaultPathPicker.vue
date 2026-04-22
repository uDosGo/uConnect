<template>
  <div class="vault-path-picker" :data-profile="'settings.vaultPath'">
    <label class="vault-path-picker__label">
      Vault path
      <div class="vault-path-picker__row">
        <input
          :value="modelValue"
          type="text"
          class="vault-path-picker__input"
          placeholder="~/vault"
          @input="onInput"
        />
        <button type="button" class="vault-path-picker__btn" @click="$emit('browse')">
          Browse…
        </button>
      </div>
    </label>
    <p class="vault-path-picker__hint">
      Web shell: paste a path or connect a desktop bridge; native apps can open a folder dialog.
    </p>
  </div>
</template>

<script setup lang="ts">
import "../styles/view-tokens.css";

defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [path: string];
  browse: [];
}>();

function onInput(e: Event) {
  const v = (e.target as HTMLInputElement).value;
  emit("update:modelValue", v);
}
</script>

<style scoped>
.vault-path-picker__label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--uv-muted, #9898a4);
}
.vault-path-picker__row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.vault-path-picker__input {
  flex: 1;
  min-width: 200px;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid var(--uv-border, #2e2e34);
  background: #25252a;
  color: inherit;
}
.vault-path-picker__btn {
  padding: 8px 14px;
  border-radius: 6px;
  border: 1px solid var(--uv-border, #2e2e34);
  background: #2a2a30;
  color: inherit;
  cursor: pointer;
}
.vault-path-picker__hint {
  margin: 8px 0 0;
  font-size: 0.78rem;
  color: var(--uv-muted, #9898a4);
}
</style>
