import { reactive, ref, computed, watch } from 'vue'
import router from '@/router'
import { showToast } from '@/use/useToast'
import * as XLSX from 'xlsx'

const STORAGE_KEY = 'bulk-referrals'

export const FIELD_DEFS = [
  { key: 'companyName', label: 'Company name' },
  { key: 'firstName', label: 'First name' },
  { key: 'lastName', label: 'Last name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'preferredContact', label: 'Preferred contact' },
]

export const OPTIONAL_FIELD_DEFS = [
  { key: 'companyWebsite', label: 'Company website' },
  { key: 'addressLine1', label: 'Address line 1' },
  { key: 'addressLine2', label: 'Address line 2' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'zip', label: 'ZIP code' },
  { key: 'salariedEmployees', label: 'Salaried employees' },
  { key: 'hourlyEmployees', label: 'Hourly employees' },
  { key: 'solution', label: 'Preferred solution' },
  { key: 'justworksBenefits', label: 'Interested in benefits' },
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^\(\d{3}\) \d{3}-\d{4}$/

export const PREFERRED_CONTACT_OPTIONS = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
]
const PREFERRED_CONTACT_VALUES = PREFERRED_CONTACT_OPTIONS.map((o) => o.value)

// Maps recognizable import-column text (varied casing/wording) to our
// canonical preferredContact values. Returns null when nothing matches,
// so getReferralErrors can flag it as invalid rather than silently guessing.
function normalizePreferredContact(raw) {
  const n = normalize(raw).replace(/'/g, '')
  if (!n) return ''
  if (n === 'email') return 'email'
  if (n === 'phone' || n === 'phonenumber') return 'phone'
  return null
}

export function getReferralErrors(referral) {
  const e = {}
  if (!referral.companyName) e.companyName = 'Company name is required'
  if (!referral.firstName) e.firstName = 'First name is required'
  if (!referral.lastName) e.lastName = 'Last name is required'
  if (!referral.preferredContact) {
    e.preferredContact = 'Preferred contact method is required'
  } else if (!PREFERRED_CONTACT_VALUES.includes(referral.preferredContact)) {
    e.preferredContact = 'Select a valid contact method'
  }
  if (referral.preferredContact === 'email') {
    if (!referral.email) e.email = 'Email is required'
    else if (!EMAIL_RE.test(referral.email)) e.email = 'Enter a valid email address'
    if (referral.phone && !PHONE_RE.test(referral.phone)) e.phone = 'Enter a valid US phone number'
  } else if (referral.preferredContact === 'phone') {
    if (!referral.phone) e.phone = 'Phone is required'
    else if (!PHONE_RE.test(referral.phone)) e.phone = 'Enter a valid US phone number'
    if (referral.email && !EMAIL_RE.test(referral.email)) e.email = 'Enter a valid email address'
  }
  return e
}

function makeReferral(overrides = {}) {
  return {
    id: crypto.randomUUID(),
    companyName: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    preferredContact: '',
    // Optional enrichment fields
    companyWebsite: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zip: '',
    salariedEmployees: null,
    hourlyEmployees: null,
    solution: '',
    justworksBenefits: '',
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
  for (const field of [...FIELD_DEFS, ...OPTIONAL_FIELD_DEFS]) {
    const normKey = normalize(field.label)
    const match = headers.find((h) => normalize(h) === normKey)
    columnMapping[field.key] = match ?? ''
  }
}

// Optional fields that were auto-detected (or manually mapped) in the
// uploaded spreadsheet. BulkMapping shows only these — we don't surface
// fields the user never included so they don't feel like they did something
// wrong by uploading a minimal spreadsheet.
export const detectedOptionalFields = computed(() =>
  OPTIONAL_FIELD_DEFS.filter((f) => columnMapping[f.key]),
)

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
  const allFields = [...FIELD_DEFS, ...OPTIONAL_FIELD_DEFS]
  const newReferrals = parsedFile.value.rows.map((row) => {
    const overrides = {}
    for (const field of allFields) {
      const colHeader = mapping[field.key]
      if (colHeader && row[colHeader] != null && row[colHeader] !== '') {
        const raw = String(row[colHeader])
        if (field.key === 'preferredContact') {
          // Normalize recognizable variants (casing/wording); keep unrecognized
          // text as-is so it surfaces as a validation error instead of being
          // silently dropped or guessed at.
          const normalized = normalizePreferredContact(raw)
          overrides[field.key] = normalized === null ? raw : normalized
        } else {
          overrides[field.key] = raw
        }
      }
    }
    // If only one of email/phone was provided and no preferred contact was
    // explicitly mapped, infer it from whichever one is present.
    if (!overrides.preferredContact) {
      const hasEmail = !!overrides.email
      const hasPhone = !!overrides.phone
      if (hasEmail && !hasPhone) overrides.preferredContact = 'email'
      else if (hasPhone && !hasEmail) overrides.preferredContact = 'phone'
    }
    return makeReferral(overrides)
  })
  referrals.splice(0, referrals.length, ...newReferrals)
  selectedId.value = referrals[0]?.id ?? null
  currentStep.value = 'review'
}

// Set whenever a referral is added that should be focused for editing as
// soon as it's on screen — BulkReview.vue may not be mounted yet (e.g. "Add
// manually" from the upload step), so it consumes this itself once it is.
export const pendingFocusId = ref(null)

export function addReferral() {
  const referral = makeReferral()
  referrals.push(referral)
  selectedId.value = referral.id
  pendingFocusId.value = referral.id
  return referral
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
  if (!allValid.value) return
  const { clients } = await import('@/use/useClients')
  const count = referrals.length
  for (const referral of referrals) {
    clients.value.push({
      id: referral.id,
      companyName: referral.companyName,
      firstName: referral.firstName,
      lastName: referral.lastName,
      email: referral.email,
      phone: referral.phone,
      preferredContact: referral.preferredContact,
      status: 'pending',
    })
  }
  clear()
  showToast(`${count} ${count === 1 ? 'client' : 'clients'} added`)
  await router.push('/clients?status=pending')
}

export function clear() {
  currentStep.value = 'upload'
  parsedFile.value = null
  Object.keys(columnMapping).forEach((k) => delete columnMapping[k])
  referrals.splice(0, referrals.length)
  selectedId.value = null
  sessionStorage.removeItem(STORAGE_KEY)
}
