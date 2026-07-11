<script setup>
import { computed, nextTick, ref } from 'vue'
import Button from './Button.vue'
import Badge from './Badge.vue'
import Popover from './Popover.vue'
import IconCaretDown from '~icons/ph/caret-down'
import IconMagnifyingGlass from '~icons/ph/magnifying-glass'

const props = defineProps({
  label: { type: String, required: true },
  options: { type: Array, required: true },
  modelValue: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue'])

const popoverRef = ref(null)
const triggerRef = ref(null)
const searchRef = ref(null)
const panelRef = ref(null)
const search = ref('')

const selectedCount = computed(() => props.modelValue.length)

const filteredOptions = computed(() => {
  if (!search.value) return props.options
  const q = search.value.toLowerCase()
  return props.options.filter((o) => o.label.toLowerCase().includes(q))
})

function isSelected(value) {
  return props.modelValue.includes(value)
}

function toggleOption(value) {
  const current = [...props.modelValue]
  const idx = current.indexOf(value)
  if (idx > -1) {
    current.splice(idx, 1)
  } else {
    current.push(value)
  }
  emit('update:modelValue', current)
}

function openPopover() {
  popoverRef.value?.open()
  nextTick(() => searchRef.value?.focus())
}

function closePopover() {
  popoverRef.value?.close()
}

function onToggle() {
  if (popoverRef.value?.isOpen.value) {
    closePopover()
  } else {
    openPopover()
  }
}

function onPopoverOpen() {
  nextTick(() => searchRef.value?.focus())
}

function onPopoverClose() {
  search.value = ''
  // Return focus to trigger button
  nextTick(() => triggerRef.value?.$el?.focus())
}

function onTriggerKeydown(e) {
  if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
    if (!popoverRef.value?.isOpen.value) {
      e.preventDefault()
      openPopover()
    }
  }
}

function onPanelKeydown(e) {
  if (e.key === 'Escape') {
    e.preventDefault()
    e.stopPropagation()
    closePopover()
  } else if (e.key === 'Tab') {
    // Trap focus within the panel
    const focusable = panelRef.value?.querySelectorAll(
      'input, [tabindex]:not([tabindex="-1"])',
    )
    if (!focusable?.length) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }
}
</script>

<template>
  <Popover
    ref="popoverRef"
    placement="bottom-start"
    :offset-px="4"
    @open="onPopoverOpen"
    @close="onPopoverClose"
  >
    <template #trigger>
      <Button
        ref="triggerRef"
        variant="secondary"
        class="multi-select-trigger"
        :class="{ 'multi-select-trigger--active': selectedCount > 0 }"
        :aria-expanded="popoverRef?.isOpen.value"
        aria-haspopup="listbox"
        @click="onToggle"
        @keydown="onTriggerKeydown"
      >
        {{ label }}
        <Badge v-if="selectedCount > 0" variant="accent" class="count-badge">
          {{ selectedCount }}
        </Badge>
        <IconCaretDown class="caret" aria-hidden="true" />
      </Button>
    </template>

    <div
      ref="panelRef"
      class="multi-select-panel"
      role="listbox"
      :aria-label="label"
      aria-multiselectable="true"
      @keydown="onPanelKeydown"
    >
      <div class="multi-select-search">
        <IconMagnifyingGlass class="search-icon" aria-hidden="true" />
        <input
          ref="searchRef"
          v-model="search"
          type="search"
          class="search-input"
          :placeholder="`Search ${label.toLowerCase()}…`"
          :aria-label="`Filter ${label.toLowerCase()}`"
        />
      </div>
      <div class="multi-select-options">
        <label
          v-for="option in filteredOptions"
          :key="option.value"
          class="multi-select-option"
          role="option"
          :aria-selected="isSelected(option.value)"
        >
          <input
            type="checkbox"
            class="option-checkbox"
            :checked="isSelected(option.value)"
            @change="toggleOption(option.value)"
          />
          <span class="option-label">{{ option.label }}</span>
        </label>
        <div v-if="filteredOptions.length === 0" class="multi-select-empty">
          No results
        </div>
      </div>
    </div>
  </Popover>
</template>

<style scoped>
.multi-select-trigger {
  gap: var(--space-2);
}

.multi-select-trigger--active {
  border-color: var(--color-accent);
}

@media (hover: hover) {
  .multi-select-trigger--active:hover {
    background: color-mix(in srgb, var(--color-accent) 12%, transparent);
  }
}

.count-badge {
  font-size: var(--font-size-xs);
  min-width: 1.25rem;
  text-align: center;
}

.caret {
  font-size: 0.75em;
  color: var(--color-text-muted);
}

.multi-select-panel {
  display: flex;
  flex-direction: column;
  min-width: 12rem;
  max-width: 18rem;
  max-height: 18rem;
  overflow: hidden;
  border-radius: var(--border-radius-md);
}

.multi-select-search {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--color-line);
  background: var(--color-bg);
}

.search-icon {
  color: var(--color-text-muted);
  font-size: var(--font-size-md);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font: inherit;
  font-size: var(--font-size-md);
  color: var(--color-text);
  min-width: 0;
}

.search-input::placeholder {
  color: var(--color-text-muted);
}

.multi-select-options {
  overflow-y: auto;
  padding: var(--space-1);
}

.multi-select-option {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  user-select: none;
}

@media (hover: hover) {
  .multi-select-option:hover {
    background: var(--color-bg-muted);
  }
}

.option-checkbox {
  cursor: pointer;
  flex-shrink: 0;
}

.option-label {
  font-size: var(--font-size-md);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.multi-select-empty {
  padding: var(--space-3);
  text-align: center;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}
</style>
