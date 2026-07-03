<script setup>
import { clearForm } from '@/use/useCreateAccountForm'
import { clearCurrentUser } from '@/use/useCurrentUser'
import { clearFirm } from '@/use/useFirm'
import { clearClients } from '@/use/useClients'
import { clearFirmMembers } from '@/use/useFirmMembers'
clearForm()
clearCurrentUser()
clearFirm()
clearClients()
clearFirmMembers()
sessionStorage.removeItem('authed')
window.location.replace('/')
</script>
