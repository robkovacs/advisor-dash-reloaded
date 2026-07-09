<script setup>
import { inject } from 'vue'
import Stack from '@/components/Stack.vue'
import Row from '@/components/Row.vue'
import Button from '@/components/Button.vue'
import InputFile from '@/components/InputFile.vue'
import InputTextarea from '@/components/InputTextarea.vue'

const next = inject('next')
const back = inject('back')
</script>

<template>
  <form>
    <Stack gap="2">
      <InputFile label="Additional documents" multiple optional>
        <template #helper>
          Share any files that might help us get this company started on
          Justworks.
        </template>
      </InputFile>
      <InputTextarea label="Anything else we should know?" optional />
    </Stack>
    <Row gap="4">
      <Button variant="primary" @click="next()">Submit</Button>
      <Button variant="secondary" @click="back()">Back</Button>
    </Row>
  </form>
</template>
