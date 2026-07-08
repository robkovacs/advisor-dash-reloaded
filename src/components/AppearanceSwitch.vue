<script setup>
import { useAppearance } from '@/use/useAppearance'
import IconSun from '~icons/ph/sun'
import IconMoon from '~icons/ph/moon'

const { isDark, toggle } = useAppearance()
</script>

<template>
  <button
    role="switch"
    :aria-checked="isDark"
    aria-label="Toggle appearance"
    :class="['switch', { 'switch--dark': isDark }]"
    @click="toggle"
  >
    <span class="knob">
      <IconSun v-if="!isDark" aria-hidden="true" />
      <IconMoon v-else aria-hidden="true" />
    </span>
  </button>
</template>

<style scoped>
.switch {
  display: inline-flex;
  align-items: center;
  width: 2.875rem;
  height: 1.625rem;
  border-radius: 999px;
  background: var(--color-gray-300);
  border: none;
  padding: 0.1875rem;
  cursor: pointer;
  transition: background 200ms ease;
  flex-shrink: 0;
}

.switch:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.switch--dark {
  background: var(--color-gray-600);
}

.knob {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  background: var(--color-white);
  color: var(--color-gray-700);
  font-size: 0.75rem;
  transition: transform 200ms ease;
  flex-shrink: 0;
}

.switch--dark .knob {
  transform: translateX(1.25rem);
  color: var(--color-gray-400);
}
</style>
