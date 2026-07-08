<script setup>
import FocusedLayout from '@/layouts/FocusedLayout.vue'
import Button from '@/components/Button.vue'
import Stack from '@/components/Stack.vue'

definePage({ meta: { noLayout: true, title: 'Page not found' } })
</script>

<template>
  <FocusedLayout>
    <Stack gap="6">
      <h1>Page not found</h1>
      <p>This page doesn't exist.</p>
      <Button to="/" variant="primary">Go home</Button>
    </Stack>
  </FocusedLayout>
</template>
