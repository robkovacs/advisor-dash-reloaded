<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Row from '@/components/Row.vue'
import Stack from '@/components/Stack.vue'
import Logo from '@/components/Logo.vue'
import UserMenu from '@/components/UserMenu.vue'
import IconMenu from '~icons/ph/list'
import IconClose from '~icons/ph/x'
import IconHome from '~icons/ph/house-line'
import Button from '@/components/Button.vue'
import IconClients from '~icons/ph/building-office'
import IconFirmMembers from '~icons/ph/users-three'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import AppearanceSwitch from '@/components/AppearanceSwitch.vue'

const open = ref(false)

const mq = window.matchMedia('(min-width: 36rem)')
mq.addEventListener('change', (e) => {
  if (e.matches) open.value = false
})

const router = useRouter()
router.afterEach(() => {
  open.value = false
})
</script>

<template>
  <div class="sidebar" :class="{ 'is-open': open }">
    <Stack gap="4" align="flex-start">
      <div class="logo-container">
        <Logo height="2rem" />
        <Button
          class="menu-button"
          variant="tertiary"
          size="small"
          icon-only
          :aria-label="open ? 'Close menu' : 'Open menu'"
          @click="open = !open"
        >
          <IconClose v-if="open" />
          <IconMenu v-else />
        </Button>
      </div>
      <nav class="nav">
        <RouterLink class="nav-item" to="/dashboard">
          <IconHome class="icon" /> Home</RouterLink
        >
        <RouterLink class="nav-item" to="/clients">
          <IconClients class="icon" /> Clients</RouterLink
        >
        <RouterLink class="nav-item" to="/firm-members">
          <IconFirmMembers class="icon" /> Firm members</RouterLink
        >
      </nav>
    </Stack>
    <UserMenu />
  </div>
</template>

<style scoped>
.sidebar {
  padding: var(--space-3);
  background-color: var(--color-bg-subtle);
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  max-height: 100vh;
  overflow-y: auto;
  z-index: 4;
}

/* Below breakpoint-sm: hide nav + UserMenu unless open */
.nav,
.sidebar :deep(.user-menu) {
  display: none;
}

.sidebar.is-open .nav,
.sidebar.is-open :deep(.user-menu) {
  display: flex;
}

@media (--breakpoint-sm) {
  .sidebar {
    width: 16rem;
    z-index: auto;
  }

  .menu-button {
    display: none;
  }

  .nav,
  .sidebar :deep(.user-menu) {
    display: flex;
  }
}

.logo-container {
  padding: var(--space-2) var(--space-3);
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

@media (--breakpoint-sm) {
  .logo-container {
    padding-top: var(--space-3);
  }
}

.nav {
  width: 100%;
  flex-direction: column;
  gap: var(--space-1);
  margin-bottom: var(--space-8);
}

@media (--breakpoint-sm) {
  .nav {
    margin-bottom: 0;
  }
}

.nav-item {
  display: flex;
  width: 100%;
  border-radius: var(--border-radius-md);
  flex-direction: row;
  gap: var(--space-3);
  align-items: center;
  padding: var(--space-3);
  color: var(--color-text);
}

.nav-item .icon {
  color: var(--color-text-muted);
  font-size: var(--font-size-lg);
}

.nav-item.router-link-active {
  background: var(--color-bg-muted);
  color: var(--color-accent);
  font-weight: var(--font-weight-bold);
}

.nav-item.router-link-active .icon {
  color: var(--color-accent);
}

@media (hover: hover) {
  .nav-item:hover {
    text-decoration: none;
  }

  .nav-item:not(.router-link-active):hover {
    background: color-mix(in srgb, var(--color-text) 6%, transparent);
  }
}
</style>
