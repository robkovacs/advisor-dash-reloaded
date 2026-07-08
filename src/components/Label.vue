<script setup>
defineProps({
  for: String,
})
</script>

<template>
  <label :for="for"><slot /></label>
</template>

<style scoped>
label {
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
}
</style>
