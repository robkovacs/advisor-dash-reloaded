<template>
  <div :class="['row', { 'row--shrink': shrink }]">
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
    default: 'flex-start',
  },
  justify: {
    type: /** @type {Prop<'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around'>} */ (
      String
    ),
    default: 'flex-start',
  },
  shrink: {
    type: Boolean,
    default: false,
  },
})

const gapSize = computed(() => `var(--space-${props.gap})`)
</script>

<style scoped>
.row {
  display: flex;
  align-items: v-bind('$props.align');
  justify-content: v-bind('$props.justify');
  gap: v-bind('gapSize');
  flex-direction: row;
  width: 100%;
}

.row--shrink {
  width: auto;
  flex-shrink: 0;
}
</style>
