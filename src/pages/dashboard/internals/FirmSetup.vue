<script setup>
import Badge from '@/components/Badge.vue'
import Stack from '@/components/Stack.vue'
import Row from '@/components/Row.vue'
import IconBox from '@/components/IconBox.vue'
import IconClipboardText from '~icons/ph/clipboard-text-duotone'
import IconPaperPlaneTilt from '~icons/ph/paper-plane-tilt-duotone'
import IconUsersThree from '~icons/ph/users-three-duotone'
import IconLinkSimple from '~icons/ph/link-simple-duotone'
import IconInvoice from '~icons/ph/invoice-duotone'
import IconListChecks from '~icons/ph/list-checks-duotone'
import Button from '@/components/Button.vue'
import FlexSpace from '@/components/FlexSpace.vue'
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
        <div class="box">
          <Stack gap="6">
            <Stack gap="4">
              <Row align="center" gap="4">
                <IconBox>
                  <IconPaperPlaneTilt />
                </IconBox>
                <h3>Refer clients</h3>
              </Row>
              <p>
                Send us your client’s contact info, and we’ll work with both of
                you to choose the right Justworks solutions.
              </p>
            </Stack>
            <Button to="/clients/refer" variant="primary"
              >Start referral</Button
            >
          </Stack>
        </div>
        <div class="box">
          <Stack gap="6">
            <Stack gap="4">
              <Row align="center" gap="4">
                <IconBox>
                  <IconClipboardText />
                </IconBox>
                <h3>Start enrolling clients</h3>
              </Row>
              <p>
                If you and your clients are ready, jump right into getting their
                company on Justworks.
              </p>
            </Stack>
            <Button to="/clients/enroll" variant="primary"
              >Start enrollment</Button
            >
          </Stack>
        </div>
      </Row>
      <div class="box">
        <Row align="center">
          <Row align="center" gap="4">
            <IconBox>
              <IconLinkSimple />
            </IconBox>
            <Stack gap="2">
              <h4>Connect to existing Justworks customers</h4>
              <p class="text-sm">
                Start managing clients that already use Justworks.
              </p>
            </Stack>
          </Row>
          <FlexSpace />
          <Button size="small" to="/clients/connect">Connect</Button>
        </Row>
      </div>
    </Stack>

    <Stack gap="8">
      <template v-if="hasSetupItems">
        <h3>Finish setting up your firm</h3>
        <div v-auto-animate class="setup-items">
          <div v-if="!skipped.has('team')" class="box">
            <Row align="center">
              <Row align="center" gap="4">
                <IconBox>
                  <IconUsersThree />
                </IconBox>
                <Stack gap="2">
                  <h4>Invite your team</h4>
                  <p class="text-sm">
                    Bring all of your staff onto Advisor Dashboard and set up
                    their access.
                  </p>
                </Stack>
              </Row>
              <FlexSpace />
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
            </Row>
          </div>
          <div v-if="!skipped.has('profile')" class="box">
            <Row align="center">
              <Row align="center" gap="4">
                <IconBox>
                  <IconListChecks />
                </IconBox>
                <Stack gap="2">
                  <h4>Complete your firm profile</h4>
                  <p class="text-sm">
                    The more we know about your business, the better we’ll be
                    able to serve you.
                  </p>
                </Stack>
              </Row>
              <FlexSpace />
              <Row gap="2" shrink>
                <Button
                  size="small"
                  variant="tertiary"
                  @click="skipped.add('profile')"
                  >Skip</Button
                >
                <Button size="small" to="/firm/edit">Edit firm profile</Button>
              </Row>
            </Row>
          </div>
          <div v-if="!skipped.has('billing')" class="box">
            <Row align="center">
              <Row align="center" gap="4">
                <IconBox>
                  <IconInvoice />
                </IconBox>
                <Stack gap="2">
                  <h4 class="has-badge">
                    Set up Advisor Billing <Badge>Optional</Badge>
                  </h4>
                  <p class="text-sm">
                    Get billed directly by Justworks for some or all of your
                    clients.
                  </p>
                </Stack>
              </Row>
              <FlexSpace />
              <Row gap="2" shrink>
                <Button
                  size="small"
                  variant="tertiary"
                  @click="skipped.add('billing')"
                  >Skip</Button
                >
                <Button size="small" to="/firm/billing/setup">Set up</Button>
              </Row>
            </Row>
          </div>
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

.box {
  padding: var(--space-6);
  border: 1px solid var(--color-line);
  border-radius: var(--border-radius-md);
  width: 100%;
}
</style>
