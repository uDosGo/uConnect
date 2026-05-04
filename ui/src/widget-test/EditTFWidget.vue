<template>
  <section class="widget">
    <h2>edit.tf Test</h2>
    <p>Teletext frame editor sandbox (vendor/edit.tf).</p>
    <iframe
      title="edit.tf widget"
      src="/vendor/edit.tf"
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
  min-height: 420px;
  border: 1px solid #444;
  border-radius: 6px;
}
</style>
