<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <button
    role="switch"
    :aria-checked="modelValue"
    class="toggle-switch"
    type="button"
    @click="emit('update:modelValue', !modelValue)"
  >
    <span class="track" :class="{ 'track--on': modelValue }">
      <span class="knob" />
    </span>
    <span class="label-text">{{ label }}</span>
  </button>
</template>

<style scoped>
.toggle-switch {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: var(--color-text);
  font: inherit;
  font-size: var(--font-size-md);
}

.toggle-switch:focus-visible {
  outline: none;
}

.toggle-switch:focus-visible .track {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.track {
  display: inline-flex;
  align-items: center;
  width: 2.875rem;
  height: 1.625rem;
  border-radius: 999px;
  background: var(--color-gray-300);
  padding: 0.1875rem;
  flex-shrink: 0;
  transition: background 200ms ease;
}

.track--on {
  background: var(--color-accent);
}

.knob {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  background: var(--color-white);
  flex-shrink: 0;
  transition: transform 200ms ease;
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.15);
}

.track--on .knob {
  transform: translateX(1.25rem);
}
</style>
