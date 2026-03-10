import { useCallback } from 'react';
import {
  buildTestIdProps,
  type TestIdProps,
} from '@/shared/utils/testId';

/** Function returned by useTestId: (element, context?) => TestIdProps */
export type TestIdFn = (element: string, context?: string | number) => TestIdProps;

/**
 * Returns a function that produces data-testid, data-component, data-element props
 * for a given element within the component.
 *
 * @param componentName - PascalCase component name (e.g. "UserCard")
 * @returns Function (element, context?) => TestIdProps
 *
 * @example
 * const tid = useTestId("UserCard");
 * <img {...tid("avatar")} />
 * // => data-component="UserCard" data-element="avatar" data-testid="user-card-avatar"
 *
 * @example With context for list items
 * const tid = useTestId("JobCard");
 * {jobs.map((job, i) => (
 *   <button {...tid("apply-button", job.id)}>Apply</button>
 * ))}
 * // => data-testid="job-card-apply-button-1234"
 */
export function useTestId(componentName: string): TestIdFn {
  return useCallback(
    (element: string, context?: string | number): TestIdProps =>
      buildTestIdProps(componentName, element, context),
    [componentName]
  );
}
