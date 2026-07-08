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
    <Stack v-if="variant === 'primary'" gap="6" class="primary-layout">
      <Stack gap="3" class="primary-content">
        <Row align="center" gap="4">
          <IconBox><slot name="icon" /></IconBox>
          <h3>{{ title }}</h3>
        </Row>
        <p>{{ description }}</p>
      </Stack>
      <slot name="actions" />
    </Stack>

    <Row v-else align="center" class="secondary-outer" gap="6">
      <Row align="center" gap="4">
        <IconBox><slot name="icon" /></IconBox>
        <Stack gap="1">
          <h3>
            {{ title }} <Badge v-if="badge">{{ badge }}</Badge>
          </h3>
          <p>{{ description }}</p>
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
  container-type: inline-size;
}

@container (max-width: 26rem) {
  :deep(.secondary-outer) {
    flex-direction: column;
    align-items: flex-start;
  }
  :deep(.secondary-outer > .flex-space) {
    display: none;
  }
}

.primary-layout {
  height: 100%;
}

.primary-content {
  flex: 1;
}
</style>
