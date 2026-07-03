import { reactive, watch } from 'vue'

const STORAGE_KEY = 'current-user'

const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '{}')
export const currentUser = reactive(stored)

watch(currentUser, (val) => {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(val))
})

export function clearCurrentUser() {
  Object.keys(currentUser).forEach((k) => delete currentUser[k])
  sessionStorage.removeItem(STORAGE_KEY)
}

export function seedCurrentUser(data) {
  Object.assign(currentUser, data)
}
