import { reactive, ref, watch } from 'vue'

export const fromLogin = ref(false)

const STORAGE_KEY = 'create-account-form'

const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '{}')
export const formData = reactive(stored)

watch(formData, (val) => {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(val))
})

export function clearForm() {
  Object.keys(formData).forEach((k) => delete formData[k])
  sessionStorage.removeItem(STORAGE_KEY)
}
