<template>
  <section class="uv-view contacts-list" :data-profile="'contacts.list'">
    <input
      v-model="query"
      type="search"
      class="contacts-list__search"
      placeholder="Search contacts..."
      aria-label="Search contacts"
    />
    <ul class="contacts-list__ul">
      <li v-for="c in filtered" :key="c.id" @click="emit('contact-selected', c)">
        <ContactCardView :contact="c" @edit="emit('contact-selected', c)" />
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { ContactItem } from "../types";
import { MOCK_CONTACTS } from "../data/defaults";
import ContactCardView from "./ContactCardView.vue";
import "../styles/view-tokens.css";

const props = withDefaults(
  defineProps<{
    filter?: string;
    contacts?: ContactItem[];
  }>(),
  {
    filter: "",
    contacts: undefined,
  }
);

const emit = defineEmits<{
  "contact-selected": [contact: ContactItem];
}>();

const query = ref("");
const list = computed(() => props.contacts ?? MOCK_CONTACTS);

const filtered = computed(() => {
  const q = query.value.toLowerCase();
  return list.value.filter(
    (c) =>
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.company && c.company.toLowerCase().includes(q))
  );
});
</script>

<style scoped>
.contacts-list__search {
  width: 100%;
  padding: 8px 12px;
  margin-bottom: 12px;
  border-radius: 6px;
  border: 1px solid var(--uv-border, #2e2e34);
  background: #25252a;
  color: inherit;
  box-sizing: border-box;
}
.contacts-list__ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
