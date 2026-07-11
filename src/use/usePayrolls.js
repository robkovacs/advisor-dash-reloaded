import { computed } from 'vue'
import { clients } from './useClients'

// Deterministic pseudo-random number from a string seed (xmur3 + mulberry32)
function seededRandom(seed) {
  let h = 1779033703 ^ seed.length
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  // One round of mulberry32
  h += 0x6d2b79f5
  let t = Math.imul(h ^ (h >>> 15), h | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

function generateDebitDates(frequency, monthsBack = 6) {
  const dates = []
  const today = new Date()
  const start = new Date(today.getFullYear(), today.getMonth() - monthsBack, 1)
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 28) // one month ahead

  if (frequency === 'weekly') {
    // Every Friday
    let cur = new Date(start)
    cur.setDate(cur.getDate() + (5 - cur.getDay() + 7) % 7)
    while (cur <= end) {
      dates.push(new Date(cur))
      cur.setDate(cur.getDate() + 7)
    }
  } else if (frequency === 'biweekly') {
    // Every other Friday, starting from a fixed anchor
    let cur = new Date(start)
    cur.setDate(cur.getDate() + (5 - cur.getDay() + 7) % 7)
    while (cur <= end) {
      dates.push(new Date(cur))
      cur.setDate(cur.getDate() + 14)
    }
  } else if (frequency === 'semi-monthly') {
    // 1st and 15th of each month
    let cur = new Date(start.getFullYear(), start.getMonth(), 1)
    while (cur <= end) {
      dates.push(new Date(cur.getFullYear(), cur.getMonth(), 1))
      dates.push(new Date(cur.getFullYear(), cur.getMonth(), 15))
      cur.setMonth(cur.getMonth() + 1)
    }
  } else if (frequency === 'monthly') {
    // 1st of each month
    let cur = new Date(start.getFullYear(), start.getMonth(), 1)
    while (cur <= end) {
      dates.push(new Date(cur))
      cur.setMonth(cur.getMonth() + 1)
    }
  }

  return dates.filter(d => d >= start && d <= end)
}

function formatDateISO(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getStatus(debitDate) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(debitDate)
  d.setHours(0, 0, 0, 0)
  if (d.getTime() === today.getTime()) return 'processing'
  if (d < today) return 'completed'
  return 'upcoming'
}

export const payrolls = computed(() => {
  const records = []
  for (const client of clients.value) {
    if (client.status !== 'active' || !client.payCycles) continue
    for (const cycle of client.payCycles) {
      const dates = generateDebitDates(cycle.frequency)
      for (const date of dates) {
        const seed = `${client.id}-${cycle.payBasis}-${formatDateISO(date)}`
        const rand = seededRandom(seed)
        // Generate amount: base $20k–$200k scaled by randomness
        const amount = Math.round((20000 + rand * 180000) * 100) / 100
        records.push({
          id: seed,
          clientId: client.id,
          companyName: client.companyName,
          frequency: cycle.frequency,
          payBasis: cycle.payBasis,
          countries: cycle.countries,
          debitDate: formatDateISO(date),
          total: amount,
          status: getStatus(date),
        })
      }
    }
  }
  // Sort by debit date descending
  records.sort((a, b) => b.debitDate.localeCompare(a.debitDate))
  return records
})

export function payrollsForClient(clientId) {
  return computed(() => payrolls.value.filter(p => p.clientId === clientId))
}

const FIRST_NAMES = [
  'James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda',
  'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Charles', 'Karen',
]

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
  'Taylor', 'Moore', 'Jackson', 'Martin',
]

const CYCLE_LENGTHS = {
  weekly: 7,
  biweekly: 14,
  'semi-monthly': 15,
  monthly: 30,
}

function addDays(dateStr, days) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d
}

// Distribute `total` across `count` items using seeded randomness, each item
// getting a base share plus a random variance, rounded to 2 decimals and
// adjusted so the items sum exactly to `total`.
function distribute(total, count, seedPrefix) {
  const weights = []
  for (let i = 0; i < count; i++) {
    const rand = seededRandom(`${seedPrefix}-w${i}`)
    weights.push(0.7 + rand * 0.6) // 0.7–1.3 variance
  }
  const weightSum = weights.reduce((a, b) => a + b, 0)
  const amounts = weights.map(w => Math.round((total * w / weightSum) * 100) / 100)
  // Correct rounding drift on the last item so the total matches exactly.
  const roundedSum = amounts.slice(0, -1).reduce((a, b) => a + b, 0)
  amounts[amounts.length - 1] = Math.round((total - roundedSum) * 100) / 100
  return amounts
}

// Split `total` into labeled items around target percentages, with ±5% seeded
// variance per item, normalized so the items sum to `total`.
function splitByPercentages(total, labels, targetPercentages, seedPrefix) {
  const raw = targetPercentages.map((pct, i) => {
    const rand = seededRandom(`${seedPrefix}-p${i}`)
    const variance = (rand - 0.5) * 0.1 // ±5%
    return Math.max(pct + variance, 0)
  })
  const rawSum = raw.reduce((a, b) => a + b, 0)
  const amounts = raw.map(pct => Math.round((total * pct / rawSum) * 100) / 100)
  const roundedSum = amounts.slice(0, -1).reduce((a, b) => a + b, 0)
  amounts[amounts.length - 1] = Math.round((total - roundedSum) * 100) / 100
  return labels.map((label, i) => ({ label, amount: amounts[i] }))
}

export function getPayrollDetail(payrollId) {
  const payroll = payrolls.value.find(p => p.id === payrollId)
  if (!payroll) return null

  const cycleLength = CYCLE_LENGTHS[payroll.frequency] || 14
  const debitDate = payroll.debitDate
  const periodEndDate = addDays(debitDate, -1)
  const periodStartDate = addDays(formatDateISO(periodEndDate), -(cycleLength - 1))
  const periodStart = formatDateISO(periodStartDate)
  const periodEnd = formatDateISO(periodEndDate)
  const payDate = formatDateISO(addDays(debitDate, 3))

  // Employee count: 3-12, seeded
  const employeeCountRand = seededRandom(`${payrollId}-employeeCount`)
  const employeeCount = 3 + Math.floor(employeeCountRand * 10)

  const totalPayShares = distribute(payroll.total, employeeCount, `${payrollId}-totalPay`)

  const employees = totalPayShares.map((totalPay, i) => {
    const firstNameIdx = Math.floor(seededRandom(`${payrollId}-firstName${i}`) * FIRST_NAMES.length)
    const lastNameIdx = Math.floor(seededRandom(`${payrollId}-lastName${i}`) * LAST_NAMES.length)
    const name = `${FIRST_NAMES[firstNameIdx]} ${LAST_NAMES[lastNameIdx]}`

    const withholdingsPct = 0.30 + seededRandom(`${payrollId}-withholdingsPct${i}`) * 0.10 // 30-40%
    const deductionsPct = 0.03 + seededRandom(`${payrollId}-deductionsPct${i}`) * 0.05 // 3-8%

    const withholdings = Math.round(totalPay * withholdingsPct * 100) / 100
    const deductions = Math.round(totalPay * deductionsPct * 100) / 100
    const netPay = Math.round((totalPay - withholdings - deductions) * 100) / 100

    return { name, totalPay, withholdings, deductions, netPay }
  })

  const totalPaymentsTotal = Math.round(
    employees.reduce((sum, e) => sum + e.totalPay, 0) * 100
  ) / 100
  const withholdingsTotal = Math.round(
    employees.reduce((sum, e) => sum + e.withholdings, 0) * 100
  ) / 100
  const deductionsTotal = Math.round(
    employees.reduce((sum, e) => sum + e.deductions, 0) * 100
  ) / 100

  const totalPaymentsLabel = payroll.payBasis === 'Hourly' ? 'Hourly wages' : 'Salary'

  const withholdingsItems = splitByPercentages(
    withholdingsTotal,
    ['Federal Income Tax', 'Social Security', 'Medicare', 'State Income Tax', 'State Disability Insurance'],
    [0.45, 0.25, 0.06, 0.18, 0.06],
    `${payrollId}-withholdingsSplit`
  )

  const deductionsItems = splitByPercentages(
    deductionsTotal,
    ['401(k) (pre-tax)', '401(k) (post-tax)', 'Health insurance'],
    [0.60, 0.20, 0.20],
    `${payrollId}-deductionsSplit`
  )

  // Add per-employee breakdown to each category item
  function addEmployeeBreakdown(items, categoryKey) {
    return items.map((item, itemIdx) => {
      const perEmployee = distribute(item.amount, employees.length, `${payrollId}-${categoryKey}-${itemIdx}-emp`)
      return {
        ...item,
        byEmployee: employees.map((emp, empIdx) => ({
          name: emp.name,
          amount: perEmployee[empIdx],
        })),
      }
    })
  }

  const totalPaymentsItems = addEmployeeBreakdown(
    [{ label: totalPaymentsLabel, amount: totalPaymentsTotal }],
    'totalPay',
  )
  const withholdingsItemsWithEmp = addEmployeeBreakdown(withholdingsItems, 'withholdings')
  const deductionsItemsWithEmp = addEmployeeBreakdown(deductionsItems, 'deductions')

  const employerContributionsTotal = Math.round(
    totalPaymentsTotal * (0.12 + (seededRandom(`${payrollId}-erContribPct`) - 0.5) * 0.02) * 100
  ) / 100

  const employerContributionsItems = addEmployeeBreakdown(
    splitByPercentages(
      employerContributionsTotal,
      ['State SUI Charge', 'Medicare - Employer', 'Social Security - Employer', 'Federal Unemployment Tax', 'Re-employment Service Fund'],
      [0.33, 0.12, 0.45, 0.05, 0.05],
      `${payrollId}-erContribSplit`
    ),
    'erContrib',
  )

  return {
    ...payroll,
    periodStart,
    periodEnd,
    debitDate,
    payDate,
    employees,
    categories: {
      totalPayments: {
        total: totalPaymentsTotal,
        items: totalPaymentsItems,
      },
      withholdings: {
        total: withholdingsTotal,
        items: withholdingsItemsWithEmp,
      },
      deductions: {
        total: deductionsTotal,
        items: deductionsItemsWithEmp,
      },
      employerContributions: {
        total: employerContributionsTotal,
        items: employerContributionsItems,
      },
    },
  }
}

export function usePayrolls() {
  return { payrolls, payrollsForClient, getPayrollDetail }
}
