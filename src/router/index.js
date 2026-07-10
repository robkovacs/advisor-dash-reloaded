import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
import { clients } from '@/use/useClients'
import { firmMembers } from '@/use/useFirmMembers'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [{ path: '/', redirect: '/dashboard' }, ...routes],
})

router.beforeEach((to, from) => {
  const authed = sessionStorage.getItem('authed')
  const publicPrefixes = ['/welcome', '/account']
  const isPublic = publicPrefixes.some(
    (p) => to.path === p || to.path.startsWith(p + '/'),
  )
  if (!authed && !isPublic) return '/welcome'

  // Suppress AppLayout for [id] routes when the resource doesn't exist
  if (to.params.id) {
    if (to.path.startsWith('/clients/')) {
      to.meta.noLayout = !clients.value.some((c) => c.id === to.params.id)
    } else if (to.path.startsWith('/firm-members/')) {
      to.meta.noLayout = !firmMembers.value.some((m) => m.id === to.params.id)
    } else {
      to.meta.noLayout = false
    }
  }
})

router.afterEach((to) => {
  const title = to.matched.findLast((r) => r.meta.title)?.meta.title
  document.title = title ? `${title} — Advisor Dashboard` : 'Advisor Dashboard'
  const main = document.getElementById('app-main')
  if (main) main.scrollTo({ top: 0, behavior: 'instant' })
  else window.scrollTo({ top: 0, behavior: 'instant' })
})

export default router
