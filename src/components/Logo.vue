<script setup>
import Logo from '@/assets/logo-advisor-dashboard.svg'

const props = defineProps({
  invert: {
    type: Boolean,
    default: false,
  },
  height: {
    type: String,
    default: '3rem',
  },
})
</script>

<template>
  <Logo
    :class="['logo', { 'logo--inverted': invert }]"
    :style="{ height: props.height }"
  />
</template>

<style scoped>
.logo {
  width: auto;
  color: var(--color-text);
}

.logo--inverted {
  color: var(--color-white);
}
</style>
