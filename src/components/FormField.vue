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
})

const slots = useSlots()
const helperId = useId()
const errorId = useId()
</script>

<template>
  <div class="form-field">
    <div class="label-row">
      <Label :for="inputId">{{ label }}</Label>
      <Badge v-if="optional">Optional</Badge>
    </div>
    <span v-if="slots.helper" :id="helperId" class="helper">
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

.helper {
  margin-top: calc(-1 * var(--space-1));
  color: var(--color-text-muted);
}
</style>
