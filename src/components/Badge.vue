<script setup>
defineProps({
  variant: {
    type: String,
    default: 'default',
  },
})
</script>

<template>
  <span class="badge" :data-variant="variant">
    <slot />
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
  line-height: 1;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--border-radius-max);
  white-space: nowrap;
}

.badge[data-variant='default'] {
  background-color: var(--color-bg-muted);
  color: var(--color-text-muted);
}

.badge[data-variant='success'] {
  background-color: var(--color-success-subtle);
  color: var(--color-success-text);
}

.badge[data-variant='error'] {
  background-color: var(--color-error-subtle);
  color: var(--color-error);
}
</style>
