import { clients as mockClients } from '@/data/mockTesterAccount'
import { US_STATES } from '@/data/usStates'
import { computed } from 'vue'
import { clients } from './useClients'

// Lookup payCycles from mock data for clients that were seeded before
// the payCycles field was added.
const MOCK_PAY_CYCLES = Object.fromEntries(
  mockClients.filter((c) => c.payCycles).map((c) => [c.id, c.payCycles]),
)

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

function round2(n) {
  return Math.round(n * 100) / 100
}

// Normalize legacy 'biweekly' (no hyphen) to 'bi-weekly'
function normalizeFrequency(f) {
  if (f === 'biweekly') return 'bi-weekly'
  return f
}

function generateDebitDates(frequency, monthsBack = 6) {
  const dates = []
  const today = new Date()
  const start = new Date(today.getFullYear(), today.getMonth() - monthsBack, 1)
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 28) // one month ahead

  if (frequency === 'weekly') {
    // Every Friday
    let cur = new Date(start)
    cur.setDate(cur.getDate() + ((5 - cur.getDay() + 7) % 7))
    while (cur <= end) {
      dates.push(new Date(cur))
      cur.setDate(cur.getDate() + 7)
    }
  } else if (frequency === 'bi-weekly') {
    // Every other Friday, starting from a fixed anchor
    let cur = new Date(start)
    cur.setDate(cur.getDate() + ((5 - cur.getDay() + 7) % 7))
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

  return dates.filter((d) => d >= start && d <= end)
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
  const d = new Date(debitDate + 'T00:00:00')
  const diffDays = Math.round((d - today) / (1000 * 60 * 60 * 24))
  // Payrolls enter "processing" up to 5 days before the debit clears
  if (diffDays >= 0 && diffDays <= 5) return 'processing'
  if (d < today) return 'completed'
  return 'upcoming'
}

const FIRST_NAMES = [
  'James',
  'Mary',
  'Robert',
  'Patricia',
  'John',
  'Jennifer',
  'Michael',
  'Linda',
  'David',
  'Elizabeth',
  'William',
  'Barbara',
  'Richard',
  'Susan',
  'Joseph',
  'Jessica',
  'Thomas',
  'Sarah',
  'Charles',
  'Karen',
]

const LAST_NAMES = [
  'Smith',
  'Johnson',
  'Williams',
  'Brown',
  'Jones',
  'Garcia',
  'Miller',
  'Davis',
  'Rodriguez',
  'Martinez',
  'Hernandez',
  'Lopez',
  'Gonzalez',
  'Wilson',
  'Anderson',
  'Thomas',
  'Taylor',
  'Moore',
  'Jackson',
  'Martin',
]

const STREET_NAMES = [
  'Main St',
  'Oak Ave',
  'Maple Dr',
  'Cedar Ln',
  'Elm St',
  'Park Ave',
  'Washington Blvd',
  'Lincoln Rd',
  '1st St',
  '2nd Ave',
]

const FILING_STATUSES = ['Single', 'Married', 'Head of Household']
const DEPARTMENTS = ['Sales', 'Engineering', 'Operations', 'Finance', 'Marketing', 'Human Resources']

const WITHHOLDINGS_LABELS = [
  'Federal Income Tax',
  'Social Security',
  'Medicare',
  'State Income Tax',
  'State Disability Insurance',
]
const WITHHOLDINGS_PCTS = [0.45, 0.25, 0.06, 0.18, 0.06]
const DEDUCTIONS_LABELS = [
  '401(k) (pre-tax)',
  '401(k) (post-tax)',
  'Health insurance',
]
const DEDUCTIONS_PCTS = [0.6, 0.2, 0.2]
const EMPLOYER_TAX_LABELS = [
  'Social Security - Employer',
  'Medicare - Employer',
  'Federal Unemployment Tax',
  'State SUI Charge',
  'Re-employment Service Fund',
]
const EMPLOYER_TAX_PCTS = [0.45, 0.12, 0.05, 0.33, 0.05]
const EMPLOYER_BENEFITS_LABELS = [
  'Health insurance - Employer',
  '401(k) match',
  'HSA contribution',
]
const EMPLOYER_BENEFITS_PCTS = [0.55, 0.35, 0.10]

const CYCLE_LENGTHS = {
  weekly: 7,
  'bi-weekly': 14,
  'semi-monthly': 15,
  monthly: 30,
}

function addDays(dateStr, days) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d
}

// Seeded weights (0.7–1.3 variance) for splitting a total across `count` items.
function generateWeights(count, seedPrefix) {
  const weights = []
  for (let i = 0; i < count; i++) {
    const rand = seededRandom(`${seedPrefix}-w${i}`)
    weights.push(0.7 + rand * 0.6)
  }
  return weights
}

// Distribute `total` proportionally across `weights`, rounded to 2 decimals
// and adjusted so the items sum exactly to `total`.
function distributeWithWeights(total, weights) {
  const weightSum = weights.reduce((a, b) => a + b, 0)
  const amounts = weights.map((w) => round2((total * w) / weightSum))
  const roundedSum = amounts.slice(0, -1).reduce((a, b) => a + b, 0)
  amounts[amounts.length - 1] = round2(total - roundedSum)
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
  const amounts = raw.map((pct) => round2((total * pct) / rawSum))
  const roundedSum = amounts.slice(0, -1).reduce((a, b) => a + b, 0)
  amounts[amounts.length - 1] = round2(total - roundedSum)
  return labels.map((label, i) => ({ label, amount: amounts[i] }))
}

// ── Employee roster ──────────────────────────────────────────────────────────
//
// Employees are stable per (client, payBasis, frequency) — the same roster of
// people appears in every pay period of that cycle, so "year to date" figures
// have a consistent person to accumulate against. Only each period's payroll
// total (and therefore each employee's current-period amounts) varies.

function getEmployeeRoster(clientId, payBasis, frequency) {
  const rosterKey = `${clientId}-${payBasis}-${frequency}`
  const client = clients.value.find((c) => c.id === clientId)
  const state =
    client?.state ||
    US_STATES[Math.floor(seededRandom(`${rosterKey}-state`) * US_STATES.length)]
  const city = client?.city || 'Springfield'

  const employeeCount =
    3 + Math.floor(seededRandom(`${rosterKey}-employeeCount`) * 10)
  const payWeights = generateWeights(employeeCount, `${rosterKey}-payWeight`)

  const today = new Date()

  return payWeights
    .map((payWeight, i) => {
      const firstNameIdx = Math.floor(
        seededRandom(`${rosterKey}-firstName${i}`) * FIRST_NAMES.length,
      )
      const lastNameIdx = Math.floor(
        seededRandom(`${rosterKey}-lastName${i}`) * LAST_NAMES.length,
      )
      const name = `${FIRST_NAMES[firstNameIdx]} ${LAST_NAMES[lastNameIdx]}`

      const streetNum =
        100 + Math.floor(seededRandom(`${rosterKey}-streetNum${i}`) * 9899)
      const streetIdx = Math.floor(
        seededRandom(`${rosterKey}-street${i}`) * STREET_NAMES.length,
      )
      const zip = String(
        10000 + Math.floor(seededRandom(`${rosterKey}-zip${i}`) * 90000),
      )

      const hireYearsAgo =
        1 + Math.floor(seededRandom(`${rosterKey}-hireYears${i}`) * 15)
      const hireDate = new Date(
        today.getFullYear() - hireYearsAgo,
        Math.floor(seededRandom(`${rosterKey}-hireMonth${i}`) * 12),
        1 + Math.floor(seededRandom(`${rosterKey}-hireDay${i}`) * 28),
      )

      const age = 22 + Math.floor(seededRandom(`${rosterKey}-age${i}`) * 43)
      const birthDate = new Date(
        today.getFullYear() - age,
        Math.floor(seededRandom(`${rosterKey}-birthMonth${i}`) * 12),
        1 + Math.floor(seededRandom(`${rosterKey}-birthDay${i}`) * 28),
      )

      const filingStatus =
        FILING_STATUSES[
          Math.floor(
            seededRandom(`${rosterKey}-filing${i}`) * FILING_STATUSES.length,
          )
        ]
      const exemptions = Math.floor(
        seededRandom(`${rosterKey}-exemptions${i}`) * 3,
      )
      const department =
        DEPARTMENTS[
          Math.floor(seededRandom(`${rosterKey}-dept${i}`) * DEPARTMENTS.length)
        ]

      const withholdingsPct =
        0.3 + seededRandom(`${rosterKey}-withholdingsPct${i}`) * 0.1 // 30-40%
      const deductionsPct =
        0.03 + seededRandom(`${rosterKey}-deductionsPct${i}`) * 0.05 // 3-8%

      const hourlyRate =
        payBasis === 'Hourly'
          ? round2(18 + seededRandom(`${rosterKey}-rate${i}`) * 27)
          : null

      const directDepositLast4 = String(
        1000 + Math.floor(seededRandom(`${rosterKey}-dd${i}`) * 9000),
      )
      const ssnLast4 = String(
        1000 + Math.floor(seededRandom(`${rosterKey}-ssn${i}`) * 9000),
      )

      return {
        name,
        employeeNumber: 1000 + i,
        ssnLast4,
        addressLine1: `${streetNum} ${STREET_NAMES[streetIdx]}`,
        city,
        state,
        zip,
        hireDate: formatDateISO(hireDate),
        birthDate: formatDateISO(birthDate),
        filingStatus,
        exemptions,
        department,
        payWeight,
        withholdingsPct,
        deductionsPct,
        hourlyRate,
        directDepositLast4,
      }
    })
    .sort((a, b) => {
      const lastNameOf = (n) => n.split(' ').slice(-1)[0]
      const firstNameOf = (n) => n.split(' ')[0]
      return (
        lastNameOf(a.name).localeCompare(lastNameOf(b.name)) ||
        firstNameOf(a.name).localeCompare(firstNameOf(b.name))
      )
    })
}

// Apply a specific pay period's total to a roster, producing each employee's
// current-period gross/withholdings/deductions/net pay.
function computeEmployeeAmounts(roster, total) {
  const grossAmounts = distributeWithWeights(
    total,
    roster.map((e) => e.payWeight),
  )
  return roster.map((emp, i) => {
    const totalPay = grossAmounts[i]
    const withholdings = round2(totalPay * emp.withholdingsPct)
    const deductions = round2(totalPay * emp.deductionsPct)
    const netPay = round2(totalPay - withholdings - deductions)
    return { ...emp, totalPay, withholdings, deductions, netPay }
  })
}

export const payrolls = computed(() => {
  const records = []
  for (const client of clients.value) {
    if (client.status !== 'active') continue
    const cycles = client.payCycles || MOCK_PAY_CYCLES[client.id]
    if (!cycles) continue
    for (const cycle of cycles) {
      const freq = normalizeFrequency(cycle.frequency)
      const dates = generateDebitDates(freq)
      const employeeCount = getEmployeeRoster(
        client.id,
        cycle.payBasis,
        freq,
      ).length
      for (const date of dates) {
        const seed = `${client.id}-${cycle.payBasis}-${formatDateISO(date)}`
        const rand = seededRandom(seed)
        // Generate amount: base $20k–$200k scaled by randomness
        const amount = round2(20000 + rand * 180000)
        records.push({
          id: seed,
          clientId: client.id,
          companyName: client.companyName,
          frequency: freq,
          payBasis: cycle.payBasis,
          countries: cycle.countries,
          debitDate: formatDateISO(date),
          total: amount,
          employeeCount,
          status: getStatus(formatDateISO(date)),
        })
      }
    }
  }
  // Sort by debit date descending
  records.sort((a, b) => b.debitDate.localeCompare(a.debitDate))
  return records
})

export function payrollsForClient(clientId) {
  return computed(() => payrolls.value.filter((p) => p.clientId === clientId))
}

// For each roster employee, sum gross/withholdings/deductions/net pay (both
// in total and per line item) across every pay period of the same client,
// payBasis and frequency in the same calendar year up to and including this
// payroll's debit date.
function computeYtd(payroll, roster) {
  const year = payroll.debitDate.slice(0, 4)
  const priorRuns = payrolls.value
    .filter(
      (p) =>
        p.clientId === payroll.clientId &&
        p.payBasis === payroll.payBasis &&
        p.frequency === payroll.frequency &&
        p.debitDate.slice(0, 4) === year &&
        p.debitDate <= payroll.debitDate,
    )
    .sort((a, b) => a.debitDate.localeCompare(b.debitDate))

  const acc = roster.map(() => ({
    gross: 0,
    withholdings: 0,
    deductions: 0,
    netPay: 0,
    withholdingsByLabel: {},
    deductionsByLabel: {},
  }))

  for (const run of priorRuns) {
    const runEmployees = computeEmployeeAmounts(roster, run.total)
    const runWithholdingsTotal = round2(
      runEmployees.reduce((sum, e) => sum + e.withholdings, 0),
    )
    const runDeductionsTotal = round2(
      runEmployees.reduce((sum, e) => sum + e.deductions, 0),
    )

    const runWithholdingsItems = splitByPercentages(
      runWithholdingsTotal,
      WITHHOLDINGS_LABELS,
      WITHHOLDINGS_PCTS,
      `${run.id}-withholdingsSplit`,
    )
    const runDeductionsItems = splitByPercentages(
      runDeductionsTotal,
      DEDUCTIONS_LABELS,
      DEDUCTIONS_PCTS,
      `${run.id}-deductionsSplit`,
    )

    const weights = roster.map((e) => e.payWeight)
    const withholdingsByItem = runWithholdingsItems.map((item) =>
      distributeWithWeights(item.amount, weights),
    )
    const deductionsByItem = runDeductionsItems.map((item) =>
      distributeWithWeights(item.amount, weights),
    )

    runEmployees.forEach((emp, i) => {
      acc[i].gross += emp.totalPay
      acc[i].withholdings += emp.withholdings
      acc[i].deductions += emp.deductions
      acc[i].netPay += emp.netPay
      runWithholdingsItems.forEach((item, itemIdx) => {
        acc[i].withholdingsByLabel[item.label] =
          (acc[i].withholdingsByLabel[item.label] || 0) +
          withholdingsByItem[itemIdx][i]
      })
      runDeductionsItems.forEach((item, itemIdx) => {
        acc[i].deductionsByLabel[item.label] =
          (acc[i].deductionsByLabel[item.label] || 0) +
          deductionsByItem[itemIdx][i]
      })
    })
  }

  return acc.map((a) => ({
    gross: round2(a.gross),
    withholdings: round2(a.withholdings),
    deductions: round2(a.deductions),
    netPay: round2(a.netPay),
    withholdingsByLabel: Object.fromEntries(
      Object.entries(a.withholdingsByLabel).map(([label, amount]) => [
        label,
        round2(amount),
      ]),
    ),
    deductionsByLabel: Object.fromEntries(
      Object.entries(a.deductionsByLabel).map(([label, amount]) => [
        label,
        round2(amount),
      ]),
    ),
  }))
}

export function getPayrollDetail(payrollId) {
  const payroll = payrolls.value.find((p) => p.id === payrollId)
  if (!payroll) return null

  const cycleLength = CYCLE_LENGTHS[payroll.frequency] || 14
  const debitDate = payroll.debitDate
  const periodEndDate = addDays(debitDate, -1)
  const periodStartDate = addDays(
    formatDateISO(periodEndDate),
    -(cycleLength - 1),
  )
  const periodStart = formatDateISO(periodStartDate)
  const periodEnd = formatDateISO(periodEndDate)
  const payDate = formatDateISO(addDays(debitDate, 3))

  const roster = getEmployeeRoster(
    payroll.clientId,
    payroll.payBasis,
    payroll.frequency,
  )
  const ytdByEmployee = computeYtd(payroll, roster)

  const employees = computeEmployeeAmounts(roster, payroll.total).map(
    (emp, i) => ({
      ...emp,
      hoursThisPeriod: emp.hourlyRate
        ? round2(emp.totalPay / emp.hourlyRate)
        : null,
      voucherNumber:
        100000 + Math.floor(seededRandom(`${payrollId}-voucher${i}`) * 900000),
      ytd: ytdByEmployee[i],
    }),
  )

  const totalPaymentsTotal = round2(
    employees.reduce((sum, e) => sum + e.totalPay, 0),
  )
  const withholdingsTotal = round2(
    employees.reduce((sum, e) => sum + e.withholdings, 0),
  )
  const deductionsTotal = round2(
    employees.reduce((sum, e) => sum + e.deductions, 0),
  )

  const totalPaymentsLabel =
    payroll.payBasis === 'Hourly' ? 'Hourly wages' : 'Salary'

  const withholdingsItems = splitByPercentages(
    withholdingsTotal,
    WITHHOLDINGS_LABELS,
    WITHHOLDINGS_PCTS,
    `${payrollId}-withholdingsSplit`,
  )
  const deductionsItems = splitByPercentages(
    deductionsTotal,
    DEDUCTIONS_LABELS,
    DEDUCTIONS_PCTS,
    `${payrollId}-deductionsSplit`,
  )

  // Add per-employee breakdown to each category item, proportional to each
  // employee's stable pay weight.
  function addEmployeeBreakdown(items) {
    const weights = employees.map((e) => e.payWeight)
    return items.map((item) => {
      const perEmployee = distributeWithWeights(item.amount, weights)
      return {
        ...item,
        byEmployee: employees.map((emp, i) => ({
          name: emp.name,
          amount: perEmployee[i],
        })),
      }
    })
  }

  const totalPaymentsItems = addEmployeeBreakdown([
    { label: totalPaymentsLabel, amount: totalPaymentsTotal },
  ])
  const withholdingsItemsWithEmp = addEmployeeBreakdown(withholdingsItems)
  const deductionsItemsWithEmp = addEmployeeBreakdown(deductionsItems)

  // Employer taxes: ~10% of gross (FICA employer match, FUTA, SUI)
  const employerTaxesTotal = round2(
    totalPaymentsTotal *
      (0.10 + (seededRandom(`${payrollId}-erTaxPct`) - 0.5) * 0.02),
  )

  const employerTaxesItems = addEmployeeBreakdown(
    splitByPercentages(
      employerTaxesTotal,
      EMPLOYER_TAX_LABELS,
      EMPLOYER_TAX_PCTS,
      `${payrollId}-erTaxSplit`,
    ),
  )

  // Employer benefits: ~4% of gross (health insurance match, 401k match, HSA)
  const employerBenefitsTotal = round2(
    totalPaymentsTotal *
      (0.04 + (seededRandom(`${payrollId}-erBenPct`) - 0.5) * 0.01),
  )

  const employerBenefitsItems = addEmployeeBreakdown(
    splitByPercentages(
      employerBenefitsTotal,
      EMPLOYER_BENEFITS_LABELS,
      EMPLOYER_BENEFITS_PCTS,
      `${payrollId}-erBenSplit`,
    ),
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
      employerTaxes: {
        total: employerTaxesTotal,
        items: employerTaxesItems,
      },
      employerBenefits: {
        total: employerBenefitsTotal,
        items: employerBenefitsItems,
      },
    },
  }
}

export function usePayrolls() {
  return { payrolls, payrollsForClient, getPayrollDetail }
}
