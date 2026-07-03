<script setup>
import Nav from '@/components/Nav.vue'
</script>

<template>
  <div class="layout">
    <Nav />
    <main>
      <div v-auto-animate>
        <RouterView :key="$route.path.split('/')[1]" />
      </div>
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  gap: 0;
  min-height: 100svh;
}

@media (--breakpoint-sm) {
  .layout {
    flex-direction: row;
  }
}

main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: var(--space-12) var(--space-6);
  align-items: stretch;
  container-type: inline-size;
}

@media (--breakpoint-sm) {
  main {
    padding: var(--space-12) var(--space-20);
  }
}
</style>
