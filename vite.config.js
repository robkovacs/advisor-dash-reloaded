import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import VueRouter from 'unplugin-vue-router/vite'
import Icons from 'unplugin-icons/vite'
import svgLoader from 'vite-svg-loader'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    VueRouter({ routesFolder: 'src/pages' }),
    vue(),
    Icons({ compiler: 'vue3', defaultClass: 'icon', scale: 1 }),
    svgLoader({ defaultImport: 'component' }),
  ],
})
