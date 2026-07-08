<script setup>
defineProps({
  message: {
    type: String,
    default: 'Nothing here yet.',
  },
})
</script>

<template>
  <div class="empty-state">
    <p class="empty-state-message">{{ message }}</p>
    <slot />
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-16);
  background-color: var(--color-bg-subtle);
  border-radius: var(--border-radius-md);
}
</style>
