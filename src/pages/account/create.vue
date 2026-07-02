<script setup>
import { computed, provide, ref, watch } from 'vue'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import Logo from '@/components/Logo.vue'
import Notice from '@/components/Notice.vue'
import ProgressBar from '@/components/ProgressBar.vue'
import { formData, fromLogin } from '@/use/useCreateAccountForm'

const route = useRoute()
const router = useRouter()

const STEPS = [
  '/account/create/check-email',
  '/account/create/confirm-email',
  '/account/create/review-firms',
  '/account/create/create-firm',
  '/account/create/personal-info',
  '/account/create/create-account',
  '/account/create/protect-account',
]
const TOTAL_STEPS = STEPS.length + 1
const forward = ref(true)

const stepIndex = computed(() => Math.max(0, STEPS.indexOf(route.path)))
const progress = computed(() => ((stepIndex.value + 1) / TOTAL_STEPS) * 100)
const transition = computed(() =>
  forward.value ? 'step-forward' : 'step-back',
)

watch(
  () => route.path,
  (newPath, oldPath) => {
    const ni = STEPS.indexOf(newPath)
    const oi = STEPS.indexOf(oldPath)
    if (ni !== -1 && oi !== -1) forward.value = ni > oi
  },
)

const showLoginNotice = computed(() => fromLogin.value && stepIndex.value === 0)

function next(data = {}) {
  Object.assign(formData, data)
  const nextPath = STEPS[stepIndex.value + 1] ?? '/dashboard'
  if (!nextPath.startsWith('/account')) localStorage.setItem('authed', 'true')
  router.push(nextPath)
}

function back() {
  router.back()
}

onBeforeRouteUpdate((to) => {
  const toIdx = STEPS.indexOf(to.path)
  if (toIdx > 0 && !formData.emailWork) return STEPS[0]
})

provide('formData', formData)
provide('next', next)
provide('back', back)
</script>

<template>
  <main>
    <Logo />
    <Notice v-if="showLoginNotice" class="login-notice">
      Create or join a firm to continue.
    </Notice>
    <div class="content--focused">
      <ProgressBar :value="progress" class="progress--create-account" />
      <Transition :name="transition" mode="out-in">
        <RouterView :key="$route.path" />
      </Transition>
    </div>
  </main>
</template>

<style scoped>
main {
  width: 100vw;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-12) var(--space-4);
  background-color: var(--color-bg-subtle);
  flex-direction: column;
  gap: var(--space-8);
}

.login-notice {
  width: 100%;
  max-width: 31rem;
}

.content--focused {
  background-color: var(--color-bg);
  border-radius: var(--border-radius-lg);
  width: 100%;
  max-width: 31rem;
  padding: var(--space-8) var(--space-12) var(--space-12);
  box-shadow:
    0 2px 4px -2px rgba(0, 0, 0, 0.1),
    0 4px 6px -1px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.progress--create-account {
  position: absolute;
  top: 0;
  left: 0;
}
</style>

