<script setup>
import { inject, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import IconArrowLeft from '~icons/ph/arrow-left'
import Stack from '@/components/Stack.vue'
import Row from '@/components/Row.vue'
import Button from '@/components/Button.vue'
import { createAccountFormData } from '@/use/useCreateAccountForm'

const next = inject('next')
const back = inject('back')
const router = useRouter()

const channel = new BroadcastChannel('email-confirmation')
channel.onmessage = (event) => {
  if (event.data?.emailConfirmed) {
    channel.close()
    next()
  }
}

function openEmail() {
  window.open(
    router.resolve({ path: '/account/confirm-email', query: { email: createAccountFormData.emailWork } }).href,
    '_blank',
  )
}

onUnmounted(() => channel.close())
</script>

<template>
  <Stack gap="8">
    <Stack gap="4">
      <Button variant="link" size="small" @click="back()"
        ><IconArrowLeft />Back</Button
      >
      <h2>Confirm your work email</h2>
    </Stack>
    <Stack gap="3">
      <p>
        We sent a confirmation link via email to
        <strong>{{ createAccountFormData.emailWork }}</strong
        >.
      </p>
    </Stack>
    <Stack gap="4">
      <Button variant="primary" disabled>Check your email to continue</Button>
      <Row gap="6" justify="center">
        <Button variant="link" size="small" @click="openEmail()">Resend</Button>
        <Button variant="link" size="small" @click="back()"
          >Update email address</Button
        >
      </Row>
    </Stack>
  </Stack>
</template>
