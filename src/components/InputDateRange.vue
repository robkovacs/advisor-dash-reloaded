<script>
export default { inheritAttrs: false }
</script>

<script setup>
import { computed, nextTick, ref, useAttrs, useId, watch } from 'vue'
import FormField from './FormField.vue'
import Popover from './Popover.vue'
import CalendarGrid from './CalendarGrid.vue'
import IconCalendarBlank from '~icons/ph/calendar-blank'

const attrs = useAttrs()

const props = defineProps({
  modelValue: { type: Array, default: () => [null, null] },
  label: String,
  error: String,
  id: String,
  optional: Boolean,
  hideError: Boolean,
  hideLabel: Boolean,
  disableDate: { type: Function, default: null },
  width: String,
})

const emit = defineEmits(['update:modelValue'])

const generatedId = useId()
const inputId = props.id ?? generatedId
const panelId = useId()

const popoverRef = ref(null)
const startInputRef = ref(null)
const endInputRef = ref(null)
const calendarRef = ref(null)

const startText = ref('')
const endText = ref('')
const hoverDate = ref(null)

// Range being built via calendar clicks — first click sets pendingStart,
// second click (if >= pendingStart) completes the range and closes.
const pendingStart = ref(null)

// ── Date helpers ──────────────────────────────────────────────────────────────

function parseDisplayDate(str) {
  if (!str) return null
  const match = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return null
  const [, mm, dd, yyyy] = match.map(Number)
  const d = new Date(yyyy, mm - 1, dd)
  return d.getFullYear() === yyyy && d.getMonth() === mm - 1 && d.getDate() === dd ? d : null
}

function dateToDisplay(date) {
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${mm}/${dd}/${date.getFullYear()}`
}

function dateToISO(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function isoToDate(iso) {
  if (!iso) return null
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return null
  const date = new Date(y, m - 1, d)
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d ? date : null
}

// ── Input formatting ──────────────────────────────────────────────────────────

function formatDate(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

// ── Computed state from modelValue ───────────────────────────────────────────

const startDate = computed(() => isoToDate(props.modelValue?.[0]))
const endDate = computed(() => isoToDate(props.modelValue?.[1]))

// Calendar display props — use pendingStart for range highlighting during
// calendar interaction, otherwise show the committed range.
const calendarRangeStart = computed(() => pendingStart.value ?? startDate.value)
const calendarRangeEnd = computed(() =>
  pendingStart.value ? null : endDate.value,
)

// ── Sync text from modelValue ────────────────────────────────────────────────

function syncText() {
  startText.value = startDate.value ? dateToDisplay(startDate.value) : ''
  endText.value = endDate.value ? dateToDisplay(endDate.value) : ''
}

watch(() => props.modelValue, syncText, { immediate: true })

// ── Input handlers ───────────────────────────────────────────────────────────

function onStartInput(event) {
  startText.value = formatDate(event.target.value)
  event.target.value = startText.value
}

function onEndInput(event) {
  endText.value = formatDate(event.target.value)
  event.target.value = endText.value
}

function commitStart() {
  const date = parseDisplayDate(startText.value)
  if (date && !props.disableDate?.(date)) {
    startText.value = dateToDisplay(date)
    emitRange(date, endDate.value)
  } else if (!startText.value) {
    emitRange(null, endDate.value)
  } else {
    startText.value = startDate.value ? dateToDisplay(startDate.value) : ''
  }
}

function commitEnd() {
  const date = parseDisplayDate(endText.value)
  if (date && !props.disableDate?.(date)) {
    endText.value = dateToDisplay(date)
    emitRange(startDate.value, date)
  } else if (!endText.value) {
    emitRange(startDate.value, null)
  } else {
    endText.value = endDate.value ? dateToDisplay(endDate.value) : ''
  }
}

function emitRange(start, end) {
  emit('update:modelValue', [
    start ? dateToISO(start) : null,
    end ? dateToISO(end) : null,
  ])
}

// ── Calendar interaction ─────────────────────────────────────────────────────

function onCalendarSelect(day) {
  if (!pendingStart.value) {
    // First click — set start
    pendingStart.value = day
    hoverDate.value = null
  } else if (day.getTime() >= pendingStart.value.getTime()) {
    // Second click on or after start — complete range
    emitRange(pendingStart.value, day)
    pendingStart.value = null
    hoverDate.value = null
    closeCalendar()
    nextTick(() => startInputRef.value?.focus())
  } else {
    // Clicked before current start — reset start
    pendingStart.value = day
    hoverDate.value = null
  }
}

function onCalendarHover(day) {
  if (pendingStart.value) {
    hoverDate.value = day
  }
}

// ── Calendar open/close ──────────────────────────────────────────────────────

function openCalendar() {
  pendingStart.value = null
  hoverDate.value = null
  popoverRef.value?.open()
  nextTick(() => {
    const init = startDate.value ?? new Date()
    calendarRef.value?.focusCell(init)
  })
}

function closeCalendar() {
  pendingStart.value = null
  hoverDate.value = null
  popoverRef.value?.close()
}

// ── Input keyboard ───────────────────────────────────────────────────────────

function onInputKeydown(e) {
  if (e.key === 'ArrowDown' && !popoverRef.value?.isOpen.value) {
    e.preventDefault()
    openCalendar()
  } else if (e.key === 'Escape' && popoverRef.value?.isOpen.value) {
    e.preventDefault()
    closeCalendar()
  }
}
</script>

<template>
  <FormField
    :label="label"
    :input-id="inputId"
    :error="error"
    :optional="optional"
    :hide-error="hideError"
    :hide-label="hideLabel"
  >
    <template v-if="$slots.helper" #helper>
      <slot name="helper" />
    </template>
    <template #default="{ invalid, ...inputAttrs }">
      <Popover ref="popoverRef" placement="bottom-start" :offset-px="4">
        <template #trigger="{ toggle }">
          <div
            class="range-wrapper"
            :class="{ invalid }"
            :style="width ? { width } : undefined"
          >
            <input
              :id="inputId"
              ref="startInputRef"
              v-bind="{ ...attrs, ...inputAttrs }"
              class="range-input"
              type="text"
              inputmode="numeric"
              autocomplete="off"
              placeholder="mm/dd/yyyy"
              :value="startText"
              :aria-expanded="popoverRef?.isOpen.value"
              :aria-controls="panelId"
              aria-haspopup="dialog"
              @input="onStartInput"
              @blur="commitStart"
              @keydown="onInputKeydown"
            />
            <span class="range-separator" aria-hidden="true">–</span>
            <input
              :id="`${inputId}-end`"
              ref="endInputRef"
              v-bind="inputAttrs"
              class="range-input"
              type="text"
              inputmode="numeric"
              autocomplete="off"
              placeholder="mm/dd/yyyy"
              :value="endText"
              :aria-expanded="popoverRef?.isOpen.value"
              :aria-controls="panelId"
              aria-haspopup="dialog"
              @input="onEndInput"
              @blur="commitEnd"
              @keydown="onInputKeydown"
            />
            <button
              type="button"
              class="calendar-toggle"
              :aria-label="popoverRef?.isOpen.value ? 'Close date picker' : 'Open date picker'"
              @click="toggle"
            >
              <IconCalendarBlank />
            </button>
          </div>
        </template>

        <div :id="panelId" class="calendar-panel" role="dialog" :aria-label="`${label ?? 'Date range'} picker`">
          <CalendarGrid
            ref="calendarRef"
            :range-start="calendarRangeStart"
            :range-end="calendarRangeEnd"
            :hover-date="hoverDate"
            :disable-date="disableDate"
            :initial-month="startDate ?? new Date()"
            @select="onCalendarSelect"
            @hover="onCalendarHover"
          />
        </div>
      </Popover>
    </template>
  </FormField>
</template>

<style scoped>
@import '../styles/components/input.css';

.range-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  border: 1px solid var(--color-input-border);
  border-radius: var(--border-radius-md);
  background: var(--color-bg);
  padding-left: var(--space-2);
  height: 2.5rem;
  transition: border-color 0.15s;
}

.range-wrapper:focus-within {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.range-wrapper.invalid {
  border-color: var(--color-error-border);
}

@media (hover: hover) {
  .range-wrapper:hover {
    border-color: var(--color-input-border-hover);
  }

  .range-wrapper.invalid:hover {
    border-color: var(--color-error-border-hover);
  }
}

.range-input {
  width: 9ch;
  border: none;
  background: transparent;
  outline: none;
  padding: 0;
  height: 100%;
  font: inherit;
  font-variant-numeric: tabular-nums;
  color: var(--color-text);
}

.range-input:focus-visible {
  outline: none;
}

.range-separator {
  color: var(--color-text-muted);
  user-select: none;
}

.calendar-toggle {
  font-size: var(--font-size-lg);
  display: flex;
  align-items: center;
  background: none;
  border: none;
  padding: calc(var(--space-3) - 0.0625rem);
  border-radius: calc(var(--border-radius-md) - 0.25rem);
  cursor: pointer;
  color: var(--color-text);
  line-height: 0;
  margin-right: 0.1875rem;
}

@media (hover: hover) {
  .calendar-toggle:hover {
    background-color: var(--color-bg-muted);
  }
}

.calendar-panel {
  padding: var(--space-3);
}
</style>
