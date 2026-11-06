import { defineConfig, devices } from '@playwright/test'

const baseURL = 'http://127.0.0.1:3100'

export default defineConfig({
  testDir: './tests',
  testMatch: '*.spec.ts',
  use: { baseURL },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'], viewport: { width: 320, height: 800 } } },
  ],
  webServer: { command: 'npm start -- --hostname 127.0.0.1 --port 3100', url: baseURL, timeout: 60_000 },
})
