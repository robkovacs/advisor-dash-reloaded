<script>
export default { inheritAttrs: false }
</script>

<script setup>
import { computed, nextTick, ref, useAttrs, useId } from 'vue'
import FormField from './FormField.vue'
import Popover from './Popover.vue'
import CalendarGrid from './CalendarGrid.vue'
import IconCalendarBlank from '~icons/ph/calendar-blank'

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
const calendarRef = ref(null)

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

// ── Calendar open/close ───────────────────────────────────────────────────────

function openCalendar() {
  const init = selectedDate.value ?? new Date()
  popoverRef.value?.open()
  nextTick(() => calendarRef.value?.focusCell(init))
}

function closeCalendar() {
  popoverRef.value?.close()
}

// ── Day interaction ───────────────────────────────────────────────────────────

function selectDay(day) {
  if (props.disableDate?.(day)) return
  emit('update:modelValue', dateToDisplay(day))
  closeCalendar()
  nextTick(() => inputRef.value?.focus())
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
      <Popover ref="popoverRef" placement="bottom-start" :offset-px="4">
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
          <CalendarGrid
            ref="calendarRef"
            :selected="selectedDate"
            :disable-date="disableDate"
            :initial-month="selectedDate ?? new Date()"
            @select="selectDay"
          />
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

.calendar-panel {
  padding: var(--space-3);
}
</style>
