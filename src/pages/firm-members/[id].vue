<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { firmMembers } from '@/use/useFirmMembers'
import Stack from '@/components/Stack.vue'
import Row from '@/components/Row.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import Badge from '@/components/Badge.vue'

definePage({ meta: { title: 'Firm member' } })

const route = useRoute()
const router = useRouter()

const member = computed(() => firmMembers.value.find((m) => m.id === route.params.id))

if (!member.value) router.replace('/firm-members')

const crumbs = [
  { label: 'Firm members', to: '/firm-members' },
  { label: member.value ? `${member.value.firstName} ${member.value.lastName}` : 'Member' },
]

const roleLabel = {
  accountant: 'Accountant',
  bookkeeper: 'Bookkeeper',
  cfo: 'CFO',
}
</script>

<template>
  <Stack v-if="member" gap="8">
    <Stack gap="4">
      <Breadcrumbs :items="crumbs" />
      <Row align="center" justify="space-between">
        <h1>{{ member.firstName }} {{ member.lastName }}</h1>
        <Badge :variant="member.status === 'active' ? 'success' : 'default'">
          {{ member.status === 'active' ? 'Active' : 'Pending' }}
        </Badge>
      </Row>
    </Stack>
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
</template>

