<script setup>
defineProps({
  size: {
    type: String,
    default: 'medium',
  },
})
</script>

<template>
  <div :class="['icon-box', `icon-box--${size}`]">
    <slot />
  </div>
</template>

<style scoped>
.icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius-md);
  background-color: var(--color-accent-subtle);
  color: var(--color-accent-text);
  flex-shrink: 0;
}

.icon-box--medium {
  width: var(--space-10);
  height: var(--space-10);
  font-size: var(--font-size-lg);
}

.icon-box--small {
  width: var(--space-8);
  height: var(--space-8);
  font-size: var(--font-size-lg);
}
</style>
