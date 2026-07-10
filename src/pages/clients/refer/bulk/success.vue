<script setup>
import { computed } from 'vue'
import { clients, getClientCompleteness } from '@/use/useClients'
import { lastSubmittedIds } from '@/use/useBulkReferrals'
import Stack from '@/components/Stack.vue'
import Button from '@/components/Button.vue'
import IconCheckCircle from '~icons/ph/check-circle-fill'

definePage({ meta: { title: 'Referrals submitted' } })

const submittedClients = computed(() =>
  lastSubmittedIds.value
    .map((id) => clients.value.find((c) => c.id === id))
    .filter(Boolean),
)

function completenessForClient(client) {
  const { filled, total } = getClientCompleteness(client)
  return total > 0 ? Math.round((filled / total) * 100) : 0
}
</script>

<template>
  <div class="success-page">
    <Stack gap="6" class="success-content">
      <Stack gap="2" align="center" class="success-header">
        <div class="success-icon">
          <IconCheckCircle aria-hidden="true" />
        </div>
        <h1 class="success-heading">
          {{ submittedClients.length }}
          {{ submittedClients.length === 1 ? 'referral' : 'referrals' }}
          submitted!
        </h1>
        <p class="success-copy">
          Click into any client to add more details. The more we know, the
          faster we can get them started.
        </p>
      </Stack>

      <div v-if="submittedClients.length" class="client-list">
        <RouterLink
          v-for="client in submittedClients"
          :key="client.id"
          :to="`/clients/${client.id}`"
          class="client-row"
        >
          <div class="client-info">
            <span class="client-company">{{ client.companyName }}</span>
            <span class="client-contact">{{ client.firstName }} {{ client.lastName }}</span>
          </div>
          <div class="client-completeness">
            <div class="progress-track">
              <div
                class="progress-fill"
                :style="{ width: completenessForClient(client) + '%' }"
              />
            </div>
            <span class="completeness-pct">{{ completenessForClient(client) }}%</span>
          </div>
        </RouterLink>
      </div>

      <div class="success-footer">
        <Button to="/clients">View all clients</Button>
      </div>
    </Stack>
  </div>
</template>

<style scoped>
.success-page {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  min-height: 100%;
  padding: var(--space-8);
}

.success-content {
  max-width: 32rem;
  width: 100%;
}

.success-header {
  text-align: center;
}

.success-icon {
  font-size: 3rem;
  color: var(--color-success);
  line-height: 0;
}

.success-heading {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
}

.success-copy {
  color: var(--color-text-muted);
  max-width: 24rem;
}

.client-list {
  border: 1px solid var(--color-line);
  border-radius: var(--border-radius-md);
  overflow: hidden;
}

.client-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-4);
  text-decoration: none;
  color: var(--color-text);
  border-bottom: 1px solid var(--color-line);
}

.client-row:last-child {
  border-bottom: none;
}

@media (hover: hover) {
  .client-row:hover {
    background: var(--color-bg-subtle);
  }
}

.client-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-0-5);
  min-width: 0;
}

.client-company {
  font-weight: var(--font-weight-bold);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.client-contact {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.client-completeness {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}

.progress-track {
  width: 60px;
  height: var(--space-2);
  background: var(--color-bg-muted);
  border-radius: 100px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-accent);
  border-radius: 100px;
  transition: width 0.3s ease;
}

.completeness-pct {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  min-width: 2.5ch;
  text-align: right;
}

.success-footer {
  display: flex;
  justify-content: center;
}
</style>
