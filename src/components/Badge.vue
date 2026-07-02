<template>
  <span class="badge">
    <slot />
  </span>
</template>

<style scoped>
.badge {
  background-color: var(--color-bg-muted);
  color: var(--color-text-muted);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-xs);
  line-height: 1;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--border-radius-max);
}

.has-badge {
  vertical-align: baseline;
}

.has-badge .badge {
  margin-left: var(--space-2);
}
</style>
