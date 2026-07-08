<script setup>
import { ref, useId } from 'vue'
import FormField from './FormField.vue'
import IconUpload from '~icons/ph/upload-simple'
import IconFile from '~icons/ph/file'
import IconX from '~icons/ph/x'

const props = defineProps({
  modelValue: { default: null },
  label: String,
  multiple: Boolean,
  accept: String,
  error: String,
  optional: Boolean,
  hideError: Boolean,
})

const emit = defineEmits(['update:modelValue'])

const inputId = useId()
const inputRef = ref(null)
const draggedOver = ref(false)
const files = ref([])

function openPicker() {
  inputRef.value?.click()
}

function onFileChange(e) {
  addFiles(Array.from(e.target.files))
  e.target.value = ''
}

function onDrop(e) {
  draggedOver.value = false
  addFiles(
    Array.from(e.dataTransfer.files).slice(0, props.multiple ? undefined : 1),
  )
}

function addFiles(incoming) {
  files.value = props.multiple
    ? [...files.value, ...incoming]
    : incoming.slice(0, 1)
  emit(
    'update:modelValue',
    props.multiple ? files.value : (files.value[0] ?? null),
  )
}

function removeFile(index) {
  files.value = files.value.filter((_, i) => i !== index)
  emit(
    'update:modelValue',
    props.multiple ? files.value : (files.value[0] ?? null),
  )
}
</script>

<template>
  <FormField
    :label="label"
    :input-id="inputId"
    :error="error"
    :optional="optional"
    :hide-error="hideError"
  >
    <template v-if="$slots.helper" #helper>
      <slot name="helper" />
    </template>
    <template #default>
      <input
        :id="inputId"
        ref="inputRef"
        type="file"
        :multiple="multiple"
        :accept="accept"
        class="file-native"
        @change="onFileChange"
      />
      <div
        class="dropzone"
        :class="{
          'dropzone--over': draggedOver,
          'dropzone--filled': !multiple && files.length > 0,
          'dropzone--invalid': !!error,
        }"
        @dragover.prevent="draggedOver = true"
        @dragleave="draggedOver = false"
        @drop.prevent="onDrop"
      >
        <div class="dropzone-description">
          <span v-if="multiple || files.length === 0"
            >Drag and drop {{ multiple ? 'files' : 'a file' }} here, or</span
          >
          <span v-else class="dropzone-filename">{{ files[0].name }}</span>
        </div>
        <button type="button" class="pick-button" @click="openPicker">
          {{
            !multiple && files.length > 0
              ? 'Choose a different file'
              : 'Choose a file'
          }}
        </button>
      </div>
      <ul v-if="multiple && files.length > 0" class="file-list">
        <li v-for="(file, i) in files" :key="i" class="file-list-item">
          <span class="file-name">{{ file.name }}</span>
          <button
            type="button"
            class="remove-button"
            :aria-label="`Remove ${file.name}`"
            @click="removeFile(i)"
          >
            <IconX aria-hidden="true" />
          </button>
        </li>
      </ul>
    </template>
  </FormField>
</template>

<style scoped>
.file-native {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}

.dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-8) var(--space-6);
  border: 1px dashed var(--color-input-border);
  border-radius: var(--border-radius-md);
  text-align: center;
  font-size: var(--font-size-md);
  color: var(--color-text-muted);
}

.dropzone--over {
  background-color: var(--color-accent-subtle);
  border-color: var(--color-accent-border);
}

.dropzone--invalid {
  border-color: var(--color-error-border);
}

.dropzone--filled .pick-button {
  order: 2;
}

.dropzone-description {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
}

.upload-icon {
  font-size: 1.5rem;
}

.dropzone-filename {
  color: var(--color-text);
  overflow-wrap: anywhere;
}

.pick-button {
  appearance: none;
  border: 1px solid var(--color-input-border);
  border-radius: var(--border-radius-md);
  background: transparent;
  padding: var(--space-2) var(--space-4);
  font-weight: var(--font-weight-bold);
  font-family: inherit;
  color: var(--color-text);
  cursor: pointer;
}

.pick-button:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

@media (hover: hover) {
  .pick-button:hover {
    background: color-mix(in srgb, var(--color-text) 6%, transparent);
  }
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  list-style: none;
  padding: 0;
  margin: var(--space-2) 0 0;
}

.file-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
  background: var(--color-bg-subtle);
  border: 1px solid var(--color-line);
  border-radius: var(--border-radius-md);
  padding: var(--space-2) var(--space-3);
}

.file-name {
  overflow-wrap: anywhere;
  color: var(--color-text);
}

.remove-button {
  appearance: none;
  border: none;
  background: none;
  padding: var(--space-1);
  border-radius: var(--border-radius-sm);
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  font-size: 1rem;
}

.remove-button:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

@media (hover: hover) {
  .remove-button:hover {
    color: var(--color-text);
    background: var(--color-bg-muted);
  }
}
</style>
