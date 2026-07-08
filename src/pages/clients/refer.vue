<script setup>
import { computed, provide, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

definePage({ meta: { title: 'Refer a client' } })
import PageHeader from '@/components/PageHeader.vue'
import Stack from '@/components/Stack.vue'
import Columns from '@/components/Columns.vue'
import Stepper from '@/components/Stepper.vue'
import { referFormData, clearReferForm } from '@/use/useReferClientForm'
import { clients } from '@/use/useClients'
import { firm } from '@/use/useFirm'

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

const ancestors = [{ label: 'Clients', to: '/clients' }]

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
  if (nextPath) {
    router.push(nextPath)
  } else {
    const client = {
      id: crypto.randomUUID(),
      firmId: firm.id ?? null,
      companyId: crypto.randomUUID(),
      companyName: referFormData.companyName,
      firstName: referFormData.firstName,
      lastName: referFormData.lastName,
      email: referFormData.email,
      status: 'pending',
      permissions: [],
    }
    clients.value.push(client)
    clearReferForm()
    router.push(`/clients/${client.id}`)
  }
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
  <template v-if="isBulk">
    <RouterView :key="$route.path" />
  </template>
  <Stack v-else gap="6">
    <PageHeader :ancestors="ancestors" title="Refer a client" />
    <Columns layout="12rem minmax(0, 24rem) 1fr" gap="6">
      <Stepper :steps="steps" />
      <Transition :name="transition" mode="out-in">
        <RouterView :key="$route.path" />
      </Transition>
    </Columns>
  </Stack>
</template>
