<script setup>
import { reactive } from 'vue'
import Stack from '@/components/Stack.vue'
import Row from '@/components/Row.vue'
import Button from '@/components/Button.vue'
import InputSelect from '@/components/InputSelect.vue'
import {
  FIELD_DEFS,
  OPTIONAL_FIELD_DEFS,
  parsedFile,
  columnMapping,
  applyMapping,
  detectedOptionalFields,
} from '@/use/useBulkReferrals'

// Local copy of mapping so user can adjust before confirming
const localMapping = reactive({ ...columnMapping })

function confirm() {
  Object.assign(columnMapping, localMapping)
  applyMapping(localMapping)
}
</script>

<template>
  <div class="mapping-container">
    <Stack gap="6" class="mapping-content">
      <Stack gap="2">
        <h2>Map your columns</h2>
        <p class="mapping-description">
          We've auto-detected some column mappings. Review and adjust as needed.
        </p>
      </Stack>

      <table class="mapping-table">
        <thead>
          <tr>
            <th>Our field</th>
            <th>Your column</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="field in FIELD_DEFS" :key="field.key" class="mapping-row">
            <td class="field-label">
              {{ field.label }}
            </td>
            <td>
              <InputSelect
                v-model="localMapping[field.key]"
                :label="field.label"
                hideLabel
                hideError
                clearable
              >
                <option
                  v-for="header in parsedFile?.headers ?? []"
                  :key="header"
                  :value="header"
                >
                  {{ header }}
                </option>
              </InputSelect>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Optional fields — only shown if the spreadsheet had columns that matched -->
      <template v-if="detectedOptionalFields.length > 0">
        <Stack gap="2">
          <h3>Additional fields detected</h3>
          <p class="mapping-description">
            We found columns that match these optional fields. You can adjust or
            clear them.
          </p>
        </Stack>

        <table class="mapping-table">
          <thead>
            <tr>
              <th>Our field</th>
              <th>Your column</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="field in detectedOptionalFields"
              :key="field.key"
              class="mapping-row"
            >
              <td class="field-label">
                {{ field.label }}
                <span class="field-optional">Optional</span>
              </td>
              <td>
                <InputSelect
                  v-model="localMapping[field.key]"
                  :label="field.label"
                  hideLabel
                  hideError
                  clearable
                >
                  <option
                    v-for="header in parsedFile?.headers ?? []"
                    :key="header"
                    :value="header"
                  >
                    {{ header }}
                  </option>
                </InputSelect>
              </td>
            </tr>
          </tbody>
        </table>
      </template>

      <Row gap="4">
        <Button variant="primary" @click="confirm">Confirm mapping</Button>
      </Row>
    </Stack>
  </div>
</template>

<style scoped>
.mapping-container {
  display: flex;
  justify-content: center;
  padding: var(--space-8);
  height: 100%;
  overflow-y: auto;
  border: 1px solid var(--color-line);
  border-radius: var(--border-radius-md);
}

.mapping-content {
  max-width: 36rem;
  width: 100%;
}

.mapping-description {
  color: var(--color-text-muted);
}

.mapping-table {
  width: 100%;
  border-collapse: collapse;
}

.mapping-table th {
  text-align: left;
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--color-line);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.mapping-row td {
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--color-line);
}

.field-label {
  white-space: nowrap;
}

.field-optional {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  font-weight: var(--font-weight-regular);
  margin-left: var(--space-2);
}
</style>
