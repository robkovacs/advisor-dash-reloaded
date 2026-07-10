<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import {
  referrals,
  addReferral,
  removeReferral,
  getStatus,
  getReferralErrors,
  allValid,
  submitAll,
  clear,
  pendingFocusId,
  PREFERRED_CONTACT_OPTIONS,
} from '@/use/useBulkReferrals'
import Stack from '@/components/Stack.vue'
import Row from '@/components/Row.vue'
import FlexSpace from '@/components/FlexSpace.vue'
import Button from '@/components/Button.vue'
import IconPlus from '~icons/ph/plus'
import IconCaretLeft from '~icons/ph/caret-left'
import IconCaretRight from '~icons/ph/caret-right'
import IconWarningCircle from '~icons/ph/warning-circle'
import ToggleSwitch from '@/components/ToggleSwitch.vue'
import InputSearch from '@/components/InputSearch.vue'
import EditableTable from './internals/EditableTable.vue'

const search = ref('')
const showOnlyIncomplete = ref(false)
const showErrors = ref(false)
const tableRef = ref(null)

// A row's "required" errors stay hidden until the user has actually left
// that row (not just blurred a single cell within it) — so a freshly-added
// blank row doesn't immediately show a sea of red, and tabbing between
// fields within one row doesn't light it up prematurely.
const touchedRows = reactive(new Set())

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

const COLUMNS = [
  { key: 'companyName', label: 'Company name', type: 'text', width: '180px' },
  {
    key: 'firstName',
    label: 'First name',
    type: 'text',
    width: '140px',
  },
  {
    key: 'lastName',
    label: 'Last name',
    type: 'text',
    width: '140px',
  },
  {
    key: 'email',
    label: 'Email',
    type: 'email',
    width: '200px',
  },
  {
    key: 'phone',
    label: 'Phone',
    type: 'phone',
    width: '160px',
  },
  {
    key: 'preferredContact',
    label: 'Preferred contact method',
    type: 'select',
    width: '120px',
    options: PREFERRED_CONTACT_OPTIONS,
  },
]

const errorStats = computed(() => {
  let totalErrors = 0
  let rowsWithErrors = 0
  for (const r of referrals) {
    const errs = Object.keys(getReferralErrors(r)).length
    if (errs > 0) {
      totalErrors += errs
      rowsWithErrors++
    }
  }
  return { totalErrors, rowsWithErrors, totalRows: referrals.length }
})

function trySubmit() {
  if (allValid.value) {
    showErrors.value = false
    submitAll().catch((err) => {
      console.error('Failed to submit referrals:', err)
    })
  } else {
    showErrors.value = true
  }
}

// Hide "required" errors on a row until it's been touched (any cell
// blurred) or the user has attempted to submit — but still surface
// format/validity errors immediately, since those reflect something the
// user actually typed.
function displayErrors(row) {
  const errs = getReferralErrors(row)
  if (showErrors.value || touchedRows.has(row.id)) return errs
  const filtered = {}
  for (const [key, message] of Object.entries(errs)) {
    if (!message.endsWith('is required')) filtered[key] = message
  }
  return filtered
}

function updateCell(rowId, key, value) {
  const row = referrals.find((r) => r.id === rowId)
  if (row) row[key] = value
}

function handleLeaveRow(rowId) {
  touchedRows.add(rowId)
}

// Focus a newly added row's first cell as soon as it's actually renderable —
// covers both "Add referral" (already mounted here) and "Add manually" from
// the upload step (this component isn't mounted yet when that row is added).
function consumePendingFocus() {
  const id = pendingFocusId.value
  if (!id) return
  pendingFocusId.value = null
  tableRef.value?.focusRowStart(id)
}

onMounted(consumePendingFocus)
watch(pendingFocusId, consumePendingFocus)

function startOver() {
  touchedRows.clear()
  clear()
}
</script>

<template>
  <Stack gap="4" class="review-wrap">
    <div
      v-if="showErrors && errorStats.totalErrors > 0"
      class="error-banner"
      role="alert"
    >
      <IconWarningCircle class="error-banner-icon" aria-hidden="true" />
      <span class="error-banner-text">
        <strong
          >{{ errorStats.totalErrors }}
          {{ errorStats.totalErrors === 1 ? 'error' : 'errors' }}</strong
        >
        across {{ errorStats.rowsWithErrors }} of
        {{ errorStats.totalRows }}
        {{ errorStats.totalRows === 1 ? 'row' : 'rows' }}
      </span>
      <FlexSpace />
      <Button
        size="small"
        iconOnly
        aria-label="Previous error"
        @click="tableRef.prevError()"
      >
        <IconCaretLeft aria-hidden="true" />
      </Button>
      <Button size="small" variant="primary" @click="tableRef.nextError()">
        Next error
        <IconCaretRight aria-hidden="true" />
      </Button>
    </div>

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
        label="Show only incomplete rows"
      />
    </Row>

    <div class="bulk-review">
      <div class="table-scroll" tabindex="-1">
        <EditableTable
          ref="tableRef"
          :columns="COLUMNS"
          :rows="filteredReferrals"
          :errors="displayErrors"
          @update="updateCell"
          @remove="removeReferral"
          @leave-row="handleLeaveRow"
        />
      </div>

      <div class="review-footer">
        <Row align="center" justify="space-between">
          <Button size="small" @click="addReferral"
            ><IconPlus />Add referral</Button
          >
          <Button variant="primary" @click="trySubmit">Submit referrals</Button>
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

.error-banner {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: color-mix(in srgb, var(--color-error) 6%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-error) 25%, transparent);
  border-radius: var(--border-radius-md);
}

.error-banner-icon {
  color: var(--color-error);
  font-size: var(--font-size-lg);
  flex-shrink: 0;
}

.error-banner-text {
  font-size: var(--font-size-md);
  color: var(--color-text);
}

.error-banner-text strong {
  color: var(--color-error);
}

.bulk-review {
  display: flex;
  flex-direction: column;
  min-height: 0;
  border: 1px solid var(--color-line);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  flex: 1;
}

.table-scroll {
  flex: 1;
  overflow: auto;
  min-height: 0;
}

.review-footer {
  background: var(--color-bg);
  border-top: 1px solid var(--color-line);
  padding: var(--space-4) var(--space-6);
  flex-shrink: 0;
}
</style>
