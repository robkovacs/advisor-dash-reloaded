<script>
export default { inheritAttrs: false }
</script>

<script setup>
import { useAttrs, useId } from 'vue'
import FormField from './FormField.vue'

const attrs = useAttrs()

const props = defineProps({
  modelValue: [String, Number],
  label: String,
  placeholder: String,
  min: [String, Number],
  max: [String, Number],
  step: [String, Number],
  error: String,
  id: String,
  optional: Boolean,
  hideError: Boolean,
  width: String,
})

const emit = defineEmits(['update:modelValue'])

const generatedId = useId()
const inputId = props.id ?? generatedId
</script>

<template>
  <FormField :label="label" :input-id="inputId" :error="error" :optional="optional" :hide-error="hideError">
    <template v-if="$slots.helper" #helper>
      <slot name="helper" />
    </template>
    <template #default="{ invalid, ...inputAttrs }">
      <input
        :id="inputId"
        v-bind="{ ...attrs, ...inputAttrs }"
        :class="{ invalid }"
        :style="width ? { width } : undefined"
        type="number"
        :value="modelValue"
        :placeholder="placeholder"
        :min="min"
        :max="max"
        :step="step"
        @input="emit('update:modelValue', $event.target.value)"
      />
    </template>
  </FormField>
</template>

<style scoped>
@import '../styles/components/input.css';
</style>
