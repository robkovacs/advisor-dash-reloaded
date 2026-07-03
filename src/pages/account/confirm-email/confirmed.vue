<script setup>
import { onMounted } from 'vue'
import FocusedLayout from '@/layouts/FocusedLayout.vue'
import Stack from '@/components/Stack.vue'

onMounted(() => {
  const channel = new BroadcastChannel('email-confirmation')
  channel.postMessage({ emailConfirmed: true })
  channel.close()
})
</script>

<template>
  <FocusedLayout stretch>
    <Stack gap="4">
      <h2>Work email confirmed!</h2>
      <p>You can close this tab and continue setting up your account.</p>
    </Stack>
  </FocusedLayout>
</template>
