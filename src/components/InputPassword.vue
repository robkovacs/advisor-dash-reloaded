<script setup>
import { ref, useId } from 'vue'
import FormField from './FormField.vue'
import IconEye from '~icons/ph/eye'
import IconEyeClosed from '~icons/ph/eye-closed'

const props = defineProps({
  modelValue: String,
  label: String,
  placeholder: String,
  autocomplete: String,
  error: String,
  id: String,
  hideError: Boolean,
  width: String,
})

const emit = defineEmits(['update:modelValue'])

const generatedId = useId()
const inputId = props.id ?? generatedId

const visible = ref(false)
</script>

<template>
  <FormField :label="label" :input-id="inputId" :error="error" :hide-error="hideError">
    <template v-if="$slots.helper" #helper>
      <slot name="helper" />
    </template>
    <template #default="{ invalid, ...inputAttrs }">
      <div class="input-wrapper" :style="width ? { width } : undefined">
        <input
          :id="inputId"
          v-bind="inputAttrs"
          :class="{ invalid }"
          :type="visible ? 'text' : 'password'"
          :value="modelValue"
          :placeholder="placeholder"
          :autocomplete="autocomplete"
          @input="emit('update:modelValue', $event.target.value)"
        />
        <button
          type="button"
          class="toggle"
          :aria-label="visible ? 'Hide password' : 'Show password'"
          @click="visible = !visible"
        >
          <IconEye v-if="!visible" />
          <IconEyeClosed v-else />
        </button>
      </div>
    </template>
  </FormField>
</template>

<style scoped>
@import '../styles/components/input.css';

input {
  padding-right: calc(var(--space-3) * 2 + 1em);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.toggle {
  position: absolute;
  right: 0.1875rem;
  top: 0.1875rem;
  bottom: 0.1875rem;
  font-size: var(--font-size-lg);
  display: flex;
  align-items: center;
  background: none;
  border: none;
  padding: calc(var(--space-3) - 0.0625rem);
  border-radius: calc(var(--border-radius-md) - 0.25rem);
  cursor: pointer;
  color: var(--color-text);
  line-height: 0;
}

@media (hover: hover) {
  .toggle:hover {
    background-color: var(--color-bg-muted);
  }
}
</style>
