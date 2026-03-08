Context

The PR significantly updates CI/CD workflows (`performance-monitoring.yml`, `seo-audit.yml`, `visual-regression.yml`, `security-analysis.yml`) with robust fallbacks and improved survivability. These workflows are now feature-rich but also increasingly large and script-heavy, which raises maintenance and debugging costs.

Related PR: #3

Problem Statement

Critical workflow logic is embedded inline in multiple YAML files, with repeated install steps, duplicated fallback behavior, and inconsistent failure semantics (`continue-on-error`, fallback reports, conditional exits). This can hide true failures and make CI outcomes harder to trust and maintain.

Proposed Solution

Refactor CI workflows into reusable components (composite actions and shared scripts), define a consistent failure policy per workflow stage, and standardize artifact/report contracts across performance, SEO, visual, and security pipelines.

Implementation Tasks

- Extract repeated setup logic (Node install, dependency install strategy, server startup) into composite actions under `.github/actions/`.
- Move large inline script blocks from workflow YAML into versioned scripts under `scripts/ci/`.
- Define and document explicit failure policy for each job type:
  - hard fail (must block merge),
  - soft fail (report only),
  - informational.
- Standardize output artifact names and JSON schemas across audit workflows.
- Add workflow-level observability summary (single machine-readable status artifact per run).
- Add lint/check step for workflow syntax and script references.

Acceptance Criteria

- Workflow YAML files are reduced in size and primarily orchestration-focused.
- Shared CI logic exists in reusable modules with no major duplication.
- Failure behavior is consistent and documented across all quality/security workflows.
- Each workflow emits predictable artifacts with stable naming and schema.
- CI debugging time is reduced via centralized logs and summaries.

Risks

- Refactoring CI logic can temporarily destabilize pipelines if rollout is not staged.
- Composite action boundaries may initially reduce discoverability for contributors.
- Over-standardization can limit flexibility for workflow-specific edge cases.

Testing Strategy

- Validate workflow changes on a dedicated branch with dry-run PRs.
- Run matrix checks for push and pull_request triggers.
- Add regression checks for artifact presence and schema validity.
- Verify at least one intentional failure path per workflow to confirm expected fail/soft-fail behavior.
