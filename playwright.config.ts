import { defineConfig, devices } from '@playwright/test';
import { BASE_URL, STORAGE_STATE } from './src/config/env';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 60_000,
  expect: { timeout: 15_000 },

  use: {
    baseURL: BASE_URL,
    locale: 'pl-PL',
    timezoneId: 'Europe/Warsaw',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    /**
     * Authentication project. Logs in once and stores the session in
     * playwright/.auth/user.json. Every other project depends on it,
     * so the login runs a single time per test run.
     */
    {
      name: 'login',
      testMatch: /.*\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    /**
     * Feature project. Reuses the stored session, so its tests start
     * already logged in.
     */
    {
      name: 'home',
      testMatch: /home[\\/].*\.spec\.ts/,
      dependencies: ['login'],
      use: { ...devices['Desktop Chrome'], storageState: STORAGE_STATE },
    },

    /**
     * Prescription consultation booking. Books a real consultation and cancels
     * it again in the post-condition, so it runs on its own worker.
     */
    {
      name: 'prescription',
      testMatch: /prescription[\\/].*\.spec\.ts/,
      dependencies: ['login'],
      use: { ...devices['Desktop Chrome'], storageState: STORAGE_STATE },
    },
  ],
});
