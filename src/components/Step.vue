<script setup>
import { computed, inject, ref } from 'vue'
import CheckIcon from '~icons/ph/check-bold'

defineProps({
  label: {
    type: String,
    required: true,
  },
  status: {
    type: String, // 'complete' | 'current' | 'pending'
    default: 'pending',
  },
  to: {
    type: String,
    default: null,
  },
})

const stepCount = inject('stepper-count', null)
const stepIndex = ref(stepCount?.value ?? 0)
if (stepCount) stepCount.value++

const isFirst = computed(() => stepIndex.value === 0)
const isLast = computed(() =>
  stepCount ? stepIndex.value === stepCount.value - 1 : true,
)
</script>

<template>
  <li class="step" :class="[`step--${status}`, { 'step--last': isLast }]">
    <div class="step__track">
      <div v-if="!isFirst" class="step__stub" />
      <div class="step__dot">
        <CheckIcon v-if="status === 'complete'" class="step__check" />
      </div>
      <div v-if="!isLast" class="step__line" />
    </div>
    <RouterLink v-if="to" :to="to" class="step__label">{{ label }}</RouterLink>
    <span v-else class="step__label">{{ label }}</span>
  </li>
</template>

<style scoped>
.step {
  display: grid;
  grid-template-columns: 1rem 1fr;
  gap: 0 var(--space-3);
}

.step__track {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  /* padding-top aligns dot center (0.375 + 0.5 = 0.875rem) with label first
     line center (padding-top 0.125 + line-height/2 0.75 = 0.875rem) */
  padding-top: 0.375rem;
}

.step__stub {
  /* absolute so it doesn't affect layout; sits in the padding-top area */
  position: absolute;
  top: 0;
  width: 1px;
  height: 0.125rem;
  background-color: var(--color-line);
}

.step__dot {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step__check {
  width: 0.625rem;
  height: 0.625rem;
  color: var(--color-text-on-accent);
}

.step__line {
  width: 1px;
  flex: 1;
  background-color: var(--color-line);
}

.step__label {
  align-self: start;
  margin-top: 0.125rem;
  margin-bottom: var(--space-4);
  font-size: var(--font-size-md);
  line-height: 1.5rem;
  color: var(--color-text-muted);
}

.step--last .step__label {
  padding-bottom: 0;
}

/* complete */
.step--complete .step__dot {
  background-color: var(--color-success);
}

.step--complete .step__label {
  color: var(--color-text);
}

a.step__label {
  text-decoration: none;
  border-radius: var(--border-radius-sm);
  width: fit-content;
}

a.step__label:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

@media (hover: hover) {
  a.step__label:hover {
    text-decoration: underline;
  }
}

/* current */
.step--current .step__dot {
  background-color: transparent;
  border: 1px solid var(--color-accent);
}

.step--current .step__label {
  color: var(--color-accent-text);
  font-weight: 700;
}

/* pending */
.step--pending .step__dot {
  background-color: var(--color-bg-muted);
}
</style>
