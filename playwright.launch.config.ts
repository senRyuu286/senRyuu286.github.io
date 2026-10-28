import { defineConfig, devices } from '@playwright/test';

// Launch gate. Run with: pnpm test:launch (close pnpm dev first).
// It checks the built site for leftover placeholders and missing launch pieces.
export default defineConfig({
  testDir: './launch-tests',
  reporter: 'list',
  use: { baseURL: 'http://localhost:4321' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'pnpm build && pnpm preview',
    url: 'http://localhost:4321',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});