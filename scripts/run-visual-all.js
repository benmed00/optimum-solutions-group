#!/usr/bin/env node
/**
 * Run visual tests for all viewports (desktop, mobile, tablet).
 * Sets VISUAL_ALL=1 so playwright.visual.config.js includes mobile and tablet projects.
 */
import { execSync } from 'child_process';

process.env.VISUAL_ALL = '1';
execSync('npx playwright test --config=playwright.visual.config.js', {
  stdio: 'inherit',
});
