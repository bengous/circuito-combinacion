import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests on the production build (e2e/). Chromium only.
 * - CI installs its browser: `npx playwright install --with-deps chromium`.
 * - Locally, a preinstalled Chromium can be used instead of downloading one:
 *   PLAYWRIGHT_CHROMIUM_EXECUTABLE=/path/to/chrome npm run test:e2e
 */
const PORT = Number(process.env.E2E_PORT ?? 4177);
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined;
const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    launchOptions: { executablePath },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run build && npx vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    // Locally, a server already running on the port is reused: make sure it serves a fresh build.
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
});
