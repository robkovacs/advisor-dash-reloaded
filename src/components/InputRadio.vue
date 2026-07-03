<script setup>
import { useId } from 'vue'
import FormField from './FormField.vue'

const props = defineProps({
  modelValue: String,
  label: String,
  options: { type: Array, required: true },
  error: String,
  optional: Boolean,
  hideError: Boolean,
  width: String,
})

const emit = defineEmits(['update:modelValue'])

const groupName = useId()
</script>

<template>
  <FormField
    :label="label"
    :error="error"
    :optional="optional"
    :hide-error="hideError"
  >
    <template #default="{ 'aria-describedby': describedby }">
      <div
        class="radio-group"
        role="radiogroup"
        :aria-describedby="describedby"
        :style="width ? { width } : undefined"
      >
        <label
          v-for="option in options"
          :key="option.value"
          class="radio-option"
          :class="{
            'radio-option--selected': modelValue === option.value,
            'radio-option--invalid': !!error,
          }"
        >
          <input
            type="radio"
            :name="groupName"
            :value="option.value"
            :checked="modelValue === option.value"
            @change="emit('update:modelValue', option.value)"
          />
          <span class="radio-dot" aria-hidden="true" />
          <span class="radio-label">{{ option.label }}</span>
        </label>
      </div>
    </template>
  </FormField>
</template>

<style scoped>
.radio-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.radio-option {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  border: 1px solid var(--color-input-border);
  border-radius: var(--border-radius-md);
  background: var(--color-bg);
  cursor: pointer;
  user-select: none;
}

.radio-option input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}

.radio-option:has(input:focus-visible) {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.radio-dot {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background-color: var(--color-bg);
  border: 1px solid var(--color-input-border);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.radio-dot::after {
  content: '';
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--color-accent);
  opacity: 0;
}

.radio-label {
  font-size: var(--font-size-md);
  color: var(--color-text);
}

.radio-option--selected {
  border-color: var(--color-accent-border);
  background: var(--color-accent-subtle);
}

.radio-option--selected .radio-dot {
  border-color: var(--color-accent-border);
}

.radio-option--selected .radio-dot::after {
  opacity: 1;
}

.radio-option--invalid {
  border-color: var(--color-error-border);
}

.radio-option--invalid.radio-option--selected {
  border-color: var(--color-accent-border);
}

@media (hover: hover) {
  .radio-option:not(.radio-option--selected):hover {
    border-color: var(--color-input-button-hover);
  }
}
</style>
