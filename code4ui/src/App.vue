<template>
  <div id="code4ui-root">
    <Code4UISurface />
  </div>
</template>

<script setup lang="ts">
import Code4UISurface from './views/surfaces/code4ui/Code4UISurface.vue'
</script>

<style>
/* ─── Global Reset ────────────────────────────────────────────── */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body, #app, #code4ui-root {
  height: 100%;
  width: 100%;
  overflow: hidden;
}

body {
  font-family: 'SF Mono', 'Fira Code', 'Courier New', monospace;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ─── Material Symbols ────────────────────────────────────────── */
.material-symbol {
  font-family: 'Material Symbols Outlined';
  font-weight: normal;
  font-style: normal;
  font-size: 20px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-smoothing: antialiased;
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20;
}
</style>
