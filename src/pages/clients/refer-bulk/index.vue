<script setup>
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import Stack from '@/components/Stack.vue'

definePage({ meta: { title: 'Bulk referrals' } })

const crumbs = [
  { label: 'Clients', to: '/clients' },
  { label: 'Refer a client', to: '/clients/refer' },
  { label: 'Bulk referrals' },
]
</script>
<template>
  <Stack gap="4">
    <Breadcrumbs :items="crumbs" />

    <h1>Bulk referrals</h1>
  </Stack>
</template>
