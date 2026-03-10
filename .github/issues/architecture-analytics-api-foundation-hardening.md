Context

The current PR introduces major architectural additions in the analytics and data-access layer, including a centralized API client (`src/shared/services/apiClient.ts`), a new analytics data hook (`src/shared/hooks/useAnalyticsData.ts`), and dashboard integration updates. This creates a solid base, but there are still opportunities to harden contract boundaries and operational behavior before wider adoption.

Related PR: #3

Problem Statement

The new architecture mixes remote and local fallback analytics behavior, retry logic, and typed data contracts without a shared domain contract package or explicit runtime validation at boundaries. This can lead to schema drift, hidden parsing failures, and inconsistent behavior across consumers as more endpoints and dashboards are added.

Proposed Solution

Formalize the analytics/data-access architecture by introducing explicit domain contracts, stricter API client extension points, and a clear data-source strategy (remote-first with predictable fallback). Align all analytics consumers to the same typed query and error semantics.

Implementation Tasks

- Define `AnalyticsData` and related API payload contracts in a shared domain module with strict exported types.
- Add runtime response validation (e.g. schema guard) for analytics API responses before data is consumed.
- Extend `apiClient` with standardized request tracing metadata (request id, timing, retry count).
- Add explicit error categories (`network`, `timeout`, `http`, `parse`) and normalize them in one place.
- Introduce a lightweight data-source policy for analytics (remote, local-fallback, local-only) and wire it through `useAnalyticsData`.
- Document architectural decision records (ADR-style note) for API client and analytics data flow.

Acceptance Criteria

- All analytics consumers use the shared domain contracts instead of local ad-hoc types.
- Invalid/malformed analytics API payloads are detected and surfaced with clear typed errors.
- `useAnalyticsData` behavior is deterministic and testable for remote success, remote failure, and local fallback.
- API client telemetry fields are available for debugging and monitoring.
- Architecture documentation for this flow exists and is linked from project docs.

Risks

- Additional runtime validation may introduce small overhead on frequent requests.
- Tightening contracts could expose hidden inconsistencies in current payloads.
- Migration across existing consumers may require staged rollout to avoid regressions.

Testing Strategy

- Add contract tests for analytics payload validation (valid, partial, malformed inputs).
- Add API client tests for retry classification, timeout behavior, and normalized error objects.
- Add hook-level tests for data-source policy branches (remote success/failure/fallback).
- Add integration test covering dashboard rendering with mocked typed analytics responses.
