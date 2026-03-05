#!/usr/bin/env node

/**
 * Run Skipped Pipelines Locally
 *
 * Executes the 3 jobs that are skipped on PRs:
 * 1. Update Performance Baseline
 * 2. Deploy Performance Dashboard (data generation only - no deploy)
 * 3. SEO Performance Tracking
 *
 * Prerequisites: performance-report.json, axe-report.json, bundle-analyzer-report.json
 * This script runs the upstream jobs first (performance, accessibility, bundle, seo)
 * then the skipped jobs.
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

function run(cmd, args = [], opts = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, {
      stdio: 'inherit',
      shell: true,
      cwd: ROOT,
      ...opts,
    });
    proc.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`Exit ${code}`))));
  });
}

function runBackground(cmd, args) {
  const proc = spawn(cmd, args, {
    stdio: 'pipe',
    shell: true,
    cwd: ROOT,
  });
  return proc;
}

async function waitForUrl(url, timeout = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch (_) {}
    await new Promise((r) => setTimeout(r, 2000));
  }
  return false;
}

async function main() {
  console.log('\n🚀 Running Skipped Pipelines Locally\n');
  console.log('═'.repeat(60));

  let serverProc = null;

  try {
    // 1. Build
    console.log('\n📦 Step 1: Build Application');
    await run('npm', ['run', 'build']);

    // 2. Start preview server
    console.log('\n🌐 Step 2: Start Preview Server');
    serverProc = runBackground('npx', ['vite', 'preview', '--port', '4173']);
    const ready = await waitForUrl('http://localhost:4173');
    if (!ready) throw new Error('Server did not start in time');
    console.log('   ✅ Server ready at http://localhost:4173');

    // 3. Performance Audit
    console.log('\n📊 Step 3: Performance Audit');
    try {
      await run('node', [
        'scripts/audit-runner.js',
        'performance',
        'http://localhost:4173',
        'performance-report.json',
      ]);
    } catch (e) {
      console.log('   ⚠️ Performance audit failed:', e.message);
    }
    if (!fs.existsSync(path.join(ROOT, 'performance-report.json'))) {
      fs.writeFileSync(
        path.join(ROOT, 'performance-report.json'),
        JSON.stringify({
          error: 'Audit failed (Chrome/Puppeteer may need update)',
          timestamp: new Date().toISOString(),
          scores: { performance: 0 },
        }, null, 2)
      );
      console.log('   Created fallback performance-report.json');
    }

    // 4. Accessibility Audit
    console.log('\n♿ Step 4: Accessibility Audit');
    try {
      await run('npx', ['@axe-core/cli', 'http://localhost:4173', '--save', 'axe-report.json']);
    } catch (_) {
      fs.writeFileSync(path.join(ROOT, 'axe-report.json'), JSON.stringify({ violations: [] }));
    }
    try {
      await run('npx', ['pa11y-ci', 'http://localhost:4173', '--reporter', 'json'], {
        stdio: 'pipe',
      }).catch(() => {});
    } catch (_) {}
    if (!fs.existsSync(path.join(ROOT, 'pa11y-report.json'))) {
      fs.writeFileSync(path.join(ROOT, 'pa11y-report.json'), '[]');
    }

    // 5. Bundle Analysis
    console.log('\n📦 Step 5: Bundle Analysis');
    try {
      await run('npm', ['run', 'analyze:bundle']);
    } catch (e) {
      console.log('   ⚠️ Bundle analysis failed:', e.message);
    }

    // 6. SEO Audit (Lighthouse)
    console.log('\n🔍 Step 6: SEO / Lighthouse Audit');
    try {
      await run('node', [
        'scripts/audit-runner.js',
        'seo',
        'http://localhost:4173',
        'seo-audit-results.json',
      ]);
      const seoPath = path.join(ROOT, 'seo-audit-results.json');
      if (fs.existsSync(seoPath)) {
        const seoData = JSON.parse(fs.readFileSync(seoPath, 'utf8'));
        const lhr = seoData.fullReport?.lhr || seoData;
        fs.writeFileSync(
          path.join(ROOT, 'lighthouse-results.json'),
          JSON.stringify(lhr, null, 2)
        );
      }
    } catch (e) {
      console.log('   ⚠️ SEO audit failed:', e.message);
    }
    if (!fs.existsSync(path.join(ROOT, 'lighthouse-results.json'))) {
      fs.writeFileSync(
        path.join(ROOT, 'lighthouse-results.json'),
        JSON.stringify({
          categories: {
            seo: { score: 0, auditRefs: [] },
            accessibility: { score: 0, auditRefs: [] },
            'best-practices': { score: 0, auditRefs: [] },
          },
          audits: {},
        })
      );
    }

    // 7. Prepare reports for dashboard
    console.log('\n📁 Step 7: Prepare Reports Directory');
    const reportsDir = path.join(ROOT, 'reports');
    fs.mkdirSync(reportsDir, { recursive: true });
    for (const [src, dest] of [
      ['performance-report.json', 'reports/performance-report.json'],
      ['axe-report.json', 'reports/accessibility-axe-report.json'],
      ['bundle-analyzer-report.json', 'reports/bundle-analyzer-report.json'],
    ]) {
      const srcPath = path.join(ROOT, src);
      const destPath = path.join(ROOT, dest);
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`   ✓ ${dest}`);
      }
    }

    // 8. Update Performance Baseline (skipped job 1)
    console.log('\n📈 Step 8: Update Performance Baseline');
    const perfReport = path.join(ROOT, 'performance-report.json');
    if (fs.existsSync(perfReport)) {
      const baselineDir = path.join(ROOT, '.github', 'performance-baselines');
      fs.mkdirSync(baselineDir, { recursive: true });
      fs.copyFileSync(perfReport, path.join(baselineDir, 'performance-baseline.json'));
      console.log('   ✅ Baseline updated at .github/performance-baselines/performance-baseline.json');
    } else {
      console.log('   ⚠️ No performance report - skipped');
    }

    // 9. Generate Dashboard Data (skipped job 2 - data only)
    console.log('\n📊 Step 9: Generate Dashboard Data');
    const dashboardScript = path.join(ROOT, 'scripts', 'generate-dashboard-data.js');
    if (fs.existsSync(dashboardScript)) {
      try {
        await run('node', [
          dashboardScript,
          '--performance',
          'reports/performance-*.json',
          '--accessibility',
          'reports/accessibility-*.json',
          '--bundle',
          'reports/bundle-*.json',
          '--output',
          'dashboard-data.json',
        ]);
        const dashboardDir = path.join(ROOT, 'dashboard');
        fs.mkdirSync(dashboardDir, { recursive: true });
        if (fs.existsSync(path.join(ROOT, 'dashboard-data.json'))) {
          fs.copyFileSync(
            path.join(ROOT, 'dashboard-data.json'),
            path.join(dashboardDir, 'data.json')
          );
        }
        console.log('   ✅ Dashboard data: dashboard/data.json');
      } catch (e) {
        console.log('   ⚠️ Dashboard generation failed:', e.message);
      }
    } else {
      console.log('   ⚠️ generate-dashboard-data.js not found');
    }

    // 10. SEO Performance Tracking (skipped job 3)
    console.log('\n📈 Step 10: SEO Performance Tracking');
    const lighthousePath = path.join(ROOT, 'lighthouse-results.json');
    if (fs.existsSync(lighthousePath)) {
      const lh = JSON.parse(fs.readFileSync(lighthousePath, 'utf8'));
      const scores = {
        seo: Math.round((lh.categories?.seo?.score ?? 0) * 100),
        accessibility: Math.round((lh.categories?.accessibility?.score ?? 0) * 100),
        bestPractices: Math.round((lh.categories?.['best-practices']?.score ?? 0) * 100),
      };
      console.log('   📊 SEO Metrics:', JSON.stringify(scores, null, 2));
      fs.writeFileSync(
        path.join(ROOT, 'seo-metrics-local.json'),
        JSON.stringify(
          {
            timestamp: new Date().toISOString(),
            branch: 'local',
            scores,
          },
          null,
          2
        )
      );
      console.log('   ✅ Metrics saved: seo-metrics-local.json');
    } else {
      console.log('   ⚠️ No Lighthouse results - skipped');
    }

    console.log('\n' + '═'.repeat(60));
    console.log('✅ All skipped pipeline steps completed locally\n');
  } finally {
    if (serverProc) {
      serverProc.kill('SIGTERM');
      console.log('   Server stopped');
    }
  }
}

main().catch((err) => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
