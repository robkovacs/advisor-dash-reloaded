<script setup>
defineProps({
  items: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <nav class="breadcrumbs" aria-label="Breadcrumb">
    <ol>
      <li v-for="(item, index) in items" :key="index">
        <span v-if="index > 0" class="separator" aria-hidden="true">/</span>
        <RouterLink v-if="item.to" :to="item.to">{{ item.label }}</RouterLink>
        <span v-else aria-current="page">{{ item.label }}</span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.breadcrumbs ol {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: var(--font-size-sm);
}

li {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

a {
  color: var(--color-text-muted);
  text-decoration: none;
}

@media (hover: hover) {
  a:hover {
    text-decoration: underline;
  }
}

.separator {
  color: var(--color-text-subtle);
}
</style>
