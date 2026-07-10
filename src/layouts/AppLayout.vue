<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Nav from '@/components/Nav.vue'

const route = useRoute()
const fixedHeight = computed(() => route.meta.fixedHeight)
</script>

<template>
  <div class="layout">
    <Nav />
    <main id="app-main" :class="{ 'fixed-height': fixedHeight }">
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
  height: 100svh;
}

@media (--breakpoint-sm) {
  .layout {
    flex-direction: row;
  }
}

main {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: var(--space-6);
  align-items: stretch;
  container-type: inline-size;
}

main.fixed-height {
  overflow: hidden;
}

main.fixed-height > * {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
</style>
