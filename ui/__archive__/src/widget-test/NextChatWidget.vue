<template>
  <section class="widget">
    <h2>NextChat Test</h2>
    <p>Candidate MCP-native chat surface for v2 exploration.</p>
    <iframe
      title="nextchat widget"
      src="/vendor/nextchat"
      loading="lazy"
      referrerpolicy="no-referrer"
    />
  </section>
</template>

<style scoped>
.widget {
  border: 1px solid #2f2f2f;
  border-radius: 8px;
  padding: 12px;
}

iframe {
  width: 100%;
  min-height: 540px;
  border: 1px solid #444;
  border-radius: 6px;
}
</style>
