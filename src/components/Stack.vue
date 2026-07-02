<template>
  <div class="stack">
    <slot />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  gap: {
    default: '4',
  },
  align: {
    type: /** @type {Prop<'flex-start' | 'center' | 'flex-end' | 'baseline' | 'stretch'>} */ (
      String
    ),
    default: 'stretch',
  },
  justify: {
    type: /** @type {Prop<'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around'>} */ (
      String
    ),
    default: 'flex-start',
  },
})

const gapSize = computed(() => `var(--space-${props.gap})`)
</script>

<style scoped>
.stack {
  display: flex;
  align-items: v-bind('$props.align');
  justify-content: v-bind('$props.justify');
  gap: v-bind('gapSize');
  flex-direction: column;
}
</style>
