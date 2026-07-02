<script setup>
import Row from '@/components/Row.vue'
import Stack from '@/components/Stack.vue'
import Logo from '@/components/Logo.vue'
import UserMenu from '@/components/UserMenu.vue'
import IconHome from '~icons/ph/house-line'
import IconBuildingOffice from '~icons/ph/building-office'
import IconUsersThree from '~icons/ph/users-three'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import AppearanceSwitch from '@/components/AppearanceSwitch.vue'
</script>

<template>
  <div class="sidebar">
    <Stack gap="4" align="flex-start">
      <div class="logo-container">
        <Logo height="2rem" />
      </div>
      <nav class="nav">
        <RouterLink class="nav-item" to="/dashboard">
          <IconHome class="icon" /> Home</RouterLink
        >
        <RouterLink class="nav-item" to="/clients">
          <IconBuildingOffice class="icon" /> Clients</RouterLink
        >
        <RouterLink class="nav-item" to="/firm-members">
          <IconUsersThree class="icon" /> Firm members</RouterLink
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
  width: 16rem;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  max-height: 100vh;
  overflow-y: auto;
}

.logo-container {
  padding-top: var(--space-3);
  padding-left: var(--space-3);
}

.nav {
  display: block;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
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
  color: var(--color-accent-text);
  font-weight: var(--font-weight-bold);
}

.nav-item.router-link-active .icon {
  color: var(--color-accent-text);
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
