<script setup>
import Logo from '@/components/Logo.vue'

defineProps({
  tightTop: Boolean,
})
</script>

<template>
  <main>
    <Logo />
    <slot name="above" />
    <div class="focused-card" :class="{ 'focused-card--tight-top': tightTop }">
      <slot />
    </div>
  </main>
</template>

<style scoped>
main {
  width: 100vw;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-12) var(--space-4);
  background-color: var(--color-bg-subtle);
  flex-direction: column;
  gap: var(--space-8);
}

.focused-card {
  background-color: var(--color-bg);
  border-radius: var(--border-radius-lg);
  width: 100%;
  max-width: 31rem;
  padding: var(--space-8);
  box-shadow:
    0 2px 4px -2px rgba(0, 0, 0, 0.1),
    0 4px 6px -1px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.focused-card--tight-top {
  padding-top: var(--space-8);
}
</style>
