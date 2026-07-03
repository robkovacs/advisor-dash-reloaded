import { ref, watch } from 'vue'

const STORAGE_KEY = 'firm-members'

const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null')
export const firmMembers = ref(stored ?? [])

watch(firmMembers, (val) => {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(val))
}, { deep: true })

export function clearFirmMembers() {
  firmMembers.value = []
  sessionStorage.removeItem(STORAGE_KEY)
}

export function seedFirmMembers(data) {
  firmMembers.value = data
}
