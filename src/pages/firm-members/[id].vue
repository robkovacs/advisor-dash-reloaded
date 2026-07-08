<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { firmMembers } from '@/use/useFirmMembers'
import Stack from '@/components/Stack.vue'
import Row from '@/components/Row.vue'
import PageHeader from '@/components/PageHeader.vue'
import Badge from '@/components/Badge.vue'
import Button from '@/components/Button.vue'
import FocusedLayout from '@/layouts/FocusedLayout.vue'

definePage({ meta: { title: 'Firm member' } })

const route = useRoute()

const member = computed(() =>
  firmMembers.value.find((m) => m.id === route.params.id),
)

const ancestors = [{ label: 'Firm members', to: '/firm-members' }]

const roleLabel = {
  accountant: 'Accountant',
  bookkeeper: 'Bookkeeper',
  cfo: 'CFO',
}
</script>

<template>
  <Stack v-if="member" gap="6">
    <Row align="center" justify="space-between">
      <PageHeader :ancestors="ancestors" :title="`${member.firstName} ${member.lastName}`" />
      <Badge :variant="member.status === 'active' ? 'success' : 'default'">
        {{ member.status === 'active' ? 'Active' : 'Pending' }}
      </Badge>
    </Row>
    <Stack gap="2">
      <h3>Role</h3>
      <p>{{ roleLabel[member.role] ?? member.role }}</p>
    </Stack>
    <Stack gap="2">
      <h3>Contact</h3>
      <p>{{ member.workEmail }}</p>
      <p v-if="member.workPhone">{{ member.workPhone }}</p>
    </Stack>
  </Stack>
  <FocusedLayout v-else>
    <Stack gap="6">
      <h1>Page not found</h1>
      <p>This page doesn't exist.</p>
      <Button to="/" variant="primary">Go home</Button>
    </Stack>
  </FocusedLayout>
</template>
