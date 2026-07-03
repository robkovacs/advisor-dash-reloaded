import { ref, watch } from 'vue'

const STORAGE_KEY = 'clients'

const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null')
export const clients = ref(stored ?? [])

watch(clients, (val) => {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(val))
}, { deep: true })

export function clearClients() {
  clients.value = []
  sessionStorage.removeItem(STORAGE_KEY)
}

export function seedClients(data) {
  clients.value = data
}
