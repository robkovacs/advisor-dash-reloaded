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
    {
      label: `${capitalize(payroll.value.payBasis)} ${payroll.value.frequency}`,
    },
  ]
})

const pageTitle = computed(() =>
  payroll.value ? formatDate(payroll.value.debitDate) : 'Debit details',
)

const payroll = computed(() =>
  payrolls.value.find((p) => p.id === route.params.id),
)
const detail = computed(() =>
  payroll.value ? getPayrollDetail(payroll.value.id) : null,
)

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

const debitTotal = computed(() => {
  if (!detail.value) return 0
  return (
    Math.round(
      (detail.value.categories.totalPayments.total +
        detail.value.categories.employerContributions.total) *
        100,
    ) / 100
  )
})

const netPayTotal = computed(() => {
  if (!detail.value) return 0
  return (
    Math.round(
      detail.value.employees.reduce((sum, e) => sum + e.netPay, 0) * 100,
    ) / 100
  )
})

// Cash Requirements Report: the total debit, grouped by where the cash
// actually goes (employees, tax agencies, benefit/deduction vendors) rather
// than by expense category.
const cashRequirementsItems = computed(() => {
  if (!detail.value) return []

  // Employer contributions are broken down per line item (e.g. State SUI,
  // Employer Medicare), each with its own byEmployee split — sum across
  // those items to get each employee's total employer-tax contribution.
  const employerContribByEmployee = detail.value.employees.map((e) => {
    const total = detail.value.categories.employerContributions.items.reduce(
      (sum, item) => {
        const match = item.byEmployee?.find((be) => be.name === e.name)
        return sum + (match ? match.amount : 0)
      },
      0,
    )
    return { name: e.name, amount: Math.round(total * 100) / 100 }
  })

  const taxDepositsByEmployee = detail.value.employees.map((e, i) => ({
    name: e.name,
    amount:
      Math.round((e.withholdings + employerContribByEmployee[i].amount) * 100) /
      100,
  }))

  return [
    {
      label: 'Net pay (direct deposit)',
      amount: netPayTotal.value,
      byEmployee: detail.value.employees.map((e) => ({
        name: e.name,
        amount: e.netPay,
      })),
    },
    {
      label: 'Tax deposits (withholding + employer taxes)',
      amount:
        Math.round(
          (detail.value.categories.withholdings.total +
            detail.value.categories.employerContributions.total) *
            100,
        ) / 100,
      byEmployee: taxDepositsByEmployee,
    },
    {
      label: 'Benefit & deduction remittances',
      amount: detail.value.categories.deductions.total,
      byEmployee: detail.value.employees.map((e) => ({
        name: e.name,
        amount: e.deductions,
      })),
    },
  ]
})

// Payroll Journal: the double-entry accounting view. Debits (expenses) and
// credits (liabilities/cash) always sum to the same total.
const journalDebits = computed(() => {
  if (!detail.value) return []
  return [
    {
      key: 'wagesExpense',
      heading: 'Wages Expense',
      total: detail.value.categories.totalPayments.total,
      items: detail.value.categories.totalPayments.items,
    },
    {
      key: 'payrollTaxExpense',
      heading: 'Payroll Tax Expense',
      total: detail.value.categories.employerContributions.total,
      items: detail.value.categories.employerContributions.items,
    },
  ]
})

const journalCredits = computed(() => {
  if (!detail.value) return []
  return [
    {
      key: 'netPayPayable',
      heading: 'Net Pay Payable',
      total: netPayTotal.value,
      items: [
        {
          label: 'Net pay',
          amount: netPayTotal.value,
          byEmployee: detail.value.employees.map((e) => ({
            name: e.name,
            amount: e.netPay,
          })),
        },
      ],
    },
    {
      key: 'withholdingsPayable',
      heading: 'Withholdings Payable',
      total: detail.value.categories.withholdings.total,
      items: detail.value.categories.withholdings.items,
    },
    {
      key: 'deductionsPayable',
      heading: 'Deductions Payable',
      total: detail.value.categories.deductions.total,
      items: detail.value.categories.deductions.items,
    },
    {
      key: 'employerTaxPayable',
      heading: 'Employer Payroll Tax Payable',
      total: detail.value.categories.employerContributions.total,
      items: detail.value.categories.employerContributions.items,
    },
  ]
})

const journalDebitsTotal = computed(() =>
  journalDebits.value.reduce((sum, s) => sum + s.total, 0),
)
const journalCreditsTotal = computed(() =>
  journalCredits.value.reduce((sum, s) => sum + s.total, 0),
)

// Payroll Register: a compressed-paystub layout, one card per employee, with
// Earnings/Deductions/Taxes broken into their own line items and shown both
// for this period ("Current") and accumulated for the year ("YTD").
function amountForEmployee(item, name) {
  return item.byEmployee?.find((be) => be.name === name)?.amount ?? 0
}

const employeePaystubs = computed(() => {
  if (!detail.value) return []
  const earningsLabel =
    detail.value.categories.totalPayments.items[0]?.label ?? 'Earnings'

  return detail.value.employees.map((emp) => {
    const earningsRows = [
      {
        label: earningsLabel,
        rate: emp.hourlyRate,
        hours: emp.hoursThisPeriod,
        current: emp.totalPay,
        ytd: emp.ytd.gross,
      },
    ]
    const taxRows = detail.value.categories.withholdings.items.map((item) => ({
      label: item.label,
      current: amountForEmployee(item, emp.name),
      ytd: emp.ytd.withholdingsByLabel[item.label] ?? 0,
    }))
    const deductionRows = detail.value.categories.deductions.items.map(
      (item) => ({
        label: item.label,
        current: amountForEmployee(item, emp.name),
        ytd: emp.ytd.deductionsByLabel[item.label] ?? 0,
      }),
    )

    return {
      ...emp,
      columns: [
        {
          key: 'earnings',
          heading: 'Earnings',
          showRateHours: !!emp.hourlyRate,
          rows: earningsRows,
          totalCurrent: emp.totalPay,
          totalYtd: emp.ytd.gross,
        },
        {
          key: 'deductions',
          heading: 'Deductions',
          showRateHours: false,
          rows: deductionRows,
          totalCurrent: emp.deductions,
          totalYtd: emp.ytd.deductions,
        },
        {
          key: 'taxes',
          heading: 'Taxes',
          showRateHours: false,
          rows: taxRows,
          totalCurrent: emp.withholdings,
          totalYtd: emp.ytd.withholdings,
        },
      ],
    }
  })
})

const view = ref('cash')
const VIEW_OPTIONS = [
  { value: 'cash', label: 'Cash requirements' },
  { value: 'journal', label: 'Payroll journal' },
  { value: 'person', label: 'Payroll register' },
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
    { date: detail.value.periodStart, label: 'Pay period start' },
    { date: detail.value.periodEnd, label: 'Pay period end' },
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

    <Stack gap="4">
      <div class="timeline">
        <div
          v-for="milestone in timeline"
          :key="milestone.label"
          class="timeline-point"
        >
          <div
            class="timeline-dot"
            :class="
              isPast(milestone.date)
                ? 'timeline-dot--past'
                : 'timeline-dot--future'
            "
          />
          <span class="timeline-date">{{ formatDate(milestone.date) }}</span>
          <span class="timeline-label">{{ milestone.label }}</span>
        </div>
      </div>

      <h3 class="overview-heading">Overview</h3>
      <div class="overview-subtotals">
        <Row justify="space-between">
          <span class="subtotal-label">Gross wages</span>
          <span class="subtotal-amount">{{
            formatCurrency(detail.categories.totalPayments.total)
          }}</span>
        </Row>
        <Row justify="space-between">
          <span class="subtotal-label">Employer taxes</span>
          <span class="subtotal-amount">{{
            formatCurrency(detail.categories.employerContributions.total)
          }}</span>
        </Row>
      </div>
      <div class="estimated-total">
        <span class="total-label">Total cost to employer</span>
        <span class="total-amount">{{ formatCurrency(debitTotal) }}</span>
      </div>
    </Stack>

    <SegmentedControl v-model="view" :options="VIEW_OPTIONS" />

    <div v-if="view === 'cash'" class="reports-view">
      <div class="report-card report-card--highlight">
        <Row class="report-card-header" justify="space-between" align="center">
          <div>
            <h3>Cash Requirements Report</h3>
            <p class="report-card-subtitle">
              Total cash required to fund this debit
            </p>
          </div>
          <span class="report-card-total">{{
            formatCurrency(debitTotal)
          }}</span>
        </Row>

        <div
          v-for="item in cashRequirementsItems"
          :key="item.label"
          class="category-item-group"
        >
          <button
            type="button"
            class="category-item"
            @click="toggleItem(`cash-${item.label}`)"
          >
            <IconCaretDown
              class="expand-icon"
              :class="{
                'expand-icon--open': expandedItems.has(`cash-${item.label}`),
              }"
              aria-hidden="true"
            />
            <span class="item-label">{{ item.label }}</span>
            <span class="item-amount">{{ formatCurrency(item.amount) }}</span>
          </button>
          <div
            v-if="expandedItems.has(`cash-${item.label}`) && item.byEmployee"
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

    <div v-else-if="view === 'journal'" class="reports-view">
      <div class="report-card">
        <h3>Payroll Journal</h3>
        <p class="report-card-subtitle">
          Double-entry accounting for this payroll run
        </p>

        <div class="journal-columns">
          <div class="journal-column">
            <h4 class="journal-column-heading">Debits</h4>
            <div
              v-for="section in journalDebits"
              :key="section.key"
              class="category-section"
            >
              <Row class="category-header" justify="space-between">
                <h5>{{ section.heading }}</h5>
                <span class="category-total">{{
                  formatCurrency(section.total)
                }}</span>
              </Row>
              <div
                v-for="item in section.items"
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
            <Row class="journal-column-total" justify="space-between">
              <span>Total debits</span>
              <span>{{ formatCurrency(journalDebitsTotal) }}</span>
            </Row>
          </div>

          <div class="journal-column">
            <h4 class="journal-column-heading">Credits</h4>
            <div
              v-for="section in journalCredits"
              :key="section.key"
              class="category-section"
            >
              <Row class="category-header" justify="space-between">
                <h5>{{ section.heading }}</h5>
                <span class="category-total">{{
                  formatCurrency(section.total)
                }}</span>
              </Row>
              <div
                v-for="item in section.items"
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
            <Row class="journal-column-total" justify="space-between">
              <span>Total credits</span>
              <span>{{ formatCurrency(journalCreditsTotal) }}</span>
            </Row>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="view === 'person'" class="person-view">
      <h3>Payroll Register</h3>
      <div class="paystub-list">
        <div
          v-for="emp in employeePaystubs"
          :key="emp.name"
          class="paystub-card"
        >
          <div class="paystub-header">
            <div class="paystub-identity">
              <span class="paystub-name">{{ emp.name }}</span>
              <span class="paystub-meta"
                >Emp #{{ emp.employeeNumber }} · SSN •••-••-{{ emp.ssnLast4 }} ·
                Dept {{ emp.department }}</span
              >
              <span class="paystub-meta"
                >{{ emp.addressLine1 }}, {{ emp.city }}, {{ emp.state }}
                {{ emp.zip }}</span
              >
            </div>
            <div class="paystub-fields">
              <div class="paystub-field">
                <span class="paystub-field-label">Hire date</span>
                <span>{{ formatDate(emp.hireDate) }}</span>
              </div>
              <div class="paystub-field">
                <span class="paystub-field-label">Birth date</span>
                <span>{{ formatDate(emp.birthDate) }}</span>
              </div>
              <div class="paystub-field">
                <span class="paystub-field-label">Filing status</span>
                <span
                  >{{ emp.filingStatus }} ({{
                    emp.exemptions
                  }}
                  exemptions)</span
                >
              </div>
              <div class="paystub-field">
                <span class="paystub-field-label">Res / work state</span>
                <span>{{ emp.state }}</span>
              </div>
            </div>
          </div>

          <div class="paystub-summary">
            <span
              >Gross wage:
              <strong>{{ formatCurrency(emp.totalPay) }}</strong></span
            >
            <span
              >Net pay: <strong>{{ formatCurrency(emp.netPay) }}</strong></span
            >
            <span class="paystub-summary-muted"
              >Direct deposit ••••{{ emp.directDepositLast4 }}</span
            >
            <span class="paystub-summary-muted"
              >Voucher #{{ emp.voucherNumber }}</span
            >
          </div>

          <div class="paystub-columns">
            <div
              v-for="col in emp.columns"
              :key="col.key"
              class="paystub-column"
            >
              <h4 class="paystub-column-heading">{{ col.heading }}</h4>
              <table class="paystub-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th v-if="col.showRateHours">Rate</th>
                    <th v-if="col.showRateHours">Hours</th>
                    <th>Current</th>
                    <th>YTD</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in col.rows" :key="row.label">
                    <td>{{ row.label }}</td>
                    <td v-if="col.showRateHours">
                      {{ formatCurrency(row.rate) }}
                    </td>
                    <td v-if="col.showRateHours">{{ row.hours }}</td>
                    <td>{{ formatCurrency(row.current) }}</td>
                    <td>{{ formatCurrency(row.ytd) }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td>Total</td>
                    <td v-if="col.showRateHours"></td>
                    <td v-if="col.showRateHours"></td>
                    <td>{{ formatCurrency(col.totalCurrent) }}</td>
                    <td>{{ formatCurrency(col.totalYtd) }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Stack>
  <EmptyState v-else message="Payroll not found." />
</template>

<style scoped>
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
  top: calc(var(--space-4) + 2px);
  left: 0;
  right: 0;
  height: 1px;
  background: var(--color-line);
}

.timeline-point {
  position: relative;
  display: flex;
  flex-direction: column;
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
  margin-top: -4px;
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

.overview-subtotals {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: 0 var(--space-4);
}

.subtotal-label {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.subtotal-amount {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
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

.reports-view {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.report-card {
  padding: var(--space-6);
  background: var(--color-bg);
  border: 1px solid var(--color-line);
  border-radius: var(--border-radius-md);
}

.report-card--highlight {
  border-color: var(--color-accent);
}

.report-card > h3 {
  margin: 0;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
}

.report-card-header {
  margin-bottom: var(--space-4);
}

.report-card-header h3 {
  margin: 0;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
}

.report-card-subtitle {
  margin: var(--space-1) 0 var(--space-4);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.report-card-total {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-accent-text);
  font-variant-numeric: tabular-nums;
}

.journal-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-8);
}

.journal-column-heading {
  margin: 0 0 var(--space-3);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--color-text-muted);
}

.journal-column-total {
  margin-top: var(--space-2);
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-line);
  font-weight: var(--font-weight-bold);
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

.category-header h5 {
  margin: 0;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
}

.category-total {
  font-weight: var(--font-weight-bold);
  font-variant-numeric: tabular-nums;
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

.person-view h3 {
  margin: 0 0 var(--space-3);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
}

.paystub-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.paystub-card {
  padding: var(--space-6);
  background: var(--color-bg);
  border: 1px solid var(--color-line);
  border-radius: var(--border-radius-md);
}

.paystub-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--space-4);
  padding-bottom: var(--space-4);
  margin-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-line);
}

.paystub-identity {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.paystub-name {
  font-weight: var(--font-weight-bold);
}

.paystub-meta {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.paystub-fields {
  display: grid;
  grid-template-columns: repeat(2, auto);
  gap: var(--space-1) var(--space-6);
}

.paystub-field {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  font-size: var(--font-size-sm);
}

.paystub-field-label {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}

.paystub-summary {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: baseline;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  margin-bottom: var(--space-4);
  background: var(--color-bg-subtle);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  font-variant-numeric: tabular-nums;
}

.paystub-summary-muted {
  color: var(--color-text-muted);
}

.paystub-columns {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-6);
}

.paystub-column-heading {
  margin: 0 0 var(--space-2);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--color-text-muted);
}

.paystub-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}

.paystub-table th,
.paystub-table td {
  padding: var(--space-1) 0;
  text-align: left;
}

.paystub-table th {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-regular);
  border-bottom: 1px dotted var(--color-line);
}

.paystub-table td:not(:first-child),
.paystub-table th:not(:first-child) {
  text-align: right;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.paystub-table td:first-child {
  color: var(--color-text-muted);
}

.paystub-table tfoot td {
  padding-top: var(--space-2);
  border-top: 1px solid var(--color-line);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
}
</style>
