# Visual Regression Tests — Why They Fail and How to Fix

## Default: Desktop Only (Production-Ready)

**`npm run test:visual`** runs **chromium-desktop only** (12 tests), matching CI. This passes and is safe for production.

To run all viewports (desktop + mobile + tablet): **`npm run test:visual:all`**. Mobile/tablet tests may fail due to layout instability (see below).

## Cross-Platform Snapshots (Windows ↔ Linux)

Snapshots use **platform-agnostic** names (e.g. `homepage-full-page-chromium-desktop.png`) so the same baseline works locally on Windows and in CI on Linux. The config sets `pathTemplate` without `{platform}` in `playwright.visual.config.js`.

## What's Going On

When you run **`npm run test:visual:all`**, Playwright runs **three projects**:

| Project | Viewport | When it runs |
| ------- | -------- | ------------- |
| chromium-desktop | 1280×720 | Always (local + CI) |
| chromium-mobile | Pixel 5 (393×851) | Local only |
| chromium-tablet | iPad Pro (1024×1366) | Local only |

**GitHub Actions** sets `CI=true`, so the config runs **only chromium-desktop** to stay within the 30-minute timeout. Locally, `CI` is unset, so all three projects run.

## Why Mobile and Tablet Tests Fail

### 1. Missing Baselines

**Error:** `A snapshot doesn't exist at ...chromium-mobile.png, writing actual`

**Cause:** Baselines were created only for desktop. Mobile and tablet use different snapshot files (e.g. `homepage-full-page-chromium-mobile.png`), which were never generated.

### 2. Pixel Differences

**Error:** `2302 pixels (ratio 0.01 of all image pixels) are different`

**Cause:** Screenshots differ from existing baselines because:

- **Different viewport** → Different responsive layout (e.g. mobile nav vs desktop nav)
- **Font rendering** → Slight differences across OS/browser
- **Layout instability** → Height changes (e.g. footer 1579px vs 1911px) from async content, fonts, or images

### 3. Layout Instability

**Error:** `Expected an image 393px by 1579px, received 393px by 1911px` or `Failed to take two consecutive stable screenshots`

**Cause:** Element size changes between captures (fonts, images, or dynamic content loading). Long sections (e.g. Services) can oscillate in height due to font swap or async content.

**Fix:** Use `waitForLayoutStability()` and `waitForFontsReady()` from `tests/visual/helpers.js` before taking screenshots of long/dynamic sections.

---

## Proposed Solutions

### Option A: Default (Recommended for Production)

**`npm run test:visual`** runs desktop only by default. Same as CI. Use this for production.

### Option B: Create/Update All Baselines

Generate or refresh baselines for desktop, mobile, and tablet:

```bash
npx playwright test --config=playwright.visual.config.js --update-snapshots
```

This will:

- Create missing mobile/tablet snapshots
- Update any that differ (use only when changes are intentional)

### Option C: Run Desktop by Default

Change the config so desktop-only is the default, and mobile/tablet are opt-in:

```javascript
// In playwright.visual.config.js — always run desktop; mobile/tablet opt-in via env
projects: [
  { name: 'chromium-desktop', ... },
  ...(process.env.VISUAL_ALL ? [
    { name: 'chromium-mobile', ... },
    { name: 'chromium-tablet', ... },
  ] : []),
],
```

Then: `npm run test:visual` runs desktop; `VISUAL_ALL=1 npm run test:visual` runs all.

### Option D: Increase Threshold for Flaky Layouts

For tests with small, acceptable differences (e.g. 1% pixels), raise the threshold per test:

```javascript
await expect(page).toHaveScreenshot('homepage-above-fold.png', {
  animations: 'disabled',
  maxDiffPixelRatio: 0.02  // Allow 2% pixel difference
});
```

### Option E: Stabilize Layout Before Screenshots

Add extra wait for fonts and layout before capturing:

```javascript
// Wait for fonts and layout to settle
await page.evaluate(() => document.fonts.ready);
await page.waitForLoadState('networkidle');
await page.waitForTimeout(500);
```

---

## Summary

| Scenario | Command | Result |
| -------- | ------- | ------ |
| Production / CI (desktop only) | `npm run test:visual` | 11 passed, 1 skipped |
| All viewports, update baselines | `npm run test:visual:all` + `--update-snapshots` | Creates/updates all snapshots |
| All viewports, compare only | `npm run test:visual:all` | May fail on mobile/tablet |

**Recommendation:** Use `npm run test:visual` for production. Use `npm run test:visual:all` only when debugging mobile/tablet.
