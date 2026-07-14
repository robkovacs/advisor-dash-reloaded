<script setup>
import { computed } from 'vue'
import Stack from '@/components/Stack.vue'
import ProfileField from './ProfileField.vue'

const props = defineProps({ client: { type: Object, required: true } })

const contactName = computed(() =>
  [props.client.firstName, props.client.lastName].filter(Boolean).join(' '),
)

const formattedDeclinedDate = computed(() => {
  if (!props.client.declinedDate) return ''
  const date = new Date(props.client.declinedDate)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
})
</script>

<template>
  <Stack gap="6">
    <div class="status-banner">
      <Stack gap="3">
        <div class="banner-row">
          <span class="banner-label">Reason</span>
          <span class="banner-value">{{ client.declinedReason }}</span>
        </div>
        <div class="banner-row">
          <span class="banner-label">Since</span>
          <span class="banner-value">{{ formattedDeclinedDate }}</span>
        </div>
      </Stack>
    </div>

    <Stack gap="4">
      <h3 class="section-heading">Company info</h3>
      <div class="info-card">
        <Stack gap="6">
          <ProfileField label="Company name" :value="client.companyName" />
          <ProfileField label="Primary contact" :value="contactName" />
          <ProfileField label="Email" :value="client.email" />
        </Stack>
      </div>
    </Stack>
  </Stack>
</template>

<style scoped>
.status-banner {
  background: var(--color-bg-subtle);
  border: 1px solid var(--color-line);
  border-radius: var(--border-radius-md);
  padding: var(--space-6);
}

.banner-row {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
}

.banner-label {
  font-weight: var(--font-weight-bold);
}

.banner-value {
  color: var(--color-text-muted);
}

.section-heading {
  margin: 0;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
}

.info-card {
  border: 1px solid var(--color-line);
  border-radius: var(--border-radius-md);
  padding: var(--space-6);
  background: var(--color-bg);
}
</style>
