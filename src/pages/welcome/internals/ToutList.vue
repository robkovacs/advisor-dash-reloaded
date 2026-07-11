<script setup>
import IconCheckCircle from '~icons/ph/check-circle'

const touts = [
  'Get notified before an important filing or deadline slips',
  'Run payroll and generate reports without switching between tools',
  'Refer or onboard clients who aren’t already using Justworks',
]
</script>

<template>
  <ul>
    <li v-for="tout in touts" :key="tout">
      <IconCheckCircle />
      {{ tout }}
    </li>
  </ul>
</template>

<style scoped>
ul {
  font-size: var(--font-size-lg);
  list-style-type: none;
  padding: 0;
  margin: 0;
}

li {
  display: flex;
  align-items: flex-start;
  gap: 0.5em;
  margin-bottom: 0.5em;
}

.icon {
  flex: 0 0 1em;
  margin-top: calc(
    ((var(--font-size-lg) * var(--line-height-body)) - var(--font-size-lg)) / 2
  );
}
</style>
