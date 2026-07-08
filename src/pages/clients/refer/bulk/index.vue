<script setup>
import PageHeader from '@/components/PageHeader.vue'

definePage({ meta: { title: 'Bulk referrals' } })

const ancestors = [
  { label: 'Clients', to: '/clients' },
  { label: 'Refer a client', to: '/clients/refer' },
]
</script>
<template>
  <PageHeader :ancestors="ancestors" title="Bulk referrals" />
</template>
