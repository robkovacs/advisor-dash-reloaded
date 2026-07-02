<script setup>
import { useId } from 'vue'
import FormField from './FormField.vue'
import IconCaretDown from '~icons/ph/caret-down'

const props = defineProps({
  modelValue: String,
  label: String,
  error: String,
  id: String,
  optional: Boolean,
  hideError: Boolean,
  placeholder: String,
  width: String,
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
        <IconCaretDown class="select-caret" aria-hidden="true" />
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
</style>
