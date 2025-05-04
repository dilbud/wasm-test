import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


// https://vite.dev/config/
export default defineConfig({
  server: {
    watch: {
      ignored: ['**/build/**', "**/smdsdk/**", "**/app/**", "**/watch/**"]
    }
  },
  plugins: [
    react()
  ],
  build: {
    sourcemap: true,
  }
})
