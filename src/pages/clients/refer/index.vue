<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import Stack from '@/components/Stack.vue'
import Row from '@/components/Row.vue'
import Notice from '@/components/Notice.vue'
import Button from '@/components/Button.vue'
import InputText from '@/components/InputText.vue'
import InputEmail from '@/components/InputEmail.vue'
import InputPhone from '@/components/InputPhone.vue'
import InputRadio from '@/components/InputRadio.vue'
import { clients } from '@/use/useClients'
import { firm } from '@/use/useFirm'
import { focusFirstError } from '@/use/useFocusFirstError'

const router = useRouter()

const { defineField, handleSubmit, errors, submitCount } = useForm({
  initialValues: {
    preferredContact: 'either',
  },
  validationSchema: yup
    .object({
      companyName: yup.string().required('Company name is required'),
      firstName: yup.string().required('First name is required'),
      lastName: yup.string().required('Last name is required'),
      preferredContact: yup.string(),
      email: yup.string().when('preferredContact', ([pref], s) =>
        pref === 'email'
          ? s.required('Email is required').email('Enter a valid email address')
          : s.email('Enter a valid email address'),
      ),
      phone: yup.string().when('preferredContact', ([pref], s) =>
        pref === 'phone'
          ? s.required('Phone is required').matches(/^\(\d{3}\) \d{3}-\d{4}$/, {
              message: 'Enter a valid US phone number',
              excludeEmptyString: true,
            })
          : s.matches(/^\(\d{3}\) \d{3}-\d{4}$/, {
              message: 'Enter a valid US phone number',
              excludeEmptyString: true,
            }),
      ),
    })
    .test('email-or-phone', 'Email or phone is required', function (values) {
      if (values.preferredContact === 'either') {
        return !!(values.email || values.phone)
      }
      return true
    }),
})

const [companyName] = defineField('companyName')
const [firstName] = defineField('firstName')
const [lastName] = defineField('lastName')
const [preferredContact] = defineField('preferredContact')
const [email] = defineField('email')
const [phone] = defineField('phone')

const contactOptions = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'either', label: "Doesn't matter" },
]

const emailRequired = computed(() => preferredContact.value === 'email')
const phoneRequired = computed(() => preferredContact.value === 'phone')

const formEl = ref(null)

const onSubmit = handleSubmit((values) => {
  const client = {
    id: crypto.randomUUID(),
    firmId: firm.id ?? null,
    companyId: crypto.randomUUID(),
    companyName: values.companyName,
    firstName: values.firstName,
    lastName: values.lastName,
    email: values.email || '',
    phone: values.phone || '',
    preferredContact: values.preferredContact,
    status: 'pending',
    permissions: [],
  }
  clients.value.push(client)
  router.push(`/clients/refer/success?id=${client.id}`)
}, () => focusFirstError(formEl.value))
</script>

<template>
  <form ref="formEl" @submit.prevent="onSubmit" class="referral-form">
    <Stack gap="4">
      <Notice center-icon>
        <Row align="center" justify="space-between" gap="4">
          <span>Have a lot of clients to refer?</span>
          <Button variant="secondary" to="/clients/refer/bulk" size="small"
            >Refer in bulk</Button
          >
        </Row>
      </Notice>
      <InputText
        v-model="companyName"
        label="Company name"
        :error="errors.companyName"
      />
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
      <InputRadio
        v-model="preferredContact"
        label="Preferred contact method"
        :options="contactOptions"
        :error="errors.preferredContact"
      />
      <InputEmail
        v-model="email"
        label="Email"
        :optional="!emailRequired"
        :error="errors.email || (submitCount > 0 && preferredContact === 'either' && !phone ? errors[''] : undefined)"
      />
      <InputPhone
        v-model="phone"
        label="Phone"
        :optional="!phoneRequired"
        :error="errors.phone"
      />
      <Row gap="4">
        <Button type="submit" variant="primary">Submit referral</Button>
      </Row>
    </Stack>
  </form>
</template>

<style scoped>
.referral-form {
  width: 100%;
  max-width: 24rem;
}
</style>
