<script setup>
import Stack from '@/components/Stack.vue'
import Row from '@/components/Row.vue'
import IconBox from '@/components/IconBox.vue'
import FlexSpace from '@/components/FlexSpace.vue'
import Badge from '@/components/Badge.vue'

defineProps({
  title: { type: String, required: true },
  description: { type: String, required: true },
  variant: { type: String, default: 'secondary' },
  badge: { type: String, default: null },
})
</script>

<template>
  <div class="firm-setup-card">
    <Stack v-if="variant === 'primary'" gap="6">
      <Stack gap="4">
        <Row align="center" gap="4">
          <IconBox><slot name="icon" /></IconBox>
          <h3>{{ title }}</h3>
        </Row>
        <p>{{ description }}</p>
      </Stack>
      <slot name="actions" />
    </Stack>

    <Row v-else align="center">
      <Row align="center" gap="4">
        <IconBox><slot name="icon" /></IconBox>
        <Stack gap="2">
          <h4>
            {{ title }} <Badge v-if="badge">{{ badge }}</Badge>
          </h4>
          <p class="text-sm">{{ description }}</p>
        </Stack>
      </Row>
      <FlexSpace />
      <slot name="actions" />
    </Row>
  </div>
</template>

<style scoped>
.firm-setup-card {
  padding: var(--space-6);
  background: var(--color-bg);
  border: 1px solid var(--color-line);
  border-radius: var(--border-radius-md);
  width: 100%;
}
</style>
