<script setup>
import IconWarningCircle from '~icons/ph/warning-circle'

defineProps({
  id: String,
  message: String,
})
</script>

<template>
  <div class="error-wrap" :class="{ active: message }">
    <span :id="id" role="alert" class="input-error">
      <template v-if="message">
        <IconWarningCircle class="icon" />{{ message }}
      </template>
    </span>
  </div>
</template>

<style scoped>
.error-wrap {
  font-size: var(--font-size-sm);
  display: grid;
  grid-template-rows: 0fr;
  min-height: calc(var(--font-size-sm) * var(--line-height-body));
  transition: grid-template-rows 250ms ease-in;
}

.error-wrap.active {
  grid-template-rows: 1fr;
}

.input-error {
  overflow: hidden;
  line-height: var(--line-height-body);
  color: var(--color-error);
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
}

.icon {
  flex: 0 0 1em;
  margin-top: calc(
    ((var(--font-size-sm) * var(--line-height-body)) - var(--font-size-sm)) / 2
  );
}
</style>
