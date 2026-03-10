/**
 * Visual regression test helpers — enterprise-grade stabilization utilities.
 *
 * Use these to reduce flakiness from layout shifts (CLS), font loading, and async content.
 */

/**
 * Waits for an element's dimensions to stabilize before taking a screenshot.
 * Prevents "Failed to take two consecutive stable screenshots" on long/dynamic sections.
 *
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {import('@playwright/test').Locator} locator - Element to stabilize
 * @param {Object} options - Options
 * @param {number} options.timeout - Max wait in ms (default 15000)
 * @param {number} options.stabilityWindow - Consecutive stable checks in ms (default 800)
 * @param {number} options.checkInterval - Interval between checks in ms (default 200)
 */
export async function waitForLayoutStability(page, locator, options = {}) {
  const { timeout = 15000, stabilityWindow = 800, checkInterval = 200 } = options;
  const start = Date.now();
  let lastHeight = -1;
  let stableSince = 0;

  while (Date.now() - start < timeout) {
    const height = await locator.evaluate((el) => el.offsetHeight);
    if (height === lastHeight && lastHeight >= 0) {
      if (stableSince === 0) stableSince = Date.now();
      if (Date.now() - stableSince >= stabilityWindow) return;
    } else {
      stableSince = 0;
    }
    lastHeight = height;
    await page.waitForTimeout(checkInterval);
  }
  throw new Error(`Layout did not stabilize within ${timeout}ms (last height: ${lastHeight})`);
}

/**
 * Ensures fonts are loaded before visual capture. Call before scrolling to sections
 * that use custom fonts (e.g. Playfair) to avoid layout shift from font swap.
 *
 * @param {import('@playwright/test').Page} page - Playwright page
 */
export async function waitForFontsReady(page) {
  await page.evaluate(() => document.fonts.ready);
}
