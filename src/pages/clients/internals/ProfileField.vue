<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: String, default: '' },
})
</script>

<template>
  <div class="profile-field">
    <div class="field-label">{{ label }}</div>
    <span v-if="value" class="field-value">{{ value }}</span>
    <span v-else class="field-empty">Not provided</span>
  </div>
</template>

<style scoped>
.profile-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  font-size: var(--font-size-md);
}
.field-label {
  font-weight: var(--font-weight-bold);
}
.field-value {
  color: var(--color-text);
}
.field-empty {
  color: var(--color-text-muted);
}
</style>
