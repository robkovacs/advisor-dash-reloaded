<script setup>
import { useId } from 'vue'
import FormField from './FormField.vue'
import IconSearch from '~icons/ph/magnifying-glass'
import IconX from '~icons/ph/x'

const props = defineProps({
  modelValue: String,
  label: String,
  placeholder: String,
  id: String,
  hideLabel: Boolean,
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
    :hide-label="hideLabel"
    hide-error
  >
    <template #default="inputAttrs">
      <div class="search-wrapper" :style="width ? { width } : undefined">
        <IconSearch class="search-icon" aria-hidden="true" />
        <input
          :id="inputId"
          v-bind="inputAttrs"
          type="search"
          :value="modelValue"
          :placeholder="placeholder"
          @input="emit('update:modelValue', $event.target.value)"
        />
        <button
          v-if="modelValue"
          class="search-clear"
          type="button"
          aria-label="Clear search"
          @click="emit('update:modelValue', '')"
        >
          <IconX aria-hidden="true" />
        </button>
      </div>
    </template>
  </FormField>
</template>

<style scoped>
@import '../styles/components/input.css';

.search-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--color-text-muted);
}

input {
  padding-left: calc(var(--space-3) + 1em + var(--space-2));
  padding-right: calc(var(--space-3) + 1em + var(--space-2));
}

.search-clear {
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
  .search-clear:hover {
    background-color: var(--color-bg-muted);
  }
}
</style>
