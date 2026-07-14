<script setup>
import { computed } from 'vue'
import Stack from '@/components/Stack.vue'
import Row from '@/components/Row.vue'
import PageHeader from '@/components/PageHeader.vue'
import Badge from '@/components/Badge.vue'
import ProfileField from './ProfileField.vue'

const props = defineProps({ client: { type: Object, required: true } })

const ancestors = [{ label: 'Clients', to: '/clients' }]

const contactName = computed(() => {
  return [props.client.firstName, props.client.lastName]
    .filter(Boolean)
    .join(' ')
})

function formatPermission(permission) {
  return permission
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const permissionsDisplay = computed(() => {
  const permissions = props.client.permissions || []
  if (permissions.length === 0) return ''
  return permissions.map(formatPermission).join(', ')
})

const FREQUENCY_LABELS = {
  weekly: 'Weekly',
  'bi-weekly': 'Bi-weekly',
  'semi-monthly': 'Semi-monthly',
  monthly: 'Monthly',
}

const payCyclesDisplay = computed(() => {
  const cycles = props.client.payCycles || []
  return cycles.map((cycle) => {
    const frequency = FREQUENCY_LABELS[cycle.frequency] || cycle.frequency
    const countries = (cycle.countries || [])
      .map((c) => c.toUpperCase())
      .join(', ')
    return countries
      ? `${frequency}, ${cycle.payBasis} (${countries})`
      : `${frequency}, ${cycle.payBasis}`
  })
})
</script>

<template>
  <Stack gap="6">
    <Stack gap="6">
      <div class="info-card">
        <Stack gap="4">
          <h3>Company info</h3>
          <ProfileField label="Company name" :value="client.companyName" />
          <ProfileField label="Primary contact" :value="contactName" />
          <ProfileField label="Contact email" :value="client.email" />
          <ProfileField label="Contact phone" :value="client.phone" />
        </Stack>
      </div>

      <div class="info-card">
        <Stack gap="4">
          <h3>Justworks account</h3>
          <ProfileField label="Permissions" :value="permissionsDisplay" />
          <div class="profile-field">
            <div class="field-label">Pay cycles</div>
            <span v-if="payCyclesDisplay.length === 0" class="field-empty"
              >Not provided</span
            >
            <Stack v-else gap="1">
              <span
                v-for="(line, i) in payCyclesDisplay"
                :key="i"
                class="field-value"
                >{{ line }}</span
              >
            </Stack>
          </div>
        </Stack>
      </div>

      <div class="info-card">
        <Stack gap="4">
          <h3>Quick links</h3>
          <RouterLink :to="`/payrolls?client=${client.id}`" class="quick-link"
            >View payrolls →</RouterLink
          >
        </Stack>
      </div>
    </Stack>
  </Stack>
</template>

<style scoped>
.info-card {
  border: 1px solid var(--color-line);
  border-radius: var(--border-radius-md);
  padding: var(--space-6);
  background: var(--color-bg);
}

h3 {
  margin: 0;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
}

.profile-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  font-size: var(--font-size-md);
}
.field-label {
  font-weight: var(--font-weight-bold);
}
.field-value {
  color: var(--color-text);
}
.field-empty {
  color: var(--color-text-muted);
}

.quick-link {
  color: var(--color-accent-text);
  font-weight: var(--font-weight-bold);
  text-decoration: none;
  width: fit-content;
}

@media (hover: hover) {
  .quick-link:hover {
    text-decoration: underline;
  }
}
</style>
