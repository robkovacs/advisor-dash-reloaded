<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { formData } from '@/use/useCreateAccountForm'
import IconCaretRight from '~icons/ph/caret-right'
import IconSignOut from '~icons/ph/sign-out'
import IconMoon from '~icons/ph/moon'
import IconGlobeSimple from '~icons/ph/globe-simple'
import Row from '@/components/Row.vue'
import Stack from '@/components/Stack.vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import AppearanceSwitch from '@/components/AppearanceSwitch.vue'

const router = useRouter()
const fullName = computed(() =>
  `${formData.firstName ?? ''} ${formData.lastName ?? ''}`.trim(),
)
const firmName = formData.firmName ?? ''
const initials = computed(() =>
  [formData.firstName, formData.lastName]
    .filter(Boolean)
    .map((n) => n[0].toUpperCase())
    .join(''),
)
const dialogRef = ref(null)
const wrapperRef = ref(null)

function toggle() {
  if (dialogRef.value.open) {
    dialogRef.value.close()
  } else {
    dialogRef.value.show()
    const rect = wrapperRef.value.getBoundingClientRect()
    dialogRef.value.style.left = `${rect.right + 24}px`
    dialogRef.value.style.top = `${rect.bottom - dialogRef.value.offsetHeight}px`
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
    dialogRef.value.close()
  }
}

onMounted(() => document.addEventListener('click', onDocumentClick, true))
onBeforeUnmount(() =>
  document.removeEventListener('click', onDocumentClick, true),
)
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
        <IconCaretRight class="user-menu-caret" />
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
  background-color: var(--color-blue-200);
  color: var(--color-gray-950);
  font-weight: var(--font-weight-bold);
}

.user-menu-caret {
  flex-shrink: 0;
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
