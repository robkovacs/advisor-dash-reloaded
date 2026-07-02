<template>
  <div ref="columns" class="columns">
    <slot />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  gap: {
    default: '6',
  },
  layout: {
    type: /** @type {Prop<'golden' | 'equal' | '1fr 1fr' | '2fr 1fr' | '1fr 1fr 1fr' | '1fr 2fr 1fr' | (string & {})>} */ (
      String
    ),
    default: '1fr 1fr',
  },
})

const columns = ref()

const gapSize = computed(() => `var(--space-${props.gap})`)
const layouts = computed(() => ({
  golden: '1.618fr 1fr',
  equal: `repeat(${columns.value?.children.length}, minmax(0, 1fr))`,
}))

const gridTemplateColumns = computed(
  () => layouts.value[props.layout] ?? props.layout,
)
</script>

<style scoped>
.columns {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: v-bind('gapSize');
  align-items: start;
  @media (min-width: 768px) {
    grid-template-columns: v-bind('gridTemplateColumns');
  }
}
</style>
