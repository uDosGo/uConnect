<template>
  <section class="uv-view chat-view" :data-profile="'chat.view'">
    <p class="uv-caption">
      NextChat embed for AI assistant (MCP-capable). Personality:
      <strong>{{ personality }}</strong>
      · MCP:
      <strong>{{ mcpEnabled ? "on" : "off" }}</strong>
    </p>
    <iframe
      title="NextChat"
      class="chat-view__frame"
      src="/vendor/nextchat"
      loading="lazy"
      referrerpolicy="no-referrer"
      @load="$emit('message-sent', { event: 'loaded' })"
    />
  </section>
</template>

<script setup lang="ts">
import "../styles/view-tokens.css";

withDefaults(
  defineProps<{
    personality?: string;
    mcpEnabled?: boolean;
  }>(),
  {
    personality: "default",
    mcpEnabled: true,
  }
);

defineEmits<{
  "message-sent": [payload: Record<string, unknown>];
}>();
</script>

<style scoped>
.chat-view__frame {
  width: 100%;
  min-height: 540px;
  border: 1px solid var(--uv-border, #2e2e34);
  border-radius: 8px;
  background: #0c0c0e;
}
</style>
