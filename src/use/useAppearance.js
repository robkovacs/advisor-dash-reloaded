import { ref } from 'vue'

const mq = window.matchMedia('(prefers-color-scheme: dark)')
const stored = localStorage.getItem('appearance')
const isDark = ref(stored !== null ? stored === 'dark' : mq.matches)

function apply() {
  document.documentElement.dataset.theme = isDark.value ? 'dark' : 'light'
}

apply()

mq.addEventListener('change', (e) => {
  if (localStorage.getItem('appearance') === null) {
    isDark.value = e.matches
    apply()
  }
})

export function useAppearance() {
  function toggle() {
    isDark.value = !isDark.value
    localStorage.setItem('appearance', isDark.value ? 'dark' : 'light')
    apply()
  }
  return { isDark, toggle }
}
