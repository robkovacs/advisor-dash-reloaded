<script setup>
import { computed, ref } from 'vue'
import { payrolls } from '@/use/usePayrolls'
import { clients } from '@/use/useClients'
import Stack from '@/components/Stack.vue'
import Row from '@/components/Row.vue'
import MultiSelect from '@/components/MultiSelect.vue'
import InputDateRange from '@/components/InputDateRange.vue'
import Badge from '@/components/Badge.vue'
import EmptyState from '@/components/EmptyState.vue'
import PageHeader from '@/components/PageHeader.vue'
import FlagUS from '~icons/circle-flags/us'
import FlagCA from '~icons/circle-flags/ca'
import FlagGB from '~icons/circle-flags/gb'
import FlagDE from '~icons/circle-flags/de'
import FlagIN from '~icons/circle-flags/in'
import FlagPH from '~icons/circle-flags/ph'

definePage({ meta: { title: 'Payrolls' } })

const FLAG_COMPONENTS = { us: FlagUS, ca: FlagCA, gb: FlagGB, de: FlagDE, in: FlagIN, ph: FlagPH }
const STATUS_VARIANT = { completed: 'success', upcoming: 'default', processing: 'accent' }
const STATUS_LABEL = { completed: 'Completed', upcoming: 'Upcoming', processing: 'Processing' }

const selectedClients = ref([])

const sixMonthsAgo = (() => {
  const d = new Date()
  d.setMonth(d.getMonth() - 6)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
})()

const dateRange = ref([sixMonthsAgo, null])

const clientOptions = computed(() =>
  clients.value
    .filter((c) => c.status === 'active')
    .map((c) => ({ label: c.companyName, value: c.id }))
    .sort((a, b) => a.label.localeCompare(b.label)),
)

const filteredPayrolls = computed(() => {
  let list = payrolls.value

  if (selectedClients.value.length > 0) {
    list = list.filter((p) => selectedClients.value.includes(p.clientId))
  }

  const [start, end] = dateRange.value
  if (start) {
    list = list.filter((p) => p.debitDate >= start)
  }
  if (end) {
    list = list.filter((p) => p.debitDate <= end)
  }

  return list
})

function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function cycleDescription(payroll) {
  return `${capitalize(payroll.payBasis)} ${payroll.frequency}`
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

function formatCurrency(n) {
  return currencyFormatter.format(n)
}

function formatDate(iso) {
  const date = new Date(iso + 'T00:00:00')
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}
</script>

<template>
  <Stack gap="6">
    <PageHeader title="Payrolls" />
    <Row gap="4" align="flex-end">
      <MultiSelect
        label="Client"
        :options="clientOptions"
        v-model="selectedClients"
      />
      <InputDateRange label="Date range" v-model="dateRange" hide-label />
    </Row>
    <div v-if="filteredPayrolls.length" class="payroll-list">
      <RouterLink
        v-for="payroll in filteredPayrolls"
        :key="payroll.id"
        :to="`/payrolls/${payroll.id}`"
        class="payroll-row"
      >
        <div class="payroll-info">
          <span class="company-name">{{ payroll.companyName }}</span>
          <span class="cycle-desc">{{ cycleDescription(payroll) }}</span>
        </div>
        <div class="payroll-flags">
          <component
            v-for="code in payroll.countries.slice(0, 3)"
            :key="code"
            :is="FLAG_COMPONENTS[code]"
            class="flag-icon"
          />
          <span
            v-if="payroll.countries.length > 3"
            class="flag-overflow"
          >+{{ payroll.countries.length - 3 }}</span>
        </div>
        <span class="payroll-date">{{ formatDate(payroll.debitDate) }}</span>
        <span class="payroll-amount">{{ formatCurrency(payroll.total) }}</span>
        <span class="payroll-status">
          <Badge :variant="STATUS_VARIANT[payroll.status]">{{
            STATUS_LABEL[payroll.status]
          }}</Badge>
        </span>
      </RouterLink>
    </div>
    <EmptyState v-else message="No payrolls found." />
  </Stack>
</template>

<style scoped>
.payroll-list {
  display: grid;
  grid-template-columns: 1fr auto auto auto auto;
  column-gap: var(--space-4);
  border: 1px solid var(--color-line);
  border-radius: var(--border-radius-md);
  overflow: hidden;
}

.payroll-row {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: subgrid;
  align-items: center;
  text-decoration: none;
  color: var(--color-text);
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--color-line);
}

.payroll-row:last-child {
  border-bottom: none;
}

@media (hover: hover) {
  .payroll-row:hover {
    background: var(--color-bg-subtle);
  }
}

.payroll-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.company-name {
  font-weight: var(--font-weight-bold);
}

.cycle-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.payroll-flags {
  display: flex;
  align-items: center;
}

.flag-icon {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  margin-left: -0.25rem;
}

.flag-icon:first-child {
  margin-left: 0;
}

.flag-overflow {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin-left: var(--space-1);
}

.payroll-date {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  white-space: nowrap;
}

.payroll-amount {
  font-weight: var(--font-weight-bold);
  text-align: right;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.payroll-status {
  justify-self: end;
}
</style>
