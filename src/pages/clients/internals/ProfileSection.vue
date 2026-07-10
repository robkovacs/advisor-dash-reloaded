<script setup>
import { nextTick, ref } from 'vue'
import Stack from '@/components/Stack.vue'
import Row from '@/components/Row.vue'
import Button from '@/components/Button.vue'

defineProps({ title: String })
const emit = defineEmits(['edit', 'save', 'cancel'])
const editing = ref(false)
const bodyRef = ref(null)

function startEdit() {
  editing.value = true
  emit('edit')
  nextTick(() => {
    const first = bodyRef.value?.querySelector('input, select, textarea')
    if (first) {
      first.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      first.focus()
    }
  })
}
function save() {
  emit('save')
}
function cancel() {
  editing.value = false
  emit('cancel')
}

defineExpose({
  close: () => {
    editing.value = false
  },
})
</script>

<template>
  <div class="profile-section">
    <div class="section-header">
      <span class="section-title">{{ title }}</span>
      <Button v-if="!editing" variant="link" size="small" @click="startEdit"
        >Edit</Button
      >
    </div>
    <div ref="bodyRef" class="section-body">
      <Stack v-if="!editing" gap="6">
        <slot name="view" />
      </Stack>
      <Stack v-else gap="4">
        <slot name="edit" />
        <Row gap="3">
          <Button variant="primary" size="small" @click="save"
            >Save changes</Button
          >
          <Button size="small" @click="cancel">Cancel</Button>
        </Row>
      </Stack>
    </div>
  </div>
</template>

<style scoped>
.profile-section {
  border: 1px solid var(--color-line);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  width: 100%;
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-6);
  background: var(--color-bg-subtle);
  border-bottom: 1px solid var(--color-line);
}
.section-title {
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-md);
  white-space: nowrap;
}

.section-body {
  padding: var(--space-6);
  background: var(--color-bg);
}
</style>
