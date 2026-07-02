import { reactive, watch } from 'vue'

const STORAGE_KEY = 'refer-client-form'
const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '{}')
export const referFormData = reactive(stored)
watch(referFormData, (val) => { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(val)) })

export function clearReferForm() {
  Object.keys(referFormData).forEach((k) => delete referFormData[k])
  sessionStorage.removeItem(STORAGE_KEY)
}
