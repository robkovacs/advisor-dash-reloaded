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
    <div class="progress-bar__indicator" :style="{ width: `${props.value}%` }"></div>
  </div>
</template>

<style scoped>
.progress-bar {
  width: 100%;
  height: 0.5rem;
  background-color: var(--color-bg-muted);
}

.progress-bar__indicator {
  background-color: var(--color-accent);
  height: 100%;
  transition: width 0.4s ease;
}
</style>
