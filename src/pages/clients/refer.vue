<script setup>
import { computed, provide, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

definePage({ meta: { title: 'Refer a client' } })
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import Stack from '@/components/Stack.vue'
import Columns from '@/components/Columns.vue'
import Stepper from '@/components/Stepper.vue'
import { referFormData } from '@/use/useReferClientForm'

const route = useRoute()
const router = useRouter()

const STEPS = [
  '/clients/refer',
  '/clients/refer/company-contact',
  '/clients/refer/company-details',
  '/clients/refer/additional-context',
]

const STEP_LABELS = [
  'Primary contact',
  'Company contact info',
  'Company details',
  'Additional context',
]

const crumbs = [
  { label: 'Clients', to: '/clients' },
  { label: 'Refer a client' },
]

const isBulk = computed(() => route.path === '/clients/refer/bulk')

const stepIndex = computed(() => {
  const i = STEPS.indexOf(route.path)
  return i === -1 ? 0 : i
})

const forward = ref(true)
watch(
  () => route.path,
  (newPath, oldPath) => {
    const ni = STEPS.indexOf(newPath)
    const oi = STEPS.indexOf(oldPath)
    if (ni !== -1 && oi !== -1) forward.value = ni > oi
  },
)
const transition = computed(() =>
  forward.value ? 'step-forward' : 'step-back',
)

const steps = computed(() =>
  STEP_LABELS.map((label, i) => ({
    label,
    status:
      i < stepIndex.value
        ? 'complete'
        : i === stepIndex.value
          ? 'current'
          : 'pending',
    to: i < stepIndex.value ? STEPS[i] : undefined,
  })),
)

function next(data = {}) {
  Object.assign(referFormData, data)
  const nextPath = STEPS[stepIndex.value + 1]
  if (nextPath) router.push(nextPath)
}

function back() {
  const prevPath = STEPS[stepIndex.value - 1]
  if (prevPath) router.push(prevPath)
  else router.back()
}

provide('referFormData', referFormData)
provide('next', next)
provide('back', back)
</script>

<template>
  <Stack gap="8">
    <Stack gap="4">
      <Breadcrumbs :items="crumbs" />
      <h1 v-if="!isBulk">Refer a client</h1>
    </Stack>
    <template v-if="isBulk">
      <RouterView :key="$route.path" />
    </template>
    <Columns v-else layout="1fr 2fr 1fr" gap="12">
      <Stepper :steps="steps" />
      <Transition :name="transition" mode="out-in">
        <RouterView :key="$route.path" />
      </Transition>
    </Columns>
  </Stack>
</template>
