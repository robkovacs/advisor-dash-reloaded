<script setup>
import { computed, ref, watch, nextTick } from 'vue'
import IconPencilSimple from '~icons/ph/pencil-simple'
import IconWarningCircle from '~icons/ph/warning-circle'
import IconCaretDown from '~icons/ph/caret-down'

const props = defineProps({
  value: { type: String, default: '' },
  type: { type: String, default: 'text' },
  options: { type: Array, default: () => [] },
  error: { type: String, default: '' },
  editing: { type: Boolean, default: false },
  active: { type: Boolean, default: false },
  tabindex: { type: [String, Number], default: -1 },
})

const emit = defineEmits(['activate', 'enterEdit', 'commit', 'cancel', 'nav'])

const rootRef = ref(null)
const displayRef = ref(null)
const inputRef = ref(null)
const localValue = ref(props.value)

// When we explicitly commit/cancel via keydown (or a select's change event),
// ending edit mode removes the input from the DOM, which fires a native
// blur — we don't want that blur to fire a second, redundant commit.
let suppressNextBlur = false

const displayValue = computed(() => {
  if (!props.value) return ''
  if (props.type === 'select') {
    const opt = props.options.find((o) => o.value === props.value)
    return opt ? opt.label : props.value
  }
  return props.value
})

watch(
  () => props.value,
  (v) => {
    if (!props.editing) localValue.value = v
  },
)

// Focus after edit mode ENDS is owned entirely by the parent (EditableTable),
// which knows whether to land on this same cell or move to another one —
// see onCommit/onCancel there. Only entering edit mode is handled locally.
//
// `immediate: true` matters here: a brand-new row (e.g. from "Add referral")
// can mount with `editing` already `true` on its very first render — there's
// no false->true transition for a non-immediate watcher to ever see, so the
// input would render but never actually receive focus.
watch(
  () => props.editing,
  async (isEditing) => {
    if (isEditing) {
      localValue.value = props.value
      await nextTick()
      if (inputRef.value) {
        inputRef.value.focus()
        if (inputRef.value.select) inputRef.value.select()
      }
    }
  },
  { immediate: true },
)

function formatPhone(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 10)
  if (digits.length <= 3) return digits.length ? `(${digits}` : ''
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

function onInput(event) {
  if (props.type === 'phone') {
    const formatted = formatPhone(event.target.value)
    event.target.value = formatted
    localValue.value = formatted
  } else {
    localValue.value = event.target.value
  }
}

function onSelectChange(event) {
  localValue.value = event.target.value
  suppressNextBlur = true
  emit('commit', localValue.value, null)
}

function onEditKeydown(e) {
  if (e.key === 'Escape') {
    e.preventDefault()
    suppressNextBlur = true
    emit('cancel')
  } else if (e.key === 'Enter') {
    e.preventDefault()
    suppressNextBlur = true
    emit('commit', localValue.value, 'right')
  } else if (e.key === 'Tab') {
    e.preventDefault()
    suppressNextBlur = true
    emit('commit', localValue.value, e.shiftKey ? 'left' : 'right')
  }
}

function onBlur() {
  if (suppressNextBlur) {
    suppressNextBlur = false
    return
  }
  emit('commit', localValue.value, null)
}

function onDisplayKeydown(e) {
  if (e.key === 'Enter' || e.key === 'F2') {
    e.preventDefault()
    emit('enterEdit')
  } else if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
    emit('enterEdit')
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault()
    emit('nav', 'left')
  } else if (e.key === 'ArrowRight') {
    e.preventDefault()
    emit('nav', 'right')
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    emit('nav', 'up')
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    emit('nav', 'down')
  }
}

defineExpose({
  focusDisplay: () => displayRef.value?.focus(),
  el: rootRef,
})
</script>

<template>
  <td
    ref="rootRef"
    class="cell"
    :class="{
      'cell--error': error,
      'cell--editing': editing,
      'cell--active': active,
    }"
  >
    <!-- EDIT MODE: absolute overlay (display stays in DOM to preserve row height) -->
    <div v-if="editing" class="cell-edit-overlay">
      <template v-if="type === 'select'">
        <select
          ref="inputRef"
          class="cell-input"
          :value="localValue"
          @change="onSelectChange"
          @blur="onBlur"
          @keydown="onEditKeydown"
        >
          <option value="" disabled>—</option>
          <option v-for="opt in options" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
        <IconCaretDown class="cell-select-caret" aria-hidden="true" />
      </template>
      <input
        v-else
        ref="inputRef"
        class="cell-input"
        :type="type === 'phone' ? 'text' : type"
        :inputmode="type === 'phone' ? 'numeric' : undefined"
        :value="localValue"
        @input="onInput"
        @blur="onBlur"
        @keydown="onEditKeydown"
      />
    </div>

    <!-- DISPLAY: always rendered to preserve row height; hidden visually during edit -->
    <div
      ref="displayRef"
      class="cell-display"
      :class="{ 'cell-display--error': error, 'cell-display--hidden': editing }"
      :tabindex="editing ? -1 : tabindex"
      @focus="emit('activate')"
      @click="emit('enterEdit')"
      @keydown="onDisplayKeydown"
    >
      <span v-if="value" class="cell-value">{{ displayValue }}</span>
      <span v-if="error" class="cell-error">
        <IconWarningCircle aria-hidden="true" />{{ error }}
      </span>
      <span class="cell-pencil" aria-hidden="true">
        <IconPencilSimple />
      </span>
    </div>
  </td>
</template>

<style scoped>
.cell {
  padding: 0;
  position: relative;
  border-top: none;
  border-bottom: 1px solid var(--color-line);
  cursor: text;
}

/* Hover: accent background tint (non-error, non-editing) */
@media (hover: hover) {
  .cell:not(.cell--error):not(.cell--editing):hover {
    background: color-mix(in srgb, var(--color-accent) 4%, transparent);
    cursor: pointer;
  }
}

/* Highlighted (active cell): accent ring on the full td.
   Driven by app state (not :focus-visible) since programmatic .focus()
   calls from click handlers (e.g. the "next error" button) don't reliably
   trigger :focus-visible in Chromium. */
.cell--active:not(.cell--editing) {
  box-shadow: inset 0 0 0 2px var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 4%, transparent);
  z-index: 2;
}

/* ── Error background + left stripe ── */
.cell--error {
  background: color-mix(in srgb, var(--color-error) 5%, transparent);
  box-shadow: inset 3px 0 0 var(--color-error);
}

/* Remove error stripe while editing (overlay takes over) */
.cell--editing {
  box-shadow: none;
  background: transparent;
}

/* ── Edit overlay ── */
.cell-edit-overlay {
  position: absolute;
  inset: 2px;
  border: 2px solid var(--color-accent);
  border-radius: 0;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 25%, transparent);
  background: var(--color-bg);
  z-index: 5;
  display: flex;
  align-items: stretch;
}

.cell-input {
  flex: 1;
  width: 100%;
  padding: 0 var(--space-3);
  border: none;
  outline: none;
  background: transparent;
  font: inherit;
  color: inherit;
  border-radius: 0;
}

select.cell-input {
  appearance: none;
  padding-right: var(--space-8);
  cursor: pointer;
}

.cell-select-caret {
  position: absolute;
  right: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--color-text);
}

/* ── Display mode ── */
.cell-display {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 2.5rem;
  height: 100%;
  padding: var(--space-2) var(--space-3);
  padding-right: var(--space-8);
  gap: var(--space-1);
  position: relative;
  outline: none;
}

/* Hidden during edit: keeps height, invisible content */
.cell-display--hidden {
  visibility: hidden;
  pointer-events: none;
}

/* Remove default outline on the inner display div (ring is on td) */
.cell-display:focus-visible {
  outline: none;
}

/* ── Value text ── */
.cell-value {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Value turns red in error state */
.cell-display--error .cell-value {
  color: var(--color-error);
}

/* ── Error message ── */
.cell-error {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  white-space: nowrap;
  color: var(--color-error);
  font-size: var(--font-size-sm);
}

/* ── Pencil affordance ── */
.cell-pencil {
  position: absolute;
  right: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  line-height: 0;
  opacity: 0;
  transition: opacity 0.1s;
  pointer-events: none;
}

@media (hover: hover) {
  .cell:not(.cell--error):hover .cell-pencil {
    opacity: 1;
  }
}

.cell--active .cell-pencil {
  opacity: 1;
}

/* Hide pencil on error cells */
.cell-display--error .cell-pencil {
  display: none;
}
</style>
