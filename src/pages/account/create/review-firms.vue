<script setup>
import { inject } from 'vue'
import IconArrowLeft from '~icons/ph/arrow-left'
import Stack from '@/components/Stack.vue'
import Row from '@/components/Row.vue'
import Button from '@/components/Button.vue'
import { createAccountFormData } from '@/use/useCreateAccountForm'

const next = inject('next')
const back = inject('back')
</script>

<template>
  <Stack gap="6">
    <Stack gap="4">
      <Button variant="link" size="small" @click="back()"
        ><IconArrowLeft />Back</Button
      >
      <h2>No matching firms found</h2>
    </Stack>
    <p>
      No firm is using
      <strong>@{{ createAccountFormData.emailWork?.split('@')[1] }}</strong> on
      Advisor Dashboard yet. You can create the firm now, and invite other firm
      members later.
    </p>
    <Stack gap="4">
      <Button variant="primary" @click="next()">Create a new firm</Button>
      <Row justify="center">
        <Button variant="link" size="small"
          >Ask a colleague to setup your firm instead</Button
        >
      </Row>
    </Stack>
  </Stack>
</template>
