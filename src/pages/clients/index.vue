<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { clients } from '@/use/useClients'
import Stack from '@/components/Stack.vue'
import Row from '@/components/Row.vue'
import Button from '@/components/Button.vue'
import IconCaretDownFill from '~icons/ph/caret-down-fill'
import Menu from '@/components/Menu.vue'
import MenuOption from '@/components/MenuOption.vue'
import Badge from '@/components/Badge.vue'
import EmptyState from '@/components/EmptyState.vue'
import SegmentedControl from '@/components/SegmentedControl.vue'

definePage({ meta: { title: 'Clients' } })

const route = useRoute()
const router = useRouter()

const statusLabel = {
  active: 'Active',
  pending: 'Pending',
  declined: 'Declined',
}
const statusVariant = {
  active: 'success',
  pending: 'default',
  declined: 'error',
}

const filters = [
  { label: 'All', value: null },
  { label: 'Active', value: 'active' },
  { label: 'Pending', value: 'pending' },
  { label: 'Declined', value: 'declined' },
]

const activeFilter = computed(() => route.query.status ?? null)

function setFilter(value) {
  router.replace({ query: value ? { status: value } : {} })
}

const sorted = computed(() => {
  const list = activeFilter.value
    ? clients.value.filter((c) => c.status === activeFilter.value)
    : clients.value
  return [...list].sort((a, b) => a.companyName.localeCompare(b.companyName))
})
</script>

<template>
  <Stack gap="6">
    <Stack gap="4">
      <Row align="center" justify="space-between">
        <h1>Clients</h1>
        <Menu placement="bottom-end">
          <template #trigger="{ toggle, isOpen }">
            <Button
              variant="primary"
              size="small"
              :aria-expanded="isOpen"
              @click="toggle"
            >
              Add client <IconCaretDownFill />
            </Button>
          </template>
          <MenuOption to="/clients/refer">Refer a client</MenuOption>
          <MenuOption to="/clients/enroll">Enroll a client</MenuOption>
        </Menu>
      </Row>
      <SegmentedControl
        :options="filters"
        :model-value="activeFilter"
        @update:model-value="setFilter"
      />
    </Stack>
    <Stack v-if="sorted.length" gap="0" class="client-list">
      <RouterLink
        v-for="client in sorted"
        :key="client.id"
        :to="`/clients/${client.id}`"
        class="client-row"
      >
        <span class="company-name">{{ client.companyName }}</span>
        <span class="contact"
          >{{ client.firstName }} {{ client.lastName }}</span
        >
        <span class="badge-cell">
          <Badge :variant="statusVariant[client.status]">{{
            statusLabel[client.status]
          }}</Badge>
        </span>
      </RouterLink>
    </Stack>
    <EmptyState
      v-else
      :message="`No ${activeFilter ? statusLabel[activeFilter].toLowerCase() + ' ' : ''}clients yet.`"
    >
      <Menu placement="bottom-end">
        <template #trigger="{ toggle, isOpen }">
          <Button variant="secondary" :aria-expanded="isOpen" @click="toggle">
            Add client <IconCaretDownFill />
          </Button>
        </template>
        <MenuOption to="/clients/refer">Refer a client</MenuOption>
        <MenuOption to="/clients/enroll">Enroll a client</MenuOption>
      </Menu>
    </EmptyState>
  </Stack>
</template>

<style scoped>
.client-list {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  column-gap: var(--space-4);
  border: 1px solid var(--color-line);
  border-radius: var(--border-radius-md);
  overflow: hidden;
}

.client-row {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: subgrid;
  align-items: center;
  text-decoration: none;
  color: var(--color-text);
  border-bottom: 1px solid var(--color-line);
}

.client-row:last-child {
  border-bottom: none;
}

@media (hover: hover) {
  .client-row:hover {
    background: var(--color-bg-subtle);
  }
}

.client-row > *:not(:last-child) {
  padding-top: var(--space-4);
  padding-bottom: var(--space-4);
}

.client-row > *:first-child {
  padding-left: var(--space-6);
}

.client-row > *:last-child {
  padding-right: var(--space-6);
  justify-self: start;
}

.company-name {
  font-weight: var(--font-weight-bold);
}

.contact {
  color: var(--color-text-muted);
}
</style>
