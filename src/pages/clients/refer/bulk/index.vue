<script setup>
import PageHeader from '@/components/PageHeader.vue'

definePage({ meta: { title: 'Bulk upload' } })

const ancestors = [
  { label: 'Clients', to: '/clients' },
  { label: 'Refer', to: '/clients/refer' },
]
</script>
<template>
  <PageHeader :ancestors="ancestors" title="Bulk upload" />
</template>
