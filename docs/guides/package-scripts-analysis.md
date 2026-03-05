# 📦 Package.json Scripts Analysis

Professional analysis of all npm scripts in the Optimum Solutions Group project. Every script is documented, classified by category, and exemplified with usage.

## 📑 Contents

1. [Prerequisites](#-prerequisites)
2. [Quick Reference](#-quick-reference)
3. [Script Index](#-script-index) – Alphabetical list
4. [Scripts by Category](#-scripts-by-category) – 10 categories, 70+ scripts
5. [START Script Usage](#-start-script-usage)
6. [Common Workflows](#-common-workflows)
7. [Usage Examples by Category](#-usage-examples-by-category)
8. [Troubleshooting](#-troubleshooting)
9. [Related Documentation](#-related-documentation)

---

## 📋 Prerequisites

| Requirement | Version |
| ----------- | ------- |
| Node.js | >= 20.0.0 |
| npm | >= 10.0.0 |
| OS | Windows, macOS, or Linux |

Optional: Copy `.env.example` to `.env` and add your values (e.g. analytics API keys).

---

## ⚡ Quick Reference

| Category | Primary Script | Purpose |
| -------- | -------------- | ------- |
| 🚀 **Start** | `npm start` | Full dev startup with pre-checks |
| 💻 **Dev** | `npm run dev` | Vite dev server (port 8080) |
| 📦 **Build** | `npm run build` | Production build |
| 🧪 **Test** | `npm run test` | Jest unit tests |
| 🔍 **Lint** | `npm run lint` | ESLint |
| 📝 **Type-check** | `npm run type-check` | TypeScript validation |

---

## 🔤 Script Index

Quick lookup – all scripts in alphabetical order:

`analyze:bundle` · `badges:generate` · `bundle:analyze` · `budgets:check` · `build` · `build:dev` · `build:optimized` · `build:prod` · `coverage:normalize` · `cypress:form` · `cypress:open` · `cypress:run` · `cypress:run:chrome` · `cypress:run:edge` · `cypress:run:firefox` · `cypress:verify` · `deploy:workflow` · `dev` · `generate:icons` · `lint` · `lint:fix` · `lint:md` · `lint:md:fix` · `prepare:dev` · `preview` · `pwa:check-icons` · `pwa:help` · `pwa:performance` · `pwa:test-offline` · `pwa:validate` · `start` · `test` · `test:accessibility` · `test:accessibility:headed` · `test:accessibility:stable` · `test:all` · `test:ci` · `test:components` · `test:coverage` · `test:coverage:open` · `test:cypress:accessibility` · `test:debug` · `test:e2e` · `test:e2e:accessibility` · `test:e2e:components` · `test:e2e:integration` · `test:e2e:journeys` · `test:e2e:open` · `test:e2e:visual` · `test:features` · `test:hooks` · `test:performance` · `test:seo` · `test:seo:components` · `test:seo:hook` · `test:seo:utils` · `test:ui` · `test:utils` · `test:visual` · `test:visual:report` · `test:visual:ui` · `test:visual:update` · `test:watch` · `test:workflow` · `test:workflow:local` · `type-check` · `type-check:all` · `type-check:app` · `type-check:ci` · `type-check:jest` · `type-check:main` · `type-check:node` · `type-check:strict` · `type-check:watch`

---

## 📂 Scripts by Category

### 1. 🚀 Development & Server

| Script | Command | Description |
| ------ | ------- | ----------- |
| `start` | `node scripts/start.js` | **Professional START script** – Node check, env setup, deps, type-check, dev server |
| `dev` | `vite` | Vite dev server (localhost:8080) |
| `preview` | `vite preview` | Preview production build locally |

### 2. 📦 Build

| Script | Command | Description |
| ------ | ------- | ----------- |
| `build` | `vite build` | Standard production build |
| `build:dev` | `vite build --mode development` | Development-mode build |
| `build:prod` | `set NODE_ENV=production && vite build --config vite.config.prod.ts` | Production build (Windows env) |
| `build:optimized` | `node scripts/build-optimized.js` | Custom optimized build pipeline |

### 3. 🔍 Linting

| Script | Command | Description |
| ------ | ------- | ----------- |
| `lint` | `eslint .` | ESLint on entire codebase |
| `lint:fix` | `eslint . --fix` | ESLint with auto-fix |
| `lint:md` | `markdownlint "**/*.md" --ignore node_modules` | Markdown lint |
| `lint:md:fix` | `markdownlint "**/*.md" --ignore node_modules --fix` | Markdown lint with fix |

### 4. 🧪 Unit Tests (Jest)

| Script | Command | Description |
| ------ | ------- | ----------- |
| `test` | `jest` | Run all Jest tests |
| `test:watch` | `jest --watch` | Watch mode |
| `test:coverage` | `jest --coverage` | Coverage report |
| `test:coverage:open` | `jest --coverage && start coverage/...` | Coverage + open HTML report |
| `test:ci` | `jest --coverage --watchAll=false --passWithNoTests` | CI-friendly run |
| `test:ui` | `jest --testPathPatterns=shared/ui` | UI component tests |
| `test:components` | `jest --testPathPatterns=shared/components` | Shared component tests |
| `test:features` | `jest --testPathPatterns=features` | Feature tests |
| `test:hooks` | `jest --testPathPatterns=hooks` | Hook tests |
| `test:utils` | `jest --testPathPatterns=utils` | Utility tests |
| `test:seo` | `jest --testPathPatterns=seo` | SEO-related tests |
| `test:seo:hook` | `jest --testPathPatterns=useSEO` | useSEO hook tests |
| `test:seo:components` | `jest --testPathPatterns=SEODashboard` | SEO dashboard tests |
| `test:seo:utils` | `jest --testPathPatterns="seo(\\.test)?\\.(ts&#124;tsx)$"` | SEO utils tests |
| `test:accessibility` | `jest --testNamePattern="accessibility&#124;a11y"` | A11y unit tests |
| `test:performance` | `jest --testNamePattern="performance&#124;benchmark"` | Performance tests |
| `test:debug` | `jest --no-cache --verbose` | Debug mode |

### 5. 📝 Type Checking

| Script | Command | Description |
| ------ | ------- | ----------- |
| `type-check` | `tsc --noEmit` | Main TS check |
| `type-check:watch` | `tsc --noEmit --watch` | Watch mode |
| `type-check:all` | Runs main, app, jest, node configs | Full multi-config check |
| `type-check:main` | `tsc --noEmit` | Default tsconfig |
| `type-check:app` | `tsc --project tsconfig.app.json` | App config |
| `type-check:jest` | `tsc --project tsconfig.jest.json` | Jest config |
| `type-check:node` | `tsc --project tsconfig.node.json` | Node config |
| `type-check:strict` | `tsc --noEmit --strict` | Strict mode |
| `type-check:ci` | `type-check:all && lint` | CI validation |

### 6. 🌐 E2E & Cypress

| Script | Command | Description |
| ------ | ------- | ----------- |
| `cypress:open` | `cypress open` | Cypress UI |
| `cypress:run` | `cypress run` | Headless run |
| `cypress:verify` | `cypress verify` | Verify Cypress install |
| `cypress:run:chrome` | `cypress run --browser chrome` | Chrome |
| `cypress:run:firefox` | `cypress run --browser firefox` | Firefox |
| `cypress:run:edge` | `cypress run --browser edge` | Edge |
| `cypress:form` | `npx cypress run --spec cypress/e2e/components/form.cy.ts --headed` | Form component E2E (headed) |
| `test:e2e` | `start-server-and-test dev http://localhost:8080 cypress:run` | E2E with dev server |
| `test:e2e:open` | Same + cypress:open | E2E with Cypress UI |
| `test:e2e:components` | `cypress run --spec 'cypress/e2e/components/**/*'` | Component E2E |
| `test:e2e:integration` | `cypress run --spec 'cypress/e2e/integration/**/*'` | Integration E2E |
| `test:e2e:accessibility` | `cypress run --spec 'cypress/e2e/accessibility/**/*'` | A11y E2E |
| `test:cypress:accessibility` | `start-server-and-test dev ... cypress run --spec accessibility/**/*` | A11y E2E with dev server |
| `test:accessibility:headed` | Same + `--headed` | A11y E2E headed (visible browser) |
| `test:accessibility:stable` | `node scripts/run-accessibility-tests.js` | Stable a11y test runner |
| `test:e2e:visual` | `cypress run --spec 'cypress/e2e/visual/**/*'` | Visual E2E |
| `test:e2e:journeys` | `cypress run --spec 'cypress/e2e/user-journeys/**/*'` | User journey E2E |
| `test:all` | `npm run test && npm run test:e2e` | Unit + E2E tests |
| `test:workflow` | `node scripts/test-workflow.js` | CI workflow tests |
| `test:workflow:local` | `node scripts/test-local-workflow.js` | Local workflow tests |

### 7. 🎨 Visual Testing (Playwright)

| Script | Command | Description |
| ------ | ------- | ----------- |
| `test:visual` | `playwright test --config=playwright.visual.config.js` | Visual regression |
| `test:visual:update` | Same + `--update-snapshots` | Update snapshots |
| `test:visual:report` | `playwright show-report playwright-report` | Open report |
| `test:visual:ui` | Same + `--ui` | Playwright UI |

### 8. 📊 Bundle & Performance

| Script | Command | Description |
| ------ | ------- | ----------- |
| `analyze:bundle` | `vite build --mode production && bundle:analyze` | Build + analyze |
| `bundle:analyze` | `node scripts/analyze-bundle.js` | Bundle analysis |
| `budgets:check` | `node scripts/enforce-performance-budgets.js` | Performance budgets |

### 9. 📱 PWA & Icons

| Script | Command | Description |
| ------ | ------- | ----------- |
| `pwa:validate` | `node scripts/pwa-dev-tools.js validate-manifest` | Validate manifest |
| `pwa:check-icons` | `node scripts/pwa-dev-tools.js check-icons` | Icon check |
| `pwa:performance` | `node scripts/pwa-dev-tools.js analyze-performance` | PWA performance |
| `pwa:test-offline` | `node scripts/pwa-dev-tools.js test-offline` | Offline test |
| `pwa:help` | `node scripts/pwa-dev-tools.js help` | PWA tools help |
| `generate:icons` | `node scripts/generate-pwa-icons.js` | Generate PWA icons |

### 10. 🔄 Workflow & Deployment

| Script | Command | Description |
| ------ | ------- | ----------- |
| `deploy:workflow` | `node deploy-workflow.js` | Deployment workflow |
| `badges:generate` | `node scripts/generate-status-badges.js` | GitHub badges |
| `prepare:dev` | `type-check && echo '✅ Development environment ready!'` | Dev readiness check |
| `coverage:normalize` | `node scripts/normalize-coverage-paths.js` | Normalize coverage paths |

---

## 🚀 START Script Usage

The `start` script is the recommended entry point for local development:

```bash
npm start
```

### ⚙️ Options

| Flag | Effect |
| ---- | ------ |
| `--quick` | ⚡ Skip install check and type-check; start dev server immediately |
| `--skip-install` | 📦 Skip dependency installation check |
| `--skip-typecheck` | 📝 Skip TypeScript validation |
| `--no-color` | Disable colored output (for CI) |
| `--help`, `-h` | Show usage and exit |
| `--version`, `-v` | Show version and exit |

### 💡 Examples

```bash
npm start                    # Full startup with pre-checks
npm start -- --quick         # Skip checks, start immediately
npm start -- --skip-typecheck # Skip type-check only
npm start -- --no-color      # Plain output for CI
npm start -- --help          # Show help
```

### ✨ What it does

1. ⚡ Verifies Node.js >= 20
2. 🔑 Creates `.env` from `.env.example` if missing
3. 📦 Runs `npm install` if `node_modules` is missing
4. 📝 Runs `npm run type-check`
5. 🌐 Starts Vite dev server at http://localhost:8080

If port 8080 is in use, the script automatically frees it (via `kill-port` or platform-specific `taskkill`/`kill`) and then continues starting.

---

## 🔄 Common Workflows

### Before committing

```bash
npm run type-check && npm run lint && npm run test:ci
```

### CI pipeline (typical order)

```bash
npm run type-check:ci        # Type-check + lint
npm run test:ci              # Unit tests with coverage
npm run test:e2e             # E2E tests (or test:workflow)
npm run build                # Production build
```

### Pre-deploy checklist

```bash
npm run build                # Verify build succeeds
npm run budgets:check        # Performance budgets
npm run pwa:validate        # PWA manifest valid
```

### Quick local dev (no checks)

```bash
npm start -- --quick
```

---

## 📋 Usage Examples by Category

### 🚀 Development

```bash
npm start                    # Full startup with pre-checks
npm start -- --quick         # Skip checks, start immediately
npm run dev                  # Direct Vite dev server
npm run preview              # Preview production build (run build first)
```

### 📦 Build

```bash
npm run build                # Production build
npm run build:dev            # Development-mode build
npm run build:prod           # Production build (Windows)
npm run build:optimized      # Custom optimized pipeline
```

### 🔍 Linting

```bash
npm run lint                 # Check code
npm run lint:fix             # Auto-fix ESLint issues
npm run lint:md              # Lint markdown files
npm run lint:md:fix          # Auto-fix markdown
```

### 🧪 Unit Tests (Jest)

```bash
npm run test                 # All unit tests
npm run test:watch           # Watch mode during development
npm run test:coverage        # Coverage report
npm run test:coverage:open   # Coverage + open HTML report
npm run test:ci              # CI pipeline (no watch)
npm run test:components      # Shared components only
npm run test:features        # Feature tests only
npm run test:seo             # SEO-related tests
npm run test:accessibility   # A11y unit tests
```

### 📝 Type Checking

```bash
npm run type-check           # Main config
npm run type-check:all       # All tsconfigs (main, app, jest, node)
npm run type-check:ci        # Full CI validation (type-check + lint)
```

### 🌐 E2E (Cypress)

```bash
npm run cypress:open         # Open Cypress UI
npm run test:e2e             # Full E2E (starts dev server, runs Cypress)
npm run test:e2e:open        # E2E with Cypress UI
npm run test:e2e:components  # Component E2E only
npm run test:all             # Unit + E2E in sequence
```

### 🎨 Visual Testing (Playwright)

```bash
npm run test:visual          # Visual regression tests
npm run test:visual:update   # Update snapshots
npm run test:visual:report   # Open Playwright report
```

### 📊 Bundle & Performance

```bash
npm run analyze:bundle       # Build + bundle analysis
npm run budgets:check        # Enforce performance budgets
```

### 📱 PWA

```bash
npm run pwa:validate         # Validate manifest
npm run pwa:check-icons      # Check PWA icons
npm run pwa:help             # PWA tools help
npm run generate:icons       # Generate PWA icons
```

### 🔄 Workflow

```bash
npm run prepare:dev          # Type-check + readiness message
npm run badges:generate      # Generate GitHub status badges
npm run deploy:workflow      # Run deployment workflow
```

---

## 🔧 Troubleshooting

| Issue | Solution |
| ----- | -------- |
| **Port 8080 already in use** | The start script auto-frees the port. If it fails, run `npx kill-port 8080` manually. |
| **Node.js version error** | Install Node.js 20+ from [nodejs.org](https://nodejs.org). Check with `node -v`. |
| **Type-check fails** | Run `npm run type-check` to see errors. Use `npm start -- --skip-typecheck` to bypass during dev. |
| **Emojis show as garbled** | Use Windows Terminal or VS Code terminal. Or run `npm start -- --no-color` for plain output. |
| **`.env` not found** | The start script creates it from `.env.example`. If missing, copy manually: `cp .env.example .env` |
| **Cypress/E2E fails** | Ensure dev server isn't running elsewhere. Run `npm run cypress:verify` to check Cypress install. |

---

## 📚 Related Documentation

| Doc | Description |
| --- | ----------- |
| [Cypress README](../../cypress/README.md) | Cypress setup and E2E testing |
| [Cypress Guide](cypress-readme.md) | Cypress configuration and usage |
| [Testing Standards](../testing/testing-standards.md) | Test conventions and coverage |
| [Deployment Guide](deployment-guide.md) | Build and deploy workflow |
| [PWA Implementation](pwa-implementation-guide.md) | PWA setup and validation |
| [Accessibility](accessibility.md) | A11y testing and standards |
