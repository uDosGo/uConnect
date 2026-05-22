<template>
  <section
    class="uv-view contact-picker sheet"
    role="dialog"
    aria-labelledby="contact-picker-title"
    :data-profile="'contacts.picker'"
  >
    <h2 id="contact-picker-title">Select Contact</h2>
    <input
      v-model="query"
      type="search"
      class="contact-picker__search"
      placeholder="Search contacts..."
      aria-label="Search contacts"
    />
    <ul class="contact-picker__list">
      <li v-for="c in filtered" :key="c.id">
        <button type="button" class="contact-picker__btn" @click="pick(c)">
          <span class="av">{{ c.avatar ?? initials(c.name) }}</span>
          <span>
            <span class="name">{{ c.name }}</span>
            <span class="email">{{ c.email }}</span>
          </span>
        </button>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { ContactItem } from "../types";
import { MOCK_CONTACTS } from "../data/defaults";
import "../styles/view-tokens.css";

const props = withDefaults(
  defineProps<{
    multiple?: boolean;
    contacts?: ContactItem[];
  }>(),
  {
    multiple: false,
    contacts: undefined,
  }
);

const emit = defineEmits<{
  selected: [contact: ContactItem | ContactItem[]];
}>();

const query = ref("");
const list = computed(() => props.contacts ?? MOCK_CONTACTS);

const filtered = computed(() => {
  const q = query.value.toLowerCase();
  return list.value.filter(
    (c) => !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
  );
});

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function pick(c: ContactItem) {
  emit("selected", c);
}
</script>

<style scoped>
.sheet {
  max-width: 400px;
  min-height: 320px;
  background: var(--uv-surface, #1e1e22);
  border: 1px solid var(--uv-border, #2e2e34);
  border-radius: var(--uv-radius, 8px);
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.sheet h2 {
  margin: 0;
  font-size: 1rem;
}
.contact-picker__search {
  width: 100%;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid var(--uv-border, #2e2e34);
  background: #25252a;
  color: inherit;
  box-sizing: border-box;
}
.contact-picker__list {
  list-style: none;
  margin: 0;
  padding: 0;
  overflow: auto;
}
.contact-picker__btn {
  width: 100%;
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  text-align: left;
}
.contact-picker__btn:hover {
  background: rgba(255, 255, 255, 0.06);
}
.av {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #3a3a44;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
}
.name {
  display: block;
  font-weight: 600;
}
.email {
  display: block;
  font-size: 0.8rem;
  color: var(--uv-muted, #9898a4);
}
</style>
