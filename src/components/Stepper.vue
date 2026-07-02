<script setup>
import { provide, ref } from 'vue'
import Step from './Step.vue'

defineProps({
  steps: {
    type: Array, // [{ label, status }]
    default: null,
  },
})

const stepCount = ref(0)
provide('stepper-count', stepCount)
</script>

<template>
  <ol class="stepper">
    <template v-if="steps">
      <Step
        v-for="(step, i) in steps"
        :key="i"
        :label="step.label"
        :status="step.status ?? 'pending'"
        :to="step.to"
        :last="i === steps.length - 1"
      />
    </template>
    <slot v-else />
  </ol>
</template>

<style scoped>
.stepper {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
}
</style>
