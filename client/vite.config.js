import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3000,
    hmr:{
      protocol: 'wss',
      // host: 'localhost',
      host: 'itineraryx.ap-northeast-1.elasticbeanstalk.com',
      port: 5000,
      path: '/ws',
      timeout: 20000,
      overlay: true,
      // clientPort: 3050,
      clientPort: 3000,
    }
  },
  plugins: [
    vue(),
    vueJsx(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
