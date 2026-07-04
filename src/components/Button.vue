<script setup>
defineProps({
  to: {
    type: [String, Object],
    default: null,
  },
  type: {
    type: String,
    default: 'button',
  },
  variant: {
    type: String,
    default: 'secondary',
  },
  iconOnly: {
    type: Boolean,
    default: false,
  },
  size: {
    type: String,
    default: null,
  },
})
</script>

<template>
  <component
    :is="to ? 'router-link' : 'button'"
    v-bind="to ? { to } : { type }"
    :class="[
      'btn',
      `btn--${variant}`,
      size ? `btn--${size}` : '',
      iconOnly ? `btn--icon-only` : '',
    ]"
  >
    <slot />
  </component>
</template>

<style scoped>
.btn:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  height: 3rem;
  border: 1px solid transparent;
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  text-decoration: none;
  flex-shrink: 0;
  user-select: none;
}

.btn--primary {
  background: var(--color-accent);
  color: var(--color-text-on-accent);
}

.btn--secondary {
  background: transparent;
  color: var(--color-text);
  border-color: var(--color-input-border);
}

.btn--tertiary {
  background: transparent;
  color: var(--color-text);
  border-color: transparent;
}

.btn--small {
  height: 2.25rem;
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-sm);
}

.btn--icon-only {
  width: 3rem;
  padding: var(--space-2);
}

.btn--icon-only.btn--small {
  width: 2.25rem;
}

.btn:disabled,
.btn[aria-disabled] {
  cursor: not-allowed;
  background-color: var(--color-bg-muted);
  color: var(--color-text-muted);
  border-color: transparent;
}

.btn--link {
  gap: var(--space-1);
  background: none;
  color: var(--color-accent);
  border-color: transparent;
  border-radius: 0;
  padding: 0;
  height: auto;
  width: fit-content;
  font-weight: var(--font-weight-regular);
}

@media (hover: hover) {
  .btn--primary:hover {
    background: var(--color-accent-hover);
  }

  .btn--secondary:hover {
    background: color-mix(in srgb, var(--color-text) 6%, transparent);
  }

  .btn--tertiary:hover {
    background: color-mix(in srgb, var(--color-text) 6%, transparent);
  }

  .btn:disabled:hover,
  .btn[aria-disabled]:hover {
    background-color: var(--color-bg-muted);
  }
}
</style>
