<script setup>
import ToutList from './internals/ToutList.vue'
import Logo from '@/components/Logo.vue'

definePage({ meta: { title: 'Welcome' } })
import Button from '@/components/Button.vue'
import Stack from '@/components/Stack.vue'
import Row from '@/components/Row.vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import AppearanceSwitch from '@/components/AppearanceSwitch.vue'
</script>

<template>
  <div class="layout">
    <aside>
      <Stack gap="12" align="flex-start">
        <Logo invert class="logo" />
        <ToutList class="tout-list" />
      </Stack>
      <Row align="center" justify="space-between">
        <LanguageSwitcher />
        <AppearanceSwitch />
      </Row>
    </aside>
    <main>
      <div class="content">
        <div class="box">
          <div class="title">
            <h2>Welcome to Advisor Dashboard</h2>
            <p class="intro">
              Login to your Justworks account, or create an account, to get
              started.
            </p>
          </div>

          <div class="actions">
            <Button to="/account/login" variant="primary">Log in</Button>
            <Button to="/account/create">Create an account</Button>
          </div>
        </div>
      </div>
      <footer>
        <ul class="footer-links">
          <li><a href="#">Terms of Use</a></li>
          <li><a href="#">Privacy Policy</a></li>
          <li><a href="#">California Privacy Notice</a></li>
          <li><a href="#">Justworks Status</a></li>
        </ul>
        <p>
          &copy; 2013-2026 Justworks, Inc. and its affiliates. All rights
          reserved.
        </p>
      </footer>
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  gap: 0;
  height: 100svh;
}

@media (min-width: 768px) {
  .layout {
    flex-direction: row;
  }
}

aside {
  display: flex;
  flex-direction: column;
  padding: var(--space-8) var(--space-12);
  align-items: center;
  background-color: var(--color-bg-dark);
  color: var(--color-text-on-accent);
  gap: var(--space-12);
}

.logo {
  height: 2rem;
  flex-shrink: 0;
}

.tout-list {
  display: none;
}

@media (min-width: 768px) {
  aside {
    padding: var(--space-16);
    width: 29.75rem;
    align-items: flex-start;
    justify-content: space-between;
  }

  .logo {
    height: 3rem;
    flex-shrink: 0;
  }

  .tout-list {
    display: block;
  }
}

main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  background-color: var(--color-bg);
  overflow-y: auto;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-16);
  padding: var(--space-16);
  width: 100%;
  flex: 1;
}

.box {
  max-width: 25rem;
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.title {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-12);
  color: var(--color-text-muted);
}

.footer-links {
  display: flex;
  gap: var(--space-4);
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links a {
  color: var(--color-accent);
  text-decoration: none;
}

@media (hover: hover) {
  .footer-links a:hover {
    color: var(--color-accent-hover);
    text-decoration: underline;
  }
}

p {
  margin: 0;
}
</style>
