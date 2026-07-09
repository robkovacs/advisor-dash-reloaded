<script>
export default { inheritAttrs: false }
</script>

<script setup>
import { useAttrs, useId } from 'vue'
import FormField from './FormField.vue'

const attrs = useAttrs()

const props = defineProps({
  modelValue: String,
  label: String,
  placeholder: String,
  rows: { type: [String, Number], default: 4 },
  error: String,
  id: String,
  optional: Boolean,
  hideError: Boolean,
  hideLabel: Boolean,
  width: String,
})

const emit = defineEmits(['update:modelValue'])

const generatedId = useId()
const inputId = props.id ?? generatedId
</script>

<template>
  <FormField :label="label" :input-id="inputId" :error="error" :optional="optional" :hide-error="hideError" :hide-label="hideLabel">
    <template v-if="$slots.helper" #helper>
      <slot name="helper" />
    </template>
    <template #default="{ invalid, ...inputAttrs }">
      <textarea
        :id="inputId"
        v-bind="{ ...attrs, ...inputAttrs }"
        :class="{ invalid }"
        :style="width ? { width } : undefined"
        :rows="rows"
        :value="modelValue"
        :placeholder="placeholder"
        @input="emit('update:modelValue', $event.target.value)"
      />
    </template>
  </FormField>
</template>

<style scoped>
@import '../styles/components/input.css';
</style>
