<script setup>
defineProps({
  variant: {
    type: String,
    default: 'default',
  },
  appearance: {
    type: String,
    default: 'primary',
  },
})
</script>

<template>
  <span class="badge" :class="[`badge--${variant}`, `badge--${appearance}`]">
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
  width: fit-content;
}

.badge--default {
  background-color: var(--color-bg-muted);
  color: var(--color-text-muted);
}

.badge--success {
  background-color: var(--color-success-subtle);
  color: var(--color-success-text);
}

.badge--error {
  background-color: var(--color-error-subtle);
  color: var(--color-error);
}

.badge--accent {
  background-color: var(--color-accent-subtle);
  color: var(--color-accent-text);
}

/* Appearance: secondary — dot + muted text */
.badge--secondary {
  background-color: transparent;
  padding: 0;
  font-weight: var(--font-weight-regular);
  color: var(--color-text-muted);
  gap: var(--space-2);
  align-items: center;
}

.badge--secondary::before {
  content: '';
  width: 0.375rem;
  height: 0.375rem;
  border-radius: var(--border-radius-max);
  flex-shrink: 0;
}

.badge--secondary.badge--default::before {
  background-color: var(--color-text-muted);
}

.badge--secondary.badge--success::before {
  background-color: var(--color-success-text);
}

.badge--secondary.badge--error::before {
  background-color: var(--color-error);
}

.badge--secondary.badge--accent::before {
  background-color: var(--color-accent-text);
}
</style>
