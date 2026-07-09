<script setup>
import { computed, ref } from 'vue'
import {
  referrals,
  selectedId,
  selectedReferral,
  addReferral,
  removeReferral,
  getStatus,
  getReferralErrors,
  allValid,
  submitAll,
  clear,
} from '@/use/useBulkReferrals'
import Stack from '@/components/Stack.vue'
import Row from '@/components/Row.vue'
import Button from '@/components/Button.vue'
import SegmentedControl from '@/components/SegmentedControl.vue'
import InputText from '@/components/InputText.vue'
import InputEmail from '@/components/InputEmail.vue'
import InputPhone from '@/components/InputPhone.vue'
import InputNumber from '@/components/InputNumber.vue'
import InputSelect from '@/components/InputSelect.vue'
import InputRadio from '@/components/InputRadio.vue'
import InputSearch from '@/components/InputSearch.vue'
import InputTextarea from '@/components/InputTextarea.vue'
import InputFile from '@/components/InputFile.vue'
import {
  US_STATES,
  SOLUTION_OPTIONS,
  BENEFITS_OPTIONS,
} from '@/data/referralOptions'
import Badge from '@/components/Badge.vue'
import IconTrash from '~icons/ph/trash'
import IconPlus from '~icons/ph/plus'

const search = ref('')
const statusFilter = ref('all')

const statusCounts = computed(() => {
  const counts = { incomplete: 0, complete: 0 }
  referrals.forEach((r) => counts[getStatus(r)]++)
  return counts
})

const STATUS_FILTERS = computed(() => [
  { value: 'all', label: 'All', badge: referrals.length },
  {
    value: 'incomplete',
    label: 'Incomplete',
    badge: statusCounts.value.incomplete,
  },
  { value: 'complete', label: 'Complete', badge: statusCounts.value.complete },
])

const filteredReferrals = computed(() => {
  return referrals.filter((r) => {
    if (search.value) {
      const q = search.value.toLowerCase()
      if (!(r.companyName || '').toLowerCase().includes(q)) return false
    }
    if (statusFilter.value !== 'all') {
      if (getStatus(r) !== statusFilter.value) return false
    }
    return true
  })
})

const errors = computed(() =>
  selectedReferral.value ? getReferralErrors(selectedReferral.value) : {},
)

const readyCount = computed(
  () => referrals.filter((r) => getStatus(r) === 'complete').length,
)
</script>

<template>
  <Stack gap="4" class="review-wrap">
    <!-- Top bar: search + filter -->
    <Row gap="4" align="center">
      <InputSearch
        v-model="search"
        label="Search referrals"
        placeholder="Search referrals…"
        hideLabel
        width="18rem"
      />
      <SegmentedControl v-model="statusFilter" :options="STATUS_FILTERS" />
    </Row>

    <div class="bulk-review">
      <!-- Left panel: company list -->
      <div class="referral-list">
        <div class="referral-list-scroll">
          <button
            v-for="referral in filteredReferrals"
            :key="referral.id"
            class="referral-item"
            :class="{ 'referral-item--selected': referral.id === selectedId }"
            type="button"
            @click="selectedId = referral.id"
          >
            <Row align="center" justify="space-between" gap="3">
              <div class="referral-item-info">
                <Row align="center" gap="2">
                  <span
                    class="referral-item-name"
                    :class="{
                      'referral-item-name--unnamed': !referral.companyName,
                    }"
                  >
                    {{ referral.companyName || 'Unnamed company' }}
                  </span>
                </Row>
                <Badge
                  :variant="
                    getStatus(referral) === 'complete' ? 'success' : 'error'
                  "
                >
                  {{
                    getStatus(referral) === 'complete'
                      ? 'Complete'
                      : 'Incomplete'
                  }}
                </Badge>
              </div>
              <Button
                class="trash-btn"
                variant="tertiary"
                size="small"
                iconOnly
                destructive
                :aria-label="`Remove ${referral.companyName || 'unnamed company'}`"
                @click.stop="removeReferral(referral.id)"
              >
                <IconTrash aria-hidden="true" />
              </Button>
            </Row>
          </button>
          <div class="referral-list-add">
            <Button size="small" @click="addReferral">
              <IconPlus aria-hidden="true" />
              Add referral
            </Button>
          </div>
        </div>
      </div>

      <!-- Right panel: detail form -->
      <div class="detail-panel">
        <template v-if="selectedReferral">
          <Stack gap="12" class="detail-form">
            <!-- Company info -->
            <Stack gap="4">
              <h2>Company info</h2>
              <Stack gap="4">
                <InputText
                  v-model="selectedReferral.companyName"
                  label="Company name"
                  :error="errors.companyName"
                />
                <InputText
                  v-model="selectedReferral.companyWebsite"
                  label="Company website"
                  optional
                  :error="errors.companyWebsite"
                />
                <h3>Billing address</h3>
                <InputText
                  v-model="selectedReferral.addressLine1"
                  label="Address line 1"
                  :error="errors.addressLine1"
                />
                <InputText
                  v-model="selectedReferral.addressLine2"
                  label="Address line 2"
                  optional
                />
                <InputText
                  v-model="selectedReferral.city"
                  label="City"
                  :error="errors.city"
                />
                <InputSelect
                  v-model="selectedReferral.state"
                  label="State"
                  placeholder="Select a state"
                  :error="errors.state"
                >
                  <option
                    v-for="state in US_STATES"
                    :key="state.value"
                    :value="state.value"
                  >
                    {{ state.label }}
                  </option>
                </InputSelect>
                <InputText
                  v-model="selectedReferral.zip"
                  label="ZIP code"
                  :error="errors.zip"
                />
              </Stack>
            </Stack>

            <!-- Primary contact -->
            <Stack gap="4">
              <h2>Primary contact</h2>
              <Stack gap="4">
                <InputText
                  v-model="selectedReferral.firstName"
                  label="First name"
                  :error="errors.firstName"
                />
                <InputText
                  v-model="selectedReferral.lastName"
                  label="Last name"
                  :error="errors.lastName"
                />
                <InputText
                  v-model="selectedReferral.jobTitle"
                  label="Job title"
                  optional
                />
                <InputEmail
                  v-model="selectedReferral.email"
                  label="Email"
                  :error="errors.email"
                />
                <InputPhone
                  v-model="selectedReferral.phone"
                  label="Phone number"
                  :error="errors.phone"
                />
              </Stack>
            </Stack>

            <!-- Company details -->
            <Stack gap="4">
              <h2>Company details</h2>
              <Stack gap="4">
                <InputNumber
                  v-model="selectedReferral.salariedEmployees"
                  label="Number of salaried employees"
                  min="0"
                  step="1"
                  :error="errors.salariedEmployees"
                />
                <InputNumber
                  v-model="selectedReferral.hourlyEmployees"
                  label="Number of hourly employees"
                  min="0"
                  step="1"
                  :error="errors.hourlyEmployees"
                />
                <InputRadio
                  v-model="selectedReferral.solution"
                  label="Preferred Justworks solution"
                  :options="SOLUTION_OPTIONS"
                />
                <InputRadio
                  v-model="selectedReferral.justworksBenefits"
                  label="Are they interested in offering benefits through Justworks?"
                  :options="BENEFITS_OPTIONS"
                />
              </Stack>
            </Stack>

            <!-- Additional context -->
            <Stack gap="4">
              <h2>Additional context</h2>
              <InputFile
                :key="selectedReferral.id"
                label="Additional documents"
                multiple
                optional
              >
                <template #helper>
                  Share any files that might help us get this company started on
                  Justworks.
                </template>
              </InputFile>
              <InputTextarea
                v-model="selectedReferral.notes"
                label="Anything else we should know?"
                optional
              />
            </Stack>
          </Stack>
        </template>

        <div v-else class="detail-empty">
          <p>Select a referral to edit its details.</p>
        </div>
      </div>

      <!-- Footer bar -->
      <div class="review-footer">
        <Row align="center" justify="space-between">
          <Row align="center" gap="4">
            <Button variant="primary" :disabled="!allValid" @click="submitAll">
              Submit {{ readyCount }}
              {{ readyCount === 1 ? 'referral' : 'referrals' }}
            </Button>
            <Button @click="clear">Back</Button>
            <span class="ready-count">
              {{ readyCount }} of {{ referrals.length }}
              {{ referrals.length === 1 ? 'referral' : 'referrals' }} ready
            </span>
          </Row>
        </Row>
      </div>
    </div>
  </Stack>
</template>

<style scoped>
.review-wrap {
  flex: 1;
  min-height: 0;
  height: 100%;
}

.bulk-review {
  display: grid;
  grid-template-columns: 18rem 1fr;
  grid-template-rows: 1fr auto;
  grid-template-areas:
    'list detail'
    'footer footer';
  min-height: 0;
  overflow: hidden;
  border: 1px solid var(--color-line);
  border-radius: var(--border-radius-md);
}

/* Left panel */
.referral-list {
  grid-area: list;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
  border-right: 1px solid var(--color-line);
  min-height: 0;
}

.referral-list-scroll {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.referral-item {
  display: block;
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: none;
  border-bottom: 1px solid var(--color-line);
  background: transparent;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  font-size: var(--font-size-md);
  color: var(--color-text);
}

.referral-item--selected {
  background: var(--color-bg-subtle);
}

.referral-item-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 0;
}

.referral-item-name {
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-md);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.referral-item-name--unnamed {
  color: var(--color-text-muted);
  font-weight: var(--font-weight-regular);
}

.trash-btn {
  opacity: 0;
}

.referral-item:hover .trash-btn,
.referral-item--selected .trash-btn {
  opacity: 1;
}

.referral-list-add {
  padding: var(--space-4) var(--space-4);
  display: flex;
  justify-content: center;
}

/* Right panel */
.detail-panel {
  grid-area: detail;
  background: var(--color-bg);
  overflow-y: auto;
  padding: var(--space-6);
  min-height: 0;
}

.detail-form {
  width: 100%;
  max-width: 24rem;
}

.detail-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-text-muted);
}

/* Footer bar */
.review-footer {
  grid-area: footer;
  background: var(--color-bg);
  border-top: 1px solid var(--color-line);
  padding: var(--space-4) var(--space-6);
}

.ready-count {
  flex: 1;
  font-size: var(--font-size-md);
  text-align: right;
  color: var(--color-text-muted);
}
</style>
