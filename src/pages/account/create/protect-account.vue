<script setup>
import { inject } from 'vue'
import IconArrowLeft from '~icons/ph/arrow-left'
import Stack from '@/components/Stack.vue'
import InputEmail from '@/components/InputText.vue'
import InputPhone from '@/components/InputPhone.vue'
import Button from '@/components/Button.vue'
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import { createAccountFormData } from '@/use/useCreateAccountForm'

const next = inject('next')
const back = inject('back')

const { defineField, handleSubmit, errors } = useForm({
  validationSchema: yup.object({
    emailPersonal: yup
      .string()
      .required('Personal email is required')
      .email('Enter a valid email address'),
    cellPhone: yup.string().matches(/^\(\d{3}\) \d{3}-\d{4}$/, {
      message: 'Enter a valid US phone number',
      excludeEmptyString: true,
    }),
  }),
  initialValues: {
    emailPersonal: createAccountFormData?.personalEmail ?? '',
    cellPhone: createAccountFormData?.cellPhone ?? '',
  },
})

const [emailPersonal] = defineField('emailPersonal')
const [cellPhone] = defineField('cellPhone')

const onSubmit = handleSubmit((values) => {
  next({ emailPersonal: values.emailPersonal, cellPhone: values.cellPhone })
})
</script>

<template>
  <Stack gap="6">
    <Stack gap="4">
      <Button variant="link" size="small" @click="back()">
        <IconArrowLeft />Back
      </Button>
      <h2>Protect your account</h2>
    </Stack>
    <form @submit="onSubmit">
      <Stack gap="4">
        <InputEmail
          v-model="emailPersonal"
          label="Personal email"
          :error="errors.emailPersonal"
        >
          <template #helper>
            We'll send password reset info to this address if you have trouble
            accessing your Justworks account.
          </template>
        </InputEmail>
        <InputPhone
          v-model="cellPhone"
          label="Cell phone"
          :error="errors.cellPhone"
        >
          <template #helper>
            We'll use this to verify your identity when you call Support.
          </template>
        </InputPhone>
        <Button type="submit" variant="primary">Continue</Button>
      </Stack>
    </form>
  </Stack>
</template>
