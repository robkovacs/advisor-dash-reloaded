<script setup>
import { useToast } from '@/use/useToast'
import IconCheckCircle from '~icons/ph/check-circle-fill'
import IconX from '~icons/ph/x'

const { toasts, dismissToast } = useToast()
</script>

<template>
  <div class="toast-stack" role="region" aria-label="Notifications">
    <TransitionGroup name="toast">
      <div v-for="toast in toasts" :key="toast.id" class="toast" role="status">
        <IconCheckCircle class="toast-icon" aria-hidden="true" />
        <span class="toast-message">{{ toast.message }}</span>
        <button
          type="button"
          class="toast-dismiss"
          aria-label="Dismiss notification"
          @click="dismissToast(toast.id)"
        >
          <IconX aria-hidden="true" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-stack {
  position: fixed;
  bottom: var(--space-6);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  z-index: 1000;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--border-radius-md);
  background: var(--color-success-subtle);
  border: 1px solid var(--color-success-border);
  color: var(--color-success-text);
  box-shadow:
    0 4px 6px -1px rgb(0 0 0 / 0.1),
    0 2px 4px -2px rgb(0 0 0 / 0.1);
  pointer-events: auto;
  white-space: nowrap;
}

.toast-icon {
  flex-shrink: 0;
  font-size: var(--font-size-lg);
  color: var(--color-success);
}

.toast-message {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
}

.toast-dismiss {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: var(--space-1);
  margin-left: var(--space-1);
  cursor: pointer;
  color: inherit;
  border-radius: var(--border-radius-sm);
  line-height: 0;
}

@media (hover: hover) {
  .toast-dismiss:hover {
    background: color-mix(in srgb, currentColor 12%, transparent);
  }
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
