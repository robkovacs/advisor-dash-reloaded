<script setup>
import { ref } from 'vue'
import Stack from '@/components/Stack.vue'
import Row from '@/components/Row.vue'
import Columns from '@/components/Columns.vue'
import Box from '@/components/Box.vue'
import Button from '@/components/Button.vue'
import Notice from '@/components/Notice.vue'
import { parseFile, addReferral, currentStep } from '@/use/useBulkReferrals'
import IconUpload from '~icons/ph/upload-simple'
import IconPlus from '~icons/ph/plus'

const inputRef = ref(null)
const draggedOver = ref(false)

function openPicker() {
  inputRef.value?.click()
}

function onFileChange(e) {
  const file = e.target.files[0]
  if (file) parseFile(file)
  e.target.value = ''
}

function onDrop(e) {
  draggedOver.value = false
  const file = e.dataTransfer.files[0]
  if (file) parseFile(file)
}

function addManual() {
  addReferral()
  currentStep.value = 'review'
}
</script>

<template>
  <div
    class="upload-dropzone"
    :class="{ 'upload-dropzone--over': draggedOver }"
    @dragover.prevent="draggedOver = true"
    @dragleave="draggedOver = false"
    @drop.prevent="onDrop"
  >
    <input
      ref="inputRef"
      type="file"
      accept=".csv,.xlsx,.xls,.ods,.tsv"
      class="file-native"
      @change="onFileChange"
    />
    <Stack gap="6">
      <Box padding="6" class="info-card">
        <Stack gap="6" align="center" class="upload-content">
          <p class="intro">
            Import a spreadsheet or CSV, or add referrals one at a time.
          </p>

          <Row gap="3" justify="center">
            <Button variant="secondary" @click="openPicker">
              <IconUpload aria-hidden="true" />
              Import
            </Button>
            <Button variant="primary" @click="addManual">
              <IconPlus aria-hidden="true" />
              Add manually
            </Button>
          </Row>
        </Stack>
      </Box>
      <Stack gap="6" align="center" class="upload-content">
        <Columns layout="1fr 1fr" gap="6">
          <Stack gap="2" class="info-details">
            <h3 class="info-subheading">Include for each referral:</h3>
            <ul class="info-list">
              <li>Company name</li>
              <li>Primary contact's first name</li>
              <li>Primary contact's last name</li>
              <li>
                Primary contact's email and/or phone number
                <ul>
                  <li>If you provide both: Preferred contact method</li>
                </ul>
              </li>
            </ul>
          </Stack>
          <Stack gap="2" class="info-details">
            <h3 class="info-subheading">Optional data to include:</h3>
            <ul class="info-list">
              <li>Company mailing address</li>
              <li>Number of salaried employees</li>
              <li>Number of hourly employees</li>
              <li>Current payroll provider</li>
              <li>
                Interested in offering benefits through Justworks?
                <ul>
                  <li>If yes: current benefits provider</li>
                  <li>If yes: Next benefits renewal date</li>
                </ul>
              </li>
            </ul>
          </Stack>
        </Columns>
        <Notice>
          Don't worry about the column names in your document; in the next step,
          we'll help you match your column names to the fields in our system.
        </Notice>
      </Stack>
    </Stack>
  </div>
</template>

<style scoped>
.upload-dropzone {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: var(--space-8);
  border: 1px solid var(--color-line);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  transition: background-color 0.15s;
}

.upload-dropzone--over {
  border-color: var(--color-accent-border);
  border-style: dashed;
}

.file-native {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}

.upload-content {
  max-width: 40rem;
  width: 100%;
}

.info-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.info-details {
  max-width: 24rem;
  width: 100%;
}

.info-note {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.info-subheading {
  margin-bottom: var(--space-2);
}

.info-list,
.info-list ul {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin: 0;
}

.info-list {
  list-style: disc;
  padding-left: var(--space-6);
}

.info-list ul {
  padding-top: var(--space-2);
  list-style: circle;
  padding-left: var(--space-4);
}

.info-footer {
  color: var(--color-text-muted);
  border-top: 1px solid var(--color-line);
  padding-top: var(--space-4);
}
</style>
