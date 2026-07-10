<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { clients, getClientCompleteness } from '@/use/useClients'
import Stack from '@/components/Stack.vue'
import Row from '@/components/Row.vue'
import Button from '@/components/Button.vue'
import CompletenessCard from '@/pages/clients/internals/CompletenessCard.vue'
import IconCheckCircle from '~icons/ph/check-circle-fill'

definePage({ meta: { title: 'Referral submitted' } })

const route = useRoute()

const client = computed(() =>
  clients.value.find((c) => c.id === route.query.id),
)

const completeness = computed(() => {
  if (!client.value) return { sections: [], filled: 0, total: 0 }
  return getClientCompleteness(client.value)
})
</script>

<template>
  <div class="success-page">
    <Stack gap="6" align="center" class="success-content">
      <div class="success-icon">
        <IconCheckCircle aria-hidden="true" />
      </div>
      <Stack gap="2" align="center">
        <h1 class="success-heading">Referral submitted!</h1>
        <p v-if="client" class="success-company">{{ client.companyName }}</p>
      </Stack>
      <p class="success-copy">
        The more info you can share, the faster we can get
        {{ client?.companyName || 'them' }} started on Justworks.
      </p>
      <CompletenessCard
        v-if="client"
        :sections="completeness.sections"
        :filled="completeness.filled"
        :total="completeness.total"
        class="success-card"
      />
      <Stack gap="3" align="center">
        <Button
          v-if="client"
          variant="primary"
          :to="`/clients/${client.id}`"
        >
          Add more details
        </Button>
        <Button variant="link" to="/clients">Done for now</Button>
      </Stack>
    </Stack>
  </div>
</template>

<style scoped>
.success-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding: var(--space-8);
}

.success-content {
  max-width: 24rem;
  width: 100%;
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

.success-company {
  font-size: var(--font-size-lg);
  color: var(--color-text-muted);
}

.success-copy {
  color: var(--color-text-muted);
  max-width: 20rem;
}

.success-card {
  width: 100%;
}
</style>
