<script setup>
import { computed } from 'vue'
import Stack from '@/components/Stack.vue'
import Row from '@/components/Row.vue'
import Button from '@/components/Button.vue'
import Badge from '@/components/Badge.vue'
import Menu from '@/components/Menu.vue'
import MenuOption from '@/components/MenuOption.vue'
import IconCaretRight from '~icons/ph/caret-right'
import IconCaretDownFill from '~icons/ph/caret-down-fill'
import { currentUser } from '@/use/useCurrentUser'
import { firm } from '@/use/useFirm'
import { clients } from '@/use/useClients'
import { firmMembers } from '@/use/useFirmMembers'

const userFirstName = computed(() => currentUser.firstName || 'there')
const firmName = computed(() => firm.name || 'your firm')

const totalClients = computed(() => clients.value.length)
const activeClients = computed(() =>
  clients.value.filter((c) => c.status === 'active'),
)
const pendingClients = computed(() =>
  clients.value.filter((c) => c.status === 'pending'),
)
const activeMembers = computed(() =>
  firmMembers.value.filter((m) => m.status === 'active'),
)
</script>

<template>
  <Stack gap="6">
    <Row align="flex-start" justify="space-between">
      <Stack gap="2">
        <h1>Welcome back, {{ userFirstName }}!</h1>
        <p class="intro">
          Here's what's going on at <strong>{{ firmName }}</strong
          >.
        </p>
      </Stack>
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

    <Stack gap="6">
      <div class="stat-grid">
        <RouterLink to="/clients" class="stat-card">
          <p class="stat-label">Total clients</p>
          <p class="stat-value">{{ totalClients }}</p>
        </RouterLink>
        <RouterLink to="/clients?status=active" class="stat-card">
          <p class="stat-label">Active</p>
          <p class="stat-value">{{ activeClients.length }}</p>
        </RouterLink>
        <RouterLink
          to="/clients?status=pending"
          class="stat-card"
          :class="{ 'stat-card--warn': pendingClients.length > 0 }"
        >
          <p class="stat-label">Pending</p>
          <p class="stat-value">{{ pendingClients.length }}</p>
        </RouterLink>
        <RouterLink to="/firm-members" class="stat-card">
          <p class="stat-label">Team members</p>
          <p class="stat-value">{{ activeMembers.length }}</p>
        </RouterLink>
      </div>
    </Stack>

    <Stack v-if="pendingClients.length" gap="4">
      <h3>Needs attention</h3>
      <div class="attention-list">
        <RouterLink
          v-for="client in pendingClients"
          :key="client.id"
          :to="`/clients/${client.id}`"
          class="attention-item"
        >
          <Stack gap="1" class="attention-info">
            <span class="attention-company">{{ client.companyName }}</span>
            <span class="attention-contact"
              >{{ client.firstName }} {{ client.lastName }}</span
            >
          </Stack>
          <Row gap="3" align="center">
            <Badge variant="default">Pending</Badge>
            <IconCaretRight />
          </Row>
        </RouterLink>
      </div>
    </Stack>
  </Stack>
</template>

<style scoped>
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
}

@container (max-width: 36rem) {
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@container (max-width: 20rem) {
  .stat-grid {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  padding: var(--space-6);
  background: var(--color-bg);
  border: 1px solid var(--color-line);
  border-radius: var(--border-radius-md);
  text-decoration: none;
  color: var(--color-text);
  transition: background 0.1s;
}

@media (hover: hover) {
  .stat-card:hover {
    background: var(--color-bg-subtle);
  }
}

.stat-card--warn {
  border-color: var(--color-error-border);
}

.stat-card--warn .stat-value {
  color: var(--color-error);
}

.stat-label {
  font-size: var(--font-size-lg);
  color: var(--color-text-muted);
  margin-bottom: var(--space-2);
  line-height: var(--line-height-heading);
}

.stat-value {
  font-size: var(--font-size-2xl, 1.75rem);
  font-weight: var(--font-weight-bold);
  line-height: 1;
}

.attention-list {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-line);
  border-radius: var(--border-radius-md);
  overflow: hidden;
}

.attention-item {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-6);
  text-decoration: none;
  color: var(--color-text);
  border-bottom: 1px solid var(--color-line);
}

.attention-info {
  min-width: 0;
}

.attention-item:last-child {
  border-bottom: none;
}

@media (hover: hover) {
  .attention-item:hover {
    background: var(--color-bg-subtle);
  }
}

.attention-company {
  font-weight: var(--font-weight-bold);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.attention-contact {
  font-size: var(--font-size-md);
  color: var(--color-text-muted);
}

.attention-cta {
  font-size: var(--font-size-md);
  color: var(--color-text-muted);
}
</style>
