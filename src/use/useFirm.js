import { reactive, watch } from 'vue'

const STORAGE_KEY = 'firm'

const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '{}')
export const firm = reactive(stored)

watch(firm, (val) => {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(val))
})

export function clearFirm() {
  Object.keys(firm).forEach((k) => delete firm[k])
  sessionStorage.removeItem(STORAGE_KEY)
}

export function seedFirm(data) {
  Object.assign(firm, data)
}
