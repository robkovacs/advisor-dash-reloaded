import '@/use/useAppearance.js'
import { createApp } from 'vue'
import { autoAnimatePlugin } from '@formkit/auto-animate/vue'
import App from './App.vue'
import router from './router/index.js'

createApp(App).use(router).use(autoAnimatePlugin).mount('#app')
