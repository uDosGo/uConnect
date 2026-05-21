<template>
  <Code3UISurface />
</template>

<script setup lang="ts">
import Code3UISurface from './views/surfaces/code3ui/Code3UISurface.vue'
</script>

<style>
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  height: 100%;
  overflow: hidden;
}

#app {
  height: 100%;
}
</style>
