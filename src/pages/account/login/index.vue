<script setup>
import Logo from '@/assets/logo-justworks.svg'

import { useRouter } from 'vue-router'

definePage({ meta: { title: 'Log in' } })
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import InputText from '@/components/InputText.vue'
import InputPassword from '@/components/InputPassword.vue'
import Button from '@/components/Button.vue'
import { formData, fromLogin } from '@/use/useCreateAccountForm'

const router = useRouter()

const ACCOUNTS = {
  tester: {
    password: 'TestingTesting123',
    data: {
      emailWork: 'rob@acmecpas.com',
      firmName: 'Acme CPAs',
      firmWebsite: 'acmecpas.com',
      firstName: 'Rob',
      lastName: 'Kovacs',
      role: 'accountant',
      username: 'tester',
      personalEmail: 'rob@personal.com',
      cellPhone: '(555) 867-5309',
    },
  },
}

const { defineField, handleSubmit, errors, setErrors } = useForm({
  validationSchema: yup.object({
    username: yup.string().required('Username is required'),
    password: yup.string().required('Password is required'),
  }),
})

const [username] = defineField('username')
const [password] = defineField('password')

const login = handleSubmit((values) => {
  const account = ACCOUNTS[values.username]
  if (account && account.password === values.password) {
    Object.assign(formData, account.data)
    localStorage.setItem('authed', 'true')
    router.push('/dashboard')
    return
  }
  fromLogin.value = true
  router.push('/account/create')
})
</script>

<template>
  <div class="layout">
    <aside>
      Welcome to
      <Logo class="logo" />
    </aside>
    <main>
      <div class="content">
        <div class="box">
          <form class="login-form" @submit.prevent="login">
            <h1>Hey there! Great to see you.</h1>
            <InputText
              v-model="username"
              label="Username"
              autocomplete="off"
              :error="errors.username"
            />
            <InputPassword
              v-model="password"
              label="Password"
              autocomplete="off"
              :error="errors.password"
            />
            <Button variant="primary" type="submit">Sign in</Button>
          </form>
          <ul class="login-form-links">
            <li><a href="#">Forgot username?</a></li>
            <li><a href="#">Forgot password?</a></li>
          </ul>
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
  padding: var(--space-8) var(--space-12);
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-dark);
  color: var(--color-text-on-accent);
  gap: var(--space-2);
}

.logo {
  height: 1.5rem;
  flex-shrink: 0;
}

@media (min-width: 768px) {
  aside {
    padding: var(--space-16);
    flex-direction: column;
    width: 29.75rem;
  }

  .logo {
    height: 2rem;
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
  gap: var(--space-8);
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

.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  max-width: 25rem;
  width: 100%;
}

.login-form h1 {
  margin-bottom: var(--space-4);
}

.login-form-links {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  list-style: none;
  padding: 0;
  margin: 0;
}

footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-12);
  padding-top: 0;
  gap: var(--space-4);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.footer-links {
  display: flex;
  gap: var(--space-4);
  list-style: none;
  padding: 0;
  margin: 0;
}

.login-form-links a,
.footer-links a {
  color: var(--color-accent);
  text-decoration: none;
}

@media (hover: hover) {
  .login-form-links a:hover,
  .footer-links a:hover {
    color: var(--color-accent-hover);
    text-decoration: underline;
  }
}

p {
  margin: 0;
}
</style>
