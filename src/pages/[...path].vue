<script setup>
import Logo from '@/components/Logo.vue'
import Button from '@/components/Button.vue'
import Stack from '@/components/Stack.vue'

definePage({ meta: { noLayout: true, title: 'Page not found' } })
</script>

<template>
  <main>
    <Logo />
    <div class="content--focused">
      <Stack gap="8">
        <h1>Page not found</h1>
        <p>This page doesn't exist.</p>
        <Button to="/" variant="primary">Go home</Button>
      </Stack>
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

.content--focused {
  background-color: var(--color-bg);
  border-radius: var(--border-radius-lg);
  width: 100%;
  max-width: 31rem;
  padding: var(--space-8) var(--space-12) var(--space-12);
  box-shadow:
    0 2px 4px -2px rgba(0, 0, 0, 0.1),
    0 4px 6px -1px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
</style>
