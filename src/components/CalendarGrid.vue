<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import IconCaretLeft from '~icons/ph/caret-left'
import IconCaretRight from '~icons/ph/caret-right'

const props = defineProps({
  selected: { type: Date, default: null },
  rangeStart: { type: Date, default: null },
  rangeEnd: { type: Date, default: null },
  hoverDate: { type: Date, default: null },
  disableDate: { type: Function, default: null },
  initialMonth: { type: Date, default: () => new Date() },
})

const emit = defineEmits(['select', 'hover'])

// ── Date helpers ─────────────────────────────────────────────────────────────

function isSameDay(a, b) {
  return (
    a != null &&
    b != null &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function addDays(date, n) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + n)
}

function addMonths(date, n) {
  const t = new Date(date.getFullYear(), date.getMonth() + n, 1)
  const days = new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate()
  return new Date(
    t.getFullYear(),
    t.getMonth(),
    Math.min(date.getDate(), days),
  )
}

function dateKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

// ── Calendar state ───────────────────────────────────────────────────────────

const viewMonth = ref(
  new Date(
    props.initialMonth.getFullYear(),
    props.initialMonth.getMonth(),
    1,
  ),
)

const focusedDate = ref(null)

const weekdayHeaders = (() => {
  const narrow = new Intl.DateTimeFormat('en', { weekday: 'narrow' })
  const long = new Intl.DateTimeFormat('en', { weekday: 'long' })
  const sunday = new Date(2000, 0, 2) // Jan 2 2000 is a Sunday
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(sunday, i)
    return { short: narrow.format(d), long: long.format(d) }
  })
})()

const weeks = computed(() => {
  const year = viewMonth.value.getFullYear()
  const month = viewMonth.value.getMonth()
  const leadingDays = new Date(year, month, 1).getDay()
  const result = []
  let cur = new Date(year, month, 1 - leadingDays)
  do {
    const week = Array.from({ length: 7 }, () => {
      const d = new Date(cur)
      cur = addDays(cur, 1)
      return d
    })
    result.push(week)
  } while (result.length < 4 || cur.getMonth() === month)
  return result
})

const monthHeading = computed(() =>
  new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(
    viewMonth.value,
  ),
)

const longDateFmt = new Intl.DateTimeFormat('en', { dateStyle: 'long' })

function isOutsideMonth(day) {
  return (
    day.getMonth() !== viewMonth.value.getMonth() ||
    day.getFullYear() !== viewMonth.value.getFullYear()
  )
}

function isDisabled(day) {
  return !isOutsideMonth(day) && !!props.disableDate?.(day)
}

// ── Range helpers ────────────────────────────────────────────────────────────

function isInRange(day) {
  if (isOutsideMonth(day)) return false
  const start = props.rangeStart
  const end = props.rangeEnd ?? props.hoverDate
  if (!start || !end) return false
  const t = day.getTime()
  const s = Math.min(start.getTime(), end.getTime())
  const e = Math.max(start.getTime(), end.getTime())
  return t >= s && t <= e
}

function isRangeStart(day) {
  if (isOutsideMonth(day)) return false
  return props.rangeStart != null && isSameDay(day, props.rangeStart)
}

function isRangeEnd(day) {
  if (isOutsideMonth(day)) return false
  const end = props.rangeEnd ?? props.hoverDate
  return end != null && isSameDay(day, end)
}

// ── Day interaction ──────────────────────────────────────────────────────────

function selectDay(day) {
  if (isOutsideMonth(day) || isDisabled(day)) return
  emit('select', day)
}

function dayTabindex(day) {
  if (isOutsideMonth(day) || isDisabled(day)) return -1
  if (focusedDate.value) return isSameDay(day, focusedDate.value) ? 0 : -1
  if (props.selected) return isSameDay(day, props.selected) ? 0 : -1
  if (props.rangeStart) return isSameDay(day, props.rangeStart) ? 0 : -1
  return day.getDate() === 1 ? 0 : -1
}

function focusDayCell(date) {
  focusedDate.value = date
  if (
    date.getMonth() !== viewMonth.value.getMonth() ||
    date.getFullYear() !== viewMonth.value.getFullYear()
  ) {
    viewMonth.value = new Date(date.getFullYear(), date.getMonth(), 1)
  }
  nextTick(() => {
    const cell = document.querySelector(`[data-date="${dateKey(date)}"]`)
    if (cell instanceof HTMLElement) cell.focus()
  })
}

function handleDayKeydown(e, day) {
  switch (e.key) {
    case 'ArrowLeft':
      e.preventDefault()
      focusDayCell(addDays(day, -1))
      break
    case 'ArrowRight':
      e.preventDefault()
      focusDayCell(addDays(day, 1))
      break
    case 'ArrowUp':
      e.preventDefault()
      focusDayCell(addDays(day, -7))
      break
    case 'ArrowDown':
      e.preventDefault()
      focusDayCell(addDays(day, 7))
      break
    case 'PageUp':
      e.preventDefault()
      focusDayCell(addMonths(day, e.shiftKey ? -12 : -1))
      break
    case 'PageDown':
      e.preventDefault()
      focusDayCell(addMonths(day, e.shiftKey ? 12 : 1))
      break
    case 'Enter':
    case ' ':
      e.preventDefault()
      selectDay(day)
      break
    case 'Escape':
      e.preventDefault()
      break
    default:
      break
  }
}

function onDayMouseEnter(day) {
  if (!isOutsideMonth(day) && !isDisabled(day)) {
    emit('hover', day)
  }
}

function onDayMouseLeave() {
  emit('hover', null)
}

// ── Expose ───────────────────────────────────────────────────────────────────

function focusCell(date) {
  viewMonth.value = new Date(date.getFullYear(), date.getMonth(), 1)
  focusDayCell(date)
}

watch(
  () => props.initialMonth,
  (m) => {
    if (m) viewMonth.value = new Date(m.getFullYear(), m.getMonth(), 1)
  },
)

defineExpose({ focusCell, viewMonth })
</script>

<template>
  <div class="calendar-grid">
    <div class="calendar-header">
      <button
        type="button"
        class="month-btn"
        aria-label="Previous month"
        @click="viewMonth = addMonths(viewMonth, -1)"
      >
        <IconCaretLeft />
      </button>
      <span class="month-heading" aria-live="polite">{{ monthHeading }}</span>
      <button
        type="button"
        class="month-btn"
        aria-label="Next month"
        @click="viewMonth = addMonths(viewMonth, 1)"
      >
        <IconCaretRight />
      </button>
    </div>
    <table role="grid" :aria-label="monthHeading">
      <thead>
        <tr>
          <th
            v-for="wd in weekdayHeaders"
            :key="wd.long"
            :abbr="wd.long"
            scope="col"
          >
            {{ wd.short }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(week, wi) in weeks" :key="wi">
          <td v-for="day in week" :key="day.getTime()" role="gridcell">
            <div
              class="day"
              role="button"
              :tabindex="dayTabindex(day)"
              :class="{
                'day-outside': isOutsideMonth(day),
                'day-disabled': isDisabled(day),
                'day-today':
                  !isOutsideMonth(day) && isSameDay(day, new Date()),
                'day-selected':
                  !isOutsideMonth(day) && isSameDay(day, selected),
                'day-in-range': isInRange(day),
                'day-range-start': isRangeStart(day),
                'day-range-end': isRangeEnd(day),
              }"
              :data-date="dateKey(day)"
              :aria-label="longDateFmt.format(day)"
              :aria-selected="
                (!isOutsideMonth(day) && isSameDay(day, selected)) || undefined
              "
              :aria-disabled="
                isOutsideMonth(day) || isDisabled(day) || undefined
              "
              @click="selectDay(day)"
              @keydown="handleDayKeydown($event, day)"
              @mouseenter="onDayMouseEnter(day)"
              @mouseleave="onDayMouseLeave"
            >
              {{ day.getDate() }}
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.calendar-grid {
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
  .day:not(.day-outside):not(.day-disabled):not(.day-selected):not(
      .day-range-start
    ):not(.day-range-end):hover {
    background: var(--color-bg-muted);
  }
}

.day-selected {
  background: var(--color-accent);
  color: var(--color-text-on-accent);
}

.day-in-range:not(.day-range-start):not(.day-range-end) {
  background: color-mix(in srgb, var(--color-accent) 12%, transparent);
  border-radius: 0;
}

.day-range-start,
.day-range-end {
  background: var(--color-accent);
  color: var(--color-text-on-accent);
}

.day-range-start {
  border-radius: var(--border-radius-sm) 0 0 var(--border-radius-sm);
}

.day-range-end {
  border-radius: 0 var(--border-radius-sm) var(--border-radius-sm) 0;
}

.day-range-start.day-range-end {
  border-radius: var(--border-radius-sm);
}

.day:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 1px;
}
</style>
