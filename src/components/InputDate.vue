<script>
export default { inheritAttrs: false }
</script>

<script setup>
import { computed, nextTick, ref, useAttrs, useId } from 'vue'
import FormField from './FormField.vue'
import Popover from './Popover.vue'
import IconCalendarBlank from '~icons/ph/calendar-blank'
import IconCaretLeft from '~icons/ph/caret-left'
import IconCaretRight from '~icons/ph/caret-right'

const attrs = useAttrs()

const props = defineProps({
  modelValue: String,
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
const inputRef = ref(null)
const focusedDate = ref(null)
const viewMonth = ref(new Date())

// ── Date helpers ──────────────────────────────────────────────────────────────

function isSameDay(a, b) {
  return a != null && b != null &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

function addDays(date, n) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + n)
}

function addMonths(date, n) {
  const t = new Date(date.getFullYear(), date.getMonth() + n, 1)
  const days = new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate()
  return new Date(t.getFullYear(), t.getMonth(), Math.min(date.getDate(), days))
}

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

function dateKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

// ── Input formatting ──────────────────────────────────────────────────────────

function formatDate(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

const displayValue = computed(() => formatDate(props.modelValue ?? ''))
const selectedDate = computed(() => parseDisplayDate(props.modelValue ?? ''))

function onInput(event) {
  const formatted = formatDate(event.target.value)
  event.target.value = formatted
  emit('update:modelValue', formatted)
}

// ── Calendar state ────────────────────────────────────────────────────────────

const weekdayHeaders = (() => {
  const narrow = new Intl.DateTimeFormat('en', { weekday: 'narrow' })
  const long = new Intl.DateTimeFormat('en', { weekday: 'long' })
  const sunday = new Date(2000, 0, 2) // Jan 2 2000 is a Sunday
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(sunday, i)
    return { short: narrow.format(d), long: long.format(d) }
  })
})()

const calendarGrid = computed(() => {
  const year = viewMonth.value.getFullYear()
  const month = viewMonth.value.getMonth()
  const leadingDays = new Date(year, month, 1).getDay()
  const weeks = []
  let cur = new Date(year, month, 1 - leadingDays)
  do {
    const week = Array.from({ length: 7 }, () => { const d = new Date(cur); cur = addDays(cur, 1); return d })
    weeks.push(week)
  } while (weeks.length < 4 || cur.getMonth() === month)
  return weeks
})

const monthHeading = computed(() =>
  new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(viewMonth.value)
)

const longDateFmt = new Intl.DateTimeFormat('en', { dateStyle: 'long' })

function isOutsideMonth(day) {
  return day.getMonth() !== viewMonth.value.getMonth() ||
    day.getFullYear() !== viewMonth.value.getFullYear()
}

function isDisabled(day) {
  return !isOutsideMonth(day) && !!props.disableDate?.(day)
}

// ── Calendar open/close ───────────────────────────────────────────────────────

function openCalendar() {
  const init = selectedDate.value ?? new Date()
  viewMonth.value = new Date(init.getFullYear(), init.getMonth(), 1)
  focusedDate.value = init
  popoverRef.value?.open()
  nextTick(() => {
    const cell = document.querySelector(`[data-date="${dateKey(init)}"]`)
    if (cell instanceof HTMLElement) cell.focus()
  })
}

function closeCalendar() {
  popoverRef.value?.close()
  focusedDate.value = null
}

function onPopoverClose() {
  focusedDate.value = null
}

// ── Day interaction ───────────────────────────────────────────────────────────

function selectDay(day) {
  if (isOutsideMonth(day) || isDisabled(day)) return
  emit('update:modelValue', dateToDisplay(day))
  closeCalendar()
  nextTick(() => inputRef.value?.focus())
}

function dayTabindex(day) {
  if (isOutsideMonth(day) || isDisabled(day)) return -1
  if (focusedDate.value) return isSameDay(day, focusedDate.value) ? 0 : -1
  if (selectedDate.value) return isSameDay(day, selectedDate.value) ? 0 : -1
  return day.getDate() === 1 ? 0 : -1
}

function focusDayCell(date) {
  focusedDate.value = date
  if (date.getMonth() !== viewMonth.value.getMonth() || date.getFullYear() !== viewMonth.value.getFullYear()) {
    viewMonth.value = new Date(date.getFullYear(), date.getMonth(), 1)
  }
  nextTick(() => {
    const cell = document.querySelector(`[data-date="${dateKey(date)}"]`)
    if (cell instanceof HTMLElement) cell.focus()
  })
}

function handleDayKeydown(e, day) {
  switch (e.key) {
    case 'ArrowLeft':   e.preventDefault(); focusDayCell(addDays(day, -1)); break
    case 'ArrowRight':  e.preventDefault(); focusDayCell(addDays(day, 1)); break
    case 'ArrowUp':     e.preventDefault(); focusDayCell(addDays(day, -7)); break
    case 'ArrowDown':   e.preventDefault(); focusDayCell(addDays(day, 7)); break
    case 'PageUp':      e.preventDefault(); focusDayCell(addMonths(day, e.shiftKey ? -12 : -1)); break
    case 'PageDown':    e.preventDefault(); focusDayCell(addMonths(day, e.shiftKey ? 12 : 1)); break
    case 'Enter':
    case ' ':           e.preventDefault(); selectDay(day); break
    case 'Escape':      e.preventDefault(); closeCalendar(); nextTick(() => inputRef.value?.focus()); break
    default: break
  }
}

// ── Input keyboard ────────────────────────────────────────────────────────────

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
      <Popover ref="popoverRef" placement="bottom-start" :offset-px="4" @close="onPopoverClose">
        <template #trigger="{ toggle }">
          <div class="input-wrapper" :style="width ? { width } : undefined">
            <input
              :id="inputId"
              ref="inputRef"
              v-bind="{ ...attrs, ...inputAttrs }"
              :class="{ invalid }"
              type="text"
              inputmode="numeric"
              autocomplete="off"
              placeholder="mm/dd/yyyy"
              :value="displayValue"
              :aria-expanded="popoverRef?.isOpen.value"
              :aria-controls="panelId"
              aria-haspopup="dialog"
              @input="onInput"
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

        <div :id="panelId" class="calendar-panel" role="dialog" :aria-label="`${label ?? 'Date'} picker`">
          <div class="calendar-header">
            <button type="button" class="month-btn" aria-label="Previous month" @click="viewMonth = addMonths(viewMonth, -1)">
              <IconCaretLeft />
            </button>
            <span class="month-heading" aria-live="polite">{{ monthHeading }}</span>
            <button type="button" class="month-btn" aria-label="Next month" @click="viewMonth = addMonths(viewMonth, 1)">
              <IconCaretRight />
            </button>
          </div>
          <table role="grid" :aria-label="monthHeading">
            <thead>
              <tr>
                <th v-for="wd in weekdayHeaders" :key="wd.long" :abbr="wd.long" scope="col">{{ wd.short }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(week, wi) in calendarGrid" :key="wi">
                <td v-for="day in week" :key="day.getTime()" role="gridcell">
                  <div
                    class="day"
                    role="button"
                    :tabindex="dayTabindex(day)"
                    :class="{
                      'day-outside': isOutsideMonth(day),
                      'day-disabled': isDisabled(day),
                      'day-today': !isOutsideMonth(day) && isSameDay(day, new Date()),
                      'day-selected': !isOutsideMonth(day) && isSameDay(day, selectedDate),
                    }"
                    :data-date="dateKey(day)"
                    :aria-label="longDateFmt.format(day)"
                    :aria-selected="(!isOutsideMonth(day) && isSameDay(day, selectedDate)) || undefined"
                    :aria-disabled="(isOutsideMonth(day) || isDisabled(day)) || undefined"
                    @click="selectDay(day)"
                    @keydown="handleDayKeydown($event, day)"
                  >{{ day.getDate() }}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Popover>
    </template>
  </FormField>
</template>

<style scoped>
@import '../styles/components/input.css';

input {
  padding-right: calc(var(--space-3) * 2 + 1em);
  font-variant-numeric: tabular-nums;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.calendar-toggle {
  position: absolute;
  right: 0.1875rem;
  top: 0.1875rem;
  bottom: 0.1875rem;
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
}

@media (hover: hover) {
  .calendar-toggle:hover {
    background-color: var(--color-bg-muted);
  }
}

/* ── Calendar panel ─────────────────────────────────────────────── */

.calendar-panel {
  padding: var(--space-3);
  user-select: none;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-2);
}

.month-heading {
  flex: 1;
  text-align: center;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-md);
}

.month-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text);
  padding: var(--space-1);
  border-radius: var(--border-radius-sm);
  line-height: 0;
  font-size: var(--font-size-md);
}

@media (hover: hover) {
  .month-btn:hover {
    background: var(--color-bg-muted);
  }
}

table {
  border-collapse: collapse;
}

th {
  width: var(--space-8);
  padding: var(--space-1) 0;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-regular);
  color: var(--color-text-muted);
  text-align: center;
}

td {
  padding: var(--space-0-5) 0;
  text-align: center;
}

.day {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--space-8);
  height: var(--space-8);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-md);
  cursor: pointer;
}

.day-outside {
  visibility: hidden;
  pointer-events: none;
}

.day-disabled {
  color: var(--color-text-muted);
  cursor: default;
  pointer-events: none;
}

.day-today {
  font-weight: var(--font-weight-bold);
}

@media (hover: hover) {
  .day:not(.day-outside):not(.day-disabled):not(.day-selected):hover {
    background: var(--color-bg-muted);
  }
}

.day-selected {
  background: var(--color-accent);
  color: var(--color-text-on-accent);
}

.day:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 1px;
}
</style>
