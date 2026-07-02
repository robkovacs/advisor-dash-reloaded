<script setup>
import { onMounted } from 'vue'
import Logo from '@/components/Logo.vue'
import Stack from '@/components/Stack.vue'

onMounted(() => {
  const channel = new BroadcastChannel('email-confirmation')
  channel.postMessage({ emailConfirmed: true })
  channel.close()
})
</script>

<template>
  <main>
    <Logo />
    <div class="content--focused">
      <Stack gap="4">
        <h2>Work email confirmed!</h2>
        <p>You can close this tab and continue setting up your account.</p>
      </Stack>
    </div>
  </main>
</template>

<style scoped>
main {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-subtle);
  flex-direction: column;
  gap: var(--space-8);
}

.content--focused {
  background-color: var(--color-bg);
  border-radius: var(--border-radius-lg);
  width: 100%;
  max-width: 31rem;
  padding: var(--space-12);
  box-shadow:
    0 2px 4px -2px rgba(0, 0, 0, 0.1),
    0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
</style>
