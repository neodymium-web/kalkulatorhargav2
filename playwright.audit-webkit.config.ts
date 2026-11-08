import { defineConfig, devices } from '@playwright/test'
export default defineConfig({
  testDir: './tests', testMatch: 'release-webkit.spec.ts', outputDir: 'test-results/webkit-audit',
  use: { baseURL: 'http://127.0.0.1:3100' },
  projects: [{ name: 'webkit-iphone', use: { ...devices['iPhone 13'], browserName: 'webkit' } }],
  webServer: { command: 'npm start -- --hostname 127.0.0.1 --port 3100', url: 'http://127.0.0.1:3100', timeout: 60000, reuseExistingServer: true },
})
