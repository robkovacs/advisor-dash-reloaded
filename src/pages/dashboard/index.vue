<script setup>
import { computed } from 'vue'
import { clients } from '@/use/useClients'
import FirmSetup from './internals/FirmSetup.vue'
import FirmDashboard from './internals/FirmDashboard.vue'

definePage({ meta: { title: 'Home' } })

const showDashboard = computed(() => clients.value.length > 1)
</script>

<template>
  <FirmDashboard v-if="showDashboard" />
  <FirmSetup v-else />
</template>
