import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { watchClient } from './plugins/vite-plugin-watch-client'


// https://vite.dev/config/
export default defineConfig({
  server: {
    watch: {
      ignored: ['**/build/**', "**/smdsdk/**", "**/app/**", "**/watch/**"]
    }
  },
  plugins: [
    react(),
    watchClient()
  ],
  build: {
    sourcemap: true,
  }
})
