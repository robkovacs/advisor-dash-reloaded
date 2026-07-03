<script setup>
import { inject } from 'vue'
import IconArrowLeft from '~icons/ph/arrow-left'
import Stack from '@/components/Stack.vue'
import Notice from '@/components/Notice.vue'
import Row from '@/components/Row.vue'
import InputText from '@/components/InputText.vue'
import InputSelect from '@/components/InputSelect.vue'
import Button from '@/components/Button.vue'
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import { createAccountFormData } from '@/use/useCreateAccountForm'

const next = inject('next')
const back = inject('back')

const { defineField, handleSubmit, errors } = useForm({
  validationSchema: yup.object({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    role: yup.string().required('Role is required'),
  }),
  initialValues: {
    firstName: createAccountFormData?.firstName ?? '',
    lastName: createAccountFormData?.lastName ?? '',
    role: createAccountFormData?.role ?? '',
  },
})

const [firstName] = defineField('firstName')
const [lastName] = defineField('lastName')
const [role] = defineField('role')

const onSubmit = handleSubmit((values) => {
  next({
    firstName: values.firstName,
    lastName: values.lastName,
    role: values.role,
  })
})
</script>

<template>
  <Stack gap="8">
    <Stack gap="4">
      <Button variant="link" size="small" @click="back()">
        <IconArrowLeft />Back
      </Button>

      <h2>Tell us about yourself</h2>
    </Stack>
    <form @submit="onSubmit">
      <Stack gap="4">
        <InputText
          v-model="firstName"
          label="First name"
          :error="errors.firstName"
        />
        <InputText
          v-model="lastName"
          label="Last name"
          :error="errors.lastName"
        />
        <InputSelect v-model="role" label="Role" :error="errors.role">
          <option value="accountant">Accountant</option>
          <option value="bookkeeper">Bookkeeper</option>
          <option value="cfo">CFO</option>
          <option value="other">Other</option>
        </InputSelect>
        <Button type="submit" variant="primary">Continue</Button>
      </Stack>
    </form>
  </Stack>
</template>

<style scoped>
.notice--email-domain {
  margin-bottom: 1rem;
}
</style>
