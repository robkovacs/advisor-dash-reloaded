<script setup>
import { computed } from 'vue'

const props = defineProps({
  padding: { default: '6' },
})

const paddingSize = computed(() => `var(--space-${props.padding})`)
</script>

<template>
  <div class="box">
    <slot />
  </div>
</template>

<style scoped>
.box {
  padding: v-bind('paddingSize');
  border: 1px solid var(--color-line);
  border-radius: var(--border-radius-md);
}
</style>
