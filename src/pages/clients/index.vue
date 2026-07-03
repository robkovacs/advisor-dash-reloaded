<script setup>
import { computed } from 'vue'
import { clients } from '@/use/useClients'
import Stack from '@/components/Stack.vue'
import Row from '@/components/Row.vue'
import Button from '@/components/Button.vue'
import Badge from '@/components/Badge.vue'

definePage({ meta: { title: 'Clients' } })

const statusLabel = { accepted: 'Active', pending: 'Pending', declined: 'Declined' }
const statusVariant = { accepted: 'success', pending: 'default', declined: 'error' }

const sorted = computed(() =>
  [...clients.value].sort((a, b) => a.companyName.localeCompare(b.companyName)),
)
</script>

<template>
  <Stack gap="8">
    <Row align="center" justify="space-between">
      <h1>Clients</h1>
      <Button variant="primary" to="/clients/refer">Refer a client</Button>
    </Row>
    <Stack v-if="sorted.length" gap="0" class="client-list">
      <RouterLink
        v-for="client in sorted"
        :key="client.id"
        :to="`/clients/${client.id}`"
        class="client-row"
      >
        <span class="company-name">{{ client.companyName }}</span>
        <span class="contact">{{ client.firstName }} {{ client.lastName }}</span>
        <span class="badge-cell">
          <Badge :variant="statusVariant[client.status]">{{ statusLabel[client.status] }}</Badge>
        </span>
      </RouterLink>
    </Stack>
    <Stack v-else align="center" gap="4" class="empty">
      <p>No clients yet.</p>
      <Button variant="primary" to="/clients/refer">Refer your first client</Button>
    </Stack>
  </Stack>
</template>

<style scoped>
.client-list {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  column-gap: var(--space-4);
  border: 1px solid var(--color-line);
  border-radius: var(--border-radius-md);
  overflow: hidden;
}

.client-row {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: subgrid;
  align-items: center;
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

.client-row > *:not(:last-child) {
  padding-top: var(--space-4);
  padding-bottom: var(--space-4);
}

.client-row > *:first-child {
  padding-left: var(--space-6);
}

.client-row > *:last-child {
  padding-right: var(--space-6);
  justify-self: start;
}

.company-name {
  font-weight: var(--font-weight-bold);
}

.contact {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.empty {
  padding: var(--space-16);
  color: var(--color-text-muted);
}
</style>
