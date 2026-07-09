<script setup>
import { inject } from 'vue'
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import Stack from '@/components/Stack.vue'
import Row from '@/components/Row.vue'
import Notice from '@/components/Notice.vue'
import Button from '@/components/Button.vue'
import InputText from '@/components/InputText.vue'
import InputSelect from '@/components/InputSelect.vue'
import { referFormData } from '@/use/useReferClientForm'
import { US_STATES } from '@/data/referralOptions'

const next = inject('next')

const { defineField, handleSubmit, errors } = useForm({
  validationSchema: yup.object({
    companyName: yup.string().required('Company name is required'),
    companyWebsite: yup.string().url('Enter a valid URL'),
    addressLine1: yup.string().required('Address is required'),
    addressLine2: yup.string(),
    city: yup.string().required('City is required'),
    state: yup.string().required('State is required'),
    zip: yup
      .string()
      .required('ZIP code is required')
      .matches(/^\d{5}(-\d{4})?$/, 'Enter a valid ZIP code'),
  }),
  initialValues: {
    companyName: referFormData.companyName ?? '',
    companyWebsite: referFormData.companyWebsite ?? '',
    addressLine1: referFormData.addressLine1 ?? '',
    addressLine2: referFormData.addressLine2 ?? '',
    city: referFormData.city ?? '',
    state: referFormData.state ?? '',
    zip: referFormData.zip ?? '',
  },
})

const [companyName] = defineField('companyName')
const [companyWebsite] = defineField('companyWebsite')
const [addressLine1] = defineField('addressLine1')
const [addressLine2] = defineField('addressLine2')
const [city] = defineField('city')
const [state] = defineField('state')
const [zip] = defineField('zip')

const onSubmit = handleSubmit((values) => next(values))
</script>

<template>
  <Stack gap="6">
    <Notice center-icon>
      <Row align="center" justify="space-between" gap="4">
        <span>Have a lot of clients to refer?</span>
        <Button variant="secondary" to="/clients/refer/bulk" size="small"
          >Refer in bulk</Button
        >
      </Row>
    </Notice>
    <form @submit.prevent="onSubmit">
      <Stack gap="2">
        <InputText
          v-model="companyName"
          label="Company name"
          :error="errors.companyName"
        />
        <InputText
          v-model="companyWebsite"
          label="Company website"
          :error="errors.companyWebsite"
          optional
        />
        <section>
          <h3>Billing address</h3>
          <Stack gap="4">
            <InputText
              v-model="addressLine1"
              label="Address line 1"
              :error="errors.addressLine1"
            />
            <InputText
              v-model="addressLine2"
              label="Address line 2"
              optional
              :error="errors.addressLine2"
            />
            <InputText v-model="city" label="City" :error="errors.city" />
            <InputSelect
              v-model="state"
              label="State"
              placeholder="Select a state"
              :error="errors.state"
              width="50%"
            >
              <option v-for="s in US_STATES" :key="s.value" :value="s.value">{{ s.label }}</option>
            </InputSelect>
            <InputText
              v-model="zip"
              label="ZIP code"
              width="calc(var(--space-3) * 2 + 5ch)"
              :error="errors.zip"
            />
          </Stack>
        </section>
        <Row gap="4">
          <Button type="submit" variant="primary">Continue</Button>
        </Row>
      </Stack>
    </form>
  </Stack>
</template>

<style scoped>
section h3 {
  margin-top: var(--space-6);
  margin-bottom: var(--space-6);
}
</style>
