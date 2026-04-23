<template>
  <article
    class="contact-card"
    :data-profile="'contacts.card'"
    role="button"
    tabindex="0"
    @click="$emit('edit')"
    @keydown.enter="$emit('edit')"
  >
    <div class="contact-card__avatar" :style="{ background: avatarColor }">
      {{ initials }}
    </div>
    <div>
      <div class="contact-card__name">{{ display.name }}</div>
      <div class="contact-card__muted">{{ display.email }}</div>
      <div v-if="display.phone" class="contact-card__muted">{{ display.phone }}</div>
      <span v-if="display.company" class="contact-card__badge">{{ display.company }}</span>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ContactItem } from "../types";
import { MOCK_CONTACTS } from "../data/defaults";
import "../styles/view-tokens.css";

const props = defineProps<{
  contactPath?: string;
  contact?: ContactItem;
}>();

defineEmits<{
  edit: [];
}>();

const display = computed(() => props.contact ?? MOCK_CONTACTS[0]);

const initials = computed(() => {
  const a = display.value.avatar;
  if (a) return a;
  return display.value.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
});

const avatarColor = computed(() => {
  const h = display.value.name.length * 47;
  return `hsl(${h % 360} 35% 32%)`;
});
</script>

<style scoped>
.contact-card {
  display: flex;
  gap: 12px;
  padding: 14px;
  border-radius: var(--uv-radius, 8px);
  border: 1px solid var(--uv-border, #2e2e34);
  background: var(--uv-surface, #1e1e22);
  cursor: pointer;
  text-align: left;
}
.contact-card:hover {
  border-color: var(--uv-accent, #5b8cff);
}
.contact-card__avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
  flex-shrink: 0;
}
.contact-card__name {
  font-weight: 600;
}
.contact-card__muted {
  font-size: 0.82rem;
  color: var(--uv-muted, #9898a4);
  margin-top: 2px;
}
.contact-card__badge {
  display: inline-block;
  margin-top: 6px;
  font-size: 0.68rem;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid var(--uv-border, #2e2e34);
  color: var(--uv-muted, #9898a4);
}
</style>
