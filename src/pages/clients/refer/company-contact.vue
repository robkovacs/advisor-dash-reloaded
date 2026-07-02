<script setup>
import { inject } from 'vue'
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import Stack from '@/components/Stack.vue'
import Row from '@/components/Row.vue'
import Button from '@/components/Button.vue'
import InputText from '@/components/InputText.vue'
import InputSelect from '@/components/InputSelect.vue'
import { referFormData } from '@/use/useReferClientForm'

const next = inject('next')
const back = inject('back')

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
  <form @submit.prevent="onSubmit">
    <Stack gap="4">
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
            <option value="AL">Alabama</option>
            <option value="AK">Alaska</option>
            <option value="AZ">Arizona</option>
            <option value="CA">California</option>
            <option value="CO">Colorado</option>
            <option value="CT">Connecticut</option>
            <option value="DE">Delaware</option>
            <option value="DC">District of Columbia</option>
            <option value="FL">Florida</option>
            <option value="GA">Georgia</option>
            <option value="HI">Hawaii</option>
            <option value="ID">Idaho</option>
            <option value="IL">Illinois</option>
            <option value="IN">Indiana</option>
            <option value="IA">Iowa</option>
            <option value="KS">Kansas</option>
            <option value="KY">Kentucky</option>
            <option value="LA">Louisiana</option>
            <option value="ME">Maine</option>
            <option value="MD">Maryland</option>
            <option value="MA">Massachusetts</option>
            <option value="MI">Michigan</option>
            <option value="MN">Minnesota</option>
            <option value="MS">Mississippi</option>
            <option value="MO">Missouri</option>
            <option value="MT">Montana</option>
            <option value="NE">Nebraska</option>
            <option value="NV">Nevada</option>
            <option value="NH">New Hampshire</option>
            <option value="NJ">New Jersey</option>
            <option value="NM">New Mexico</option>
            <option value="NY">New York</option>
            <option value="NC">North Carolina</option>
            <option value="ND">North Dakota</option>
            <option value="OH">Ohio</option>
            <option value="OK">Oklahoma</option>
            <option value="OR">Oregon</option>
            <option value="PA">Pennsylvania</option>
            <option value="RI">Rhode Island</option>
            <option value="SC">South Carolina</option>
            <option value="SD">South Dakota</option>
            <option value="TN">Tennessee</option>
            <option value="TX">Texas</option>
            <option value="UT">Utah</option>
            <option value="VT">Vermont</option>
            <option value="VA">Virginia</option>
            <option value="WA">Washington</option>
            <option value="WV">West Virginia</option>
            <option value="WI">Wisconsin</option>
            <option value="WY">Wyoming</option>
            <option value="AS">American Samoa</option>
            <option value="GU">Guam</option>
            <option value="MP">Northern Mariana Islands</option>
            <option value="PR">Puerto Rico</option>
            <option value="VI">U.S. Virgin Islands</option>
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
        <Button variant="secondary" @click="back()">Back</Button>
      </Row>
    </Stack>
  </form>
</template>

<style scoped>
section h3 {
  margin-top: var(--space-6);
  margin-bottom: var(--space-6);
}
</style>
