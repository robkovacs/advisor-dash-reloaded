<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom'
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
const dialogRef = ref(null)
const wrapperRef = ref(null)
const mq = window.matchMedia('(min-width: 40rem)')
let cleanupAutoUpdate = null

async function updatePosition() {
  const { x, y } = await computePosition(wrapperRef.value, dialogRef.value, {
    placement: mq.matches ? 'right-end' : 'bottom-end',
    middleware: [offset(8), flip(), shift({ padding: 8 })],
  })
  dialogRef.value.style.left = `${x}px`
  dialogRef.value.style.top = `${y}px`
}

function closeDialog() {
  dialogRef.value.close()
  cleanupAutoUpdate?.()
  cleanupAutoUpdate = null
}

function toggle() {
  if (dialogRef.value.open) {
    closeDialog()
  } else {
    dialogRef.value.show()
    cleanupAutoUpdate = autoUpdate(wrapperRef.value, dialogRef.value, updatePosition)
  }
}

function logout() {
  router.push('/account/logout')
}

function onDocumentClick(e) {
  if (
    dialogRef.value?.open &&
    !dialogRef.value.contains(e.target) &&
    !wrapperRef.value.contains(e.target)
  ) {
    closeDialog()
  }
}

function onMqChange() {
  if (dialogRef.value?.open) closeDialog()
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick, true)
  mq.addEventListener('change', onMqChange)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick, true)
  mq.removeEventListener('change', onMqChange)
  cleanupAutoUpdate?.()
})
</script>

<template>
  <div ref="wrapperRef" class="user-menu-wrapper">
    <button class="user-menu" :aria-expanded="dialogRef?.open" @click="toggle">
      <Row align="center" justify="space-between">
        <Row align="center" gap="3" class="user-menu-identity">
          <div class="avatar">{{ initials }}</div>
          <Stack gap="0" align="flex-start" class="user-info">
            <span class="full-name">{{ fullName }}</span>
            <span class="firm-name">{{ firmName }}</span>
          </Stack>
        </Row>
        <IconCaretRight class="user-menu-caret user-menu-caret--right" />
        <IconCaretDown class="user-menu-caret user-menu-caret--down" />
      </Row>
    </button>
    <Teleport to="body">
      <dialog ref="dialogRef" class="user-menu-dialog">
        <button class="logout-btn" @click="logout">
          <Row align="center" gap="3"
            ><IconSignOut class="user-menu-icon" /> Log out
          </Row>
        </button>
        <Row align="center" justify="space-between">
          <Row align="center" gap="3">
            <IconGlobeSimple class="user-menu-icon" />
            Language
          </Row>
          <LanguageSwitcher />
        </Row>
        <Row align="center" justify="space-between">
          <Row align="center" gap="3">
            <IconMoon class="user-menu-icon" />
            Dark mode
          </Row>
          <AppearanceSwitch />
        </Row>
      </dialog>
    </Teleport>
  </div>
</template>

<style scoped>
.user-menu-wrapper {
  position: relative;
}

.user-menu {
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

.user-menu-caret {
  flex-shrink: 0;
}

.user-menu-caret--right {
  display: none;
}

@media (--breakpoint-sm) {
  .user-menu-caret--right {
    display: block;
  }

  .user-menu-caret--down {
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
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-regular);
}

.user-menu-dialog {
  user-select: none;
  position: fixed;
  margin: 0;
  padding: var(--space-2);
  background: var(--color-bg);
  border: 1px solid var(--color-line);
  border-radius: var(--border-radius-md);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -2px rgba(0, 0, 0, 0.1);
  color: var(--color-text);
  z-index: 9999;
  width: 16rem;
}

.user-menu-dialog > .row {
  padding: var(--space-2) var(--space-3);
}

.user-menu-icon {
  color: var(--color-text-muted);
}

.user-menu-dialog :deep(.icon-left) {
  display: none;
}

.user-menu-dialog :deep(.language-switcher) {
  padding-left: var(--space-3);
}

.logout-btn {
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
}

.logout-btn:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

@media (hover: hover) {
  .user-menu:hover {
    background: color-mix(in srgb, var(--color-text) 6%, transparent);
  }

  .logout-btn:hover {
    background: color-mix(in srgb, var(--color-text) 6%, transparent);
  }
}
</style>
