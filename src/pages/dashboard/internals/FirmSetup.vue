<script setup>
import Stack from '@/components/Stack.vue'
import Row from '@/components/Row.vue'
import IconClipboardText from '~icons/ph/clipboard-text-duotone'
import IconPaperPlaneTilt from '~icons/ph/paper-plane-tilt-duotone'
import IconUsersThree from '~icons/ph/users-three-duotone'
import IconLinkSimple from '~icons/ph/link-simple-duotone'
import IconInvoice from '~icons/ph/invoice-duotone'
import IconListChecks from '~icons/ph/list-checks-duotone'
import Button from '@/components/Button.vue'
import FirmSetupCard from './FirmSetupCard.vue'
import { computed, reactive } from 'vue'
import { formData } from '@/use/useCreateAccountForm'

const userFirstName = computed(() => formData.firstName || 'there')
const firmName = computed(() => formData.firmName || 'your firm')

const skipped = reactive(new Set())
const hasSetupItems = computed(() =>
  ['team', 'profile', 'billing'].some((k) => !skipped.has(k)),
)
</script>

<template>
  <Stack gap="12">
    <Stack gap="4">
      <h1>Welcome to Advisor Dashboard, {{ userFirstName }}!</h1>
      <p class="intro">
        Let's get <strong>{{ firmName }}</strong> up and running. You’ll need to
        add at least one client, but the rest of these steps can be done
        anytime.
      </p>
    </Stack>

    <Stack gap="6">
      <h3>Add your clients</h3>
      <Row gap="6" align="stretch">
        <FirmSetupCard
          variant="primary"
          title="Refer clients"
          description="Send us your client’s contact info, and we’ll work with both of you to choose the right Justworks solutions."
        >
          <template #icon><IconPaperPlaneTilt /></template>
          <template #actions>
            <Button to="/clients/refer" variant="primary"
              >Start referral</Button
            >
          </template>
        </FirmSetupCard>
        <FirmSetupCard
          variant="primary"
          title="Start enrolling clients"
          description="If you and your clients are ready, jump right into getting their company on Justworks."
        >
          <template #icon><IconClipboardText /></template>
          <template #actions>
            <Button to="/clients/enroll" variant="primary"
              >Start enrollment</Button
            >
          </template>
        </FirmSetupCard>
      </Row>
      <FirmSetupCard
        title="Connect to existing Justworks customers"
        description="Start managing clients that already use Justworks."
      >
        <template #icon><IconLinkSimple /></template>
        <template #actions>
          <Button size="small" to="/clients/connect">Connect</Button>
        </template>
      </FirmSetupCard>
    </Stack>

    <Stack gap="6">
      <template v-if="hasSetupItems">
        <h3>Finish setting up your firm</h3>
        <div v-auto-animate class="setup-items">
          <FirmSetupCard
            v-if="!skipped.has('team')"
            title="Invite your team"
            description="Bring all of your staff onto Advisor Dashboard and set up their access."
          >
            <template #icon><IconUsersThree /></template>
            <template #actions>
              <Row gap="2" shrink>
                <Button
                  size="small"
                  variant="tertiary"
                  @click="skipped.add('team')"
                  >Skip</Button
                >
                <Button size="small" to="/firm-members/invite"
                  >Send invites</Button
                >
              </Row>
            </template>
          </FirmSetupCard>
          <FirmSetupCard
            v-if="!skipped.has('profile')"
            title="Complete your firm profile"
            description="The more we know about your business, the better we’ll be able to serve you."
          >
            <template #icon><IconListChecks /></template>
            <template #actions>
              <Row gap="2" shrink>
                <Button
                  size="small"
                  variant="tertiary"
                  @click="skipped.add('profile')"
                  >Skip</Button
                >
                <Button size="small" to="/firm/edit">Edit firm profile</Button>
              </Row>
            </template>
          </FirmSetupCard>
          <FirmSetupCard
            v-if="!skipped.has('billing')"
            title="Set up Advisor Billing"
            description="Get billed directly by Justworks for some or all of your clients."
            badge="Optional"
          >
            <template #icon><IconInvoice /></template>
            <template #actions>
              <Row gap="2" shrink>
                <Button
                  size="small"
                  variant="tertiary"
                  @click="skipped.add('billing')"
                  >Skip</Button
                >
                <Button size="small" to="/firm/billing/setup">Set up</Button>
              </Row>
            </template>
          </FirmSetupCard>
        </div>
      </template>

      <Stack gap="3" align="center">
        <Button disabled>Go to firm dashboard</Button>
        <p class="text-sm text-muted">
          You need to add at least one client before you can view your firm
          dashboard.
        </p>
      </Stack>
    </Stack>
  </Stack>
</template>

<style scoped>
.setup-items {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  align-self: stretch;
}
</style>
