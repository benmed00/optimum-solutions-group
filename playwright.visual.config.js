import { defineConfig, devices } from '@playwright/test';

/**
 * Visual Regression Testing Configuration
 * 
 * This configuration is specifically for visual regression tests using Playwright.
 * It captures screenshots and compares them against baseline images.
 */

export default defineConfig({
  testDir: './tests/visual',
  
  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Default test timeout (includes beforeEach); CI runners need more time */
  timeout: process.env.CI ? 120000 : 60000,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter to use */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list']
  ],

  /* Shared settings for all the projects below */
  use: {
    /* Base URL - must match workflow (vite preview --port 8080) */
    baseURL: 'http://localhost:8080',
    
    /* Collect trace when retrying the failed test. */
    trace: 'on-first-retry',
    
    /* Take screenshots on failure */
    screenshot: 'only-on-failure',
    
    /* Record video on failure */
    video: 'retain-on-failure',
    
    /* Increase timeout for elements (CI runners are slower) */
    actionTimeout: process.env.CI ? 45000 : 15000,
    navigationTimeout: process.env.CI ? 60000 : 30000,
  },

  /* Configure projects - desktop only by default (matches CI). Use VISUAL_ALL=1 for mobile+tablet */
  projects: (process.env.CI || !process.env.VISUAL_ALL)
    ? [
        {
          name: 'chromium-desktop',
          use: {
            ...devices['Desktop Chrome'],
            viewport: { width: 1280, height: 720 },
          },
        },
      ]
    : [
        {
          name: 'chromium-desktop',
          use: {
            ...devices['Desktop Chrome'],
            viewport: { width: 1280, height: 720 },
          },
        },
        {
          name: 'chromium-mobile',
          use: { ...devices['Pixel 5'] },
        },
        {
          name: 'chromium-tablet',
          use: { ...devices['iPad Pro'] },
        },
      ],

  /* Visual comparison settings */
  expect: {
    // Assertion timeout (full-page screenshots need more time for capture + font loading)
    timeout: 20000,
    toHaveScreenshot: {
      // Omit {platform} so same baseline works on Windows (local) and Linux (CI)
      pathTemplate: '{testDir}/{testFilePath}-snapshots/{arg}-{projectName}{ext}',
      threshold: 0.2, // Allow 20% difference
      mode: 'pixel',
      animations: 'disabled', // Disable animations for consistent screenshots
    },
    toMatchSnapshot: { 
      threshold: 0.2,
      mode: 'pixel',
      timeout: 10000
    }
  },

  /* Run your local dev server before starting the tests */
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
