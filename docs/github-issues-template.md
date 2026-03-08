# GitHub Issues — Copy-Paste Ready

Use this template to create issues. Each block can be pasted into GitHub's "New Issue" form.

**Related**: [Documentation Index](README.md) | [Technical Audit Report](technical-audit-report.md)

---

## Issue 1: Remove console.log from main.tsx

**Title:** `perf: Remove console.log statements from main.tsx`

**Labels:** `performance`, `cleanup`

**Priority:** High

**Body:**
```markdown
## Problem
`src/main.tsx` contains 10+ `console.log`/`console.error` calls for initialization diagnostics. These run in production and add noise.

## Technical Impact
- Unnecessary runtime overhead
- Potential information leakage
- Unprofessional UX in production

## Proposed Solution
- Replace with `logger.debug()` from `src/shared/utils/logger.ts` guarded by `import.meta.env.DEV`
- Or ensure `drop_console` in Vite build strips them

## Acceptance Criteria
- [ ] No `console.log`/`console.info` in `main.tsx` in production build
- [ ] Diagnostic logging only in development mode
```

---

## Issue 2: Add React.memo to list components

**Title:** `perf: Add React.memo to frequently re-rendered list components`

**Labels:** `performance`, `refactor`

**Priority:** Medium

**Body:**
```markdown
## Problem
Components like `TestimonialsSection`, `PortfolioSection`, `ServicesSection` render lists without memoization. Parent re-renders can cause unnecessary child re-renders.

## Proposed Solution
- Wrap list item components with `React.memo` where props are stable
- Use `useMemo` for derived list data
- Profile with React DevTools Profiler to validate

## Acceptance Criteria
- [ ] List item components memoized where appropriate
- [ ] No regression in bundle size
```

---

## Issue 3: Integrate budgets:check into CI

**Title:** `perf: Integrate budgets:check into CI pipeline`

**Labels:** `performance`, `ci`

**Priority:** High

**Body:**
```markdown
## Problem
`scripts/enforce-performance-budgets.js` exists but is not invoked in any GitHub workflow. Performance budgets are never enforced.

## Proposed Solution
- Add `budgets:check` step to `performance-monitoring.yml` or `code-quality.yml`
- Ensure Lighthouse/bundle reports are generated before check

## Acceptance Criteria
- [ ] `budgets:check` runs on PRs targeting `main`/`develop`
- [ ] Build fails when budgets exceeded
```

---

## Issue 4: Leverage TanStack Query

**Title:** `feat: Leverage TanStack Query for API caching and deduplication`

**Labels:** `performance`, `caching`, `refactor`

**Priority:** High

**Body:**
```markdown
## Problem
`@tanstack/react-query` is installed but **no `useQuery` or `useMutation`** is used. All data fetching uses raw `fetch` or `useEffect` + `fetch`.

## Technical Impact
No request deduplication; no automatic caching; wasted network and CPU.

## Proposed Solution
- Create custom hooks (e.g., `useAnalyticsData`) that wrap `useQuery`
- Migrate `CoreWebVitalsDashboard` and `AnalyticsDashboard` to React Query
- Configure `staleTime`/`gcTime` per endpoint

## Acceptance Criteria
- [ ] At least one data-fetching flow uses `useQuery`
- [ ] Duplicate requests deduplicated
- [ ] Loading/error states handled via React Query
```

---

## Issue 5: Centralized API client

**Title:** `feat: Introduce centralized API client with error normalization and retry`

**Labels:** `api`, `refactor`, `dx`

**Priority:** High

**Body:**
```markdown
## Problem
No shared API abstraction. `fetch` used directly in analytics, performanceMonitor, CoreWebVitalsDashboard. No retry, timeout, or request interceptors.

## Proposed Solution
- Create `src/shared/services/apiClient.ts` with base URL, retry, timeout, normalized errors
- Migrate all `fetch` calls to use this client

## Acceptance Criteria
- [ ] Single `apiClient` used for all API requests
- [ ] Retry on 5xx and network errors
- [ ] Typed error responses
```

---

## Issue 6: Wire analytics env vars

**Title:** `fix: Wire analytics apiEndpoint and apiKey from environment`

**Labels:** `bug`, `analytics`, `config`

**Priority:** Critical

**Body:**
```markdown
## Problem
`AnalyticsService` is instantiated without `apiEndpoint` or `apiKey`. Production analytics never reach an API.

## Proposed Solution
- Pass `apiEndpoint: import.meta.env.VITE_ANALYTICS_API_ENDPOINT` and `apiKey: import.meta.env.VITE_ANALYTICS_API_KEY` into constructor
- Document in `.env.example`

## Acceptance Criteria
- [ ] Analytics sends to configured endpoint when env is set
- [ ] API key sent in Authorization header when configured
```

---

## Issue 7: Document state management strategy

**Title:** `refactor: Document global vs local state strategy`

**Labels:** `documentation`, `state-management`

**Priority:** Low

**Body:**
```markdown
## Problem
No documented strategy for when to use Context vs React Query vs local state.

## Proposed Solution
- Add `docs/STATE_MANAGEMENT.md` describing server state (React Query), UI state (Context/local), and anti-patterns

## Acceptance Criteria
- [ ] Document exists and linked from README
```

---

## Issue 8: Fix ErrorBoundary @ts-ignore

**Title:** `fix: Replace @ts-ignore with proper typing in ErrorBoundary`

**Labels:** `refactor`, `type-safety`

**Priority:** Medium

**Body:**
```markdown
## Problem
`ErrorBoundary.tsx` line 80 uses `@ts-ignore` which suppresses type errors.

## Proposed Solution
- Fix underlying type error
- Remove `@ts-ignore`

## Acceptance Criteria
- [ ] No @ts-ignore in ErrorBoundary
- [ ] TypeScript compiles without errors
```

---

## Issue 9: Typed error models

**Title:** `feat: Add typed error models and user-facing error messages`

**Labels:** `error-handling`, `ux`

**Priority:** Medium

**Body:**
```markdown
## Problem
ErrorBoundary and errorHandler use generic messages. No typed error hierarchy or user-facing message mapping.

## Proposed Solution
- Define AppError base and subtypes in `src/shared/types/errors.ts`
- Map error types to user-facing messages
- Use in ErrorBoundary fallback

## Acceptance Criteria
- [ ] Typed error models exported
- [ ] ErrorBoundary shows user-friendly messages based on error type
```

---

## Issue 10: Sentry / structured logging

**Title:** `feat: Integrate structured logging and Sentry for production`

**Labels:** `observability`, `logging`

**Priority:** Medium

**Body:**
```markdown
## Problem
`logger.ts` uses console only. No Sentry or backend error reporting.

## Proposed Solution
- Add optional Sentry integration
- Send production errors to external service
- Ensure no PII in logs

## Acceptance Criteria
- [ ] Production errors reported to external service
- [ ] No PII in logs
```

---

## Issue 11: Add .env.example

**Title:** `security: Add .env.example and document required env vars`

**Labels:** `security`, `documentation`

**Priority:** High

**Body:**
```markdown
## Problem
No `.env.example`. Env vars documented in markdown only. Risk of committing secrets.

## Proposed Solution
- Create `.env.example` with placeholder values for all VITE_* vars
- Add to README: "Copy .env.example to .env"

## Acceptance Criteria
- [ ] .env.example exists
- [ ] README references it
```

---

## Issue 12: Sanitize StructuredData

**Title:** `security: Sanitize StructuredData JSON to prevent XSS`

**Labels:** `security`, `xss`

**Priority:** Medium

**Body:**
```markdown
## Problem
StructuredData uses dangerouslySetInnerHTML with JSON.stringify(data). If data contains user-controlled content, XSS is possible.

## Proposed Solution
- Validate/sanitize data before stringify
- Use schema (e.g., Zod) to validate structure
- Document that data must be trusted

## Acceptance Criteria
- [ ] Input validation or allowlist for StructuredData
- [ ] No unsanitized user content in __html
```

---

## Issue 13: Empty states for dashboards

**Title:** `ux: Add empty states for analytics and performance dashboards`

**Labels:** `ux`, `empty-state`

**Priority:** Low

**Body:**
```markdown
## Problem
When no data is available, dashboards may show blank UI. No explicit empty state.

## Proposed Solution
- Add EmptyState component
- Use in AnalyticsDashboard, CoreWebVitalsDashboard, SEODashboard

## Acceptance Criteria
- [ ] Empty states for Analytics and Core Web Vitals dashboards
- [ ] Clear messaging and optional CTA
```

---

## Issue 14: Fix PWA icon paths

**Title:** `fix: Correct PWA apple-touch-icon paths in index.html`

**Labels:** `bug`, `pwa`, `ux`

**Priority:** Critical

**Body:**
```markdown
## Problem
index.html references `/icons/icon-192x192.png.svg` — invalid extension. Should be .png or .svg.

## Technical Impact
PWA icons may fail to load on iOS.

## Proposed Solution
- Fix paths to correct extension (e.g., .png)
- Verify icon files exist in public/icons/

## Acceptance Criteria
- [ ] All apple-touch-icon hrefs use valid extensions
- [ ] Icons load correctly on iOS
```

---

## Issue 15: Breakpoint consistency

**Title:** `a11y: Audit breakpoint consistency across components`

**Labels:** `responsive`, `ux`

**Priority:** Low

**Body:**
```markdown
## Problem
Tailwind breakpoints used in ~30 files. No documented breakpoint strategy.

## Proposed Solution
- Document breakpoint usage
- Audit key pages for consistency

## Acceptance Criteria
- [ ] Breakpoint strategy documented
- [ ] No major layout shifts at common breakpoints
```

---

## Issue 16: Design system doc

**Title:** `style: Document Tailwind + CSS variables design system`

**Labels:** `documentation`, `css`

**Priority:** Low

**Body:**
```markdown
## Problem
No single doc describing tokens, spacing, typography scale.

## Proposed Solution
- Create docs/DESIGN_SYSTEM.md
- Cover colors, spacing, typography

## Acceptance Criteria
- [ ] Design system doc exists
```

---

## Issue 17: Fix cypres typo

**Title:** `fix: Correct package.json script typo cypres:form → cypress:form`

**Labels:** `bug`, `dx`

**Priority:** Low

**Body:**
```markdown
## Problem
package.json has "cypres:form" instead of "cypress:form".

## Proposed Solution
Rename to cypress:form

## Acceptance Criteria
- [ ] npm run cypress:form works
```

---

## Issue 18: Unit tests for ErrorBoundary and analytics

**Title:** `test: Add unit tests for ErrorBoundary and analytics service`

**Labels:** `testing`, `coverage`

**Priority:** High

**Body:**
```markdown
## Problem
ErrorBoundary and AnalyticsService have no dedicated unit tests.

## Proposed Solution
- Add ErrorBoundary.test.tsx (error state, retry, fallback)
- Add analytics.test.ts for core methods

## Acceptance Criteria
- [ ] ErrorBoundary test covers error state and retry
- [ ] Analytics test covers track and flush
```

---

## Issue 19: E2E test for Index page

**Title:** `test: Add E2E test for Index page critical path`

**Labels:** `testing`, `e2e`

**Priority:** Medium

**Body:**
```markdown
## Problem
Cypress E2E focuses on /component-showcase. Index page has no E2E coverage.

## Proposed Solution
- Add cypress/e2e/user-journeys/index-page.cy.ts
- Test: load Index, scroll to contact, validate form

## Acceptance Criteria
- [ ] E2E test for Index page
- [ ] Covers hero visibility and contact section
```

---

## Issue 20: i18n foundation

**Title:** `feat: Add i18n foundation for future localization`

**Labels:** `i18n`, `enhancement`

**Priority:** Low

**Body:**
```markdown
## Problem
All strings hardcoded in English. No i18n library.

## Proposed Solution
- Add react-i18next
- Extract strings from Navigation, Hero, Contact, ErrorBoundary
- Set up en as default

## Acceptance Criteria
- [ ] i18n library integrated
- [ ] At least 3 components use translation keys
```

---

## Issue 21: axe-core on Index page

**Title:** `a11y: Run axe-core on Index page in E2E`

**Labels:** `accessibility`, `testing`

**Priority:** Medium

**Body:**
```markdown
## Problem
Cypress a11y tests target /component-showcase only. Index page not tested with axe.

## Proposed Solution
- Add cypress/e2e/accessibility/index-a11y.cy.ts
- Visit /, inject axe, run cy.checkA11y()

## Acceptance Criteria
- [ ] Index page has axe E2E test
- [ ] No critical a11y violations
```

---

## Summary

| # | Title | Priority |
| - | ----- | -------- |
| 1 | Remove console.log from main.tsx | High |
| 2 | Add React.memo to list components | Medium |
| 3 | Integrate budgets:check into CI | High |
| 4 | Leverage TanStack Query | High |
| 5 | Centralized API client | High |
| 6 | Wire analytics env vars | **Critical** |
| 7 | Document state management | Low |
| 8 | Fix ErrorBoundary @ts-ignore | Medium |
| 9 | Typed error models | Medium |
| 10 | Sentry / structured logging | Medium |
| 11 | Add .env.example | High |
| 12 | Sanitize StructuredData | Medium |
| 13 | Empty states for dashboards | Low |
| 14 | Fix PWA icon paths | **Critical** |
| 15 | Breakpoint consistency | Low |
| 16 | Design system doc | Low |
| 17 | Fix cypres typo | Low |
| 18 | Unit tests ErrorBoundary/analytics | High |
| 19 | E2E test Index page | Medium |
| 20 | i18n foundation | Low |
| 21 | axe-core on Index page | Medium |
