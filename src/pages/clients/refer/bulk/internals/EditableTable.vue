<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import EditableCell from './EditableCell.vue'
import Button from '@/components/Button.vue'
import IconTrash from '~icons/ph/trash'

const props = defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, required: true },
  errors: { type: Function, required: true },
})

const emit = defineEmits(['update', 'remove', 'leaveRow'])

// activeCell: which cell has tabindex=0 and (while focus is inside the table) shows the ring
// editingCell: which cell has an active input
// colKey can be a real column key OR 'delete' for the action button
const activeCell = ref(null) // { rowId, colKey }
const editingCell = ref(null) // { rowId, colKey }

// Tracks whether focus is currently anywhere inside the table. Without this,
// activeCell (and its ring) would stay stuck on the last cell after the user
// tabs past the table to an element like "Add referral" — showing a stale
// ring on the cell at the same time as the browser's real ring on the button.
const tableFocused = ref(false)
function onTableFocusIn() {
  tableFocused.value = true
}
function onTableFocusOut(e) {
  if (!e.currentTarget.contains(e.relatedTarget)) tableFocused.value = false
}

// Ref registry: '${rowId}-${colKey}' → element with .focusDisplay() or .focus()
const cellRefs = new Map()
function setCellRef(rowId, colKey, el) {
  const key = `${rowId}-${colKey}`
  if (el) cellRefs.set(key, el)
  else cellRefs.delete(key)
}

function focusCell(rowId, colKey) {
  const cell = cellRefs.get(`${rowId}-${colKey}`)
  if (!cell) return
  // EditableCell exposes focusDisplay(); plain elements have focus()
  if (cell.focusDisplay) {
    cell.focusDisplay()
    // Scroll the td into view
    cell.el?.value?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  } else if (cell.focus) {
    cell.focus()
    cell.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
  }
}

// The full column sequence includes 'delete' at the end
function colSequence() {
  return [...props.columns.map((c) => c.key), 'delete']
}

// Pure position match — always tracks the last-focused cell, regardless of
// whether focus is currently inside the table. This is the roving tabindex
// target: it must never go "unset" while focus is elsewhere, or the whole
// table drops out of the tab order.
function isRovingTarget(rowId, colKey) {
  const a = activeCell.value
  return a?.rowId === rowId && a?.colKey === colKey
}

// Ring visibility — only show the highlight while focus is actually inside
// the table (see tableFocused above), so a stale ring doesn't linger after
// tabbing away to something like "Add referral".
function isActive(rowId, colKey) {
  return tableFocused.value && isRovingTarget(rowId, colKey)
}

// Emits 'leaveRow' the moment focus actually moves to a DIFFERENT row (or
// leaves the table entirely) — not on every cell blur within the same row.
// This is what should trigger a row's required-field errors, so tabbing
// company name -> first name -> last name within one row doesn't light it
// up until the user is actually done with that row.
const currentRowId = computed(() => (tableFocused.value ? activeCell.value?.rowId ?? null : null))
watch(currentRowId, (next, prev) => {
  if (prev != null && prev !== next) emit('leaveRow', prev)
})

function isEditing(rowId, colKey) {
  const e = editingCell.value
  return e?.rowId === rowId && e?.colKey === colKey
}

function tabindexFor(rowId, colKey) {
  if (activeCell.value) return isRovingTarget(rowId, colKey) ? 0 : -1
  const firstRow = props.rows[0]
  const firstCol = props.columns[0]
  return firstRow?.id === rowId && firstCol?.key === colKey ? 0 : -1
}

function getAdjacentCell(rowId, colKey, direction) {
  const seq = colSequence()
  const ri = props.rows.findIndex((r) => r.id === rowId)
  const ci = seq.indexOf(colKey)
  let nr = ri,
    nc = ci
  if (direction === 'up') nr = Math.max(0, ri - 1)
  if (direction === 'down') nr = Math.min(props.rows.length - 1, ri + 1)
  if (direction === 'left') nc = Math.max(0, ci - 1)
  if (direction === 'right') nc = Math.min(seq.length - 1, ci + 1)
  if (nr === ri && nc === ci) return null
  return { rowId: props.rows[nr].id, colKey: seq[nc] }
}

function onActivate(rowId, colKey) {
  activeCell.value = { rowId, colKey }
}

function onEnterEdit(rowId, colKey) {
  activeCell.value = { rowId, colKey }
  editingCell.value = { rowId, colKey }
}

// The single place that decides where focus lands after edit mode ends —
// either the next cell (Enter/Tab) or back on the same cell (blur/select
// change with no direction). EditableCell no longer refocuses itself, so
// this is the only actor moving focus, avoiding a race between two competing
// nextTick() focus calls.
function onCommit(rowId, colKey, value, direction) {
  emit('update', rowId, colKey, value)
  editingCell.value = null
  const target = (direction && getAdjacentCell(rowId, colKey, direction)) || {
    rowId,
    colKey,
  }
  activeCell.value = target
  nextTick(() => focusCell(target.rowId, target.colKey))
}

function onCancel(rowId, colKey) {
  editingCell.value = null
  activeCell.value = { rowId, colKey }
  nextTick(() => focusCell(rowId, colKey))
}

function onNav(rowId, colKey, direction) {
  const next = getAdjacentCell(rowId, colKey, direction)
  if (next) {
    activeCell.value = next
    nextTick(() => focusCell(next.rowId, next.colKey))
  }
}

function onDeleteFocus(rowId) {
  activeCell.value = { rowId, colKey: 'delete' }
}

function onDeleteKeydown(e, rowId) {
  const dirMap = {
    ArrowLeft: 'left',
    ArrowRight: 'right',
    ArrowUp: 'up',
    ArrowDown: 'down',
  }
  if (dirMap[e.key]) {
    e.preventDefault()
    onNav(rowId, 'delete', dirMap[e.key])
  }
}

// ── Error navigation ──
const errorList = computed(() => {
  const out = []
  for (const row of props.rows) {
    const errs = props.errors(row)
    for (const col of props.columns) {
      if (errs[col.key]) out.push({ rowId: row.id, colKey: col.key })
    }
  }
  return out
})

const errorCursor = ref(-1)

function goToError(delta) {
  if (errorList.value.length === 0) return
  errorCursor.value =
    (errorCursor.value + delta + errorList.value.length) %
    errorList.value.length
  const { rowId, colKey } = errorList.value[errorCursor.value]
  editingCell.value = null
  activeCell.value = { rowId, colKey }
  nextTick(() => focusCell(rowId, colKey))
}

function nextError() {
  goToError(1)
}
function prevError() {
  goToError(-1)
}

// Enters edit mode on the first column of a row — used to jump straight
// into a newly added row so the user can start typing immediately, rather
// than landing on the highlighted-but-not-editing display state.
function focusRowStart(rowId) {
  const firstCol = props.columns[0]
  if (!firstCol) return
  onEnterEdit(rowId, firstCol.key)
}

defineExpose({ nextError, prevError, focusRowStart })
</script>

<template>
  <table
    class="editable-table"
    role="grid"
    @focusin="onTableFocusIn"
    @focusout="onTableFocusOut"
  >
    <colgroup>
      <col
        v-for="col in columns"
        :key="col.key"
        :style="{ width: col.width || 'auto' }"
      />
      <col style="width: 56px" />
    </colgroup>
    <thead>
      <tr>
        <th v-for="col in columns" :key="col.key" class="th" scope="col">
          {{ col.label }}
        </th>
        <th class="th th--action" scope="col">
          <span class="sr-only">Actions</span>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in rows" :key="row.id" class="tbody-row">
        <EditableCell
          v-for="col in columns"
          :key="col.key"
          :ref="(el) => setCellRef(row.id, col.key, el)"
          :data-row-id="row.id"
          :data-col-key="col.key"
          :value="row[col.key] || ''"
          :type="col.type"
          :options="col.options || []"
          :error="errors(row)[col.key] || ''"
          :editing="isEditing(row.id, col.key)"
          :active="isActive(row.id, col.key)"
          :tabindex="tabindexFor(row.id, col.key)"
          @activate="onActivate(row.id, col.key)"
          @enter-edit="onEnterEdit(row.id, col.key)"
          @commit="(val, dir) => onCommit(row.id, col.key, val, dir)"
          @cancel="onCancel(row.id, col.key)"
          @nav="(dir) => onNav(row.id, col.key, dir)"
        />

        <td class="td td--action">
          <Button
            :ref="(el) => setCellRef(row.id, 'delete', el?.$el || el)"
            variant="tertiary"
            size="small"
            iconOnly
            destructive
            :tabindex="tabindexFor(row.id, 'delete')"
            :aria-label="`Remove ${row.companyName || 'unnamed company'}`"
            @focus="onDeleteFocus(row.id)"
            @keydown="(e) => onDeleteKeydown(e, row.id)"
            @click="emit('remove', row.id)"
          >
            <IconTrash aria-hidden="true" />
          </Button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.editable-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: auto;
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-line);
}

.th {
  text-align: left;
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-muted);
  border-top: none;
  /* box-shadow instead of border-bottom: with border-collapse + position:
     sticky, a collapsed border can visually disappear on scroll in Chromium
     since the sticky header repaints without the border it shares with the
     row below. box-shadow isn't subject to that collapsing behavior. */
  box-shadow: 0 1px 0 0 var(--color-line);
  white-space: nowrap;
  background: var(--color-bg);
  position: sticky;
  top: 0;
  z-index: 10;
}

.th--action {
  width: 56px;
}

.tbody-row:last-child .td,
.tbody-row:last-child :deep(.cell) {
  border-bottom: none;
}

.td {
  border-top: none;
  border-bottom: 1px solid var(--color-line);
  vertical-align: middle;
}

.td--action {
  padding: var(--space-1) var(--space-4) var(--space-1) var(--space-2);
  text-align: center;
  vertical-align: middle;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
