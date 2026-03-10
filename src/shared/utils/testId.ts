/**
 * DOM Element Indexing Utilities
 *
 * Provides deterministic, human-readable identifiers for:
 * - Debugging (data-component, data-element)
 * - Unit testing (React Testing Library)
 * - E2E testing (Playwright, Cypress)
 * - Observability
 *
 * Convention: <component-name>-<element-name>-<optional-context>
 * Example: dashboard-navbar-profile-button, auth-login-form-submit-button
 */

/**
 * Whether test IDs should be rendered.
 * Set VITE_STRIP_TEST_IDS=true in production build to strip (via Vite plugin).
 * Default: always render for debugging and E2E compatibility.
 */
const ENABLE_TEST_IDS = true;

/**
 * Converts PascalCase or camelCase to kebab-case.
 * @example "UserCard" -> "user-card", "jobCard" -> "job-card"
 */
function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Builds a deterministic data-testid string.
 *
 * @param component - Component name (PascalCase or kebab-case)
 * @param element - Element/role within the component
 * @param context - Optional unique context (e.g. id, index)
 * @returns kebab-case string like "user-card-avatar" or "job-card-apply-button-1234"
 *
 * @example
 * buildTestId("UserCard", "avatar") // "user-card-avatar"
 * buildTestId("job-card", "apply-button", "1234") // "job-card-apply-button-1234"
 * buildTestId("auth", "login-form", "submit") // "auth-login-form-submit"
 */
export function buildTestId(
  component: string,
  element: string,
  context?: string | number
): string {
  const parts = [toKebabCase(component), toKebabCase(element)];
  if (context !== undefined && context !== null && context !== '') {
    parts.push(String(context));
  }
  return parts.join('-');
}

/**
 * Props object for data-testid, data-component, data-element.
 * Returns empty object when ENABLE_TEST_IDS is false (e.g. production).
 */
export interface TestIdProps {
  'data-testid'?: string;
  'data-component'?: string;
  'data-element'?: string;
}

/**
 * Builds the full set of DOM attributes for debugging and testing.
 *
 * @param component - Component name (PascalCase)
 * @param element - Element name within the component
 * @param context - Optional context for uniqueness
 * @returns Object with data-testid, data-component, data-element (or empty in prod)
 */
export function buildTestIdProps(
  component: string,
  element: string,
  context?: string | number
): TestIdProps {
  if (!ENABLE_TEST_IDS) {
    return {};
  }
  const testId = buildTestId(component, element, context);
  return {
    'data-testid': testId,
    'data-component': component,
    'data-element': element,
  };
}

/**
 * Merges test ID props with existing props, ensuring test IDs take precedence
 * when explicitly provided in props.
 */
export function mergeTestIdProps(
  base: TestIdProps,
  props?: Record<string, unknown>
): TestIdProps {
  if (!props) return base;
  const result = { ...base };
  if (props['data-testid']) result['data-testid'] = String(props['data-testid']);
  if (props['data-component']) result['data-component'] = String(props['data-component']);
  if (props['data-element']) result['data-element'] = String(props['data-element']);
  return result;
}
