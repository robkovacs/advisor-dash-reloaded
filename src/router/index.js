import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
import { clearReferForm } from '@/use/useReferClientForm'

const REFER_PATHS = [
  '/clients/refer',
  '/clients/refer/company-contact',
  '/clients/refer/company-details',
  '/clients/refer/additional-context',
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [{ path: '/', redirect: '/dashboard' }, ...routes],
})

router.beforeEach((to, from) => {
  const authed = localStorage.getItem('authed')
  const publicPrefixes = ['/welcome', '/account']
  const isPublic = publicPrefixes.some(
    (p) => to.path === p || to.path.startsWith(p + '/'),
  )
  if (!authed && !isPublic) return '/welcome'

  if (to.path === '/clients/refer' && !REFER_PATHS.includes(from.path)) {
    clearReferForm()
  }
})

router.afterEach(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
})

export default router
