<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'

const route = useRoute()
const PUBLIC_PREFIXES = ['/welcome', '/account']
const isPublic = computed(() =>
  route.meta.noLayout ||
  PUBLIC_PREFIXES.some((p) => route.path === p || route.path.startsWith(p + '/')),
)
</script>

<template>
  <div v-auto-animate>
    <AppLayout v-if="!isPublic" key="app" />
    <RouterView v-else key="public" />
  </div>
</template>

<style>
@import './styles/app.css';
</style>
