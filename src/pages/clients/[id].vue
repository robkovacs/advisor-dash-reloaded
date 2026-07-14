<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { clients } from '@/use/useClients'
import Stack from '@/components/Stack.vue'
import Row from '@/components/Row.vue'
import PageHeader from '@/components/PageHeader.vue'
import Badge from '@/components/Badge.vue'
import Button from '@/components/Button.vue'
import FocusedLayout from '@/layouts/FocusedLayout.vue'
import ClientDetailActive from './internals/ClientDetailActive.vue'
import ClientDetailOnboarding from './internals/ClientDetailOnboarding.vue'
import ClientDetailReferral from './internals/ClientDetailReferral.vue'
import ClientDetailInactive from './internals/ClientDetailInactive.vue'

definePage({ meta: { title: 'Client' } })

const route = useRoute()

const client = computed(() =>
  clients.value.find((c) => c.id === route.params.id),
)

const STATUS_META = {
  active: { label: 'Active', variant: 'success', typeLabel: 'Active' },
  pending: { label: 'Referral', variant: 'default', typeLabel: 'Referrals' },
  pending2: { label: 'Onboarding', variant: 'accent', typeLabel: 'Onboarding' },
  declined: { label: 'Inactive', variant: 'error', typeLabel: 'Inactive' },
}

const meta = computed(() => STATUS_META[client.value?.status] ?? STATUS_META.pending)

const ancestors = computed(() => [
  { label: 'Clients', to: '/clients' },
  { label: meta.value.typeLabel, to: `/clients?status=${client.value?.status}` },
])
</script>

<template>
  <Stack v-if="client" gap="6">
    <Row align="center" justify="space-between">
      <PageHeader
        :ancestors="ancestors"
        :title="client.companyName || 'Unnamed client'"
      />
      <Badge :variant="meta.variant">{{ meta.label }}</Badge>
    </Row>

    <ClientDetailActive v-if="client.status === 'active'" :client="client" />
    <ClientDetailOnboarding
      v-else-if="client.status === 'pending2'"
      :client="client"
    />
    <ClientDetailReferral
      v-else-if="client.status === 'pending'"
      :client="client"
    />
    <ClientDetailInactive
      v-else-if="client.status === 'declined'"
      :client="client"
    />
  </Stack>

  <FocusedLayout v-else>
    <Stack gap="6">
      <h1>Page not found</h1>
      <p>This page doesn't exist.</p>
      <Button to="/" variant="primary">Go home</Button>
    </Stack>
  </FocusedLayout>
</template>
