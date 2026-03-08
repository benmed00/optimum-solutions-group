Context

The PR adds meaningful tests (Cypress accessibility and user journey specs, `ErrorBoundary` unit tests, `apiClient` tests) and refactors existing hook tests. Coverage breadth improved, but test strategy remains fragmented across unit, hook, integration, E2E, and visual layers.

Related PR: #3

Problem Statement

Current tests validate many happy paths but lack a unified test matrix for cross-layer guarantees (contracts, failure scenarios, regressions, and deterministic CI behavior). This can allow subtle breakage to pass in one layer while failing in another.

Proposed Solution

Create a layered testing strategy with explicit ownership and coverage goals: contract tests for shared services, integration tests for core flows, strengthened E2E reliability gates, and consistent visual regression baselines.

Implementation Tasks

- Define a test matrix mapping critical capabilities to test levels (unit/integration/e2e/visual).
- Add negative-path and edge-case tests for `apiClient` (abort, malformed JSON, retry exhaustion).
- Add integration tests for analytics dashboard data-loading and error fallback flows.
- Harden Cypress accessibility and user-journey tests with deterministic waits and resilient selectors.
- Add CI checks for flaky-test detection/retry reporting and publish flake metrics.
- Align test commands and docs so local and CI execution paths are equivalent.

Acceptance Criteria

- Critical user flows and shared services are covered by at least one deterministic integration or E2E test.
- API/client failure modes are explicitly tested and documented.
- Flaky test rate is measurable and trending down over subsequent runs.
- Visual and accessibility checks are stable and reproducible in CI.

Risks

- Increased test scope may initially raise CI duration.
- Stricter deterministic assertions may expose existing non-determinism.
- Cross-layer test ownership may be unclear without explicit assignment.

Testing Strategy

- Execute targeted suites first (service + hook + integration), then full CI matrix.
- Run repeated CI executions to validate flake reduction changes.
- Compare pass/fail consistency across local and CI environments.
- Capture baseline metrics (duration, pass rate, retries) before and after rollout.
