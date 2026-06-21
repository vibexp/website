import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright config for the (Astro) website. Runs the `e2e/astro/**` specs
 * against the static `astro preview` server on :4321. Build first (`npm run
 * build`), then `npm run test:e2e`; the config starts the preview server itself.
 */
export default defineConfig({
  testDir: './e2e/astro',
  timeout: 20000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 4,
  reporter: [['list']],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:4321',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 900 },
      },
    },
  ],
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4321',
    reuseExistingServer: true,
    timeout: 120000,
  },
})
