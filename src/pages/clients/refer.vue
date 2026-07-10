<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

definePage({ meta: { title: 'Refer' } })
import PageHeader from '@/components/PageHeader.vue'
import Stack from '@/components/Stack.vue'

const route = useRoute()

const ancestors = [{ label: 'Clients', to: '/clients' }]

const hideChrome = computed(
  () =>
    route.path.startsWith('/clients/refer/bulk') ||
    route.path === '/clients/refer/success',
)
</script>

<template>
  <template v-if="hideChrome">
    <RouterView :key="$route.path" />
  </template>
  <Stack v-else gap="6">
    <PageHeader :ancestors="ancestors" title="Refer" />
    <RouterView :key="$route.path" />
  </Stack>
</template>
