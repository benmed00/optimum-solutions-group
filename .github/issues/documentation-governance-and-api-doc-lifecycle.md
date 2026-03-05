Context

The PR performs a major documentation reorganization into `docs/` and adds substantial API documentation assets (OpenAPI + Postman collections/environments), guides, and audit reports. This improves discoverability, but long-term governance and update ownership need formalization.

Related PR: #3

Problem Statement

Large documentation additions can become stale quickly without clear ownership, update triggers, and consistency checks. API docs duplicated between source (`docs/api`) and public assets (`public/api-docs`) risk divergence if synchronization is not enforced.

Proposed Solution

Establish a documentation governance model with lifecycle rules for API artifacts, ownership assignments, and automated validation to keep docs accurate, current, and aligned with implementation changes.

Implementation Tasks

- Define doc ownership and review requirements per section (`api`, `guides`, `deployment`, `testing`, `analysis`).
- Introduce update triggers (e.g., required docs update when API/client contracts change).
- Enforce synchronization between `docs/api/openapi.yaml` and `public/api-docs/openapi.yaml` via CI check.
- Add automated validation for OpenAPI syntax and Postman collection consistency.
- Add a docs freshness checklist to PR template or contributing guide.
- Add a documentation index page with “last updated” metadata for major documents.

Acceptance Criteria

- Documentation ownership and update rules are documented and discoverable.
- API doc source and published artifacts remain in sync automatically.
- CI fails on invalid or stale API documentation artifacts.
- Contributors have a clear checklist for documentation updates in relevant PRs.

Risks

- Additional governance steps may increase PR overhead if too strict.
- Synchronization automation may fail if file-generation assumptions change.
- Ownership gaps can persist if maintainers are not explicitly assigned.

Testing Strategy

- Add CI job to validate OpenAPI and compare source/published doc checksums.
- Test documentation lint and link checks on every PR touching docs.
- Run a sample API contract change and verify required documentation gates trigger.
- Audit one full release cycle to confirm docs remain accurate and up to date.
