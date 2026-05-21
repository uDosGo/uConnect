<template>
  <div class="proseui-embed">
    <iframe
      ref="proseuiFrame"
      src="http://localhost:5177"
      class="proseui-frame"
      title="ProseUI Document Surface"
      allow="clipboard-read; clipboard-write"
    ></iframe>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const proseuiFrame = ref<HTMLIFrameElement | null>(null)
</script>

<style scoped>
.proseui-embed {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.proseui-frame {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}
</style>
