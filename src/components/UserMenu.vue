<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { currentUser } from '@/use/useCurrentUser'
import { firm } from '@/use/useFirm'
import IconCaretRight from '~icons/ph/caret-right'
import IconCaretDown from '~icons/ph/caret-down'
import IconSignOut from '~icons/ph/sign-out'
import IconMoon from '~icons/ph/moon'
import IconGlobeSimple from '~icons/ph/globe-simple'
import Row from '@/components/Row.vue'
import Stack from '@/components/Stack.vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import AppearanceSwitch from '@/components/AppearanceSwitch.vue'
import Menu from '@/components/Menu.vue'
import MenuOption from '@/components/MenuOption.vue'

const router = useRouter()

const fullName = computed(() =>
  `${currentUser.firstName ?? ''} ${currentUser.lastName ?? ''}`.trim(),
)
const firmName = computed(() => firm.name ?? '')
const initials = computed(() =>
  [currentUser.firstName, currentUser.lastName]
    .filter(Boolean)
    .map((n) => n[0].toUpperCase())
    .join(''),
)

const menuRef = ref(null)
const mq = window.matchMedia('(min-width: 40rem)')
const placement = ref(mq.matches ? 'right-end' : 'bottom-end')

function onMqChange() {
  placement.value = mq.matches ? 'right-end' : 'bottom-end'
  menuRef.value?.close()
}

function logout() {
  router.push('/account/logout')
}

onMounted(() => mq.addEventListener('change', onMqChange))
onBeforeUnmount(() => mq.removeEventListener('change', onMqChange))
</script>

<template>
  <div class="user-menu">
    <Menu ref="menuRef" :placement="placement" width="16rem">
      <template #trigger="{ toggle, isOpen }">
        <button class="user-menu-btn" :aria-expanded="isOpen" @click="toggle">
          <Row align="center" justify="space-between">
            <Row align="center" gap="3" class="user-menu-identity">
              <div class="avatar">{{ initials }}</div>
              <Stack gap="0" align="flex-start" class="user-info">
                <span class="full-name">{{ fullName }}</span>
                <span class="firm-name">{{ firmName }}</span>
              </Stack>
            </Row>
            <IconCaretRight class="caret caret--right" />
            <IconCaretDown class="caret caret--down" />
          </Row>
        </button>
      </template>

      <MenuOption @click="logout">
        <Row align="center" gap="3">
          <IconSignOut class="menu-icon" />
          Log out
        </Row>
      </MenuOption>
      <MenuOption inert>
        <Row align="center" justify="space-between" class="inert-row">
          <Row align="center" gap="3">
            <IconGlobeSimple class="menu-icon" />
            Language
          </Row>
          <LanguageSwitcher />
        </Row>
      </MenuOption>
      <MenuOption inert>
        <Row align="center" justify="space-between">
          <Row align="center" gap="3">
            <IconMoon class="menu-icon" />
            Dark mode
          </Row>
          <AppearanceSwitch />
        </Row>
      </MenuOption>
    </Menu>
  </div>
</template>

<style scoped>
.user-menu,
.user-menu :deep(> div) {
  width: 100%;
}

.user-menu-btn {
  user-select: none;
  cursor: pointer;
  background: transparent;
  color: var(--color-text);
  border: none;
  border-radius: var(--border-radius-md);
  padding: var(--space-3);
  font-weight: var(--font-weight-bold);
  width: 100%;
  text-align: left;
}

@media (hover: hover) {
  .user-menu-btn:hover {
    background: color-mix(in srgb, var(--color-text) 6%, transparent);
  }
}

.avatar {
  height: 2.5rem;
  width: 2.5rem;
  border-radius: 50%;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  background-color: var(--color-blue-100);
  color: var(--color-gray-950);
  font-weight: var(--font-weight-bold);
}

.caret {
  flex-shrink: 0;
  margin: calc((2.25rem - var(--font-size-md)) / 4);
}

.caret--right {
  display: none;
}

@media (--breakpoint-sm) {
  .caret--right {
    display: block;
  }

  .caret--down {
    display: none;
  }
}

.user-menu-identity {
  min-width: 0;
  overflow: hidden;
}

.user-info {
  min-width: 0;
}

.full-name,
.firm-name {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.firm-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-regular);
}

.menu-icon {
  color: var(--color-text-muted);
}

.inert-row :deep(.icon-left) {
  display: none;
}

.inert-row :deep(.language-switcher) {
  padding-left: var(--space-3);
}
</style>
