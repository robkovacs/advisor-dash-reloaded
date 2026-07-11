<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { payrolls, getPayrollDetail } from '@/use/usePayrolls'
import Stack from '@/components/Stack.vue'
import Row from '@/components/Row.vue'
import Badge from '@/components/Badge.vue'
import PageHeader from '@/components/PageHeader.vue'
import SegmentedControl from '@/components/SegmentedControl.vue'
import EmptyState from '@/components/EmptyState.vue'
import IconCaretDown from '~icons/ph/caret-down'

definePage({ meta: { title: 'Debit details' } })

const route = useRoute()
const ancestors = computed(() => {
  if (!payroll.value) return [{ label: 'Payrolls', to: '/payrolls' }]
  return [
    { label: 'Payrolls', to: '/payrolls' },
    { label: payroll.value.companyName },
    { label: `${capitalize(payroll.value.payBasis)} ${payroll.value.frequency}` },
  ]
})

const pageTitle = computed(() =>
  payroll.value ? formatDate(payroll.value.debitDate) : 'Debit details',
)

const payroll = computed(() => payrolls.value.find((p) => p.id === route.params.id))
const detail = computed(() => (payroll.value ? getPayrollDetail(payroll.value.id) : null))

const STATUS_VARIANT = { completed: 'success', upcoming: 'default', processing: 'accent' }
const STATUS_LABEL = { completed: 'Completed', upcoming: 'Upcoming', processing: 'Forecasted' }

const CATEGORY_SECTIONS = [
  { key: 'totalPayments', heading: 'Total payments', tone: 'default' },
  { key: 'withholdings', heading: 'Withholdings', tone: 'negative' },
  { key: 'deductions', heading: 'Deductions', tone: 'negative' },
  { key: 'employerContributions', heading: 'Employer contributions', tone: 'default' },
]

const view = ref('category')
const VIEW_OPTIONS = [
  { value: 'category', label: 'By category' },
  { value: 'person', label: 'By person' },
]

// Track which category items are expanded to show per-employee breakdown
const expandedItems = reactive(new Set())

function toggleItem(key) {
  if (expandedItems.has(key)) {
    expandedItems.delete(key)
  } else {
    expandedItems.add(key)
  }
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

function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const today = (() => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
})()

function isPast(iso) {
  const d = new Date(iso + 'T00:00:00')
  return d <= today
}

const timeline = computed(() => {
  if (!detail.value) return []
  return [
    { date: detail.value.periodStart, label: 'Period start' },
    { date: detail.value.periodEnd, label: 'Period end' },
    { date: detail.value.debitDate, label: 'Debit date' },
    { date: detail.value.payDate, label: 'Pay date' },
  ]
})
</script>

<template>
  <Stack v-if="payroll && detail" gap="6">
    <Row align="center" justify="space-between">
      <PageHeader :ancestors="ancestors" :title="pageTitle" />
      <Badge :variant="STATUS_VARIANT[payroll.status]">{{
        STATUS_LABEL[payroll.status]
      }}</Badge>
    </Row>

    <div class="info-card">
      <Row align="center" justify="space-between">
        <Badge>{{ capitalize(payroll.payBasis) }}</Badge>
      </Row>
      <h2 class="info-company">{{ payroll.companyName }}</h2>

      <div class="timeline">
        <div
          v-for="milestone in timeline"
          :key="milestone.label"
          class="timeline-point"
        >
          <span class="timeline-date">{{ formatDate(milestone.date) }}</span>
          <div
            class="timeline-dot"
            :class="isPast(milestone.date) ? 'timeline-dot--past' : 'timeline-dot--future'"
          />
          <span class="timeline-label">{{ milestone.label }}</span>
        </div>
      </div>

      <h3 class="overview-heading">Overview</h3>
      <div class="estimated-total">
        <span class="total-label">Estimated total</span>
        <span class="total-amount">{{ formatCurrency(payroll.total) }}</span>
      </div>
    </div>

    <Stack gap="4">
      <h2>Payments included</h2>
      <SegmentedControl v-model="view" :options="VIEW_OPTIONS" />

      <div v-if="view === 'category'" class="category-view">
        <div
          v-for="section in CATEGORY_SECTIONS"
          :key="section.key"
          class="category-section"
        >
          <Row class="category-header" justify="space-between">
            <h3>{{ section.heading }}</h3>
            <span
              class="category-total"
              :class="section.tone === 'negative' ? 'category-total--negative' : ''"
              >{{ formatCurrency(detail.categories[section.key].total) }}</span
            >
          </Row>
          <div
            v-for="item in detail.categories[section.key].items"
            :key="item.label"
            class="category-item-group"
          >
            <button
              type="button"
              class="category-item"
              @click="toggleItem(`${section.key}-${item.label}`)"
            >
              <IconCaretDown
                class="expand-icon"
                :class="{
                  'expand-icon--open': expandedItems.has(
                    `${section.key}-${item.label}`,
                  ),
                }"
                aria-hidden="true"
              />
              <span class="item-label">{{ item.label }}</span>
              <span class="item-amount">{{
                formatCurrency(item.amount)
              }}</span>
            </button>
            <div
              v-if="
                expandedItems.has(`${section.key}-${item.label}`) &&
                item.byEmployee
              "
              class="employee-breakdown"
            >
              <div
                v-for="emp in item.byEmployee"
                :key="emp.name"
                class="employee-line"
              >
                <span class="employee-name">{{ emp.name }}</span>
                <span class="employee-amount">{{
                  formatCurrency(emp.amount)
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="person-view">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Total payments</th>
              <th>Withholdings</th>
              <th>Deductions</th>
              <th>Net pay</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="employee in detail.employees" :key="employee.name">
              <td>{{ employee.name }}</td>
              <td>{{ formatCurrency(employee.totalPay) }}</td>
              <td>{{ formatCurrency(employee.withholdings) }}</td>
              <td>{{ formatCurrency(employee.deductions) }}</td>
              <td>{{ formatCurrency(employee.netPay) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Stack>
  </Stack>
  <EmptyState v-else message="Payroll not found." />
</template>

<style scoped>
.info-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-6);
  background: var(--color-bg);
  border: 1px solid var(--color-line);
  border-radius: var(--border-radius-md);
}

.info-company {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
}

.timeline {
  position: relative;
  display: flex;
  justify-content: space-between;
  padding: var(--space-4) var(--space-2) var(--space-2);
  margin-top: var(--space-2);
}

.timeline::before {
  content: '';
  position: absolute;
  top: calc(var(--space-4) + 1.4rem);
  left: var(--space-2);
  right: var(--space-2);
  height: 2px;
  background: var(--color-line);
}

.timeline-point {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  z-index: 1;
}

.timeline-date {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  white-space: nowrap;
}

.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: var(--border-radius-max);
  background: var(--color-bg);
  border: 2px solid var(--color-line);
}

.timeline-dot--past {
  background: var(--color-success);
  border-color: var(--color-success);
}

.timeline-dot--future {
  background: var(--color-bg);
  border-color: var(--color-text-muted);
}

.timeline-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  white-space: nowrap;
}

.overview-heading {
  margin: 0;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
}

.estimated-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
  background: var(--color-bg-subtle);
  border-radius: var(--border-radius-md);
}

.total-label {
  color: var(--color-text-muted);
}

.total-amount {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-accent-text);
  font-variant-numeric: tabular-nums;
}

.category-section {
  margin-bottom: var(--space-6);
}

.category-section:last-child {
  margin-bottom: 0;
}

.category-header {
  margin-bottom: var(--space-2);
}

.category-header h3 {
  margin: 0;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
}

.category-total {
  font-weight: var(--font-weight-bold);
  font-variant-numeric: tabular-nums;
}

.category-total--negative {
  color: var(--color-error);
}

.category-item-group:last-child .category-item {
  border-bottom: none;
}

.category-item {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-2) 0;
  padding-left: var(--space-4);
  border: none;
  border-bottom: 1px dotted var(--color-line);
  background: none;
  font: inherit;
  color: inherit;
  cursor: pointer;
  text-align: left;
}

@media (hover: hover) {
  .category-item:hover {
    background: var(--color-bg-subtle);
  }
}

.expand-icon {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  flex-shrink: 0;
  transition: transform 0.15s;
}

.expand-icon--open {
  transform: rotate(180deg);
}

.item-label {
  flex: 1;
  color: var(--color-text-muted);
}

.item-amount {
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.employee-breakdown {
  padding-left: var(--space-10);
}

.employee-line {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-2);
  padding: var(--space-1) 0;
  font-size: var(--font-size-sm);
}

.employee-name {
  color: var(--color-text-muted);
}

.employee-amount {
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  color: var(--color-text-muted);
}

.person-view table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid var(--color-line);
  border-radius: var(--border-radius-md);
  overflow: hidden;
}

.person-view th,
.person-view td {
  padding: var(--space-3) var(--space-4);
  text-align: left;
  border-bottom: 1px solid var(--color-line);
}

.person-view th {
  background: var(--color-bg-subtle);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
}

.person-view td:not(:first-child),
.person-view th:not(:first-child) {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.person-view tbody tr:last-child td {
  border-bottom: none;
}
</style>
