import { reactive, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import * as XLSX from 'xlsx'

const STORAGE_KEY = 'bulk-referrals'

export const FIELD_DEFS = [
  { key: 'companyName', label: 'Company name', required: true },
  { key: 'firstName', label: 'First name', required: true },
  { key: 'lastName', label: 'Last name', required: true },
  { key: 'email', label: 'Email', required: true },
  { key: 'phone', label: 'Phone', required: false },
  { key: 'jobTitle', label: 'Job title', required: false },
  { key: 'companyWebsite', label: 'Company website', required: false },
  { key: 'addressLine1', label: 'Address line 1', required: false },
  { key: 'addressLine2', label: 'Address line 2', required: false },
  { key: 'city', label: 'City', required: false },
  { key: 'state', label: 'State', required: false },
  { key: 'zip', label: 'ZIP code', required: false },
  { key: 'salariedEmployees', label: 'Salaried employees', required: false },
  { key: 'hourlyEmployees', label: 'Hourly employees', required: false },
  { key: 'solution', label: 'Preferred solution', required: false },
  { key: 'justworksBenefits', label: 'Interested in benefits', required: false },
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^\(\d{3}\) \d{3}-\d{4}$/
const ZIP_RE = /^\d{5}(-\d{4})?$/

function isValidUrl(str) {
  try { new URL(str); return true } catch { return false }
}

export function getReferralErrors(referral) {
  const e = {}
  if (!referral.firstName) e.firstName = 'First name is required'
  if (!referral.lastName) e.lastName = 'Last name is required'
  if (!referral.email) e.email = 'Email is required'
  else if (!EMAIL_RE.test(referral.email)) e.email = 'Enter a valid email address'
  if (!referral.phone) e.phone = 'Phone number is required'
  else if (!PHONE_RE.test(referral.phone)) e.phone = 'Enter a valid US phone number'
  if (!referral.companyName) e.companyName = 'Company name is required'
  if (referral.companyWebsite && !isValidUrl(referral.companyWebsite)) e.companyWebsite = 'Enter a valid URL'
  if (!referral.addressLine1) e.addressLine1 = 'Address is required'
  if (!referral.city) e.city = 'City is required'
  if (!referral.state) e.state = 'State is required'
  if (!referral.zip) e.zip = 'ZIP code is required'
  else if (!ZIP_RE.test(referral.zip)) e.zip = 'Enter a valid ZIP code'
  const sal = referral.salariedEmployees
  if (sal === '' || sal === null || sal === undefined) e.salariedEmployees = 'Required'
  else if (isNaN(Number(sal)) || Number(sal) < 0) e.salariedEmployees = 'Must be 0 or more'
  const hrly = referral.hourlyEmployees
  if (hrly === '' || hrly === null || hrly === undefined) e.hourlyEmployees = 'Required'
  else if (isNaN(Number(hrly)) || Number(hrly) < 0) e.hourlyEmployees = 'Must be 0 or more'
  return e
}

function makeReferral(overrides = {}) {
  return {
    id: crypto.randomUUID(),
    companyName: '',
    firstName: '',
    lastName: '',
    jobTitle: '',
    email: '',
    phone: '',
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
    notes: '',
    ...overrides,
  }
}

function normalize(str) {
  return String(str ?? '').toLowerCase().replace(/[\s_-]/g, '')
}

// --- Restore from sessionStorage ---
const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null')

const restoredStep = stored?.currentStep ?? 'upload'
const stepIsValid =
  restoredStep === 'upload' ||
  (restoredStep === 'mapping' && stored?.parsedFile) ||
  (restoredStep === 'review' && stored?.referrals?.length > 0)

export const currentStep = ref(stepIsValid ? restoredStep : 'upload')
export const parsedFile = ref(stored?.parsedFile ?? null)
export const columnMapping = reactive(stored?.columnMapping ?? {})
export const referrals = reactive(stored?.referrals ?? [])
export const selectedId = ref(stored?.selectedId ?? null)

// --- Computed ---
export const selectedReferral = computed(() =>
  referrals.find((r) => r.id === selectedId.value) ?? null
)

export const allValid = computed(() =>
  referrals.length > 0 &&
  referrals.every((r) => Object.keys(getReferralErrors(r)).length === 0)
)

// --- Persistence ---
function persist() {
  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      currentStep: currentStep.value,
      parsedFile: parsedFile.value,
      columnMapping: { ...columnMapping },
      referrals: referrals.slice(),
      selectedId: selectedId.value,
    })
  )
}

watch(currentStep, persist)
watch(parsedFile, persist)
watch(columnMapping, persist)
watch(referrals, persist, { deep: true })
watch(selectedId, persist)

// --- Methods ---
export function autoMapColumns() {
  if (!parsedFile.value) return
  const headers = parsedFile.value.headers
  for (const field of FIELD_DEFS) {
    const normKey = normalize(field.label)
    const match = headers.find((h) => normalize(h) === normKey)
    columnMapping[field.key] = match ?? ''
  }
}

export function parseFile(file) {
  const reader = new FileReader()
  reader.onload = (e) => {
    const workbook = XLSX.read(e.target.result, { type: 'array' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 })
    const headers = json[0].map(String)
    const rows = json
      .slice(1)
      .filter((row) => row.some((cell) => cell != null && cell !== ''))
      .map((row) => Object.fromEntries(headers.map((h, i) => [h, row[i] ?? ''])))
    parsedFile.value = { headers, rows }
    autoMapColumns()
    currentStep.value = 'mapping'
  }
  reader.readAsArrayBuffer(file)
}

export function applyMapping(mapping) {
  Object.assign(columnMapping, mapping)
  const newReferrals = parsedFile.value.rows.map((row) => {
    const overrides = {}
    for (const field of FIELD_DEFS) {
      const colHeader = mapping[field.key]
      if (colHeader && row[colHeader] != null && row[colHeader] !== '') {
        overrides[field.key] = String(row[colHeader])
      }
    }
    return makeReferral(overrides)
  })
  referrals.splice(0, referrals.length, ...newReferrals)
  selectedId.value = referrals[0]?.id ?? null
  currentStep.value = 'review'
}

export function addReferral() {
  const referral = makeReferral()
  referrals.push(referral)
  selectedId.value = referral.id
}

export function removeReferral(id) {
  const idx = referrals.findIndex((r) => r.id === id)
  if (idx === -1) return
  referrals.splice(idx, 1)
  if (selectedId.value === id) {
    selectedId.value = referrals[0]?.id ?? null
  }
}

export function getStatus(referral) {
  return Object.keys(getReferralErrors(referral)).length > 0 ? 'incomplete' : 'complete'
}

export async function submitAll() {
  const { clients } = await import('@/use/useClients')
  const router = useRouter()
  for (const referral of referrals) {
    clients.value.push({
      id: referral.id,
      companyName: referral.companyName,
      firstName: referral.firstName,
      lastName: referral.lastName,
      email: referral.email,
      status: 'pending',
    })
  }
  clear()
  router.push('/clients')
}

export function clear() {
  currentStep.value = 'upload'
  parsedFile.value = null
  Object.keys(columnMapping).forEach((k) => delete columnMapping[k])
  referrals.splice(0, referrals.length)
  selectedId.value = null
  sessionStorage.removeItem(STORAGE_KEY)
}
