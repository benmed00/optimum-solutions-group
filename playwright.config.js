/**
 * =============================================================================
 * PLAYWRIGHT CONFIGURATION - DEFAULT ENTRY POINT
 * =============================================================================
 *
 * @file       playwright.config.js
 * @purpose    Default config discovered by `npx playwright test`; delegates to
 *             visual regression config so Jest and Playwright tests stay separate.
 *
 * @context    This project uses two test frameworks:
 *             - Jest: unit tests in src/.../__tests__/*.test.ts (run: npm run test)
 *             - Playwright: visual/E2E tests in tests/visual/*.spec.js (run: npm run test:visual)
 *
 * @why        Without this file, `npx playwright test` would use Playwright's default
 *             discovery and try to run Jest test files, causing "jest is not defined"
 *             and similar errors. This file ensures Playwright only runs visual tests.
 *
 * @delegates  playwright.visual.config.js (testDir: tests/visual, projects: chromium-desktop)
 *
 * @commands   npx playwright test          -> visual tests (desktop only by default)
 *             npm run test:visual          -> same, explicit
 *             npm run test:visual:all      -> desktop + mobile + tablet
 *
 * @related    jest.config.mjs              -> Jest unit tests
 *             playwright.visual.config.js  -> actual Playwright settings
 *             tests/visual/               -> spec files and helpers
 *
 * =============================================================================
 */

import config from './playwright.visual.config.js';
export default config;
