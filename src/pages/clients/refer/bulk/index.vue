<script setup>
import { watch, onMounted, onUnmounted } from 'vue'
import Stack from '@/components/Stack.vue'
import PageHeader from '@/components/PageHeader.vue'
import BulkUpload from './BulkUpload.vue'
import BulkMapping from './BulkMapping.vue'
import BulkReview from './BulkReview.vue'
import { currentStep } from '@/use/useBulkReferrals'

definePage({ meta: { title: 'Bulk referrals', fixedHeight: true } })

const ancestors = [
  { label: 'Clients', to: '/clients' },
  { label: 'Refer', to: '/clients/refer' },
]

function onPopState(e) {
  if (e.state?.bulkStep) {
    currentStep.value = e.state.bulkStep
  }
}

onMounted(() => {
  history.replaceState({ ...history.state, bulkStep: currentStep.value }, '')
  window.addEventListener('popstate', onPopState)
})

onUnmounted(() => {
  window.removeEventListener('popstate', onPopState)
})

watch(currentStep, (step, oldStep) => {
  if (history.state?.bulkStep !== step) {
    history.pushState({ ...history.state, bulkStep: step }, '')
  }
})
</script>

<template>
  <Stack gap="6" class="bulk-page">
    <div class="bulk-header">
      <PageHeader :ancestors="ancestors" title="Bulk referrals" />
    </div>
    <div class="bulk-body">
      <BulkUpload v-if="currentStep === 'upload'" />
      <BulkMapping v-else-if="currentStep === 'mapping'" />
      <BulkReview v-else />
    </div>
  </Stack>
</template>

<style scoped>
.bulk-page {
  flex: 1;
  min-height: 0;
}

.bulk-body {
  flex: 1;
  min-height: 0;
  overflow: visible;
}
</style>
