<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom'

const props = defineProps({
  placement: {
    type: String,
    default: 'bottom-start',
    validator: (v) =>
      ['top','top-start','top-end','right','right-start','right-end',
       'bottom','bottom-start','bottom-end','left','left-start','left-end'].includes(v),
  },
  offsetPx: { type: Number, default: 8 },
})

const emit = defineEmits(['open', 'close'])

const anchorRef = ref(null)
const dialogRef = ref(null)
const isOpen = ref(false)
let cleanupAutoUpdate = null

async function updatePosition() {
  const { x, y } = await computePosition(anchorRef.value, dialogRef.value, {
    placement: props.placement,
    middleware: [offset(props.offsetPx), flip(), shift({ padding: 8 })],
  })
  dialogRef.value.style.left = `${x}px`
  dialogRef.value.style.top = `${y}px`
}

function close() {
  if (!dialogRef.value?.open) return
  dialogRef.value.close()
  isOpen.value = false
  cleanupAutoUpdate?.()
  cleanupAutoUpdate = null
  emit('close')
}

async function open() {
  if (dialogRef.value?.open) return
  dialogRef.value.style.visibility = 'hidden'
  dialogRef.value.show()
  isOpen.value = true
  await updatePosition()
  dialogRef.value.style.visibility = ''
  cleanupAutoUpdate = autoUpdate(anchorRef.value, dialogRef.value, updatePosition)
  emit('open')
}

async function toggle() {
  isOpen.value ? close() : open()
}

function onDocumentClick(e) {
  if (
    dialogRef.value?.open &&
    !dialogRef.value.contains(e.target) &&
    !anchorRef.value.contains(e.target)
  ) {
    close()
  }
}

onMounted(() => document.addEventListener('click', onDocumentClick, true))
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick, true)
  cleanupAutoUpdate?.()
})

defineExpose({ open, close, toggle, isOpen })
</script>

<template>
  <div ref="anchorRef">
    <slot name="trigger" :toggle="toggle" :is-open="isOpen" />
  </div>
  <Teleport to="body">
    <dialog ref="dialogRef" class="popover-dialog">
      <slot :close="close" />
    </dialog>
  </Teleport>
</template>

<style scoped>
.popover-dialog {
  position: fixed;
  margin: 0;
  padding: 0;
  background: var(--color-bg);
  border: 1px solid var(--color-line);
  border-radius: var(--border-radius-md);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -2px rgba(0, 0, 0, 0.1);
  color: var(--color-text);
  z-index: 9999;
}
</style>
