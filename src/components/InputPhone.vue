<script>
export default { inheritAttrs: false }
</script>

<script setup>
import { computed, useAttrs, useId } from 'vue'
import FormField from './FormField.vue'

const attrs = useAttrs()

const props = defineProps({
  modelValue: String,
  label: String,
  error: String,
  id: String,
  optional: Boolean,
  hideError: Boolean,
  hideLabel: Boolean,
})

const emit = defineEmits(['update:modelValue'])

const generatedId = useId()
const inputId = props.id ?? generatedId

function formatPhone(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 10)
  if (digits.length <= 3) return digits.length ? `(${digits}` : ''
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

const displayValue = computed(() => formatPhone(props.modelValue ?? ''))

function onInput(event) {
  const formatted = formatPhone(event.target.value)
  event.target.value = formatted
  emit('update:modelValue', formatted)
}
</script>

<template>
  <FormField :label="label" :input-id="inputId" :error="error" :optional="optional" :hide-error="hideError" :hide-label="hideLabel">
    <template v-if="$slots.helper" #helper>
      <slot name="helper" />
    </template>
    <template #default="{ invalid, ...inputAttrs }">
      <input
        :id="inputId"
        v-bind="{ ...attrs, ...inputAttrs }"
        :class="{ invalid }"
        type="text"
        inputmode="numeric"
        maxlength="14"
        :value="displayValue"
        @input="onInput"
      />
    </template>
  </FormField>
</template>

<style scoped>
@import '../styles/components/input.css';
</style>
