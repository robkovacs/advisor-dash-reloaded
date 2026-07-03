<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { clients } from '@/use/useClients'
import Stack from '@/components/Stack.vue'
import Row from '@/components/Row.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import Badge from '@/components/Badge.vue'
import Button from '@/components/Button.vue'
import FocusedLayout from '@/layouts/FocusedLayout.vue'

definePage({ meta: { title: 'Client' } })

const route = useRoute()

const client = computed(() => clients.value.find((c) => c.id === route.params.id))

const crumbs = [
  { label: 'Clients', to: '/clients' },
  { label: client.value?.companyName ?? 'Client' },
]

const statusLabel = { accepted: 'Active', pending: 'Pending', declined: 'Declined' }
const statusVariant = { accepted: 'success', pending: 'default', declined: 'error' }
</script>

<template>
  <Stack v-if="client" gap="8">
    <Stack gap="4">
      <Breadcrumbs :items="crumbs" />
      <Row align="center" justify="space-between">
        <h1>{{ client.companyName }}</h1>
        <Badge :variant="statusVariant[client.status]">{{ statusLabel[client.status] }}</Badge>
      </Row>
    </Stack>
    <Stack gap="2">
      <h3>Primary contact</h3>
      <p>{{ client.firstName }} {{ client.lastName }}</p>
      <p>{{ client.email }}</p>
    </Stack>
  </Stack>
  <FocusedLayout v-else>
    <Stack gap="8">
      <h1>Page not found</h1>
      <p>This page doesn't exist.</p>
      <Button to="/" variant="primary">Go home</Button>
    </Stack>
  </FocusedLayout>
</template>
