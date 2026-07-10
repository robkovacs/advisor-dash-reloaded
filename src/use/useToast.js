import { reactive } from 'vue'

const toasts = reactive([])
let nextId = 0

export function showToast(message, { duration = 4000 } = {}) {
  const id = ++nextId
  toasts.push({ id, message })
  setTimeout(() => dismissToast(id), duration)
  return id
}

export function dismissToast(id) {
  const idx = toasts.findIndex((t) => t.id === id)
  if (idx !== -1) toasts.splice(idx, 1)
}

export function useToast() {
  return { toasts, showToast, dismissToast }
}
