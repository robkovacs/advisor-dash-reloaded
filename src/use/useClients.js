import { computed, ref, watch } from 'vue'

const STORAGE_KEY = 'clients'

const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null')
export const clients = ref(stored ?? [])

watch(clients, (val) => {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(val))
}, { deep: true })

export function clearClients() {
  clients.value = []
  sessionStorage.removeItem(STORAGE_KEY)
}

export function seedClients(data) {
  clients.value = data
}

// ── Completeness ──
// Shared logic so both the client detail page and success interstitials
// can compute the same completeness data.
// addressLine2, notes, and documents excluded; email+phone count as one.
export const COMPLETENESS_SECTIONS = [
  {
    label: 'Company info',
    fields: ['companyName', 'companyWebsite', 'addressLine1', 'city', 'state', 'zip'],
  },
  {
    label: 'Primary contact',
    fields: ['firstName', 'lastName', 'jobTitle', 'preferredContact'],
    groups: [['email', 'phone']],
  },
  {
    label: 'Payroll solution fit',
    fields: ['salariedEmployees', 'hourlyEmployees', 'solution', 'payrollProvider'],
  },
  {
    label: 'Benefits solution fit',
    fields: ['justworksBenefits', 'benefitsProvider', 'benefitsRenewalDate'],
  },
]

export function sectionCompleteness(section, data) {
  const total = section.fields.length + (section.groups?.length ?? 0)
  const filled =
    section.fields.filter((f) => !!data[f]).length +
    (section.groups?.filter((g) => g.some((f) => !!data[f])).length ?? 0)
  return { label: section.label, filled, total }
}

export function getClientCompleteness(client) {
  const sections = COMPLETENESS_SECTIONS.map((s) => sectionCompleteness(s, client))
  const filled = sections.reduce((sum, s) => sum + s.filled, 0)
  const total = sections.reduce((sum, s) => sum + s.total, 0)
  return { sections, filled, total }
}

export function makeClient(data = {}) {
  return {
    id: data.id ?? crypto.randomUUID(),
    firmId: data.firmId ?? null,
    companyId: data.companyId ?? crypto.randomUUID(),
    companyName: data.companyName ?? '',
    firstName: data.firstName ?? '',
    lastName: data.lastName ?? '',
    email: data.email ?? '',
    phone: data.phone ?? '',
    preferredContact: data.preferredContact ?? '',
    jobTitle: '',
    companyWebsite: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zip: '',
    salariedEmployees: '',
    hourlyEmployees: '',
    solution: 'not-sure',
    justworksBenefits: 'not-sure',
    payrollProvider: '',
    benefitsProvider: '',
    benefitsRenewalDate: '',
    notes: '',
    status: data.status ?? 'pending',
    permissions: data.permissions ?? [],
    ...data,
  }
}
