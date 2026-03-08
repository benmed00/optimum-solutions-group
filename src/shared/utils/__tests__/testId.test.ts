import { buildTestId, buildTestIdProps } from '../testId';
describe('buildTestId', () => {
  it('converts PascalCase component and element to kebab-case', () => {
    expect(buildTestId('UserCard', 'avatar')).toBe('user-card-avatar');
  });

  it('handles kebab-case input', () => {
    expect(buildTestId('user-card', 'apply-button')).toBe('user-card-apply-button');
  });

  it('appends context when provided', () => {
    expect(buildTestId('job-card', 'apply-button', '1234')).toBe(
      'job-card-apply-button-1234'
    );
  });

  it('appends numeric context', () => {
    expect(buildTestId('list', 'item', 0)).toBe('list-item-0');
  });

  it('omits empty context', () => {
    expect(buildTestId('form', 'submit', '')).toBe('form-submit');
    expect(buildTestId('form', 'submit', undefined)).toBe('form-submit');
  });
});

describe('buildTestIdProps', () => {
  it('returns data-testid, data-component, data-element', () => {
    const props = buildTestIdProps('ContactSection', 'submit-button');
    expect(props['data-testid']).toBe('contact-section-submit-button');
    expect(props['data-component']).toBe('ContactSection');
    expect(props['data-element']).toBe('submit-button');
  });

  it('includes context in data-testid', () => {
    const props = buildTestIdProps('JobCard', 'apply-button', 'abc');
    expect(props['data-testid']).toBe('job-card-apply-button-abc');
  });
});
