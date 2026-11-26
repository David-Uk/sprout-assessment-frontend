import react from '@vitejs/plugin-react'
import process from 'node:process'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Optional development proxy: set VITE_USE_DEV_PROXY=true and
  // VITE_API_BASE_URL=/api to avoid configuring CORS locally.
  const proxy =
    env.VITE_USE_DEV_PROXY === 'true'
      ? {
          '/api': {
            target: env.VITE_API_TARGET || 'http://localhost:3000',
            changeOrigin: true,
          },
        }
      : undefined

  return {
    devtools: {
      apply: 'serve',
    },
    plugins: [react()],
    server: { proxy },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      clearMocks: true,
    },
  }
})
