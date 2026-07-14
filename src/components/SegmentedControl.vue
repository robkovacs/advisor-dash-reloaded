<script setup>
import Badge from './Badge.vue'

const props = defineProps({
  options: {
    type: Array, // [{ label, value }]
    required: true,
  },
  modelValue: {
    type: [String, Number, null],
    default: null,
  },
  size: {
    type: String,
    default: 'default',
  },
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div
    class="segmented-control"
    :class="{ 'segmented-control--small': size === 'small' }"
    role="group"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="segment"
      :class="{ 'segment--active': modelValue === option.value }"
      :aria-pressed="modelValue === option.value"
      @click="emit('update:modelValue', option.value)"
    >
      {{ option.label }}
      <Badge
        class="segment-badge"
        v-if="option.badge != null"
        :variant="modelValue === option.value ? 'accent' : 'default'"
        >{{ option.badge }}</Badge
      >
    </button>
  </div>
</template>

<style scoped>
.segmented-control {
  display: inline-flex;
  width: fit-content;
  height: 2.5rem;
  background: var(--color-bg-muted);
  border-radius: var(--border-radius-md);
  padding: 2px;
}

.segmented-control--small {
  height: 2.25rem;
}

.segment {
  display: flex;
  gap: var(--space-2);
  align-items: center;
  padding: var(--space-1) var(--space-3);
  border: none;
  border-radius: calc(var(--border-radius-md) - 2px);
  background: transparent;
  color: var(--color-text-muted);
  font-family: inherit;
  font-size: inherit;
  cursor: pointer;
  white-space: nowrap;
  transition:
    background 0.12s,
    color 0.12s,
    box-shadow 0.12s;
}

@media (hover: hover) {
  .segment:hover:not(.segment--active) {
    color: var(--color-text);
  }
}

.segment--active {
  background: var(--color-bg);
  color: var(--color-text);
  font-weight: var(--font-weight-bold);
  box-shadow:
    0 1px 2px rgb(0 0 0 / 0.06),
    0 0 0 1px rgb(0 0 0 / 0.04);
}

.segment-badge {
  min-width: 1lh;
  text-align: center;
}
</style>
