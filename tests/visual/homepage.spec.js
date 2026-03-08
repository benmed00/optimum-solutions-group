import { test, expect } from '@playwright/test';
import { waitForLayoutStability, waitForFontsReady } from './helpers.js';

/**
 * Homepage Visual Regression Tests
 * 
 * These tests capture screenshots of the homepage across different viewport sizes
 * and compare them with baseline screenshots to detect visual regressions.
 */

test.describe('Homepage Visual Tests', () => {
  // Apply to entire test (including beforeEach); CI runners are slower
  test.describe.configure({ timeout: process.env.CI ? 120000 : 60000 });

  test.beforeEach(async ({ page }) => {
    // Handle console errors gracefully
    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('Maximum update depth')) {
        console.log('Console error:', msg.text());
      }
    });

    // Handle page errors gracefully
    page.on('pageerror', error => {
      if (!error.message.includes('Maximum update depth')) {
        console.log('Page error:', error.message);
      }
    });

    // Navigate to homepage
    await page.goto('/', { waitUntil: 'load' });
    
    // Wait for React to render: #root starts empty and Playwright treats empty divs as hidden.
    // Script is type="module" so it loads async; wait for root to have content (React has mounted).
    // CI runners are slower; use longer timeout to avoid flakiness.
    const mountTimeout = process.env.CI ? 45000 : 20000;
    await page.waitForFunction(
      () => {
        const root = document.getElementById('root');
        return root && (root.children.length > 0 || document.querySelector('main, nav, [role="main"]'));
      },
      { timeout: mountTimeout }
    );
    
    // Additional wait for content to stabilize
    await page.waitForTimeout(2000);
    
    // Wait for any remaining network requests to complete
    await page.waitForLoadState('networkidle');
    
    // Hide dynamic elements and disable animations
    await page.addStyleTag({
      content: `
        /* Hide elements with dynamic content */
        .dynamic-timestamp,
        .loading-spinner,
        .animated-element {
          visibility: hidden !important;
        }
        
        /* Disable CSS animations and transitions */
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
        /* Force scroll-animated content visible for full-page screenshot */
        .animate-out, .stagger-children > * {
          opacity: 1 !important;
          transform: none !important;
        }
      `
    });
  });

  test('Homepage - Full page screenshot', async ({ page }) => {
    test.setTimeout(60000); // Full-page capture + font loading can be slow
    await expect(page).toHaveScreenshot('homepage-full-page.png', {
      fullPage: true,
      animations: 'disabled',
      timeout: 45000
    });
  });

  test('Homepage - Above the fold', async ({ page }) => {
    // Screenshot of the visible viewport (above the fold)
    await expect(page).toHaveScreenshot('homepage-above-fold.png', {
      animations: 'disabled'
    });
  });

  test('Homepage - Hero section', async ({ page }) => {
    // Screenshot of just the hero section
    const heroSection = page.locator('section').first();
    await heroSection.waitFor({ state: 'visible', timeout: 15000 });
    await expect(heroSection).toHaveScreenshot('homepage-hero-section.png', {
      animations: 'disabled'
    });
  });

  test('Homepage - Navigation', async ({ page }) => {
    // Screenshot of the navigation bar
    const navigation = page.locator('nav').first();
    await navigation.waitFor({ state: 'visible', timeout: 15000 });
    await expect(navigation).toHaveScreenshot('homepage-navigation.png', {
      animations: 'disabled'
    });
  });

  test('Homepage - Footer', async ({ page }) => {
    // Screenshot of the footer
    const footer = page.locator('footer').first();
    await footer.waitFor({ state: 'visible', timeout: 15000 });
    await footer.scrollIntoViewIfNeeded();
    await expect(footer).toHaveScreenshot('homepage-footer.png', {
      animations: 'disabled'
    });
  });

  test('Homepage - Mobile navigation menu', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'This test only runs on mobile viewports');
    
    // Open mobile menu if it exists
    const menuButton = page.locator('[aria-label="Open menu"], [aria-label="Menu"], .mobile-menu-button');
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await page.waitForTimeout(500); // Wait for animation
      
      await expect(page).toHaveScreenshot('homepage-mobile-menu.png', {
        animations: 'disabled'
      });
    }
  });

  test('Homepage - Contact form section', async ({ page }) => {
    // Scroll to and screenshot contact form if it exists
    const contactForm = page.locator('form, [data-testid="contact-section-form"]').first();
    if (await contactForm.isVisible()) {
      await contactForm.scrollIntoViewIfNeeded();
      await expect(contactForm).toHaveScreenshot('homepage-contact-form.png', {
        animations: 'disabled'
      });
    }
  });

  test('Homepage - Services section', async ({ page }) => {
    test.setTimeout(60000); // Layout stability + screenshot can take 45s on mobile
    const servicesSection = page.locator('[data-testid="services-section-root"], section:has-text("Services")').first();
    if (await servicesSection.isVisible()) {
      // Ensure fonts (e.g. Playfair) are loaded before scroll to avoid font-swap layout shift
      await waitForFontsReady(page);
      await servicesSection.scrollIntoViewIfNeeded();
      // Wait for layout to stabilize (section height can oscillate on mobile due to font/async content)
      await waitForLayoutStability(page, servicesSection, {
        timeout: 15000,
        stabilityWindow: 800,
        checkInterval: 200
      });
      await expect(servicesSection).toHaveScreenshot('homepage-services-section.png', {
        animations: 'disabled',
        maxDiffPixelRatio: 0.05,
        timeout: 30000
      });
    }
  });

  // Test with different color schemes (if supported)
  test('Homepage - Dark theme', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Color scheme tests run on Chromium only');
    test.setTimeout(process.env.CI ? 120000 : 90000); // Full-page capture can be slow
    const mountTimeout = process.env.CI ? 45000 : 20000;
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/', { waitUntil: 'load' });
    await page.waitForFunction(
      () => {
        const root = document.getElementById('root');
        return root && (root.children.length > 0 || document.querySelector('main, nav, [role="main"]'));
      },
      { timeout: mountTimeout }
    );
    await page.waitForTimeout(2000);
    await page.waitForLoadState('domcontentloaded');
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
        /* Force scroll-animated content visible for full-page screenshot */
        .animate-out, .stagger-children > * {
          opacity: 1 !important;
          transform: none !important;
        }
      `
    });
    
    await expect(page).toHaveScreenshot('homepage-dark-theme.png', {
      fullPage: true,
      animations: 'disabled',
      timeout: 60000
    });
  });

  test('Homepage - Light theme', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Color scheme tests run on Chromium only');
    test.setTimeout(process.env.CI ? 120000 : 90000); // Full-page capture can be slow
    const mountTimeout = process.env.CI ? 45000 : 20000;
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/', { waitUntil: 'load' });
    await page.waitForFunction(
      () => {
        const root = document.getElementById('root');
        return root && (root.children.length > 0 || document.querySelector('main, nav, [role="main"]'));
      },
      { timeout: mountTimeout }
    );
    await page.waitForTimeout(2000);
    await page.waitForLoadState('domcontentloaded');
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
        /* Force scroll-animated content visible for full-page screenshot */
        .animate-out, .stagger-children > * {
          opacity: 1 !important;
          transform: none !important;
        }
      `
    });
    
    await expect(page).toHaveScreenshot('homepage-light-theme.png', {
      fullPage: true,
      animations: 'disabled',
      timeout: 60000
    });
  });

  // Test hover states for interactive elements
  test('Homepage - Button hover states', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Hover tests not applicable on mobile');
    
    // Exclude fixed/overlay buttons (e.g. high-contrast toggle) that may be covered
    const buttons = page.locator('main button, main [role="button"], main .btn');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 3); i++) { // Test up to 3 buttons
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        await button.scrollIntoViewIfNeeded();
        await button.hover({ force: true });
        await expect(button).toHaveScreenshot(`homepage-button-${i}-hover.png`, {
          animations: 'disabled'
        });
      }
    }
  });

  // Test focus states for accessibility
  test('Homepage - Focus states', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Focus tests not applicable on mobile');
    
    const focusableElements = page.locator('a, button, input, [tabindex]:not([tabindex="-1"])');
    const elementCount = await focusableElements.count();
    
    for (let i = 0; i < Math.min(elementCount, 5); i++) { // Test up to 5 elements
      const element = focusableElements.nth(i);
      if (await element.isVisible()) {
        await element.focus();
        await expect(element).toHaveScreenshot(`homepage-focus-${i}.png`, {
          animations: 'disabled'
        });
      }
    }
  });
});
