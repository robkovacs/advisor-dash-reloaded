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
import IconCaretUpDown from '~icons/ph/caret-up-down'
import FlagUS from '~icons/circle-flags/us'
import FlagCA from '~icons/circle-flags/ca'
import FlagGB from '~icons/circle-flags/gb'
import FlagDE from '~icons/circle-flags/de'
import FlagIN from '~icons/circle-flags/in'
import FlagPH from '~icons/circle-flags/ph'

definePage({ meta: { title: 'Payrolls' } })

const FLAG_COMPONENTS = {
  us: FlagUS,
  ca: FlagCA,
  gb: FlagGB,
  de: FlagDE,
  in: FlagIN,
  ph: FlagPH,
}
const STATUS_VARIANT = {
  completed: 'success',
  upcoming: 'default',
  processing: 'accent',
}
const STATUS_LABEL = {
  completed: 'Completed',
  upcoming: 'Upcoming',
  processing: 'Processing',
}

const selectedStatuses = ref([])
const STATUS_OPTIONS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
]

const selectedClients = ref([])

const SORT_OPTIONS = [
  { value: 'date-desc', label: 'Date (newest first)' },
  { value: 'date-asc', label: 'Date (oldest first)' },
  { value: 'amount-desc', label: 'Amount (high to low)' },
  { value: 'amount-asc', label: 'Amount (low to high)' },
  { value: 'company-asc', label: 'Company (A–Z)' },
  { value: 'company-desc', label: 'Company (Z–A)' },
]

const sortBy = ref('date-desc')

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

  if (selectedStatuses.value.length > 0) {
    list = list.filter((p) => selectedStatuses.value.includes(p.status))
  }

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

  const sorted = [...list]
  const [field, dir] = sortBy.value.split('-')
  sorted.sort((a, b) => {
    let cmp = 0
    if (field === 'date') cmp = a.debitDate.localeCompare(b.debitDate)
    else if (field === 'amount') cmp = a.total - b.total
    else if (field === 'company')
      cmp = a.companyName.localeCompare(b.companyName)
    return dir === 'desc' ? -cmp : cmp
  })

  return sorted
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
    <Row gap="3" align="flex-end">
      <MultiSelect
        label="Status"
        :options="STATUS_OPTIONS"
        v-model="selectedStatuses"
      />
      <MultiSelect
        label="Client"
        :options="clientOptions"
        v-model="selectedClients"
      />
      <InputDateRange
        label="Date range"
        v-model="dateRange"
        hide-label
        hide-error
      />
      <div class="sort-control">
        <IconCaretUpDown class="sort-icon" aria-hidden="true" />
        <select v-model="sortBy" class="sort-select" aria-label="Sort payrolls">
          <option
            v-for="opt in SORT_OPTIONS"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.label }}
          </option>
        </select>
      </div>
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
        <div class="payroll-date-status">
          <span class="payroll-date">{{ formatDate(payroll.debitDate) }}</span>
          <Badge
            appearance="secondary"
            :variant="STATUS_VARIANT[payroll.status]"
            >{{ STATUS_LABEL[payroll.status] }}</Badge
          >
        </div>
        <div class="payroll-people-flags">
          <span class="payroll-people">{{ payroll.employeeCount }} people</span>
          <div class="payroll-flags">
            <component
              v-for="code in payroll.countries.slice(0, 3)"
              :key="code"
              :is="FLAG_COMPONENTS[code]"
              class="flag-icon"
            />
            <span v-if="payroll.countries.length > 3" class="flag-overflow"
              >+{{ payroll.countries.length - 3 }}</span
            >
          </div>
        </div>
        <span class="payroll-amount">{{ formatCurrency(payroll.total) }}</span>
      </RouterLink>
    </div>
    <EmptyState v-else message="No payrolls found." />
  </Stack>
</template>

<style scoped>
.sort-control {
  position: relative;
  display: inline-flex;
  align-items: center;
  margin-left: auto;
}

.sort-icon {
  position: absolute;
  left: var(--space-3);
  pointer-events: none;
  color: var(--color-text-muted);
  font-size: var(--font-size-md);
}

.sort-select {
  appearance: none;
  border: 1px solid var(--color-input-border);
  border-radius: var(--border-radius-md);
  background: var(--color-bg);
  padding: var(--space-2) var(--space-4) var(--space-2)
    calc(var(--space-3) + 1em + var(--space-2));
  font: inherit;
  font-size: var(--font-size-md);
  color: var(--color-text);
  cursor: pointer;
  height: 2.25rem;
}

@media (hover: hover) {
  .sort-select:hover {
    border-color: var(--color-input-border-hover);
  }
}

.sort-select:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.payroll-list {
  display: grid;
  grid-template-columns: auto auto auto auto;
  column-gap: var(--space-8);
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

.payroll-date-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-2);
}

.payroll-date {
  font-size: var(--font-size-md);
  white-space: nowrap;
}

.payroll-people-flags {
  display: flex;
  flex-direction: column;
  align-items: flex-ehd;
  gap: var(--space-1);
}

.payroll-people {
  font-size: var(--font-size-md);
  white-space: nowrap;
  text-align: right;
}

.payroll-flags {
  display: flex;
  align-items: center;
  justify-content: flex-end;
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

.payroll-amount {
  font-weight: var(--font-weight-bold);
  color: var(--color-success-text);
  font-size: var(--font-size-lg);
  text-align: right;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
</style>
