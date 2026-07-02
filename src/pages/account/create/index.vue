<script setup>
import { useRouter } from 'vue-router'
import { clearForm } from '@/use/useCreateAccountForm'

clearForm()
useRouter().replace('/account/create/check-email')
</script>
