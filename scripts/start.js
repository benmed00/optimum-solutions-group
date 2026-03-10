#!/usr/bin/env node

/**
 * Optimum Solutions Group - Professional START Script
 *
 * A complete, operational entry point for local development.
 * Ensures environment readiness, validates setup, and launches the dev server.
 *
 * Usage: npm start
 *        npm run start
 *        npm run start -- --skip-install   # Skip dependency check
 *        npm run start -- --skip-typecheck # Skip TypeScript validation
 *        npm run start -- --quick          # Minimal checks, start immediately
 */

import { spawn, spawnSync } from 'child_process';
import fs from 'fs';
import net from 'net';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const DEV_PORT = 8080;

// Minimum Node.js version (from package.json engines)
const MIN_NODE_MAJOR = 20;

// Respect NO_COLOR (https://no-color.org) and --no-color
const useColor = !process.env.NO_COLOR && !process.argv.includes('--no-color');

// ANSI colors for terminal output
const colors = useColor
  ? {
      reset: '\x1b[0m',
      dim: '\x1b[2m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      red: '\x1b[31m',
      cyan: '\x1b[36m',
      bold: '\x1b[1m',
    }
  : { reset: '', dim: '', green: '', yellow: '', red: '', cyan: '', bold: '' };

// Emojis (use ASCII fallback when no color)
const emoji = useColor
  ? {
      rocket: '🚀',
      check: '✓',
      warn: '⚠',
      cross: '✗',
      box: '📦',
      gear: '⚙',
      key: '🔑',
      zap: '⚡',
      globe: '🌐',
      sparkles: '✨',
      skip: '⏭️',
    }
  : {
      rocket: '>',
      check: '[OK]',
      warn: '[!]',
      cross: '[X]',
      box: '[pkg]',
      gear: '[*]',
      key: '[env]',
      zap: '[~]',
      globe: '->',
      sparkles: '[+]',
      skip: '--',
    };

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function logStep(step, msg, icon = emoji.gear) {
  log(`\n${colors.bold}${icon} [${step}]${colors.reset} ${msg}`, 'cyan');
}

function logSuccess(msg, icon = emoji.check) {
  log(`  ${colors.green}${icon}${colors.reset} ${msg}`);
}

function logWarn(msg, icon = emoji.warn) {
  log(`  ${colors.yellow}${icon}${colors.reset} ${msg}`, 'yellow');
}

function logError(msg, icon = emoji.cross) {
  log(`  ${colors.red}${icon}${colors.reset} ${msg}`, 'red');
}

/**
 * Parse CLI args (filter out flags that trigger early exit)
 */
function parseArgs() {
  const args = process.argv
    .slice(2)
    .filter((a) => !['--help', '-h', '--version', '-v', '--no-color'].includes(a));
  return {
    skipInstall: args.includes('--skip-install'),
    skipTypecheck: args.includes('--skip-typecheck'),
    quick: args.includes('--quick'),
  };
}

/**
 * Show help and exit
 */
function showHelp() {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  console.log(`
${colors.bold}Optimum Solutions Group - START Script${colors.reset} v${pkg.version}

${colors.dim}Usage:${colors.reset}
  npm start
  npm run start -- [options]

${colors.dim}Options:${colors.reset}
  --quick          Skip install check and type-check; start dev server immediately
  --skip-install   Skip dependency installation check
  --skip-typecheck Skip TypeScript validation
  --no-color       Disable colored output (for CI)
  --help, -h       Show this help
  --version, -v    Show version

${colors.dim}Examples:${colors.reset}
  npm start                    Full startup with pre-checks
  npm start -- --quick         Skip checks, start immediately
  npm start -- --skip-typecheck  Skip type-check only
  npm start -- --no-color      Plain output for CI

${colors.dim}Docs:${colors.reset} docs/guides/package-scripts-analysis.md
`);
  process.exit(0);
}

/**
 * Show version and exit
 */
function showVersion() {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  console.log(pkg.version);
  process.exit(0);
}

/**
 * Check if port is in use
 */
function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', (err) => {
      resolve(err.code === 'EADDRINUSE');
    });
    server.once('listening', () => {
      server.close();
      resolve(false);
    });
    server.listen(port, 'localhost');
  });
}

/**
 * Get PID of process using the port (Windows: netstat, Unix: lsof)
 */
function getPidOnPort(port) {
  const isWin = process.platform === 'win32';
  const result = spawnSync(
    isWin ? 'cmd' : 'lsof',
    isWin ? ['/c', 'netstat', '-ano'] : ['-i', `:${port}`, '-t'],
    { encoding: 'utf8', shell: !isWin }
  );
  const output = (result.stdout || '') + (result.stderr || '');
  if (isWin) {
    const line = output.split('\n').find((l) => l.includes(`:${port}`) && l.includes('LISTENING'));
    const pidMatch = line && line.match(/\s+(\d+)\s*$/);
    return pidMatch ? pidMatch[1] : null;
  }
  const pid = output.trim().split('\n')[0];
  return pid || null;
}

/**
 * Kill process on port. Uses npx kill-port (cross-platform) or platform-specific fallback.
 */
async function killProcessOnPort(port) {
  logStep('PORT', `Port ${port} in use – freeing...`, emoji.gear);
  const result = spawnSync('npx', ['kill-port', String(port)], {
    cwd: ROOT,
    stdio: 'inherit',
    shell: true,
  });
  if (result.status === 0) {
    logSuccess(`Port ${port} freed`);
    await new Promise((r) => setTimeout(r, 500));
    return true;
  }
  const pid = getPidOnPort(port);
  if (pid && process.platform === 'win32') {
    const killResult = spawnSync('taskkill', ['/F', '/PID', pid], {
      stdio: 'pipe',
      shell: true,
      encoding: 'utf8',
    });
    if (killResult.status === 0) {
      logSuccess(`Port ${port} freed (PID ${pid})`);
      await new Promise((r) => setTimeout(r, 500));
      return true;
    }
  }
  if (pid && process.platform !== 'win32') {
    const killResult = spawnSync('kill', ['-9', pid], {
      stdio: 'pipe',
      shell: true,
      encoding: 'utf8',
    });
    if (killResult.status === 0) {
      logSuccess(`Port ${port} freed (PID ${pid})`);
      await new Promise((r) => setTimeout(r, 500));
      return true;
    }
  }
  logError(`Could not free port ${port}. Run "npx kill-port ${port}" manually.`);
  return false;
}

/**
 * Check Node.js version meets engines requirement
 */
function checkNodeVersion() {
  const major = parseInt(process.version.slice(1).split('.')[0], 10);
  if (major < MIN_NODE_MAJOR) {
    logError(`Node.js ${MIN_NODE_MAJOR}+ required. Current: ${process.version}`);
    process.exit(1);
  }
  logSuccess(`Node.js ${process.version}`);
}

/**
 * Ensure .env exists (copy from .env.example if missing)
 */
function ensureEnv() {
  const envPath = path.join(ROOT, '.env');
  const examplePath = path.join(ROOT, '.env.example');

  if (fs.existsSync(envPath)) {
    logSuccess('.env exists');
    return;
  }

  if (fs.existsSync(examplePath)) {
    fs.copyFileSync(examplePath, envPath);
    logSuccess('.env created from .env.example', emoji.key);
    logWarn('Review .env and add your values if needed.');
  } else {
    logWarn('.env.example not found; .env not created.');
  }
}

/**
 * Ensure dependencies are installed
 */
function ensureDependencies() {
  const nodeModules = path.join(ROOT, 'node_modules');

  if (fs.existsSync(nodeModules)) {
    logSuccess('Dependencies present');
    return;
  }

  logStep('INSTALL', 'Installing dependencies...', emoji.box);
  const result = spawnSync('npm', ['install'], {
    cwd: ROOT,
    stdio: 'inherit',
    shell: true,
  });

  if (result.status !== 0) {
    logError('npm install failed');
    process.exit(1);
  }
  logSuccess('Dependencies installed', emoji.sparkles);
}

/**
 * Run TypeScript type-check
 */
function runTypeCheck() {
  logStep('TYPE-CHECK', 'Validating TypeScript...', emoji.gear);
  const result = spawnSync('npm', ['run', 'type-check'], {
    cwd: ROOT,
    stdio: 'inherit',
    shell: true,
  });

  if (result.status !== 0) {
    logError('Type-check failed. Fix errors or use --skip-typecheck');
    process.exit(1);
  }
  logSuccess('Type-check passed');
}

/**
 * Start Vite dev server
 */
async function startDevServer() {
  let portInUse = await isPortInUse(DEV_PORT);
  if (portInUse) {
    const freed = await killProcessOnPort(DEV_PORT);
    if (!freed) process.exit(1);
    portInUse = await isPortInUse(DEV_PORT);
    if (portInUse) {
      logError(`Port ${DEV_PORT} still in use after kill attempt.`);
      process.exit(1);
    }
  }

  logStep('START', 'Launching development server...', emoji.rocket);
  log(`\n  ${colors.dim}${emoji.globe}  http://localhost:${DEV_PORT}${colors.reset}\n`);

  const child = spawn('npm', ['run', 'dev'], {
    cwd: ROOT,
    stdio: 'inherit',
    shell: true,
  });

  child.on('error', (err) => {
    logError(`Failed to start dev server: ${err.message}`);
    process.exit(1);
  });

  child.on('exit', (code) => {
    process.exit(code ?? 0);
  });
}

/**
 * Main entry
 */
async function main() {
  // Early exits
  if (process.argv.includes('--help') || process.argv.includes('-h')) showHelp();
  if (process.argv.includes('--version') || process.argv.includes('-v')) showVersion();

  const { skipInstall, skipTypecheck, quick } = parseArgs();

  log(`\n${colors.bold}${emoji.rocket} Optimum Solutions Group${colors.reset} - Development Start`, 'cyan');
  log(`${colors.dim}React + Vite + TypeScript${colors.reset}`);
  log(`${colors.dim}${'─'.repeat(48)}${colors.reset}\n`);

  // 1. Node version (always)
  logStep('CHECK', 'Node.js version', emoji.zap);
  checkNodeVersion();

  // 2. Environment
  logStep('ENV', 'Environment configuration', emoji.key);
  ensureEnv();

  // 3. Dependencies (unless --skip-install or --quick)
  if (!skipInstall && !quick) {
    logStep('DEPS', 'Dependencies');
    ensureDependencies();
  } else if (quick) {
    log(`\n  ${colors.dim}${emoji.skip}  DEPS skipped (--quick)${colors.reset}`);
  }

  // 4. Type-check (unless --skip-typecheck or --quick)
  if (!skipTypecheck && !quick) {
    runTypeCheck();
  } else if (quick) {
    log(`\n  ${colors.dim}${emoji.skip}  TYPE-CHECK skipped (--quick)${colors.reset}`);
  }

  // 5. Start dev server
  await startDevServer();
}

main().catch((err) => {
  logError(err?.message ?? String(err));
  process.exit(1);
});
