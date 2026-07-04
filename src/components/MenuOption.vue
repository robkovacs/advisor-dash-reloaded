<script setup>
import { inject } from 'vue'

const props = defineProps({
  to: { type: [String, Object], default: null },
  href: { type: String, default: null },
  inert: { type: Boolean, default: false },
})

const emit = defineEmits(['click'])

const menuClose = inject('menuClose', null)

function handleClick(e) {
  emit('click', e)
  menuClose?.()
}
</script>

<template>
  <div v-if="inert" class="menu-option menu-option--inert">
    <slot />
  </div>
  <RouterLink v-else-if="to" :to="to" class="menu-option" @click="menuClose?.()">
    <slot />
  </RouterLink>
  <a v-else-if="href" :href="href" class="menu-option" @click="menuClose?.()">
    <slot />
  </a>
  <button v-else type="button" class="menu-option" @click="handleClick">
    <slot />
  </button>
</template>

<style scoped>
.menu-option {
  display: block;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  border-radius: calc(var(--border-radius-md) - 2px);
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-md);
  font-family: inherit;
  color: var(--color-text);
  cursor: pointer;
  text-decoration: none;
  box-sizing: border-box;
  user-select: none;
}

.menu-option--inert {
  cursor: default;
}

.menu-option:not(.menu-option--inert):focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

@media (hover: hover) {
  .menu-option:not(.menu-option--inert):hover {
    background: color-mix(in srgb, var(--color-text) 6%, transparent);
  }
}
</style>
