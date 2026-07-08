<script setup>
import { computed, inject } from 'vue'
import IconArrowLeft from '~icons/ph/arrow-left'
import IconCircle from '~icons/ph/circle-duotone'
import IconCheckCircle from '~icons/ph/check-circle-duotone'
import Stack from '@/components/Stack.vue'
import Row from '@/components/Row.vue'
import InputText from '@/components/InputText.vue'
import InputPassword from '@/components/InputPassword.vue'
import Button from '@/components/Button.vue'
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import { createAccountFormData } from '@/use/useCreateAccountForm'

const next = inject('next')
const back = inject('back')

const { defineField, handleSubmit, errors } = useForm({
  validationSchema: yup.object({
    username: yup.string().required('Username is required'),
    password: yup
      .string()
      .min(15, 'At least 15 characters')
      .matches(/[a-z]/, 'A lowercase letter')
      .matches(/[A-Z]/, 'An uppercase letter')
      .matches(/[0-9]/, 'A number')
      .test('no-username', 'Must not contain your username', function (value) {
        const { username } = this.parent
        if (!username || !value) return true
        return !value.toLowerCase().includes(username.toLowerCase())
      })
      .required('Password is required'),
  }),
  initialValues: {
    username: createAccountFormData?.username ?? '',
    password: createAccountFormData?.password ?? '',
  },
})

const [username] = defineField('username')
const [password] = defineField('password')

const passwordRules = computed(() => {
  const p = password.value ?? ''
  const u = username.value ?? ''
  return [
    { label: 'At least 15 characters', met: p.length >= 15 },
    { label: 'A lowercase letter', met: /[a-z]/.test(p) },
    { label: 'An uppercase letter', met: /[A-Z]/.test(p) },
    { label: 'A number', met: /[0-9]/.test(p) },
    {
      label: 'Must not contain your username',
      met:
        p.length > 0 &&
        u.length > 0 &&
        !p.toLowerCase().includes(u.toLowerCase()),
    },
  ]
})

const onSubmit = handleSubmit((values) => {
  next({ username: values.username, password: values.password })
})
</script>

<template>
  <Stack gap="6">
    <Stack gap="4">
      <Button variant="link" size="small" @click="back()">
        <IconArrowLeft />Back
      </Button>
      <h2>Create your account</h2>
    </Stack>
    <form @submit="onSubmit">
      <Stack gap="2">
        <InputText v-model="username" label="Username" :error="errors.username">
          <template #helper>
            Keep the same login, even if your work email changes
          </template>
        </InputText>

        <Stack gap="3">
          <InputPassword
            v-model="password"
            label="Password"
            :error="errors.password"
            hide-error
          />
          <ul class="password-rules">
            <li
              v-for="rule in passwordRules"
              :key="rule.label"
              :class="{ 'is-met': rule.met }"
            >
              <IconCheckCircle v-if="rule.met" aria-hidden="true" />
              <IconCircle v-else aria-hidden="true" />
              {{ rule.label }}
            </li>
          </ul>
        </Stack>

        <Button type="submit" variant="primary">Continue</Button>
      </Stack>
    </form>
  </Stack>
</template>

<style scoped>
.password-rules {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.password-rules li {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-text-muted);
}

.password-rules li.is-met {
  color: var(--color-success-text);
}
</style>
