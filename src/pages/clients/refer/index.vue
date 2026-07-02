<script setup>
import { inject } from 'vue'
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import Stack from '@/components/Stack.vue'
import Row from '@/components/Row.vue'
import Notice from '@/components/Notice.vue'
import InputText from '@/components/InputText.vue'
import InputEmail from '@/components/InputEmail.vue'
import InputPhone from '@/components/InputPhone.vue'
import Button from '@/components/Button.vue'
import { referFormData } from '@/use/useReferClientForm'

const next = inject('next')

const { defineField, handleSubmit, errors } = useForm({
  validationSchema: yup.object({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    jobTitle: yup.string(),
    email: yup
      .string()
      .required('Email is required')
      .email('Enter a valid email address'),
    phone: yup
      .string()
      .required('Phone number is required')
      .matches(/^\(\d{3}\) \d{3}-\d{4}$/, {
        message: 'Enter a valid US phone number',
        excludeEmptyString: true,
      }),
  }),
  initialValues: {
    firstName: referFormData.firstName ?? '',
    lastName: referFormData.lastName ?? '',
    jobTitle: referFormData.jobTitle ?? '',
    email: referFormData.email ?? '',
    phone: referFormData.phone ?? '',
  },
})

const [firstName] = defineField('firstName')
const [lastName] = defineField('lastName')
const [jobTitle] = defineField('jobTitle')
const [email] = defineField('email')
const [phone] = defineField('phone')

const onSubmit = handleSubmit((values) => next(values))
</script>

<template>
  <Stack gap="8">
    <Notice center-icon>
      <Row align="center" justify="space-between" gap="4">
        <span>Have a lot of clients to refer?</span>
        <Button variant="secondary" to="/clients/refer-bulk" size="small"
          >Bulk upload</Button
        >
      </Row>
    </Notice>
    <form @submit.prevent="onSubmit">
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
        <InputText
          v-model="jobTitle"
          label="Job title"
          optional
          :error="errors.jobTitle"
        />
        <InputEmail v-model="email" label="Email" :error="errors.email" />
        <InputPhone
          v-model="phone"
          label="Phone number"
          :error="errors.phone"
        />
        <Row gap="4">
          <Button type="submit" variant="primary">Continue</Button>
        </Row>
      </Stack>
    </form>
  </Stack>
</template>
