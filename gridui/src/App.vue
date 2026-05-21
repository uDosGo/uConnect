<template>
  <GridUISurface />
</template>

<script setup lang="ts">
import GridUISurface from './views/surfaces/gridui/GridUISurface.vue'
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
