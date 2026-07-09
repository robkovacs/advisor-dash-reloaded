<script setup>
import Stack from '@/components/Stack.vue'
import Row from '@/components/Row.vue'
import Box from '@/components/Box.vue'
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
  <Box padding="6" class="firm-setup-card">
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
  </Box>
</template>

<style scoped>
.firm-setup-card {
  background: var(--color-bg);
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
