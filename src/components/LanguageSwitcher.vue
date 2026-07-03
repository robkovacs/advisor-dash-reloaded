<script setup>
import IconGlobeSimple from '~icons/ph/globe-simple'
import IconCaretDown from '~icons/ph/caret-down'
</script>

<template>
  <div class="language-switcher-wrapper">
    <IconGlobeSimple class="language-switcher-icon icon-left" />
    <select class="language-switcher">
      <option selected>en</option>
    </select>
    <IconCaretDown class="language-switcher-icon icon-right" />
  </div>
</template>

<style scoped>
.language-switcher-wrapper {
  position: relative;
  display: flex;
  gap: var(--space-2);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  align-items: center;
  background-color: transparent;
  border: 1px solid var(--color-input-border);
  color: inherit;
}

.language-switcher:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.language-switcher {
  appearance: none;
  border: none;
  background-color: transparent;
  border-radius: var(--border-radius-md);
  padding: var(--space-2) var(--space-8);
  color: inherit;
}

.language-switcher-icon {
  flex-shrink: 0;
  position: absolute;
  top: 0;
  transform: translateY(75%);
  pointer-events: none;
}

.icon-left {
  left: var(--space-3);
  color: var(--color-text-muted);
}

.icon-right {
  right: var(--space-3);
}
</style>
