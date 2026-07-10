import { nextTick } from 'vue'

export function focusFirstError(formEl) {
  nextTick(() => {
    const root = formEl ?? document
    const first = root.querySelector('[aria-invalid="true"]')
    if (first) {
      first.focus()
      first.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
}
