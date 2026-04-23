<template>
  <section class="uv-view contact-edit" :data-profile="'contacts.edit'">
    <header class="contact-edit__head">
      <button type="button" class="back" @click="$emit('cancel')">←</button>
      <h1>Edit Contact</h1>
    </header>
    <form class="contact-edit__form" @submit.prevent="save">
      <label v-for="f in fields" :key="f.key">
        {{ f.label }}
        <input v-if="f.type !== 'textarea'" v-model="form[f.key]" :type="f.type" />
        <textarea v-else v-model="form[f.key]" rows="3" />
      </label>
      <div class="contact-edit__actions">
        <button type="button" class="btn" @click="$emit('cancel')">Cancel</button>
        <button type="submit" class="btn primary">Save</button>
        <button type="button" class="btn danger" @click="$emit('deleted')">Delete</button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import "../styles/view-tokens.css";

defineProps<{
  contactPath: string;
}>();

const emit = defineEmits<{
  saved: [payload: Record<string, string>];
  deleted: [];
  cancel: [];
}>();

const form = reactive({
  firstName: "Alice",
  lastName: "Chen",
  email: "alice@example.com",
  phone: "+1 555-0101",
  company: "Design Studio",
  notes: "",
});

const fields = [
  { key: "firstName" as const, label: "First name", type: "text" },
  { key: "lastName" as const, label: "Last name", type: "text" },
  { key: "email" as const, label: "Email", type: "email" },
  { key: "phone" as const, label: "Phone", type: "tel" },
  { key: "company" as const, label: "Company", type: "text" },
  { key: "notes" as const, label: "Notes", type: "textarea" },
];

function save() {
  emit("saved", { ...form });
}
</script>

<style scoped>
.contact-edit__head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}
.contact-edit__head h1 {
  margin: 0;
  font-size: 1.2rem;
}
.back {
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-size: 1.2rem;
}
.contact-edit__form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.contact-edit__form label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.82rem;
  color: var(--uv-muted, #9898a4);
}
.contact-edit__form input,
.contact-edit__form textarea {
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid var(--uv-border, #2e2e34);
  background: #25252a;
  color: inherit;
}
.contact-edit__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 8px;
}
.btn {
  padding: 8px 14px;
  border-radius: 6px;
  border: 1px solid var(--uv-border, #2e2e34);
  background: #2a2a30;
  color: inherit;
  cursor: pointer;
}
.btn.primary {
  background: var(--uv-accent, #5b8cff);
  border-color: transparent;
}
.btn.danger {
  color: #f0a0a0;
}
</style>
