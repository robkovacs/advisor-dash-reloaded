<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const email = route.query.email ?? 'you'
const confirmUrl = window.location.origin + router.resolve({ path: '/account/confirm-email/confirmed' }).href
</script>

<template>
  <div class="email-page">
    <div class="email">
      <div class="email__header">
        <div class="email__sender-avatar" aria-hidden="true"></div>
        <div class="email__sender-info">
          <div class="email__sender-name">Justworks</div>
          <div class="email__sender-address">support@justworks.com</div>
        </div>
      </div>
      <h1 class="email__subject">Confirm your email address</h1>
      <div class="email__body">
        <p>Hi there,</p>
        <p>
          Click the button below to confirm your email address and continue
          setting up your Advisor Dashboard account.
        </p>
        <a :href="confirmUrl" class="email__cta">Confirm email address</a>
        <p class="email__fine-print">
          If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
}

.email-page {
  min-height: 100svh;
  background: #f4f4f5;
  display: flex;
  justify-content: center;
  padding: 3rem 1rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #18181b;
}

.email {
  background: #ffffff;
  border-radius: 0.5rem;
  border: 1px solid #e4e4e7;
  width: 100%;
  max-width: 36rem;
  padding: 2.5rem;
  height: fit-content;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.email__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e4e4e7;
}

.email__sender-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: #2563eb;
  color: #ffffff;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background-image: url(@/assets/fake-email-avatar.png);
  background-size: cover;
}

.email__sender-name {
  font-weight: 600;
  font-size: 0.9375rem;
}

.email__sender-address {
  font-size: 0.8125rem;
  color: #71717a;
}

.email__subject {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.3;
}

.email__body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  font-size: 0.9375rem;
  line-height: 1.65;
  color: #3f3f46;
}

.email__cta {
  display: inline-block;
  align-self: flex-start;
  background: #2563eb;
  color: #ffffff;
  text-decoration: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 0.9375rem;
  margin-top: 0.25rem;
}

.email__cta:hover {
  background: #1d4ed8;
}

.email__fine-print {
  font-size: 0.8125rem;
  color: #a1a1aa;
  margin-top: 0.5rem;
}

@media (prefers-color-scheme: dark) {
  .email-page {
    background: #09090b;
    color: #fafafa;
  }

  .email {
    background: #18181b;
    border-color: #27272a;
  }

  .email__header {
    border-bottom-color: #27272a;
  }

  .email__sender-address {
    color: #a1a1aa;
  }

  .email__body {
    color: #d4d4d8;
  }

  .email__cta:hover {
    background: #3b82f6;
  }

  .email__fine-print {
    color: #71717a;
  }
}
</style>
