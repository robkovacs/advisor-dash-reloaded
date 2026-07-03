<script setup>
import { inject } from 'vue'
import { useRouter } from 'vue-router'
import IconArrowLeft from '~icons/ph/arrow-left'
import Stack from '@/components/Stack.vue'
import InputEmail from '@/components/InputEmail.vue'
import Button from '@/components/Button.vue'
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import { createAccountFormData } from '@/use/useCreateAccountForm'

const next = inject('next')

const { defineField, handleSubmit, errors } = useForm({
  validationSchema: yup.object({
    emailWork: yup
      .string()
      .email('Enter a valid email address')
      .required('Email is required'),
  }),
  initialValues: {
    emailWork: createAccountFormData?.emailWork ?? '',
  },
})

const router = useRouter()
const [emailWork] = defineField('emailWork')

const onSubmit = handleSubmit((values) => {
  window.open(
    router.resolve({ path: '/account/confirm-email', query: { email: values.emailWork } }).href,
    '_blank',
  )
  next({ emailWork: values.emailWork })
})
</script>

<template>
  <Stack gap="8">
    <Stack gap="4">
      <Button to="/welcome" variant="link" size="small"
        ><IconArrowLeft />Back</Button
      >
      <Stack gap="3">
        <h2>Enter your work email</h2>
        <p class="text-muted">
          We'll use it to check if your firm is already here.
        </p>
      </Stack>
    </Stack>
    <form @submit="onSubmit">
      <Stack gap="4">
        <InputEmail
          v-model="emailWork"
          label="Work email"
          :error="errors.emailWork"
        />
        <Button type="submit" variant="primary">Continue</Button>
      </Stack>
    </form>
  </Stack>
</template>
