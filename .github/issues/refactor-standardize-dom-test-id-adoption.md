Context

This PR introduces test-id utilities (`src/shared/utils/testId.ts`) and a hook (`src/shared/hooks/useTestId.ts`) to provide deterministic DOM identifiers for testing and observability. The foundation exists, but adoption appears partial across feature components.

Related PR: #3

Problem Statement

Without full adoption standards, test IDs may remain inconsistent (manual IDs, mixed naming, missing attributes), reducing reliability for Cypress/Playwright tests and increasing maintenance when UI structure changes.

Proposed Solution

Roll out a repository-wide DOM instrumentation standard based on `buildTestIdProps`/`useTestId`, enforce naming conventions, and migrate priority UI components to a consistent test-id strategy.

Implementation Tasks

- Define and publish naming rules for component/element/context patterns (kebab-case output contract).
- Inventory key user-facing components and identify missing or inconsistent test IDs.
- Refactor priority feature components (`navigation`, `contact`, `services`, `hero`) to use `useTestId`.
- Replace brittle selector usage in tests with stable `data-testid` selectors where appropriate.
- Add lint/custom check to discourage hardcoded ad-hoc test IDs in new code.
- Document migration guidelines and examples for contributors.

Acceptance Criteria

- Priority UI components expose deterministic, convention-compliant test IDs.
- E2E and component tests can rely on stable selectors independent of styling/layout changes.
- New test-id additions follow one naming convention and one generation path.
- Contributor guidance for test IDs is available and discoverable.

Risks

- Aggressive selector migration may break existing tests if not coordinated.
- Over-instrumentation can clutter DOM and reduce readability if not scoped.
- Naming convention changes can trigger widespread churn.

Testing Strategy

- Add/extend unit tests for `testId` utility and hook behavior (including context variants).
- Update representative Cypress and Playwright tests to verify selector stability.
- Run full E2E suite before/after migration to compare flaky test rates.
- Include snapshot or DOM-assertion checks on critical components to ensure attributes are rendered as expected.
