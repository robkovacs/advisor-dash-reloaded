<script setup>
import { inject } from 'vue'
import IconArrowLeft from '~icons/ph/arrow-left'
import Stack from '@/components/Stack.vue'
import Notice from '@/components/Notice.vue'
import Row from '@/components/Row.vue'
import InputText from '@/components/InputText.vue'
import Button from '@/components/Button.vue'
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import { formData } from '@/use/useCreateAccountForm'

const next = inject('next')
const back = inject('back')

const { defineField, handleSubmit, errors } = useForm({
  validationSchema: yup.object({
    firmName: yup.string().required('Firm name is required'),
    firmWebsite: yup.string().url('Enter a valid URL'),
  }),
  initialValues: {
    firmName: formData?.firmName ?? '',
    firmWebsite: formData?.firmWebsite ?? '',
  },
})

const [firmName] = defineField('firmName')
const [firmWebsite] = defineField('firmWebsite')

const onSubmit = handleSubmit((values) => {
  next({ firmName: values.firmName, firmWebsite: values.firmWebsite })
})
</script>

<template>
  <Stack gap="8">
    <Stack gap="4">
      <Button variant="link" size="small" @click="back()">
        <IconArrowLeft />Back
      </Button>

      <h2>Create a new firm</h2>
    </Stack>
    <form @submit="onSubmit">
      <Stack gap="4">
        <InputText
          v-model="firmName"
          label="Firm name"
          :error="errors.firmName"
        />
        <InputText
          v-model="firmWebsite"
          label="Website"
          :error="errors.firmWebsite"
          optional
        />
        <Notice class="notice--email-domain">
          All future firm members will need to use email addresses ending in
          <strong>@{{ formData.emailWork?.split('@')[1] }}</strong
          >.
        </Notice>
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
