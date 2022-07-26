/// <reference types="vitest" />

// Configure Vitest (https://vitest.dev/config)

import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    exclude: ['node_modules', 'build'],
  },
})
