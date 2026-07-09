<script setup>
import { useId, useSlots } from 'vue'
import Label from './Label.vue'
import Badge from './Badge.vue'
import InputError from './InputError.vue'

defineProps({
  label: String,
  inputId: String,
  error: String,
  optional: Boolean,
  hideError: Boolean,
  hideLabel: Boolean,
})

const slots = useSlots()
const helperId = useId()
const errorId = useId()
</script>

<template>
  <div class="form-field">
    <div class="label-row" :class="{ 'sr-only': hideLabel }">
      <Label :for="inputId">{{ label }}</Label>
      <Badge v-if="optional">Optional</Badge>
    </div>
    <span v-if="slots.helper" :id="helperId" class="field-helper">
      <slot name="helper" />
    </span>
    <slot
      :aria-describedby="
        [slots.helper && helperId, errorId].filter(Boolean).join(' ')
      "
      :aria-invalid="!!error || undefined"
      :invalid="!!error"
    />
    <InputError v-if="!hideError" :id="errorId" :message="error" />
  </div>
</template>

<style scoped>
.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.label-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.field-helper {
  margin-top: calc(-1 * var(--space-1));
  color: var(--color-text-muted);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
