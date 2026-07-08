<script setup>
const props = defineProps({
  value: {
    type: Number,
    required: true,
  },
})
</script>

<template>
  <div
    class="progress-bar"
    role="progressbar"
    :aria-valuenow="props.value"
    aria-valuemin="0"
    aria-valuemax="100"
  >
    <div class="indicator" :style="{ width: `${props.value}%` }"></div>
  </div>
</template>

<style scoped>
.progress-bar {
  width: 100%;
  height: 0.5rem;
  background-color: var(--color-bg-muted);
}

.indicator {
  background-color: var(--color-accent);
  height: 100%;
  transition: width 0.4s ease;
}
</style>
