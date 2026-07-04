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
  <Stack gap="8">
    <Row align="center" justify="space-between">
      <h1>Clients</h1>
      <Menu placement="bottom-end">
        <template #trigger="{ toggle, isOpen }">
          <Button variant="primary" :aria-expanded="isOpen" @click="toggle">
            Add client <IconCaretDownFill />
          </Button>
        </template>
        <MenuOption to="/clients/refer">Refer a client</MenuOption>
        <MenuOption to="/clients/enroll">Enroll a client</MenuOption>
      </Menu>
    </Row>
    <Row gap="2" class="filter-row">
      <button
        v-for="f in filters"
        :key="f.label"
        class="filter-btn"
        :class="{ 'filter-btn--active': activeFilter === f.value }"
        @click="setFilter(f.value)"
      >
        {{ f.label }}
      </button>
    </Row>
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
    <Stack v-else align="center" gap="4" class="empty">
      <p>No {{ activeFilter ? statusLabel[activeFilter].toLowerCase() : '' }} clients yet.</p>
      <Menu placement="bottom-end">
        <template #trigger="{ toggle, isOpen }">
          <Button variant="primary" :aria-expanded="isOpen" @click="toggle">
            Add client <IconCaretDownFill />
          </Button>
        </template>
        <MenuOption to="/clients/refer">Refer a client</MenuOption>
        <MenuOption to="/clients/enroll">Enroll a client</MenuOption>
      </Menu>
    </Stack>
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
  font-size: var(--font-size-sm);
}

.empty {
  padding: var(--space-16);
  color: var(--color-text-muted);
}

.filter-row {
  flex-wrap: wrap;
}

.filter-btn {
  padding: var(--space-1) var(--space-3);
  border: 1px solid var(--color-line);
  border-radius: var(--border-radius-max);
  background: var(--color-bg);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-family: inherit;
  cursor: pointer;
  transition:
    background 0.1s,
    color 0.1s,
    border-color 0.1s;
}

@media (hover: hover) {
  .filter-btn:hover {
    background: var(--color-bg-subtle);
    color: var(--color-text);
  }
}

.filter-btn--active {
  background: var(--color-bg-muted);
  color: var(--color-text);
  border-color: var(--color-input-border);
}
</style>
