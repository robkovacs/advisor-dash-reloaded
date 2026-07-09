<script setup>
import { useId } from 'vue'
import FormField from './FormField.vue'
import IconCaretDown from '~icons/ph/caret-down'
import IconX from '~icons/ph/x'

const props = defineProps({
  modelValue: String,
  label: String,
  error: String,
  id: String,
  optional: Boolean,
  hideError: Boolean,
  hideLabel: Boolean,
  placeholder: String,
  width: String,
  clearable: Boolean,
})

const emit = defineEmits(['update:modelValue'])

const generatedId = useId()
const inputId = props.id ?? generatedId
</script>

<template>
  <FormField
    :label="label"
    :input-id="inputId"
    :error="error"
    :optional="optional"
    :hide-error="hideError"
    :hide-label="hideLabel"
  >
    <template v-if="$slots.helper" #helper>
      <slot name="helper" />
    </template>
    <template #default="{ invalid, ...inputAttrs }">
      <div class="select-wrapper" :style="width ? { width } : undefined">
        <select
          :id="inputId"
          v-bind="inputAttrs"
          :class="{ invalid }"
          :value="modelValue"
          @change="emit('update:modelValue', $event.target.value)"
        >
          <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
          <slot />
        </select>
        <button
          v-if="clearable && modelValue"
          type="button"
          class="select-clear"
          aria-label="Clear selection"
          @click="emit('update:modelValue', '')"
        >
          <IconX aria-hidden="true" />
        </button>
        <IconCaretDown v-else class="select-caret" aria-hidden="true" />
      </div>
    </template>
  </FormField>
</template>

<style scoped>
@import '../styles/components/input.css';

.select-wrapper {
  position: relative;
}

select {
  appearance: none;
  padding-right: var(--space-10);
  cursor: pointer;
}

select:has(option:checked[value='']) {
  color: var(--color-text-subtle);
}

.select-caret {
  position: absolute;
  right: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--color-text);
}

.select-clear {
  position: absolute;
  right: var(--space-2);
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border: none;
  background: transparent;
  border-radius: var(--border-radius-sm);
  color: var(--color-text-muted);
  cursor: pointer;
}

.select-clear:hover {
  color: var(--color-text);
  background: var(--color-bg-muted);
}
</style>
