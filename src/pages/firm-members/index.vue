<script setup>
import { computed } from 'vue'
import { firmMembers } from '@/use/useFirmMembers'
import Stack from '@/components/Stack.vue'
import Row from '@/components/Row.vue'
import Badge from '@/components/Badge.vue'

definePage({ meta: { title: 'Firm members' } })

const roleLabel = {
  accountant: 'Accountant',
  bookkeeper: 'Bookkeeper',
  cfo: 'CFO',
}

const sorted = computed(() =>
  [...firmMembers.value].sort((a, b) =>
    `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`),
  ),
)
</script>

<template>
  <Stack gap="8">
    <Row align="center" justify="space-between">
      <h1>Firm members</h1>
    </Row>
    <Stack v-if="sorted.length" gap="0" class="member-list">
      <RouterLink
        v-for="member in sorted"
        :key="member.id"
        :to="`/firm-members/${member.id}`"
        class="member-row"
      >
        <span class="name">{{ member.firstName }} {{ member.lastName }}</span>
        <span class="role">{{ roleLabel[member.role] ?? member.role }}</span>
        <span class="badge-cell">
          <Badge :variant="member.status === 'active' ? 'success' : 'default'">
            {{ member.status === 'active' ? 'Active' : 'Pending' }}
          </Badge>
        </span>
      </RouterLink>
    </Stack>
    <p v-else class="empty">No firm members yet.</p>
  </Stack>
</template>

<style scoped>
.member-list {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  column-gap: var(--space-4);
  border: 1px solid var(--color-line);
  border-radius: var(--border-radius-md);
  overflow: hidden;
}

.member-row {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: subgrid;
  align-items: center;
  text-decoration: none;
  color: var(--color-text);
  border-bottom: 1px solid var(--color-line);
}

.member-row:last-child {
  border-bottom: none;
}

@media (hover: hover) {
  .member-row:hover {
    background: var(--color-bg-subtle);
  }
}

.member-row > *:not(:last-child) {
  padding-top: var(--space-4);
  padding-bottom: var(--space-4);
}

.member-row > *:first-child {
  padding-left: var(--space-6);
}

.member-row > *:last-child {
  padding-right: var(--space-6);
  justify-self: start;
}

.name {
  font-weight: var(--font-weight-bold);
}

.role {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.empty {
  color: var(--color-text-muted);
}
</style>
