<script setup>
import { computed } from 'vue'
import Stack from '@/components/Stack.vue'
import ProfileField from './ProfileField.vue'

const props = defineProps({ client: { type: Object, required: true } })

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

function formatDate(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return dateFormatter.format(d)
}

const ONBOARDING_STEPS = [
  { key: 'accountCreated', label: 'Account created' },
  { key: 'companyDetailsVerified', label: 'Company details verified' },
  { key: 'employeesImported', label: 'Employees imported' },
  { key: 'bankAccountConnected', label: 'Bank account connected' },
  { key: 'firstPayrollScheduled', label: 'First payroll scheduled' },
]

const steps = computed(() => {
  const onboardingSteps = props.client?.onboardingSteps || {}
  return ONBOARDING_STEPS.map((step) => ({
    ...step,
    complete: !!onboardingSteps[step.key],
  }))
})

const completedCount = computed(
  () => steps.value.filter((s) => s.complete).length,
)

const targetDateLabel = computed(() =>
  formatDate(props.client?.onboardingTargetDate),
)
const startDateLabel = computed(() =>
  formatDate(props.client?.onboardingStartDate),
)

const contactName = computed(() =>
  [props.client?.firstName, props.client?.lastName].filter(Boolean).join(' '),
)

const employeesDisplay = computed(() => {
  const { salariedEmployees, hourlyEmployees } = props.client || {}
  if (salariedEmployees && hourlyEmployees) {
    return `${salariedEmployees} salaried, ${hourlyEmployees} hourly`
  }
  if (salariedEmployees) return `${salariedEmployees} salaried`
  if (hourlyEmployees) return `${hourlyEmployees} hourly`
  return ''
})

const SOLUTION_LABELS = {
  payroll: 'Payroll only',
  'payroll-benefits': 'Payroll + Benefits',
  'not-sure': 'Not sure yet',
}

const solutionLabel = computed(
  () => SOLUTION_LABELS[props.client?.solution] || '',
)
</script>

<template>
  <Stack gap="6">
    <div class="info-card progress-card">
      <Stack gap="4">
        <h3>Onboarding progress</h3>
        <ProfileField label="Target go-live date" :value="targetDateLabel" />
        <ul class="checklist">
          <li
            v-for="step in steps"
            :key="step.key"
            class="checklist-item"
            :class="{ 'checklist-item--complete': step.complete }"
          >
            <span class="checklist-icon">{{ step.complete ? '✓' : '○' }}</span>
            <span>{{ step.label }}</span>
          </li>
        </ul>
        <span class="progress-summary"
          >{{ completedCount }} of {{ ONBOARDING_STEPS.length }} steps
          complete</span
        >
      </Stack>
    </div>

    <div class="info-card">
      <Stack gap="4">
        <h3>Company info</h3>
        <ProfileField label="Company name" :value="client.companyName" />
        <ProfileField label="Primary contact" :value="contactName" />
        <ProfileField label="Email" :value="client.email" />
        <ProfileField label="Phone" :value="client.phone" />
        <ProfileField label="Number of employees" :value="employeesDisplay" />
        <ProfileField
          label="Current payroll provider"
          :value="client.payrollProvider"
        />
        <ProfileField label="Solution preference" :value="solutionLabel" />
      </Stack>
    </div>

    <div class="info-card">
      <Stack gap="4">
        <h3>Timeline</h3>
        <ProfileField label="Started" :value="startDateLabel" />
        <ProfileField label="Target" :value="targetDateLabel" />
      </Stack>
    </div>
  </Stack>
</template>

<style scoped>
.info-card {
  border: 1px solid var(--color-line);
  border-radius: var(--border-radius-md);
  padding: var(--space-6);
  background: var(--color-bg);
}

.progress-card {
  border-color: var(--color-accent);
}

h3 {
  margin: 0;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
}

.checklist {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.checklist-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.checklist-item--complete {
  color: var(--color-text);
}

.checklist-icon {
  color: var(--color-text-muted);
}

.checklist-item--complete .checklist-icon {
  color: var(--color-success);
}

.progress-summary {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
}
</style>
