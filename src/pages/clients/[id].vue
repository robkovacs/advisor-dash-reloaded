<script setup>
import { computed, reactive, ref, watchEffect } from 'vue'
import * as yup from 'yup'
import { useRoute } from 'vue-router'
import { clients, COMPLETENESS_SECTIONS, sectionCompleteness } from '@/use/useClients'
import {
  US_STATES,
  SOLUTION_OPTIONS,
  BENEFITS_OPTIONS,
} from '@/data/referralOptions'
import Columns from '@/components/Columns.vue'
import Stack from '@/components/Stack.vue'
import Row from '@/components/Row.vue'
import PageHeader from '@/components/PageHeader.vue'
import Badge from '@/components/Badge.vue'
import Button from '@/components/Button.vue'
import ProfileSection from './internals/ProfileSection.vue'
import ProfileField from './internals/ProfileField.vue'
import CompletenessCard from './internals/CompletenessCard.vue'
import InputText from '@/components/InputText.vue'
import InputNumber from '@/components/InputNumber.vue'
import InputSelect from '@/components/InputSelect.vue'
import InputRadio from '@/components/InputRadio.vue'
import InputEmail from '@/components/InputEmail.vue'
import InputPhone from '@/components/InputPhone.vue'
import InputTextarea from '@/components/InputTextarea.vue'
import InputDate from '@/components/InputDate.vue'
import InputFile from '@/components/InputFile.vue'
import FocusedLayout from '@/layouts/FocusedLayout.vue'
import IconPlus from '~icons/ph/plus'

definePage({ meta: { title: 'Client' } })

const route = useRoute()

const client = computed(() =>
  clients.value.find((c) => c.id === route.params.id),
)

// Backfill any missing enrichment fields for clients created before makeClient
const ENRICHMENT_DEFAULTS = {
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
}

watchEffect(() => {
  if (client.value) {
    for (const [key, defaultVal] of Object.entries(ENRICHMENT_DEFAULTS)) {
      if (!(key in client.value)) {
        client.value[key] = defaultVal
      }
    }
  }
})


const sectionStats = computed(() => {
  if (!client.value)
    return COMPLETENESS_SECTIONS.map((s) => ({
      label: s.label,
      filled: 0,
      total: s.fields.length + (s.groups?.length ?? 0),
    }))
  return COMPLETENESS_SECTIONS.map((s) => sectionCompleteness(s, client.value))
})

const completeness = computed(() => ({
  filled: sectionStats.value.reduce((sum, s) => sum + s.filled, 0),
  total: sectionStats.value.reduce((sum, s) => sum + s.total, 0),
}))

// Snapshot refs
const companySnap = ref(null)
const contactSnap = ref(null)
const payrollSnap = ref(null)
const benefitsSnap = ref(null)
const miscSnap = ref(null)

function snapshotFields(fields) {
  return Object.fromEntries(fields.map((k) => [k, client.value[k]]))
}
function restoreSnapshot(snap) {
  if (snap) Object.assign(client.value, snap)
}

const COMPANY_FIELDS = [
  'companyName',
  'companyWebsite',
  'addressLine1',
  'addressLine2',
  'city',
  'state',
  'zip',
]
const CONTACT_FIELDS = [
  'firstName',
  'lastName',
  'jobTitle',
  'email',
  'phone',
  'preferredContact',
]
const PAYROLL_FIELDS = [
  'salariedEmployees',
  'hourlyEmployees',
  'solution',
  'payrollProvider',
]
const BENEFITS_FIELDS = [
  'justworksBenefits',
  'benefitsProvider',
  'benefitsRenewalDate',
]
const MISC_FIELDS = ['notes']

const showAddressLine2 = ref(false)

// Section refs (for programmatic close after save)
const companySectionRef = ref(null)
const contactSectionRef = ref(null)
const payrollSectionRef = ref(null)
const benefitsSectionRef = ref(null)
const miscSectionRef = ref(null)

// Validation errors
const companyErrors = reactive({ companyName: '', companyWebsite: '', zip: '' })
const contactErrors = reactive({
  firstName: '',
  lastName: '',
  preferredContact: '',
  email: '',
  phone: '',
})
const benefitsErrors = reactive({ benefitsRenewalDate: '' })

const companySchema = yup.object({
  companyName: yup.string().required('Company name is required'),
  companyWebsite: yup
    .string()
    .matches(/^(https?:\/\/)?[\w-]+(\.[\w-]+)+(\/\S*)?$/, {
      message: 'Enter a valid website URL',
      excludeEmptyString: true,
    }),
  zip: yup.string().matches(/^\d{5}(-\d{4})?$/, {
    message: 'Enter a valid ZIP code',
    excludeEmptyString: true,
  }),
})

const contactSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  preferredContact: yup
    .string()
    .required('Preferred contact method is required'),
  email: yup
    .string()
    .when('preferredContact', ([pref], s) =>
      pref === 'email'
        ? s.required('Email is required').email('Enter a valid email address')
        : s.email('Enter a valid email address'),
    ),
  phone: yup.string().when('preferredContact', ([pref], s) =>
    pref === 'phone'
      ? s.required('Phone is required').matches(/^\(\d{3}\) \d{3}-\d{4}$/, {
          message: 'Enter a valid US phone number',
          excludeEmptyString: true,
        })
      : s.matches(/^\(\d{3}\) \d{3}-\d{4}$/, {
          message: 'Enter a valid US phone number',
          excludeEmptyString: true,
        }),
  ),
})

const benefitsSchema = yup.object({
  benefitsRenewalDate: yup.string().test('valid-future-date', '', function (v) {
    if (!v) return true
    const match = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
    if (!match)
      return this.createError({ message: 'Enter a complete date (mm/dd/yyyy)' })
    const [, mm, dd, yyyy] = match.map(Number)
    const d = new Date(yyyy, mm - 1, dd)
    if (
      d.getFullYear() !== yyyy ||
      d.getMonth() !== mm - 1 ||
      d.getDate() !== dd
    ) {
      return this.createError({ message: 'Enter a valid date' })
    }
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return d > today
      ? true
      : this.createError({ message: 'Renewal date must be in the future' })
  }),
})

async function validateSection(schema, data, errors) {
  Object.keys(errors).forEach((k) => (errors[k] = ''))
  try {
    await schema.validate(data, { abortEarly: false })
    return true
  } catch (err) {
    if (err instanceof yup.ValidationError) {
      for (const e of err.inner) {
        if (e.path in errors) errors[e.path] = e.message
      }
    }
    return false
  }
}

async function validateField(schema, path, errors) {
  errors[path] = ''
  try {
    await schema.validateAt(path, client.value)
  } catch (err) {
    if (err instanceof yup.ValidationError) errors[path] = err.message
  }
}

function editCompany() {
  companySnap.value = snapshotFields(COMPANY_FIELDS)
  showAddressLine2.value = !!client.value.addressLine2
  Object.keys(companyErrors).forEach((k) => (companyErrors[k] = ''))
}
async function saveCompany() {
  const ok = await validateSection(companySchema, client.value, companyErrors)
  if (!ok) return
  companySnap.value = null
  companySectionRef.value.close()
}
function cancelCompany() {
  restoreSnapshot(companySnap.value)
  companySnap.value = null
  Object.keys(companyErrors).forEach((k) => (companyErrors[k] = ''))
}

function editContact() {
  contactSnap.value = snapshotFields(CONTACT_FIELDS)
  Object.keys(contactErrors).forEach((k) => (contactErrors[k] = ''))
}
async function saveContact() {
  const ok = await validateSection(contactSchema, client.value, contactErrors)
  if (!ok) return
  contactSnap.value = null
  contactSectionRef.value.close()
}
function cancelContact() {
  restoreSnapshot(contactSnap.value)
  contactSnap.value = null
  Object.keys(contactErrors).forEach((k) => (contactErrors[k] = ''))
}

function editPayroll() {
  payrollSnap.value = snapshotFields(PAYROLL_FIELDS)
}
function savePayroll() {
  payrollSnap.value = null
  payrollSectionRef.value.close()
}
function cancelPayroll() {
  restoreSnapshot(payrollSnap.value)
  payrollSnap.value = null
}

function editBenefits() {
  benefitsSnap.value = snapshotFields(BENEFITS_FIELDS)
  benefitsErrors.benefitsRenewalDate = ''
}
async function saveBenefits() {
  const ok = await validateSection(benefitsSchema, client.value, benefitsErrors)
  if (!ok) return
  benefitsSnap.value = null
  benefitsSectionRef.value.close()
}
function cancelBenefits() {
  restoreSnapshot(benefitsSnap.value)
  benefitsSnap.value = null
  benefitsErrors.benefitsRenewalDate = ''
}

function editMisc() {
  miscSnap.value = snapshotFields(MISC_FIELDS)
}
function saveMisc() {
  miscSnap.value = null
  miscSectionRef.value.close()
}
function cancelMisc() {
  restoreSnapshot(miscSnap.value)
  miscSnap.value = null
}

// Computed display values
const mailingAddress = computed(() => {
  if (!client.value) return ''
  const { addressLine1, addressLine2, city, state, zip } = client.value
  return [addressLine1, addressLine2, city, state, zip]
    .filter(Boolean)
    .join(', ')
})

const contactName = computed(() => {
  if (!client.value) return ''
  return [client.value.firstName, client.value.lastName]
    .filter(Boolean)
    .join(' ')
})

const preferredContactLabel = computed(() => {
  const map = { email: 'Email', phone: 'Phone' }
  return map[client.value?.preferredContact] ?? ''
})

const PREFERRED_OPTIONS = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
]

const emailRequired = computed(() => client.value?.preferredContact === 'email')
const phoneRequired = computed(() => client.value?.preferredContact === 'phone')

const employeesDisplay = computed(() => {
  if (!client.value) return ''
  const { salariedEmployees, hourlyEmployees } = client.value
  if (salariedEmployees && hourlyEmployees) {
    return `${salariedEmployees} salaried, ${hourlyEmployees} hourly`
  }
  if (salariedEmployees) return `${salariedEmployees} salaried`
  if (hourlyEmployees) return `${hourlyEmployees} hourly`
  return ''
})

const solutionLabel = computed(() => {
  const opt = SOLUTION_OPTIONS.find((o) => o.value === client.value?.solution)
  return opt?.label ?? ''
})

const benefitsLabel = computed(() => {
  const opt = BENEFITS_OPTIONS.find(
    (o) => o.value === client.value?.justworksBenefits,
  )
  return opt?.label ?? ''
})

const ancestors = [{ label: 'Clients', to: '/clients' }]

const statusLabel = {
  active: 'Active',
  pending: 'Pending',
  declined: 'Declined',
}
const statusVariant = {
  active: 'success',
  pending: 'default',
  declined: 'error',
}
</script>

<template>
  <Stack v-if="client" gap="6">
    <Row align="center" justify="space-between">
      <PageHeader
        :ancestors="ancestors"
        :title="client.companyName || 'Unnamed client'"
      />
      <Badge :variant="statusVariant[client.status]">{{
        statusLabel[client.status]
      }}</Badge>
    </Row>

    <div class="page-layout">
      <Columns gap="6" layout="minmax(16rem, 1fr) 2fr 1fr">
        <div class="card-sticky">
          <CompletenessCard
            :filled="completeness.filled"
            :total="completeness.total"
            :sections="sectionStats"
          />
        </div>

        <Stack gap="6" class="sections-container">
          <!-- Company info -->
          <ProfileSection
            ref="companySectionRef"
            title="Company info"
            @edit="editCompany"
            @save="saveCompany"
            @cancel="cancelCompany"
          >
            <template #view>
              <ProfileField label="Company name" :value="client.companyName" />
              <ProfileField
                label="Company website"
                :value="client.companyWebsite"
              />
              <ProfileField label="Billing address" :value="mailingAddress" />
            </template>
            <template #edit>
              <InputText
                v-model="client.companyName"
                label="Company name"
                :error="companyErrors.companyName"
                @blur="
                  validateField(companySchema, 'companyName', companyErrors)
                "
              />
              <InputText
                v-model="client.companyWebsite"
                label="Company website"
                optional
                :error="companyErrors.companyWebsite"
                @blur="
                  validateField(companySchema, 'companyWebsite', companyErrors)
                "
              />
              <InputText
                v-model="client.addressLine1"
                label="Address line 1"
                optional
              />
              <template v-if="showAddressLine2">
                <InputText
                  v-model="client.addressLine2"
                  label="Address line 2"
                  optional
                />
              </template>
              <Button
                v-else
                variant="link"
                class="add-field-btn"
                @click="showAddressLine2 = true"
              >
                <IconPlus /> Add address line 2
              </Button>
              <InputText v-model="client.city" label="City" optional />
              <InputSelect
                v-model="client.state"
                label="State"
                placeholder="Select a state"
                optional
              >
                <option v-for="s in US_STATES" :key="s.value" :value="s.value">
                  {{ s.label }}
                </option>
              </InputSelect>
              <InputText
                v-model="client.zip"
                label="ZIP code"
                optional
                :error="companyErrors.zip"
                width="calc(5ch + (var(--space-3) * 2))"
                @blur="validateField(companySchema, 'zip', companyErrors)"
              />
            </template>
          </ProfileSection>

          <!-- Primary contact -->
          <ProfileSection
            ref="contactSectionRef"
            title="Primary contact"
            @edit="editContact"
            @save="saveContact"
            @cancel="cancelContact"
          >
            <template #view>
              <ProfileField label="Name" :value="contactName" />
              <ProfileField label="Job title" :value="client.jobTitle" />
              <ProfileField
                label="Preferred contact method"
                :value="preferredContactLabel"
              />
              <ProfileField label="Email" :value="client.email" />
              <ProfileField label="Phone" :value="client.phone" />
            </template>
            <template #edit>
              <InputText
                v-model="client.firstName"
                label="First name"
                :error="contactErrors.firstName"
                @blur="validateField(contactSchema, 'firstName', contactErrors)"
              />
              <InputText
                v-model="client.lastName"
                label="Last name"
                :error="contactErrors.lastName"
                @blur="validateField(contactSchema, 'lastName', contactErrors)"
              />
              <InputText v-model="client.jobTitle" label="Job title" optional />
              <InputRadio
                v-model="client.preferredContact"
                label="Preferred contact method"
                :options="PREFERRED_OPTIONS"
                :error="contactErrors.preferredContact"
                @change="
                  validateField(
                    contactSchema,
                    'preferredContact',
                    contactErrors,
                  )
                "
              />
              <InputEmail
                v-model="client.email"
                label="Email"
                :optional="!emailRequired"
                :error="contactErrors.email"
                @blur="validateField(contactSchema, 'email', contactErrors)"
              />
              <InputPhone
                v-model="client.phone"
                label="Phone"
                :optional="!phoneRequired"
                :error="contactErrors.phone"
                @blur="validateField(contactSchema, 'phone', contactErrors)"
              />
            </template>
          </ProfileSection>

          <!-- Payroll solution fit -->
          <ProfileSection
            ref="payrollSectionRef"
            title="Payroll solution fit"
            @edit="editPayroll"
            @save="savePayroll"
            @cancel="cancelPayroll"
          >
            <template #view>
              <ProfileField
                label="Number of employees"
                :value="employeesDisplay"
              />
              <ProfileField
                label="Preferred Justworks solution"
                :value="solutionLabel"
              />
              <ProfileField
                label="Current payroll provider"
                :value="client.payrollProvider"
              />
            </template>
            <template #edit>
              <InputNumber
                v-model="client.salariedEmployees"
                label="Salaried employees"
                min="0"
                step="1"
                optional
                width="6rem"
              />
              <InputNumber
                v-model="client.hourlyEmployees"
                label="Hourly employees"
                min="0"
                step="1"
                optional
                width="6rem"
              />

              <InputRadio
                v-model="client.solution"
                label="Preferred Justworks solution"
                :options="SOLUTION_OPTIONS"
                optional
              />
              <InputText
                v-model="client.payrollProvider"
                label="Current payroll provider"
                optional
              />
            </template>
          </ProfileSection>

          <!-- Benefits solution fit -->
          <ProfileSection
            ref="benefitsSectionRef"
            title="Benefits solution fit"
            @edit="editBenefits"
            @save="saveBenefits"
            @cancel="cancelBenefits"
          >
            <template #view>
              <ProfileField
                label="Interested in benefits through Justworks?"
                :value="benefitsLabel"
              />
              <template v-if="client.justworksBenefits === 'yes'">
                <ProfileField
                  label="Current benefits provider"
                  :value="client.benefitsProvider"
                />
                <ProfileField
                  label="Next benefits renewal date"
                  :value="client.benefitsRenewalDate"
                />
              </template>
            </template>
            <template #edit>
              <InputRadio
                v-model="client.justworksBenefits"
                label="Interested in benefits through Justworks?"
                :options="BENEFITS_OPTIONS"
                optional
              />
              <template v-if="client.justworksBenefits === 'yes'">
                <InputText
                  v-model="client.benefitsProvider"
                  label="Current benefits provider"
                  optional
                />
                <InputDate
                  v-model="client.benefitsRenewalDate"
                  label="Next benefits renewal date"
                  optional
                  :disable-date="
                    (d) => {
                      const t = new Date()
                      t.setHours(0, 0, 0, 0)
                      return d <= t
                    }
                  "
                  :error="benefitsErrors.benefitsRenewalDate"
                  @blur="
                    validateField(
                      benefitsSchema,
                      'benefitsRenewalDate',
                      benefitsErrors,
                    )
                  "
                  width="9rem"
                />
              </template>
            </template>
          </ProfileSection>

          <!-- Additional context -->
          <ProfileSection
            ref="miscSectionRef"
            title="Additional context"
            @edit="editMisc"
            @save="saveMisc"
            @cancel="cancelMisc"
          >
            <template #view>
              <ProfileField label="Documents" value="" />
              <ProfileField
                label="Anything else we should know?"
                :value="client.notes"
              />
            </template>
            <template #edit>
              <InputFile label="Additional documents" multiple optional>
                <template #helper>
                  Share any files that might help us get this company started on
                  Justworks.
                </template>
              </InputFile>
              <InputTextarea
                v-model="client.notes"
                label="Anything else we should know?"
                optional
              />
            </template>
          </ProfileSection>
        </Stack>
      </Columns>
    </div>
  </Stack>

  <FocusedLayout v-else>
    <Stack gap="6">
      <h1>Page not found</h1>
      <p>This page doesn't exist.</p>
      <Button to="/" variant="primary">Go home</Button>
    </Stack>
  </FocusedLayout>
</template>

<style scoped>
.card-sticky {
  position: sticky;
  top: 0;
}

.sections-container :deep(input),
.sections-container :deep(select),
.sections-container :deep(.radio-group),
.sections-container :deep(.input-wrapper) {
  width: 100%;
  max-width: 16rem;
}

.add-field-btn {
  margin-top: calc(-1 * var(--font-size-md) * var(--line-height-body));
  margin-bottom: var(--space-3);
}
</style>
