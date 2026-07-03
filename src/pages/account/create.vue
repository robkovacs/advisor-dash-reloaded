<script setup>
import { computed, provide, ref, watch } from 'vue'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'

definePage({ meta: { title: 'Create account' } })
import FocusedLayout from '@/layouts/FocusedLayout.vue'
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
  <FocusedLayout tight-top>
    <template v-if="showLoginNotice" #above>
      <Notice class="login-notice">Create or join a firm to continue.</Notice>
    </template>
    <ProgressBar :value="progress" class="progress--create-account" />
    <Transition :name="transition" mode="out-in">
      <RouterView :key="$route.path" />
    </Transition>
  </FocusedLayout>
</template>

<style scoped>
.login-notice {
  width: 100%;
  max-width: 31rem;
}

.progress--create-account {
  position: absolute;
  top: 0;
  left: 0;
}
</style>
