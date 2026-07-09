<script setup>
import { inject } from 'vue'
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import Stack from '@/components/Stack.vue'
import Row from '@/components/Row.vue'
import Button from '@/components/Button.vue'
import InputNumber from '@/components/InputNumber.vue'
import InputRadio from '@/components/InputRadio.vue'
import { referFormData } from '@/use/useReferClientForm'
import { SOLUTION_OPTIONS, BENEFITS_OPTIONS } from '@/data/referralOptions'

const next = inject('next')
const back = inject('back')

const { defineField, handleSubmit, errors } = useForm({
  validationSchema: yup.object({
    salariedEmployees: yup
      .number()
      .typeError('Enter a number')
      .min(0, 'Must be 0 or more')
      .required('Required'),
    hourlyEmployees: yup
      .number()
      .typeError('Enter a number')
      .min(0, 'Must be 0 or more')
      .required('Required'),
    solution: yup.string().required('Select a preferred solution'),
    justworksBenefits: yup.string().required('Choose an answer'),
  }),
  initialValues: {
    salariedEmployees: referFormData.salariedEmployees ?? '',
    hourlyEmployees: referFormData.hourlyEmployees ?? '',
    solution: referFormData.solution ?? 'not-sure',
    justworksBenefits: referFormData.justworksBenefits ?? 'not-sure',
  },
})

const [salariedEmployees] = defineField('salariedEmployees')
const [hourlyEmployees] = defineField('hourlyEmployees')
const [solution] = defineField('solution')
const [justworksBenefits] = defineField('justworksBenefits')

const onSubmit = handleSubmit((values) => next(values))
</script>

<template>
  <form @submit.prevent="onSubmit">
    <Stack gap="2">
      <InputNumber
        v-model="salariedEmployees"
        label="Number of salaried employees"
        min="0"
        step="1"
        :error="errors.salariedEmployees"
        width="calc(var(--space-3) * 2 + 8ch)"
      />
      <InputNumber
        v-model="hourlyEmployees"
        label="Number of hourly employees"
        min="0"
        step="1"
        :error="errors.hourlyEmployees"
        width="calc(var(--space-3) * 2 + 8ch)"
      />
      <InputRadio
        v-model="solution"
        label="Preferred Justworks solution"
        width="50%"
        :options="SOLUTION_OPTIONS"
        :error="errors.solution"
      />
      <InputRadio
        v-model="justworksBenefits"
        label="Are they interested in offering benefits through Justworks?"
        width="50%"
        :options="BENEFITS_OPTIONS"
        :error="errors.justworksBenefits"
      />
      <Row gap="4">
        <Button type="submit" variant="primary">Continue</Button>
        <Button variant="secondary" @click="back()">Back</Button>
      </Row>
    </Stack>
  </form>
</template>
