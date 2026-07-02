<script setup>
import IconInfo from '~icons/ph/info-fill'

defineProps({
  centerIcon: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <div class="notice" :class="{ 'notice--center-icon': centerIcon }">
    <IconInfo class="notice-icon" />
    <slot />
  </div>
</template>

<style scoped>
.notice {
  padding: var(--space-4);
  border-radius: var(--border-radius-md);
  background-color: var(--color-accent-subtle);
  display: flex;
  align-items: flex-start;
}

.notice--center-icon {
  align-items: center;
}

.notice-icon {
  flex-shrink: 0;
  margin-top: var(--space-0-5);
  font-size: var(--font-size-lg);
  color: var(--color-accent-text);
  margin-right: var(--space-3);
}

.notice--center-icon .notice-icon {
  margin-top: 0;
}
</style>
