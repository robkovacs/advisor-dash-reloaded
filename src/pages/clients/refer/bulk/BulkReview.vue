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
  PREFERRED_CONTACT_OPTIONS,
} from '@/use/useBulkReferrals'
import Stack from '@/components/Stack.vue'
import Row from '@/components/Row.vue'
import Button from '@/components/Button.vue'
import ToggleSwitch from '@/components/ToggleSwitch.vue'
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
const showOnlyIncomplete = ref(false)

const filteredReferrals = computed(() => {
  return referrals.filter((r) => {
    if (search.value) {
      const q = search.value.toLowerCase()
      if (!(r.companyName || '').toLowerCase().includes(q)) return false
    }
    if (showOnlyIncomplete.value && getStatus(r) !== 'incomplete') return false
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
      <ToggleSwitch
        v-model="showOnlyIncomplete"
        label="Show only incomplete referrals"
      />
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
                  appearance="secondary"
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
        </div>
      </div>

      <!-- Right panel: detail form -->
      <div class="detail-panel">
        <template v-if="selectedReferral">
          <Stack gap="12" class="detail-form">
            <Stack gap="4">
              <Stack gap="2">
                <InputText
                  v-model="selectedReferral.companyName"
                  label="Company name"
                  :error="errors.companyName"
                />
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
                <InputRadio
                  v-model="selectedReferral.preferredContact"
                  label="Preferred contact method"
                  :options="PREFERRED_CONTACT_OPTIONS"
                  :error="errors.preferredContact"
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

            <!-- Optional: Additional details -->
            <Stack gap="4">
              <Stack gap="2">
                <h1>Additional details</h1>
                <p class="section-note">
                  These fields are optional — fill them in to help us get
                  started faster.
                </p>
              </Stack>
              <Stack gap="2">
                <InputText
                  v-model="selectedReferral.companyWebsite"
                  label="Company website"
                  optional
                />
                <Stack gap="4">
                  <h2>Company billing address</h2>
                  <Stack gap="2">
                    <InputText
                      v-model="selectedReferral.addressLine1"
                      label="Address line 1"
                      optional
                    />
                    <InputText
                      v-model="selectedReferral.addressLine2"
                      label="Address line 2"
                      optional
                    />
                    <InputText
                      v-model="selectedReferral.city"
                      label="City"
                      optional
                    />
                    <InputSelect
                      v-model="selectedReferral.state"
                      label="State"
                      placeholder="Select a state"
                      optional
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
                      optional
                    />
                  </Stack>
                </Stack>
              </Stack>
            </Stack>

            <!-- Optional: Company details -->
            <Stack gap="4">
              <h2>Company details</h2>
              <Stack gap="2">
                <InputNumber
                  v-model="selectedReferral.salariedEmployees"
                  label="Number of salaried employees"
                  min="0"
                  step="1"
                  optional
                />
                <InputNumber
                  v-model="selectedReferral.hourlyEmployees"
                  label="Number of hourly employees"
                  min="0"
                  step="1"
                  optional
                />
                <InputRadio
                  v-model="selectedReferral.solution"
                  label="Preferred Justworks solution"
                  :options="SOLUTION_OPTIONS"
                  optional
                />
                <InputRadio
                  v-model="selectedReferral.justworksBenefits"
                  label="Interested in offering benefits through Justworks?"
                  :options="BENEFITS_OPTIONS"
                  optional
                />
              </Stack>
            </Stack>

            <!-- Optional: Additional context -->
            <Stack gap="4">
              <h2>Additional context</h2>
              <Stack gap="2"
                ><InputFile
                  :key="selectedReferral.id"
                  label="Additional documents"
                  multiple
                  optional
                >
                  <template #helper>
                    Share any files that might help us get this company started
                    on Justworks.
                  </template>
                </InputFile>
                <InputTextarea
                  v-model="selectedReferral.notes"
                  label="Anything else we should know?"
                  optional
                />
              </Stack>
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
          <Button size="small" @click="addReferral">
            <IconPlus aria-hidden="true" />
            Add referral
          </Button>
          <Row align="center" gap="4">
            <span class="ready-count">
              {{ readyCount }} of {{ referrals.length }}
              {{ referrals.length === 1 ? 'referral' : 'referrals' }} ready
            </span>
            <Button variant="primary" :disabled="!allValid" @click="submitAll">
              Submit referrals
            </Button>
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
  gap: var(--space-2);
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
  max-width: 60ch;
}

.detail-form :deep(input),
.detail-form :deep(select),
.detail-form :deep(.radio-group),
.detail-form :deep(.input-wrapper) {
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
