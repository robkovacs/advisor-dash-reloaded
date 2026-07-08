<script setup>
defineProps({
  ancestors: {
    type: Array, // [{ label, to? }]
    default: () => [],
  },
  title: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <h1 class="page-header">
    <template v-for="(ancestor, i) in ancestors" :key="i">
      <RouterLink v-if="ancestor.to" :to="ancestor.to" class="ancestor">{{ ancestor.label }}</RouterLink>
      <span v-else class="ancestor">{{ ancestor.label }}</span>
      <span class="separator" aria-hidden="true">/</span>
    </template>
    <span class="title">{{ title }}</span>
  </h1>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.ancestor {
  font-weight: var(--font-weight-regular);
  color: var(--color-text-muted);
  text-decoration: none;
}

@media (hover: hover) {
  a.ancestor:hover {
    text-decoration: underline;
  }
}

.separator {
  font-weight: var(--font-weight-regular);
  color: var(--color-text-subtle);
}
</style>
